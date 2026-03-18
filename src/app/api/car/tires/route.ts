// src/app/api/car/tires/route.ts
import { NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server";
import type { TireSetInsert } from '@/types/car.types';

export async function GET(request: Request) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get('vehicleId');
    const status = searchParams.get('status');

    let query = supabase
        .from('tire_set')
        .select('*')
        .order('created_at', { ascending: false });

    if (vehicleId) {
        query = query.eq('vehicle_id', vehicleId);
    }

    if (status) {
        query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const body: TireSetInsert = await request.json();

    const { data, error } = await supabase
        .from('tire_set')
        .insert([body])
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
