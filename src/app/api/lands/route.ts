import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import { searchParamsSchemaCompat, sanitizeInput } from '@/lib/validation';
import { ZodError } from 'zod';

export const dynamic = 'force-dynamic';

type UnclaimedLandRow = Database['public']['Tables']['unclaimed_lands']['Row'];

/**
 * GET /api/lands
 * Query unclaimed lands with optional filters
 *
 * Query params:
 * - city: Filter by source city (e.g., 台北市)
 * - district: Filter by district (e.g., 中正區)
 * - query: Search in owner name, district, section, land number
 * - limit: Number of results (default: 50, max: 100)
 * - offset: Pagination offset (default: 0)
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

        // Parse and validate query parameters
        const rawParams = {
            city: searchParams.get('city') || undefined,
            district: searchParams.get('district') || undefined,
            query: searchParams.get('query') || undefined,
            limit: searchParams.get('limit') || undefined,
            offset: searchParams.get('offset') || undefined,
        };

        // Validate with Zod schema
        const validationResult = searchParamsSchemaCompat.safeParse(rawParams);

        if (!validationResult.success) {
            const errors = validationResult.error.issues.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            }));

            return NextResponse.json(
                {
                    error: 'Invalid request parameters',
                    details: errors,
                },
                { status: 400 }
            );
        }

        const { city, district, query, limit, offset } = validationResult.data;

        // Build query
        let dbQuery = supabase
            .from('unclaimed_lands')
            .select('*', { count: 'exact' });

        // Apply filters
        if (city) {
            dbQuery = dbQuery.eq('source_city', city);
        }

        if (district) {
            dbQuery = dbQuery.eq('district', district);
        }

        // Apply search query (searches in multiple fields)
        if (query) {
            // Sanitize the search query to prevent SQL injection
            const sanitizedQuery = sanitizeInput(query);
            dbQuery = dbQuery.or(
                `owner_name.ilike.%${sanitizedQuery}%,district.ilike.%${sanitizedQuery}%,section.ilike.%${sanitizedQuery}%,land_number.ilike.%${sanitizedQuery}%`
            );
        }

        // Apply pagination
        dbQuery = dbQuery.range(offset, offset + limit - 1);

        // Order by created_at desc
        dbQuery = dbQuery.order('created_at', { ascending: false });

        const { data, error, count } = await dbQuery;

        if (error) {
            console.error('Supabase query error:', error);
            return NextResponse.json(
                { error: 'Failed to fetch lands', details: error.message },
                { status: 500 }
            );
        }

        // Transform data to match frontend types
        const lands = (data as UnclaimedLandRow[] | null)?.map((land) => ({
            id: land.id,
            sourceCity: land.source_city,
            district: land.district,
            section: land.section || '',
            landNumber: land.land_number,
            ownerName: land.owner_name || '',
            areaM2: land.area_m2 || 0,
            areaPing: land.area_ping || 0,
            status: land.status || '列管中',
            coordinates: land.coordinates,
        })) || [];

        return NextResponse.json({
            success: true,
            data: lands,
            pagination: {
                total: count || 0,
                limit,
                offset,
                hasMore: (count || 0) > offset + limit,
            },
        });
    } catch (error) {
        console.error('API error:', error);

        // Handle Zod validation errors
        if (error instanceof ZodError) {
            return NextResponse.json(
                {
                    error: 'Validation error',
                    details: error.issues.map((err) => ({
                        field: err.path.join('.'),
                        message: err.message,
                    })),
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
