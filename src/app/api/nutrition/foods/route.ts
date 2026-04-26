import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { FoodItemInsert } from "@/types/nutrition.types";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");

  let query = supabase.from("food_item").select("*").order("name", { ascending: true });

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body: FoodItemInsert = await request.json();

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("food_item")
    .insert([{ ...body, name: body.name.trim() }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
