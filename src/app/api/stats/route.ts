import { NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

type DataSourceRow = Database['public']['Tables']['data_sources']['Row'];

interface LandAreaRecord {
    source_city: string;
    area_m2: number | null;
    area_ping: number | null;
}

// Response schema for type safety
const statsResponseSchema = z.object({
    success: z.boolean(),
    data: z.object({
        totalLands: z.number().int().min(0),
        totalAreaM2: z.number().min(0),
        totalAreaPing: z.number().min(0),
        byCity: z.array(z.object({
            city: z.string(),
            count: z.number().int().min(0),
            areaM2: z.number().min(0),
            areaPing: z.number().min(0),
            lastSynced: z.string().datetime().nullable().optional(),
            status: z.string(),
        })),
        lastUpdated: z.string().datetime(),
    }),
});

/**
 * GET /api/stats
 * Get statistics about the unclaimed lands dataset
 */
export async function GET() {
    // Check if Supabase is configured
    if (!isSupabaseConfigured) {
        return NextResponse.json(
            { error: 'Database not configured', message: 'Supabase configuration is missing' },
            { status: 503 }
        );
    }

    try {
        const supabase = getSupabase();

        // Get total count
        const { count: totalLands, error: countError } = await supabase
            .from('unclaimed_lands')
            .select('*', { count: 'exact', head: true });

        if (countError) {
            console.error('Supabase count error:', countError);
            return NextResponse.json(
                { error: 'Failed to fetch statistics', details: countError.message },
                { status: 500 }
            );
        }

        // Get aggregated data
        const { data: landsData, error: dataError } = await supabase
            .from('unclaimed_lands')
            .select('source_city, area_m2, area_ping');

        if (dataError) {
            console.error('Supabase query error:', dataError);
            return NextResponse.json(
                { error: 'Failed to fetch statistics', details: dataError.message },
                { status: 500 }
            );
        }

        // Calculate statistics
        let totalAreaM2 = 0;
        let totalAreaPing = 0;
        const byCity: Record<string, { count: number; areaM2: number; areaPing: number }> = {};

        (landsData as LandAreaRecord[] | null)?.forEach((land) => {
            const areaM2 = land.area_m2 || 0;
            const areaPing = land.area_ping || 0;

            totalAreaM2 += areaM2;
            totalAreaPing += areaPing;

            if (!byCity[land.source_city]) {
                byCity[land.source_city] = { count: 0, areaM2: 0, areaPing: 0 };
            }
            byCity[land.source_city].count += 1;
            byCity[land.source_city].areaM2 += areaM2;
            byCity[land.source_city].areaPing += areaPing;
        });

        // Get last sync info from data_sources
        const { data: sourcesData, error: sourcesError } = await supabase
            .from('data_sources')
            .select('city, last_synced_at, record_count, status');

        if (sourcesError) {
            console.error('Supabase sources error:', sourcesError);
            // Continue without sync info
        }

        const sources = sourcesData as Pick<DataSourceRow, 'city' | 'last_synced_at' | 'record_count' | 'status'>[] | null;

        // Format city statistics
        const cityStats = Object.entries(byCity).map(([city, stats]) => {
            const sourceInfo = sources?.find((s) => s.city === city);
            return {
                city,
                count: stats.count,
                areaM2: Math.round(stats.areaM2 * 100) / 100,
                areaPing: Math.round(stats.areaPing * 100) / 100,
                lastSynced: sourceInfo?.last_synced_at,
                status: sourceInfo?.status || 'unknown',
            };
        }).sort((a, b) => b.count - a.count);

        const response = {
            success: true,
            data: {
                totalLands: totalLands || 0,
                totalAreaM2: Math.round(totalAreaM2 * 100) / 100,
                totalAreaPing: Math.round(totalAreaPing * 100) / 100,
                byCity: cityStats,
                lastUpdated: new Date().toISOString(),
            },
        };

        // Validate response format
        const validated = statsResponseSchema.parse(response);
        return NextResponse.json(validated);
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
