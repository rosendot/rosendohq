import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import type { HomeProjectInsert } from '@/types/database.types';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const propertyId = searchParams.get('propertyId');
        const status = searchParams.get('status');

        let query = supabase
            .from('home_project')
            .select(`
                *,
                home_area(id, name),
                home_contractor(id, name, company)
            `)
            .order('updated_at', { ascending: false });

        if (propertyId) {
            query = query.eq('property_id', propertyId);
        }

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body: HomeProjectInsert = await request.json();

        if (!body.name || !body.name.trim()) {
            return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
        }

        if (!body.property_id) {
            return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
        }

        const insertData: HomeProjectInsert = {
            property_id: body.property_id,
            area_id: body.area_id || null,
            name: body.name.trim(),
            description: body.description?.trim() || null,
            status: body.status || 'planning',
            priority: body.priority || 3,
            category: body.category?.trim() || null,
            estimated_cost_cents: body.estimated_cost_cents || null,
            actual_cost_cents: body.actual_cost_cents || null,
            budget_cents: body.budget_cents || null,
            start_date: body.start_date || null,
            target_end_date: body.target_end_date || null,
            actual_end_date: body.actual_end_date || null,
            contractor_id: body.contractor_id || null,
            notes: body.notes?.trim() || null,
        };

        const { data, error } = await supabase
            .from('home_project')
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
        return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }
}
