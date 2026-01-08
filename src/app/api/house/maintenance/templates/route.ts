import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import type { HomeMaintenanceTemplateInsert } from '@/types/database.types';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const propertyId = searchParams.get('propertyId');
        const category = searchParams.get('category');

        let query = supabase
            .from('home_maintenance_template')
            .select('*')
            .order('priority', { ascending: false })
            .order('name', { ascending: true });

        if (propertyId) {
            query = query.or(`property_id.eq.${propertyId},property_id.is.null`);
        }

        if (category) {
            query = query.eq('category', category);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Failed to fetch maintenance templates' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body: HomeMaintenanceTemplateInsert = await request.json();

        if (!body.name || !body.name.trim()) {
            return NextResponse.json({ error: 'Template name is required' }, { status: 400 });
        }

        const insertData: HomeMaintenanceTemplateInsert = {
            property_id: body.property_id || null,
            name: body.name.trim(),
            interval_months: body.interval_months || null,
            interval_days: body.interval_days || null,
            priority: body.priority || 3,
            estimated_cost_cents: body.estimated_cost_cents || null,
            category: body.category?.trim() || null,
            notes: body.notes?.trim() || null,
        };

        const { data, error } = await supabase
            .from('home_maintenance_template')
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
        return NextResponse.json({ error: 'Failed to create maintenance template' }, { status: 500 });
    }
}
