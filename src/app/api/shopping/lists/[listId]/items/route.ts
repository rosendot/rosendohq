// src/app/api/shopping/lists/[listId]/items/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ listId: string }> }
) {
    try {
        const { listId } = await params;

        const { data, error } = await supabase
            .from('shopping_list_item')
            .select('*')
            .eq('list_id', listId)
            .order('is_done', { ascending: true })
            .order('priority', { ascending: true })
            .order('category', { ascending: true })
            .order('item_name', { ascending: true });

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch shopping list items' },
            { status: 500 }
        );
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ listId: string }> }
) {
    try {
        const { listId } = await params;
        const body = await request.json();

        if (!body.item_name || !body.item_name.trim()) {
            return NextResponse.json(
                { error: 'Item name is required' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('shopping_list_item')
            .insert([{
                list_id: listId,
                item_name: body.item_name.trim(),
                quantity: body.quantity || null,
                unit: body.unit?.trim() || null,
                category: body.category?.trim() || null,
                notes: body.notes?.trim() || null,
                is_done: body.is_done || false,
                priority: body.priority || null,
                needed_by: body.needed_by || null,
                aisle: body.aisle?.trim() || null,
            }])
            .select()
            .single();

        if (error) {
            console.error('Supabase insert error:', error);
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: 'Failed to create shopping list item' },
            { status: 500 }
        );
    }
}