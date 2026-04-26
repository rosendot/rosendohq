import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { MealInsert } from "@/types/nutrition.types";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  let query = supabase.from("meal").select("*").order("meal_date", { ascending: false });

  if (date) {
    query = query.eq("meal_date", date);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body: MealInsert = await request.json();

  if (!body.meal_date || !body.name) {
    return NextResponse.json({ error: "meal_date and name are required" }, { status: 400 });
  }

  const { data, error } = await supabase.from("meal").insert([body]).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
