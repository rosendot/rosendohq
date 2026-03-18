import { NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server";
import type { HomeProjectTaskInsert } from '@/types/house.types';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    try {
        const { id: projectId } = await params;

        const { data, error } = await supabase
            .from('home_project_task')
            .select('*')
            .eq('project_id', projectId)
            .order('sort_order', { ascending: true })
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Failed to fetch project tasks' }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    try {
        const { id: projectId } = await params;
        const body: HomeProjectTaskInsert = await request.json();

        if (!body.name || !body.name.trim()) {
            return NextResponse.json({ error: 'Task name is required' }, { status: 400 });
        }

        const insertData: HomeProjectTaskInsert = {
            project_id: projectId,
            name: body.name.trim(),
            description: body.description?.trim() || null,
            status: body.status || 'pending',
            sort_order: body.sort_order || 0,
            estimated_cost_cents: body.estimated_cost_cents || null,
            actual_cost_cents: body.actual_cost_cents || null,
            due_date: body.due_date || null,
            completed_date: body.completed_date || null,
            assigned_to: body.assigned_to?.trim() || null,
            notes: body.notes?.trim() || null,
        };

        const { data, error } = await supabase
            .from('home_project_task')
            .insert([insertData])
            .select()
            .single();

        if (error) {
            console.error('Supabase insert error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Failed to create project task' }, { status: 500 });
    }
}
