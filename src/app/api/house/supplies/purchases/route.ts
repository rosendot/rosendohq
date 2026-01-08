import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import type { HomeSupplyPurchaseInsert } from '@/types/database.types';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const supplyItemId = searchParams.get('supplyItemId');
        const propertyId = searchParams.get('propertyId');

        let query = supabase
            .from('home_supply_purchase')
            .select(`
                *,
                home_supply_item(id, name, category, unit),
                home_area(id, name)
            `)
            .order('purchase_date', { ascending: false });

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
        return NextResponse.json({ error: 'Failed to fetch supply purchases' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body: HomeSupplyPurchaseInsert = await request.json();

        if (!body.supply_item_id) {
            return NextResponse.json({ error: 'Supply item ID is required' }, { status: 400 });
        }

        if (!body.purchase_date) {
            return NextResponse.json({ error: 'Purchase date is required' }, { status: 400 });
        }

        if (!body.quantity || body.quantity <= 0) {
            return NextResponse.json({ error: 'Quantity must be greater than 0' }, { status: 400 });
        }

        const insertData: HomeSupplyPurchaseInsert = {
            property_id: body.property_id || null,
            area_id: body.area_id || null,
            supply_item_id: body.supply_item_id,
            purchase_date: body.purchase_date,
            quantity: body.quantity,
            unit_cost_cents: body.unit_cost_cents || null,
            vendor: body.vendor?.trim() || null,
            notes: body.notes?.trim() || null,
        };

        const { data, error } = await supabase
            .from('home_supply_purchase')
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
        return NextResponse.json({ error: 'Failed to create supply purchase' }, { status: 500 });
    }
}
