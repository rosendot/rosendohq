// src/app/api/shopping/lists/[listId]/route.ts
import { NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server";
import type { ShoppingListUpdate } from '@/types/database.types';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ listId: string }> }
) {
    const supabase = await createClient();
    const { listId } = await params;

    const { data, error } = await supabase
        .from('shopping_list')
        .select('*')
        .eq('id', listId)
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(data);
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ listId: string }> }
) {
    const supabase = await createClient();
    const { listId } = await params;
    const body: ShoppingListUpdate = await request.json();

    const { data, error } = await supabase
        .from('shopping_list')
        .update(body)
        .eq('id', listId)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ listId: string }> }
) {
    const supabase = await createClient();
    const { listId } = await params;

    // First delete all items in the list
    await supabase
        .from('shopping_list_item')
        .delete()
        .eq('list_id', listId);

    // Then delete the list
    const { error } = await supabase
        .from('shopping_list')
        .delete()
        .eq('id', listId);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
}
