// src/app/api/media/[id]/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import type { MediaItemUpdate } from '@/types/database.types';

// GET single media item
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const { data, error } = await supabase
        .from('media_item')
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

// PATCH - Update media item
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body: MediaItemUpdate = await request.json();

    const updateData: MediaItemUpdate = {
        ...body,
        updated_at: new Date().toISOString(),
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof MediaItemUpdate] === undefined) {
            delete updateData[key as keyof MediaItemUpdate];
        }
    });

    const { data, error } = await supabase
        .from('media_item')
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

// DELETE media item
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const { error } = await supabase
        .from('media_item')
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