import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { InventoryItemInsert } from "@/types/database.types";

// GET all inventory items
export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const category = searchParams.get("category");
  const location = searchParams.get("location");

  let query = supabase.from("inventory_item").select("*").order("updated_at", { ascending: false });

  if (search) {
    query = query.or(`name.ilike.%${search}%,notes.ilike.%${search}%`);
  }

  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  if (location && location !== "all") {
    query = query.eq("location", location);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST - Create new inventory item
export async function POST(request: Request) {
  const supabase = await createClient();
  try {
    const body: InventoryItemInsert = await request.json();

    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const insertData: InventoryItemInsert = {
      name: body.name.trim(),
      quantity: body.quantity ?? 1,
      unit: body.unit || null,
      location: body.location || null,
      category: body.category || null,
      purchase_price_cents: body.purchase_price_cents ?? null,
      acquired_at: body.acquired_at || null,
      notes: body.notes?.trim() || null,
    };

    const { data, error } = await supabase.from("inventory_item").insert([insertData]).select().single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Failed to create inventory item" }, { status: 500 });
  }
}
