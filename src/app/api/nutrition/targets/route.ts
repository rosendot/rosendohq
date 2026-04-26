import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { NutritionTargetInsert } from "@/types/nutrition.types";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const active = searchParams.get("active");

  let query = supabase.from("nutrition_target").select("*").order("start_date", { ascending: false });

  if (active === "true") {
    const today = new Date().toISOString().split("T")[0];
    query = query.lte("start_date", today).or(`end_date.is.null,end_date.gte.${today}`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body: NutritionTargetInsert = await request.json();

  const { data, error } = await supabase.from("nutrition_target").insert([body]).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
