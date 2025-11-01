// src/app/api/books/[id]/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import type { BookUpdate } from '@/types/database.types';

// GET single book
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const { data, error } = await supabase
        .from('book')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 404 }
        );
    }

    return NextResponse.json(data);
}

// PATCH - Update book
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body: BookUpdate = await request.json();

    const updateData: BookUpdate = {
        ...body,
        updated_at: new Date().toISOString(),
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof BookUpdate] === undefined) {
            delete updateData[key as keyof BookUpdate];
        }
    });

    const { data, error } = await supabase
        .from('book')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Supabase update error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }

    return NextResponse.json(data);
}

// DELETE book
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const { error } = await supabase
        .from('book')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Supabase delete error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }

    return NextResponse.json({ success: true });
}