// src/app/api/books/route.ts
import { NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server";
import type { BookInsert } from '@/types/reading.types';

// GET all books
export async function GET(request: Request) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const format = searchParams.get('format');

    let query = supabase
        .from('book')
        .select('*')
        .order('updated_at', { ascending: false });

    if (status && status !== 'all') {
        query = query.eq('status', status);
    }

    if (format && format !== 'all') {
        query = query.eq('format', format);
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

// POST - Create new book
export async function POST(request: Request) {
    const supabase = await createClient();
    try {
        const body: BookInsert = await request.json();

        // Validate required fields
        if (!body.title) {
            return NextResponse.json(
                { error: 'Title is required' },
                { status: 400 }
            );
        }

        const insertData: Partial<BookInsert> = {
            title: body.title.trim(),
            author: body.author?.trim() || null,
            status: body.status || 'planned',
            current_page: body.current_page || 0,
            total_pages: body.total_pages || null,
            format: body.format || null,
            rating: body.rating || null,
            notes: body.notes?.trim() || null,
            started_at: body.started_at || null,
            finished_at: body.finished_at || null,
        };

        const { data, error } = await supabase
            .from('book')
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
            { error: 'Failed to create book' },
            { status: 500 }
        );
    }
}