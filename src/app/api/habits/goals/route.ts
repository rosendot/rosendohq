// src/app/api/habits/goals/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET() {
    const { data, error } = await supabase
        .from('goal')
        .select('*, habit:habit_id(*)')
        .order('status', { ascending: true })
        .order('due_date', { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const body = await request.json();

    const { data, error } = await supabase
        .from('goal')
        .insert([body])
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}