import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import type { HomeMaintenanceRecordInsert } from '@/types/database.types';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const propertyId = searchParams.get('propertyId');
        const status = searchParams.get('status');
        const areaId = searchParams.get('areaId');

        let query = supabase
            .from('home_maintenance_record')
            .select(`
                *,
                home_maintenance_template(id, name, category, priority, interval_months, interval_days),
                home_area(id, name),
                home_appliance(id, name),
                home_contractor(id, name, company)
            `)
            .order('service_date', { ascending: false });

        if (propertyId) {
            query = query.eq('property_id', propertyId);
        }

        if (status) {
            query = query.eq('status', status);
        }

        if (areaId) {
            query = query.eq('area_id', areaId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Failed to fetch maintenance records' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body: HomeMaintenanceRecordInsert = await request.json();

        if (!body.item || !body.item.trim()) {
            return NextResponse.json({ error: 'Item/task name is required' }, { status: 400 });
        }

        if (!body.property_id) {
            return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
        }

        if (!body.service_date) {
            return NextResponse.json({ error: 'Service date is required' }, { status: 400 });
        }

        const insertData: HomeMaintenanceRecordInsert = {
            property_id: body.property_id,
            area_id: body.area_id || null,
            appliance_id: body.appliance_id || null,
            template_id: body.template_id || null,
            item: body.item.trim(),
            service_date: body.service_date,
            cost_cents: body.cost_cents || null,
            vendor: body.vendor?.trim() || null,
            status: body.status || 'pending',
            is_diy: body.is_diy || false,
            contractor_id: body.contractor_id || null,
            project_id: body.project_id || null,
            notes: body.notes?.trim() || null,
        };

        const { data, error } = await supabase
            .from('home_maintenance_record')
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
        return NextResponse.json({ error: 'Failed to create maintenance record' }, { status: 500 });
    }
}
