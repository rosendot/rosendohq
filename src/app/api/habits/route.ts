// src/app/api/habits/route.ts
import { NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('include_inactive') === 'true';

    let query = supabase
        .from('habit')
        .select('*')
        .order('category', { ascending: true })
        .order('period', { ascending: true })
        .order('sort_order', { ascending: true });

    if (!includeInactive) {
        query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const body = await request.json();

    const { data, error } = await supabase
        .from('habit')
        .insert([body])
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}