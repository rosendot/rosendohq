import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function PATCH(request: Request, { params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params;
  const body = await request.json();

  const updateData: Record<string, unknown> = {};
  if (body.at !== undefined) updateData.at = body.at;
  if (body.type !== undefined) updateData.type = body.type;
  if (body.title !== undefined) updateData.title = body.title?.trim() || null;
  if (body.details !== undefined) updateData.details = body.details;

  const { data, error } = await supabase
    .from("itinerary_item")
    .update(updateData)
    .eq("id", itemId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params;

  const { error } = await supabase.from("itinerary_item").delete().eq("id", itemId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
