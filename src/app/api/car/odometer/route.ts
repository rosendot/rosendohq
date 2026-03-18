// src/app/api/car/odometer/route.ts
import { NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server";
import type { OdometerLogInsert } from '@/types/car.types';

export async function GET(request: Request) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get('vehicleId');

    let query = supabase
        .from('odometer_log')
        .select('*')
        .order('log_date', { ascending: false });

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
    const supabase = await createClient();
    const body: OdometerLogInsert = await request.json();

    const { data, error } = await supabase
        .from('odometer_log')
        .insert([body])
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}