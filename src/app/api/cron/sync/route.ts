import { NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/lib/database.types';
import { createServerClient } from '@/lib/supabase';
import { DataFetcher } from '@/lib/data-sync/fetcher';
import { TaipeiParser } from '@/lib/data-sync/parsers/taipei';
import { ChiayiParser } from '@/lib/data-sync/parsers/chiayi';
import { ChanghuaParser } from '@/lib/data-sync/parsers/changhua';
import { normalizeData } from '@/lib/data-sync/normalizer';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for cron job

/**
 * Vercel Cron Job endpoint for daily data sync
 * Schedule: Every day at 3:00 AM (configured in vercel.json)
 * 
 * GET /api/cron/sync
 */
export async function GET(request: NextRequest) {
    try {
        // Verify Vercel Cron secret (or allow dev mode)
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        // Verify cron secret when configured; fail in production if not set
        if (cronSecret) {
            if (authHeader !== `Bearer ${cronSecret}`) {
                return NextResponse.json(
                    { error: 'Unauthorized' },
                    { status: 401 }
                );
            }
        } else if (process.env.NODE_ENV === 'production') {
            return NextResponse.json(
                { error: 'Server misconfiguration: CRON_SECRET not set' },
                { status: 500 }
            );
        }

        const supabase = createServerClient();
        const cities = ['台北市', '嘉義市', '嘉義縣', '彰化縣'];
        const results: Array<{
            city: string;
            success: boolean;
            recordCount: number;
            error?: string;
        }> = [];

        console.log('[Cron Sync] Starting daily sync...');

        for (const city of cities) {
            const logId = crypto.randomUUID();

            // Log sync start
            await supabase.from('sync_logs').insert({
                id: logId,
                source_city: city,
                status: 'running',
            });

            try {
                const result = await syncCityData(city);
                results.push(result);

                // Update sync log
                await supabase.from('sync_logs').update({
                    completed_at: new Date().toISOString(),
                    records_added: result.recordCount,
                    status: result.success ? 'completed' : 'failed',
                    error_message: result.error || null,
                }).eq('id', logId);

                // Update data source
                if (result.success) {
                    await supabase.from('data_sources').update({
                        last_synced_at: new Date().toISOString(),
                        record_count: result.recordCount,
                    }).eq('city', city);
                }

                console.log(`[Cron Sync] ${city}: ${result.success ? 'Success' : 'Failed'} - ${result.recordCount} records`);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                results.push({
                    city,
                    success: false,
                    recordCount: 0,
                    error: errorMessage,
                });

                await supabase.from('sync_logs').update({
                    completed_at: new Date().toISOString(),
                    status: 'failed',
                    error_message: errorMessage,
                }).eq('id', logId);

                console.error(`[Cron Sync] ${city}: Error - ${errorMessage}`);
            }
        }

        const allSuccess = results.every((r) => r.success);
        console.log(`[Cron Sync] Completed. All success: ${allSuccess}`);

        return NextResponse.json({
            success: allSuccess,
            syncedAt: new Date().toISOString(),
            results,
        });
    } catch (error) {
        console.error('[Cron Sync] Fatal error:', error);
        return NextResponse.json(
            { error: 'Sync failed', details: String(error) },
            { status: 500 }
        );
    }
}

async function syncCityData(city: string): Promise<{
    city: string;
    success: boolean;
    recordCount: number;
    error?: string;
}> {
    let fetchResult;
    let parser;

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
            return { city, success: false, recordCount: 0, error: `Unknown city: ${city}` };
    }

    if (!fetchResult.success || !fetchResult.data) {
        return {
            city,
            success: false,
            recordCount: 0,
            error: fetchResult.error || 'Failed to fetch data',
        };
    }

    const rawData = parser.parse(fetchResult.data);
    const normalizedData = normalizeData(rawData, city);

    const supabase = createServerClient();

    // Upsert in batches
    const batchSize = 100;
    let totalRecords = 0;

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
            console.error(`Batch upsert error for ${city}:`, error);
        } else {
            totalRecords += data?.length || 0;
        }
    }

    return {
        city,
        success: true,
        recordCount: totalRecords,
    };
}
