// src/app/api/habits/logs/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const habitId = searchParams.get('habit_id');

    let query = supabase
        .from('habit_log')
        .select('*')
        .order('log_date', { ascending: false });

    if (date) {
        query = query.eq('log_date', date);
    }

    if (habitId) {
        query = query.eq('habit_id', habitId);
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const body = await request.json();

    const { data, error } = await supabase
        .from('habit_log')
        .insert([body])
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}