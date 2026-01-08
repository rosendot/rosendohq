import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import type { HomeApplianceInsert } from '@/types/database.types';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const propertyId = searchParams.get('propertyId');
        const areaId = searchParams.get('areaId');

        let query = supabase
            .from('home_appliance')
            .select('*, home_area(id, name)')
            .order('name', { ascending: true });

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

        return NextResponse.json(data);
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Failed to fetch appliances' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body: HomeApplianceInsert = await request.json();

        if (!body.name || !body.name.trim()) {
            return NextResponse.json({ error: 'Appliance name is required' }, { status: 400 });
        }

        if (!body.property_id) {
            return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
        }

        const insertData: HomeApplianceInsert = {
            property_id: body.property_id,
            area_id: body.area_id || null,
            name: body.name.trim(),
            manufacturer: body.manufacturer?.trim() || null,
            model: body.model?.trim() || null,
            serial_number: body.serial_number?.trim() || null,
            purchase_date: body.purchase_date || null,
            purchase_price_cents: body.purchase_price_cents || null,
            warranty_months: body.warranty_months || null,
            notes: body.notes?.trim() || null,
        };

        const { data, error } = await supabase
            .from('home_appliance')
            .insert([insertData])
            .select()
            .single();

        if (error) {
            console.error('Supabase insert error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Failed to create appliance' }, { status: 500 });
    }
}
