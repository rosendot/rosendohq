import { NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server";
import type { HomeApplianceUpdate } from '@/types/house.types';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    try {
        const { id } = await params;

        const { data, error } = await supabase
            .from('home_appliance')
            .select('*, home_area(id, name)')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Failed to fetch appliance' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    try {
        const { id } = await params;
        const body: HomeApplianceUpdate = await request.json();

        const { data, error } = await supabase
            .from('home_appliance')
            .update(body)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Supabase update error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Failed to update appliance' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    try {
        const { id } = await params;

        const { error } = await supabase
            .from('home_appliance')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Supabase delete error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Failed to delete appliance' }, { status: 500 });
    }
}
