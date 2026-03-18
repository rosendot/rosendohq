import { NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server";
import type { HomeSupplyUsageInsert } from '@/types/house.types';

export async function GET(request: Request) {
    const supabase = await createClient();
    try {
        const { searchParams } = new URL(request.url);
        const supplyItemId = searchParams.get('supplyItemId');
        const propertyId = searchParams.get('propertyId');

        let query = supabase
            .from('home_supply_usage')
            .select(`
                *,
                home_supply_item(id, name, category, unit),
                home_area(id, name)
            `)
            .order('use_date', { ascending: false });

        if (supplyItemId) {
            query = query.eq('supply_item_id', supplyItemId);
        }

        if (propertyId) {
            query = query.eq('property_id', propertyId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Failed to fetch supply usage' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const supabase = await createClient();
    try {
        const body: HomeSupplyUsageInsert = await request.json();

        if (!body.supply_item_id) {
            return NextResponse.json({ error: 'Supply item ID is required' }, { status: 400 });
        }

        if (!body.use_date) {
            return NextResponse.json({ error: 'Use date is required' }, { status: 400 });
        }

        if (!body.quantity || body.quantity <= 0) {
            return NextResponse.json({ error: 'Quantity must be greater than 0' }, { status: 400 });
        }

        const insertData: HomeSupplyUsageInsert = {
            property_id: body.property_id || null,
            area_id: body.area_id || null,
            supply_item_id: body.supply_item_id,
            use_date: body.use_date,
            quantity: body.quantity,
            notes: body.notes?.trim() || null,
        };

        const { data, error } = await supabase
            .from('home_supply_usage')
            .insert([insertData])
            .select(`
                *,
                home_supply_item(id, name, category, unit)
            `)
            .single();

        if (error) {
            console.error('Supabase insert error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Failed to create supply usage' }, { status: 500 });
    }
}
