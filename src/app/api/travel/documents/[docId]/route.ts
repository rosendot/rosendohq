import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ docId: string }> }) {
  const supabase = await createClient();
  const { docId } = await params;
  const body = await request.json();

  const updateData: Record<string, unknown> = {};
  if (body.name !== undefined) updateData.name = body.name.trim();
  if (body.url !== undefined) updateData.url = body.url?.trim() || null;
  if (body.doc_type !== undefined) updateData.doc_type = body.doc_type;
  if (body.notes !== undefined) updateData.notes = body.notes?.trim() || null;

  const { data, error } = await supabase
    .from("trip_document")
    .update(updateData)
    .eq("id", docId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ docId: string }> }) {
  const supabase = await createClient();
  const { docId } = await params;

  const { error } = await supabase.from("trip_document").delete().eq("id", docId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
