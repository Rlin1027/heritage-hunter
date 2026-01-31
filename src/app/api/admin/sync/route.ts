import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';
import { DataFetcher } from '@/lib/data-sync/fetcher';
import { TaipeiParser } from '@/lib/data-sync/parsers/taipei';
import { ChiayiParser } from '@/lib/data-sync/parsers/chiayi';
import { ChanghuaParser } from '@/lib/data-sync/parsers/changhua';
import { normalizeData } from '@/lib/data-sync/normalizer';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for sync

// API key for admin operations
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'dev-key-change-me';

// Create typed Supabase client for server operations
function getServerClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    return createClient<Database>(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

interface SyncResult {
    city: string;
    success: boolean;
    recordsAdded: number;
    recordsUpdated: number;
    error?: string;
}

/**
 * POST /api/admin/sync
 * Trigger data sync from government open data sources
 * Requires API key authentication
 */
export async function POST(request: NextRequest) {
    try {
        // Verify API key
        const authHeader = request.headers.get('authorization');
        const apiKey = authHeader?.replace('Bearer ', '');

        if (apiKey !== ADMIN_API_KEY) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Parse request body
        const body = await request.json().catch(() => ({}));
        const citiesToSync = body.cities || ['台北市', '嘉義市', '嘉義縣', '彰化縣'];

        const supabase = getServerClient();
        const results: SyncResult[] = [];

        // Process each city
        for (const city of citiesToSync) {
            const logId = crypto.randomUUID();

            // Create sync log entry
            await supabase.from('sync_logs').insert({
                id: logId,
                source_city: city,
                status: 'running',
            });

            try {
                const result = await syncCity(supabase, city);
                results.push(result);

                // Update sync log
                await supabase.from('sync_logs').update({
                    completed_at: new Date().toISOString(),
                    records_added: result.recordsAdded,
                    records_updated: result.recordsUpdated,
                    status: result.success ? 'completed' : 'failed',
                    error_message: result.error || null,
                }).eq('id', logId);

                // Update data source
                if (result.success) {
                    await supabase.from('data_sources').update({
                        last_synced_at: new Date().toISOString(),
                        record_count: result.recordsAdded + result.recordsUpdated,
                    }).eq('city', city);
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                results.push({
                    city,
                    success: false,
                    recordsAdded: 0,
                    recordsUpdated: 0,
                    error: errorMessage,
                });

                await supabase.from('sync_logs').update({
                    completed_at: new Date().toISOString(),
                    status: 'failed',
                    error_message: errorMessage,
                }).eq('id', logId);
            }
        }

        const allSuccess = results.every((r) => r.success);
        const totalAdded = results.reduce((sum, r) => sum + r.recordsAdded, 0);
        const totalUpdated = results.reduce((sum, r) => sum + r.recordsUpdated, 0);

        return NextResponse.json({
            success: allSuccess,
            message: allSuccess ? 'Sync completed successfully' : 'Sync completed with errors',
            summary: {
                totalRecordsAdded: totalAdded,
                totalRecordsUpdated: totalUpdated,
            },
            results,
        });
    } catch (error) {
        console.error('Sync API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * Sync data for a specific city
 */
async function syncCity(supabase: ReturnType<typeof getServerClient>, city: string): Promise<SyncResult> {
    let fetchResult;
    let parser;

    // Determine fetcher and parser based on city
    switch (city) {
        case '台北市':
            fetchResult = await DataFetcher.fetchFromTaipei('134972');
            parser = new TaipeiParser();
            break;
        case '嘉義市':
            fetchResult = await DataFetcher.fetchFromDataGov('52344');
            parser = new ChiayiParser();
            break;
        case '嘉義縣':
            fetchResult = await DataFetcher.fetchFromDataGov('133739');
            parser = new ChiayiParser();
            break;
        case '彰化縣':
            fetchResult = await DataFetcher.fetchFromDataGov('28529');
            parser = new ChanghuaParser();
            break;
        default:
            return {
                city,
                success: false,
                recordsAdded: 0,
                recordsUpdated: 0,
                error: `Unknown city: ${city}`,
            };
    }

    if (!fetchResult.success || !fetchResult.data) {
        return {
            city,
            success: false,
            recordsAdded: 0,
            recordsUpdated: 0,
            error: fetchResult.error || 'Failed to fetch data',
        };
    }

    // Parse the CSV data
    const rawData = parser.parse(fetchResult.data);

    // Normalize data
    const normalizedData = normalizeData(rawData, city);

    // Upsert to database
    let recordsAdded = 0;

    // Process in batches of 100
    const batchSize = 100;
    for (let i = 0; i < normalizedData.length; i += batchSize) {
        const batch = normalizedData.slice(i, i + batchSize);

        // Transform to database format (snake_case)
        const dbRecords = batch.map((land) => ({
            source_city: land.sourceCity,
            district: land.district,
            section: land.section,
            land_number: land.landNumber,
            owner_name: land.ownerName,
            area_m2: land.areaM2,
            area_ping: land.areaPing,
            status: land.status,
            coordinates: land.coordinates as Database['public']['Tables']['unclaimed_lands']['Insert']['coordinates'],
            raw_data: land.rawData as Database['public']['Tables']['unclaimed_lands']['Insert']['raw_data'],
            source_url: land.sourceUrl,
        }));

        const { data, error } = await supabase
            .from('unclaimed_lands')
            .upsert(dbRecords, { onConflict: 'source_city,district,land_number' })
            .select();

        if (error) {
            console.error(`Upsert error for ${city}:`, error);
            // Continue with other batches
        } else {
            // Note: Supabase upsert doesn't distinguish between added and updated
            // We count all as either added or updated based on context
            recordsAdded += data?.length || 0;
        }
    }

    return {
        city,
        success: true,
        recordsAdded,
        recordsUpdated: 0,
    };
}

/**
 * GET /api/admin/sync
 * Get sync status and history
 */
export async function GET(request: NextRequest) {
    try {
        // Verify API key
        const authHeader = request.headers.get('authorization');
        const apiKey = authHeader?.replace('Bearer ', '');

        if (apiKey !== ADMIN_API_KEY) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const supabase = getServerClient();

        // Get recent sync logs
        const { data: logs, error: logsError } = await supabase
            .from('sync_logs')
            .select('*')
            .order('started_at', { ascending: false })
            .limit(50);

        if (logsError) {
            console.error('Fetch sync logs error:', logsError);
            return NextResponse.json(
                { error: 'Failed to fetch sync logs' },
                { status: 500 }
            );
        }

        // Get data sources status
        const { data: sources, error: sourcesError } = await supabase
            .from('data_sources')
            .select('*');

        if (sourcesError) {
            console.error('Fetch data sources error:', sourcesError);
            return NextResponse.json(
                { error: 'Failed to fetch data sources' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            dataSources: sources,
            recentSyncLogs: logs,
        });
    } catch (error) {
        console.error('Sync status API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
