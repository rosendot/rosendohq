import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

// DELETE - Remove a wishlist item
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Validate ID format (UUID)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            return NextResponse.json(
                { error: 'Invalid item ID format' },
                { status: 400 }
            );
        }

        // Check if item exists
        const { data: existingItem, error: fetchError } = await supabase
            .from('wishlist_item')
            .select('id')
            .eq('id', id)
            .single();

        if (fetchError || !existingItem) {
            return NextResponse.json(
                { error: 'Item not found' },
                { status: 404 }
            );
        }

        // Delete the item
        const { error: deleteError } = await supabase
            .from('wishlist_item')
            .delete()
            .eq('id', id);

        if (deleteError) {
            console.error('Supabase delete error:', deleteError);
            return NextResponse.json(
                { error: deleteError.message },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: 'Item deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: 'Failed to delete item' },
            { status: 500 }
        );
    }
}

// PUT - Update a wishlist item (bonus - included for completeness)
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Validate ID format (UUID)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            return NextResponse.json(
                { error: 'Invalid item ID format' },
                { status: 400 }
            );
        }

        // Check if item exists
        const { data: existingItem, error: fetchError } = await supabase
            .from('wishlist_item')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !existingItem) {
            return NextResponse.json(
                { error: 'Item not found' },
                { status: 404 }
            );
        }

        // Validate status if provided
        if (body.status) {
            const validStatuses = ['wanted', 'considering', 'on_hold', 'purchased', 'declined'];
            if (!validStatuses.includes(body.status)) {
                return NextResponse.json(
                    { error: `Status must be one of: ${validStatuses.join(', ')}` },
                    { status: 400 }
                );
            }
        }

        // Validate priority if provided (1-5)
        if (body.priority !== undefined && (body.priority < 1 || body.priority > 5)) {
            return NextResponse.json(
                { error: 'Priority must be between 1 and 5' },
                { status: 400 }
            );
        }

        // Validate price_cents if provided (must be positive)
        if (body.price_cents !== undefined && body.price_cents < 0) {
            return NextResponse.json(
                { error: 'Price must be positive' },
                { status: 400 }
            );
        }

        // Validate URL format if provided
        if (body.url) {
            try {
                new URL(body.url);
            } catch {
                return NextResponse.json(
                    { error: 'Invalid URL format' },
                    { status: 400 }
                );
            }
        }

        // Prepare update data - only include fields that were provided
        const updateData: Record<string, unknown> = {};

        if (body.title !== undefined) updateData.title = body.title.trim();
        if (body.category !== undefined) updateData.category = body.category?.trim() || null;
        if (body.status !== undefined) updateData.status = body.status;
        if (body.url !== undefined) updateData.url = body.url?.trim() || null;
        if (body.notes !== undefined) updateData.notes = body.notes?.trim() || null;
        if (body.priority !== undefined) updateData.priority = body.priority;
        if (body.price_cents !== undefined) updateData.price_cents = body.price_cents;
        if (body.currency !== undefined) updateData.currency = body.currency?.trim() || 'USD';
        if (body.image_url !== undefined) updateData.image_url = body.image_url?.trim() || null;
        if (body.vendor !== undefined) updateData.vendor = body.vendor?.trim() || null;
        if (body.brand !== undefined) updateData.brand = body.brand?.trim() || null;
        if (body.color !== undefined) updateData.color = body.color?.trim() || null;
        if (body.size !== undefined) updateData.size = body.size?.trim() || null;
        if (body.purchased_at !== undefined) updateData.purchased_at = body.purchased_at || null;

        // Ensure at least one field is being updated
        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { error: 'No fields to update' },
                { status: 400 }
            );
        }

        // Update the item
        const { data, error: updateError } = await supabase
            .from('wishlist_item')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (updateError) {
            console.error('Supabase update error:', updateError);
            return NextResponse.json(
                { error: updateError.message },
                { status: 500 }
            );
        }

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: 'Failed to update item' },
            { status: 500 }
        );
    }
}