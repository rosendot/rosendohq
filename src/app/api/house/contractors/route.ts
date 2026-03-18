import { NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server";
import type { HomeContractorInsert } from '@/types/house.types';

export async function GET(request: Request) {
    const supabase = await createClient();
    try {
        const { searchParams } = new URL(request.url);
        const specialty = searchParams.get('specialty');
        const isPreferred = searchParams.get('isPreferred');

        let query = supabase
            .from('home_contractor')
            .select('*')
            .order('is_preferred', { ascending: false })
            .order('name', { ascending: true });

        if (specialty) {
            query = query.eq('specialty', specialty);
        }

        if (isPreferred === 'true') {
            query = query.eq('is_preferred', true);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Failed to fetch contractors' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const supabase = await createClient();
    try {
        const body: HomeContractorInsert = await request.json();

        if (!body.name || !body.name.trim()) {
            return NextResponse.json({ error: 'Contractor name is required' }, { status: 400 });
        }

        const insertData: HomeContractorInsert = {
            name: body.name.trim(),
            company: body.company?.trim() || null,
            phone: body.phone?.trim() || null,
            email: body.email?.trim() || null,
            website: body.website?.trim() || null,
            address: body.address?.trim() || null,
            specialty: body.specialty?.trim() || null,
            rating: body.rating || null,
            is_preferred: body.is_preferred || false,
            notes: body.notes?.trim() || null,
        };

        const { data, error } = await supabase
            .from('home_contractor')
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
        return NextResponse.json({ error: 'Failed to create contractor' }, { status: 500 });
    }
}
