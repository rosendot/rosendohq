// src/app/api/car/maintenance/records/[id]/route.ts
import { NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
const params = await props.params;
    const { error } = await supabase
        .from('maintenance_record')
        .delete()
        .eq('id', params.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
