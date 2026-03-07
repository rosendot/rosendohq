import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { InventoryItemUpdate } from "@/types/database.types";

// GET single inventory item
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  const { data, error } = await supabase.from("inventory_item").select("*").eq("id", id).single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}

// PATCH - Update inventory item
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;
  const body: InventoryItemUpdate = await request.json();

  const updateData: InventoryItemUpdate = {
    ...body,
    updated_at: new Date().toISOString(),
  };

  Object.keys(updateData).forEach((key) => {
    if (updateData[key as keyof InventoryItemUpdate] === undefined) {
      delete updateData[key as keyof InventoryItemUpdate];
    }
  });

  const { data, error } = await supabase
    .from("inventory_item")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Supabase update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE inventory item
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  const { error } = await supabase.from("inventory_item").delete().eq("id", id);

  if (error) {
    console.error("Supabase delete error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
