// src/app/api/shopping/lists/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import type { ShoppingList, ShoppingListInsert } from '@/types/database.types';

export async function GET() {
    const { data, error } = await supabase
        .from('shopping_list')
        .select('*');

    // data is automatically typed as ShoppingList[]
    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const body: ShoppingListInsert = await request.json();

    const { data, error } = await supabase
        .from('shopping_list')
        .insert([body])
        .select()
        .single();

    return NextResponse.json(data);
}