// src/app/api/books/logs/[logId]/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import type { ReadingLogUpdate } from '@/types/database.types';

// GET single reading log
export async function GET(
    request: Request,
    { params }: { params: Promise<{ logId: string }> }
) {
    const { logId } = await params;

    const { data, error } = await supabase
        .from('reading_log')
        .select('*')
        .eq('id', logId)
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(data);
}

// PATCH - Update reading log
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ logId: string }> }
) {
    const { logId } = await params;
    const body: ReadingLogUpdate = await request.json();

    const { data, error } = await supabase
        .from('reading_log')
        .update(body)
        .eq('id', logId)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

// DELETE reading log
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ logId: string }> }
) {
    const { logId } = await params;

    const { error } = await supabase
        .from('reading_log')
        .delete()
        .eq('id', logId);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
