// src/app/api/habits/logs/route.ts
import { NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const habitId = searchParams.get('habit_id');

    let query = supabase
        .from('habit_log')
        .select('*')
        .order('log_date', { ascending: false });

    // Support single date or date range
    if (date) {
        query = query.eq('log_date', date);
    } else if (startDate && endDate) {
        query = query.gte('log_date', startDate).lte('log_date', endDate);
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
    const supabase = await createClient();
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