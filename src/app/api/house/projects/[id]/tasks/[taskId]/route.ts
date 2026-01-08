import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import type { HomeProjectTaskUpdate } from '@/types/database.types';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string; taskId: string }> }
) {
    try {
        const { taskId } = await params;

        const { data, error } = await supabase
            .from('home_project_task')
            .select('*')
            .eq('id', taskId)
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Failed to fetch project task' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string; taskId: string }> }
) {
    try {
        const { taskId } = await params;
        const body: HomeProjectTaskUpdate = await request.json();

        // If status is being set to completed, auto-set completed_date
        const updateData: HomeProjectTaskUpdate = { ...body };
        if (body.status === 'completed' && !body.completed_date) {
            updateData.completed_date = new Date().toISOString().split('T')[0];
        }

        const { data, error } = await supabase
            .from('home_project_task')
            .update(updateData)
            .eq('id', taskId)
            .select()
            .single();

        if (error) {
            console.error('Supabase update error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Failed to update project task' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string; taskId: string }> }
) {
    try {
        const { taskId } = await params;

        const { error } = await supabase
            .from('home_project_task')
            .delete()
            .eq('id', taskId);

        if (error) {
            console.error('Supabase delete error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Failed to delete project task' }, { status: 500 });
    }
}
