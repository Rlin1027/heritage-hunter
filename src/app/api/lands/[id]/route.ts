import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

export const dynamic = 'force-dynamic';

type UnclaimedLandRow = Database['public']['Tables']['unclaimed_lands']['Row'];

/**
 * GET /api/lands/[id]
 * Get a single land record by ID
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // Check if Supabase is configured
    if (!isSupabaseConfigured) {
        return NextResponse.json(
            { error: 'Database not configured', message: 'Supabase configuration is missing' },
            { status: 503 }
        );
    }

    try {
        const supabase = getSupabase();
        const { id } = await params;

        const { data, error } = await supabase
            .from('unclaimed_lands')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json(
                    { error: 'Land not found' },
                    { status: 404 }
                );
            }
            console.error('Supabase query error:', error);
            return NextResponse.json(
                { error: 'Failed to fetch land', details: error.message },
                { status: 500 }
            );
        }

        const landData = data as UnclaimedLandRow;

        // Transform to frontend type
        const land = {
            id: landData.id,
            sourceCity: landData.source_city,
            district: landData.district,
            section: landData.section || '',
            landNumber: landData.land_number,
            ownerName: landData.owner_name || '',
            areaM2: landData.area_m2 || 0,
            areaPing: landData.area_ping || 0,
            status: landData.status || '列管中',
            coordinates: landData.coordinates,
            rawData: landData.raw_data,
            sourceUrl: landData.source_url,
            createdAt: landData.created_at,
            updatedAt: landData.updated_at,
        };

        return NextResponse.json({
            success: true,
            data: land,
        });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
