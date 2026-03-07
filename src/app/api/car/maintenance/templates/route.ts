// src/app/api/car/maintenance/templates/route.ts
import { NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server";
import type { MaintenanceTemplateInsert } from '@/types/database.types';

export async function GET() {
    const supabase = await createClient();
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
    const supabase = await createClient();
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