import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('wishlist_item')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Failed to fetch wishlist items' }, { status: 500 });
    }
}