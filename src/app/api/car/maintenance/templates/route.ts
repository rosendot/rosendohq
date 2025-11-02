// src/app/api/car/maintenance/templates/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import type { MaintenanceTemplateInsert } from '@/types/database.types';

export async function GET() {
    const { data, error } = await supabase
        .from('maintenance_template')
        .select('*')
        .order('priority', { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const body: MaintenanceTemplateInsert = await request.json();

    const { data, error } = await supabase
        .from('maintenance_template')
        .insert([body])
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}