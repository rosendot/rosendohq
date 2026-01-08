import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import type { HomeSupplyStockInsert } from '@/types/database.types';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const propertyId = searchParams.get('propertyId');
        const areaId = searchParams.get('areaId');
        const lowStock = searchParams.get('lowStock');

        let query = supabase
            .from('home_supply_stock')
            .select(`
                *,
                home_supply_item(id, name, category, unit),
                home_area(id, name)
            `)
            .order('updated_at', { ascending: false });

        if (propertyId) {
            query = query.eq('property_id', propertyId);
        }

        if (areaId) {
            query = query.eq('area_id', areaId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Filter for low stock items client-side if requested
        let result = data;
        if (lowStock === 'true') {
            result = data?.filter(item => item.quantity <= item.min_quantity) || [];
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Failed to fetch supply stock' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body: HomeSupplyStockInsert = await request.json();

        if (!body.supply_item_id) {
            return NextResponse.json({ error: 'Supply item ID is required' }, { status: 400 });
        }

        if (!body.property_id) {
            return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
        }

        const insertData: HomeSupplyStockInsert = {
            property_id: body.property_id,
            area_id: body.area_id || null,
            supply_item_id: body.supply_item_id,
            quantity: body.quantity || 0,
            min_quantity: body.min_quantity || 0,
        };

        const { data, error } = await supabase
            .from('home_supply_stock')
            .insert([insertData])
            .select(`
                *,
                home_supply_item(id, name, category, unit),
                home_area(id, name)
            `)
            .single();

        if (error) {
            console.error('Supabase insert error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Failed to create supply stock' }, { status: 500 });
    }
}
