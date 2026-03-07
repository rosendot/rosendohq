// src/app/api/car/odometer/[id]/route.ts
import { NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server";
import type { OdometerLog } from '@/types/database.types';

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    const params = await props.params;
    const { data, error } = await supabase
        .from('odometer_log')
        .select('*')
        .eq('id', params.id)
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function PATCH(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    const params = await props.params;
    const body: Partial<OdometerLog> = await request.json();

    const { data, error } = await supabase
        .from('odometer_log')
        .update(body)
        .eq('id', params.id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    const params = await props.params;
    const { error } = await supabase
        .from('odometer_log')
        .delete()
        .eq('id', params.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
