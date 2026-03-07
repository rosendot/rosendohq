import { NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server";
import type { HomeUtilityBillInsert } from '@/types/database.types';

export async function GET(request: Request) {
    const supabase = await createClient();
    try {
        const { searchParams } = new URL(request.url);
        const propertyId = searchParams.get('propertyId');
        const utilityType = searchParams.get('type');
        const isPaid = searchParams.get('isPaid');

        let query = supabase
            .from('home_utility_bill')
            .select('*')
            .order('bill_date', { ascending: false });

        if (propertyId) {
            query = query.eq('property_id', propertyId);
        }

        if (utilityType) {
            query = query.eq('utility_type', utilityType);
        }

        if (isPaid === 'true') {
            query = query.eq('is_paid', true);
        } else if (isPaid === 'false') {
            query = query.eq('is_paid', false);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Failed to fetch utility bills' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const supabase = await createClient();
    try {
        const body: HomeUtilityBillInsert = await request.json();

        if (!body.property_id) {
            return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
        }

        if (!body.utility_type) {
            return NextResponse.json({ error: 'Utility type is required' }, { status: 400 });
        }

        if (!body.bill_date) {
            return NextResponse.json({ error: 'Bill date is required' }, { status: 400 });
        }

        if (body.amount_cents === undefined || body.amount_cents === null) {
            return NextResponse.json({ error: 'Amount is required' }, { status: 400 });
        }

        const insertData: HomeUtilityBillInsert = {
            property_id: body.property_id,
            utility_type: body.utility_type,
            provider: body.provider?.trim() || null,
            account_number: body.account_number?.trim() || null,
            bill_date: body.bill_date,
            due_date: body.due_date || null,
            period_start: body.period_start || null,
            period_end: body.period_end || null,
            amount_cents: body.amount_cents,
            usage_quantity: body.usage_quantity || null,
            usage_unit: body.usage_unit?.trim() || null,
            is_paid: body.is_paid || false,
            paid_date: body.paid_date || null,
            notes: body.notes?.trim() || null,
        };

        const { data, error } = await supabase
            .from('home_utility_bill')
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
        return NextResponse.json({ error: 'Failed to create utility bill' }, { status: 500 });
    }
}
