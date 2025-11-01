// src/app/api/media/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import type { MediaItemInsert } from '@/types/database.types';

// GET all media items
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    let query = supabase
        .from('media_item')
        .select('*')
        .order('updated_at', { ascending: false });

    if (status && status !== 'all') {
        query = query.eq('status', status);
    }

    if (type && type !== 'all') {
        query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Supabase fetch error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }

    return NextResponse.json(data);
}

// POST - Create new media item
export async function POST(request: Request) {
    try {
        const body: MediaItemInsert = await request.json();

        // Validate required fields
        if (!body.title || !body.type) {
            return NextResponse.json(
                { error: 'Title and type are required' },
                { status: 400 }
            );
        }

        const insertData: MediaItemInsert = {
            owner_id: body.owner_id,
            title: body.title.trim(),
            type: body.type,
            status: body.status || 'planned',
            total_episodes: body.total_episodes || null,
            current_episode: body.current_episode || 0,
            platform: body.platform?.trim() || null,
            rating: body.rating || null,
            notes: body.notes?.trim() || null,
            started_at: body.started_at || null,
            completed_at: body.completed_at || null,
        };

        const { data, error } = await supabase
            .from('media_item')
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
            { error: 'Failed to create media item' },
            { status: 500 }
        );
    }
}