import { NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server";
import type { HomeAreaInsert } from '@/types/house.types';

export async function GET(request: Request) {
    const supabase = await createClient();
    try {
        const { searchParams } = new URL(request.url);
        const propertyId = searchParams.get('propertyId');

        let query = supabase
            .from('home_area')
            .select('*')
            .order('name', { ascending: true });

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
        return NextResponse.json({ error: 'Failed to fetch areas' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const supabase = await createClient();
    try {
        const body: HomeAreaInsert = await request.json();

        if (!body.name || !body.name.trim()) {
            return NextResponse.json({ error: 'Area name is required' }, { status: 400 });
        }

        if (!body.property_id) {
            return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
        }

        const insertData: HomeAreaInsert = {
            property_id: body.property_id,
            name: body.name.trim(),
            type: body.type?.trim() || null,
            notes: body.notes?.trim() || null,
        };

        const { data, error } = await supabase
            .from('home_area')
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
        return NextResponse.json({ error: 'Failed to create area' }, { status: 500 });
    }
}
