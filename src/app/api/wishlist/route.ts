import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

// GET - Fetch all wishlist items
export async function GET() {
    try {
        const { data, error } = await supabase
            .from('wishlist_item')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Failed to fetch wishlist items' }, { status: 500 });
    }
}

// POST - Create new wishlist item
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.title || !body.title.trim()) {
            return NextResponse.json(
                { error: 'Title is required' },
                { status: 400 }
            );
        }

        // Validate status if provided
        const validStatuses = ['wanted', 'considering', 'on_hold', 'purchased', 'declined'];
        if (body.status && !validStatuses.includes(body.status)) {
            return NextResponse.json(
                { error: `Status must be one of: ${validStatuses.join(', ')}` },
                { status: 400 }
            );
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

        // Prepare insert data
        const insertData = {
            title: body.title.trim(),
            category: body.category?.trim() || null,
            status: body.status || 'wanted',
            url: body.url?.trim() || null,
            notes: body.notes?.trim() || null,
            priority: body.priority || null,
            price_cents: body.price_cents || null,
            currency: body.currency?.trim() || 'USD',
            image_url: body.image_url?.trim() || null,
            vendor: body.vendor?.trim() || null,
            brand: body.brand?.trim() || null,
            color: body.color?.trim() || null,
            size: body.size?.trim() || null,
            purchased_at: body.purchased_at || null,
        };

        // Insert into database
        const { data, error } = await supabase
            .from('wishlist_item')
            .insert([insertData])
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
            { error: 'Failed to create wishlist item' },
            { status: 500 }
        );
    }
}