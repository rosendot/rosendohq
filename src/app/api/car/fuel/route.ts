// src/app/api/car/fuel/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import type { FuelLogInsert } from '@/types/database.types';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get('vehicleId');

    let query = supabase
        .from('fuel_log')
        .select('*')
        .order('fill_date', { ascending: false });

    if (vehicleId) {
        query = query.eq('vehicle_id', vehicleId);
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const body: FuelLogInsert = await request.json();

    const { data, error } = await supabase
        .from('fuel_log')
        .insert([body])
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}