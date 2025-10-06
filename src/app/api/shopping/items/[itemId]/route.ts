// src/app/api/shopping/items/[itemId]/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function PATCH(
    request: Request,
    { params }: { params: { itemId: string } }
) {
    try {
        const { itemId } = params;
        const body = await request.json();

        const updateData: Record<string, any> = {};

        if (body.item_name !== undefined) updateData.item_name = body.item_name.trim();
        if (body.quantity !== undefined) updateData.quantity = body.quantity;
        if (body.unit !== undefined) updateData.unit = body.unit?.trim() || null;
        if (body.category !== undefined) updateData.category = body.category?.trim() || null;
        if (body.notes !== undefined) updateData.notes = body.notes?.trim() || null;
        if (body.is_done !== undefined) updateData.is_done = body.is_done;
        if (body.priority !== undefined) updateData.priority = body.priority;
        if (body.needed_by !== undefined) updateData.needed_by = body.needed_by;
        if (body.aisle !== undefined) updateData.aisle = body.aisle?.trim() || null;
        if (body.last_purchased_at !== undefined) updateData.last_purchased_at = body.last_purchased_at;

        const { data, error } = await supabase
            .from('shopping_list_item')
            .update(updateData)
            .eq('id', itemId)
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
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: 'Failed to update item' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { itemId: string } }
) {
    try {
        const { itemId } = params;

        const { error } = await supabase
            .from('shopping_list_item')
            .delete()
            .eq('id', itemId);

        if (error) {
            console.error('Supabase delete error:', error);
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: 'Failed to delete item' },
            { status: 500 }
        );
    }
}