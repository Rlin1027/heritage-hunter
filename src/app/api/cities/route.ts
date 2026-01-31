import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { VALID_CITIES } from '@/lib/validation';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

interface CityDistrictRecord {
    source_city: string;
    district: string;
}

// Response schema for type safety
const cityDistrictsResponseSchema = z.object({
    success: z.boolean(),
    data: z.union([
        z.object({
            city: z.string(),
            districts: z.array(z.string()),
        }),
        z.array(z.object({
            city: z.string(),
            districts: z.array(z.string()),
        })),
    ]),
});

/**
 * GET /api/cities
 * Get list of available cities and their districts
 * 
 * Query params:
 * - city: If provided, returns districts for that city only
 */
export async function GET(request: NextRequest) {
    // Check if Supabase is configured
    if (!isSupabaseConfigured) {
        return NextResponse.json(
            { error: 'Database not configured', message: 'Supabase configuration is missing' },
            { status: 503 }
        );
    }

    try {
        const supabase = getSupabase();
        const searchParams = request.nextUrl.searchParams;
        const cityParam = searchParams.get('city');

        if (cityParam) {
            // Validate city parameter
            const cityValidation = z.enum(VALID_CITIES).safeParse(cityParam);

            if (!cityValidation.success) {
                return NextResponse.json(
                    {
                        error: 'Invalid city parameter',
                        details: `City must be one of: ${VALID_CITIES.join(', ')}`,
                    },
                    { status: 400 }
                );
            }

            // Return districts for specific city
            const { data, error } = await supabase
                .from('unclaimed_lands')
                .select('district')
                .eq('source_city', cityValidation.data);

            if (error) {
                console.error('Supabase query error:', error);
                return NextResponse.json(
                    { error: 'Failed to fetch districts', details: error.message },
                    { status: 500 }
                );
            }

            // Get unique districts
            const districts = [...new Set((data as { district: string }[] | null)?.map((d) => d.district))].sort();

            const response = {
                success: true,
                data: {
                    city: cityValidation.data,
                    districts,
                },
            };

            // Validate response format
            const validated = cityDistrictsResponseSchema.parse(response);
            return NextResponse.json(validated);
        }

        // Return all cities with their districts
        const { data, error } = await supabase
            .from('unclaimed_lands')
            .select('source_city, district');

        if (error) {
            console.error('Supabase query error:', error);
            return NextResponse.json(
                { error: 'Failed to fetch cities', details: error.message },
                { status: 500 }
            );
        }

        // Group districts by city
        const cityMap = new Map<string, Set<string>>();
        (data as CityDistrictRecord[] | null)?.forEach((record) => {
            if (!cityMap.has(record.source_city)) {
                cityMap.set(record.source_city, new Set());
            }
            cityMap.get(record.source_city)!.add(record.district);
        });

        // Convert to array format
        const cities = Array.from(cityMap.entries())
            .map(([city, districts]) => ({
                city,
                districts: Array.from(districts).sort(),
            }))
            .sort((a, b) => a.city.localeCompare(b.city, 'zh-TW'));

        const response = {
            success: true,
            data: cities,
        };

        // Validate response format
        const validated = cityDistrictsResponseSchema.parse(response);
        return NextResponse.json(validated);
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
