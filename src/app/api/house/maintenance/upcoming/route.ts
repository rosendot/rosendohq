import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const propertyId = searchParams.get('propertyId');

        let query = supabase
            .from('v_home_maintenance_next_due')
            .select('*')
            .order('next_due_date', { ascending: true });

        if (propertyId) {
            query = query.eq('property_id', propertyId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Failed to fetch upcoming maintenance' }, { status: 500 });
    }
}
