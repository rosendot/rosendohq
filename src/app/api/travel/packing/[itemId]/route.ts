import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ itemId: string }> }) {
  const supabase = await createClient();
  const { itemId } = await params;
  const body = await request.json();

  const updateData: Record<string, unknown> = {};
  if (body.item !== undefined) updateData.item = body.item.trim();
  if (body.qty !== undefined) updateData.qty = body.qty;
  if (body.packed !== undefined) updateData.packed = body.packed;
  if (body.category !== undefined) updateData.category = body.category?.trim() || null;
  if (body.sort_order !== undefined) updateData.sort_order = body.sort_order;

  const { data, error } = await supabase
    .from("trip_packing_item")
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
  const supabase = await createClient();
  const { itemId } = await params;

  const { error } = await supabase.from("trip_packing_item").delete().eq("id", itemId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
