import { NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server";
import type { HomeSupplyStockUpdate } from '@/types/database.types';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    try {
        const { id } = await params;

        const { data, error } = await supabase
            .from('home_supply_stock')
            .select(`
                *,
                home_supply_item(id, name, category, unit),
                home_area(id, name)
            `)
            .eq('id', id)
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Failed to fetch supply stock' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    try {
        const { id } = await params;
        const body: HomeSupplyStockUpdate = await request.json();

        const updateData: HomeSupplyStockUpdate = {
            ...body,
            updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
            .from('home_supply_stock')
            .update(updateData)
            .eq('id', id)
            .select(`
                *,
                home_supply_item(id, name, category, unit),
                home_area(id, name)
            `)
            .single();

        if (error) {
            console.error('Supabase update error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Failed to update supply stock' }, { status: 500 });
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
            .from('home_supply_stock')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Supabase delete error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Failed to delete supply stock' }, { status: 500 });
    }
}
