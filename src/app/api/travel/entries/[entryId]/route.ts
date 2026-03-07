import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function PATCH(request: Request, { params }: { params: Promise<{ entryId: string }> }) {
  const { entryId } = await params;
  const body = await request.json();

  const updateData: Record<string, unknown> = {};
  if (body.entry_date !== undefined) updateData.entry_date = body.entry_date;
  if (body.content_md !== undefined) updateData.content_md = body.content_md?.trim() || null;

  const { data, error } = await supabase
    .from("trip_entry")
    .update(updateData)
    .eq("id", entryId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ entryId: string }> }) {
  const { entryId } = await params;

  const { error } = await supabase.from("trip_entry").delete().eq("id", entryId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
