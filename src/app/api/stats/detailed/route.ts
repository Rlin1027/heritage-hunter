import { NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

type UnclaimedLandRow = Database['public']['Tables']['unclaimed_lands']['Row'];

interface DistrictRecord {
    source_city: string;
    district: string;
    area_m2: number | null;
    area_ping: number | null;
}

interface TopLandRecord {
    id: string;
    owner_name: string | null;
    district: string;
    area_m2: number | null;
    area_ping: number | null;
}

interface SectionRecord {
    source_city: string;
    district: string;
    section: string | null;
}

// Response schema for type safety
const detailedStatsResponseSchema = z.object({
    success: z.boolean(),
    data: z.object({
        byDistrict: z.array(z.object({
            city: z.string(),
            district: z.string(),
            count: z.number().int().min(0),
            areaM2: z.number().min(0),
            areaPing: z.number().min(0),
        })),
        topLandsByArea: z.array(z.object({
            id: z.string(),
            ownerName: z.string().nullable(),
            district: z.string(),
            areaM2: z.number().min(0),
            areaPing: z.number().min(0),
        })),
        topDistrictsByCount: z.array(z.object({
            city: z.string(),
            district: z.string(),
            count: z.number().int().min(0),
        })),
        bySection: z.array(z.object({
            city: z.string(),
            district: z.string(),
            section: z.string(),
            count: z.number().int().min(0),
        })),
    }),
});

/**
 * GET /api/stats/detailed
 * Get detailed statistics about the unclaimed lands dataset
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

        // Get data grouped by district
        const { data: districtData, error: districtError } = await supabase
            .from('unclaimed_lands')
            .select('source_city, district, area_m2, area_ping');

        if (districtError) {
            console.error('Supabase district query error:', districtError);
            return NextResponse.json(
                { error: 'Failed to fetch district statistics', details: districtError.message },
                { status: 500 }
            );
        }

        // Calculate statistics by district
        const byDistrict: Record<string, { city: string; count: number; areaM2: number; areaPing: number }> = {};

        (districtData as DistrictRecord[] | null)?.forEach((land) => {
            const key = `${land.source_city}|${land.district}`;
            const areaM2 = land.area_m2 || 0;
            const areaPing = land.area_ping || 0;

            if (!byDistrict[key]) {
                byDistrict[key] = {
                    city: land.source_city,
                    count: 0,
                    areaM2: 0,
                    areaPing: 0,
                };
            }
            byDistrict[key].count += 1;
            byDistrict[key].areaM2 += areaM2;
            byDistrict[key].areaPing += areaPing;
        });

        // Format district statistics
        const districtStats = Object.entries(byDistrict).map(([key, stats]) => {
            const district = key.split('|')[1];
            return {
                city: stats.city,
                district,
                count: stats.count,
                areaM2: Math.round(stats.areaM2 * 100) / 100,
                areaPing: Math.round(stats.areaPing * 100) / 100,
            };
        }).sort((a, b) => b.count - a.count);

        // Get top 10 lands by area
        const { data: topLandsData, error: topLandsError } = await supabase
            .from('unclaimed_lands')
            .select('id, owner_name, district, area_m2, area_ping')
            .order('area_m2', { ascending: false, nullsFirst: false })
            .limit(10);

        if (topLandsError) {
            console.error('Supabase top lands query error:', topLandsError);
            return NextResponse.json(
                { error: 'Failed to fetch top lands', details: topLandsError.message },
                { status: 500 }
            );
        }

        // Format top lands
        const topLandsByArea = (topLandsData as TopLandRecord[] | null)?.map((land) => ({
            id: land.id,
            ownerName: land.owner_name,
            district: land.district,
            areaM2: Math.round((land.area_m2 || 0) * 100) / 100,
            areaPing: Math.round((land.area_ping || 0) * 100) / 100,
        })) || [];

        // Top 10 districts by count
        const topDistrictsByCount = districtStats.slice(0, 10).map(({ city, district, count }) => ({
            city,
            district,
            count,
        }));

        // Get data grouped by section
        const { data: sectionData, error: sectionError } = await supabase
            .from('unclaimed_lands')
            .select('source_city, district, section')
            .not('section', 'is', null);

        if (sectionError) {
            console.error('Supabase section query error:', sectionError);
            return NextResponse.json(
                { error: 'Failed to fetch section statistics', details: sectionError.message },
                { status: 500 }
            );
        }

        // Calculate statistics by section
        const bySection: Record<string, { city: string; district: string; section: string; count: number }> = {};

        (sectionData as SectionRecord[] | null)?.forEach((land) => {
            if (!land.section) return;
            const key = `${land.source_city}|${land.district}|${land.section}`;

            if (!bySection[key]) {
                bySection[key] = {
                    city: land.source_city,
                    district: land.district,
                    section: land.section,
                    count: 0,
                };
            }
            bySection[key].count += 1;
        });

        // Format section statistics
        const sectionStats = Object.values(bySection)
            .sort((a, b) => b.count - a.count);

        const response = {
            success: true,
            data: {
                byDistrict: districtStats,
                topLandsByArea,
                topDistrictsByCount,
                bySection: sectionStats,
            },
        };

        // Validate response format
        const validated = detailedStatsResponseSchema.parse(response);
        return NextResponse.json(validated);
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
