// src/app/api/shopping/lists/route.ts
import { NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server";
import type { ShoppingListInsert } from '@/types/shopping.types';

export async function GET() {
    const supabase = await createClient();
    const { data } = await supabase
        .from('shopping_list')
        .select('*');

    // data is automatically typed as ShoppingList[]
    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const body: ShoppingListInsert = await request.json();

    const { data } = await supabase
        .from('shopping_list')
        .insert([body])
        .select()
        .single();

    return NextResponse.json(data);
}