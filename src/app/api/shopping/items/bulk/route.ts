// src/app/api/shopping/items/bulk/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

// Bulk update items (for marking as complete)
export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { itemIds, updates } = body;

        if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
            return NextResponse.json(
                { error: 'itemIds array is required' },
                { status: 400 }
            );
        }

        const updateData: Record<string, unknown> = {};
        if (updates.is_done !== undefined) {
            updateData.is_done = updates.is_done;
            // If marking as incomplete, clear the purchase timestamp
            if (updates.is_done === false) {
                updateData.last_purchased_at = null;
            }
        }
        if (updates.last_purchased_at !== undefined) updateData.last_purchased_at = updates.last_purchased_at;

        const { data, error } = await supabase
            .from('shopping_list_item')
            .update(updateData)
            .in('id', itemIds)
            .select();

        if (error) {
            console.error('Supabase bulk update error:', error);
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            updated: data?.length || 0,
            data
        });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: 'Failed to bulk update items' },
            { status: 500 }
        );
    }
}

// Bulk delete items
export async function DELETE(request: Request) {
    try {
        const body = await request.json();
        const { itemIds } = body;

        if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
            return NextResponse.json(
                { error: 'itemIds array is required' },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from('shopping_list_item')
            .delete()
            .in('id', itemIds);

        if (error) {
            console.error('Supabase bulk delete error:', error);
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            deleted: itemIds.length
        });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: 'Failed to bulk delete items' },
            { status: 500 }
        );
    }
}
