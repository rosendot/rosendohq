import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import type { HomePropertyInsert } from '@/types/database.types';

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('home_property')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body: HomePropertyInsert = await request.json();

        if (!body.name || !body.name.trim()) {
            return NextResponse.json({ error: 'Property name is required' }, { status: 400 });
        }

        const insertData: HomePropertyInsert = {
            name: body.name.trim(),
            address1: body.address1?.trim() || null,
            address2: body.address2?.trim() || null,
            city: body.city?.trim() || null,
            state: body.state?.trim() || null,
            postal_code: body.postal_code?.trim() || null,
            country: body.country?.trim() || null,
            notes: body.notes?.trim() || null,
        };

        const { data, error } = await supabase
            .from('home_property')
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
        return NextResponse.json({ error: 'Failed to create property' }, { status: 500 });
    }
}
