import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { RecipeCookLogInsert } from "@/types/recipes.types";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  const { data, error } = await supabase
    .from("recipe_cook_log")
    .select("*")
    .eq("recipe_id", id)
    .order("cooked_on", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;
  const body: Omit<RecipeCookLogInsert, "recipe_id"> = await request.json();

  const { data, error } = await supabase
    .from("recipe_cook_log")
    .insert([{ ...body, recipe_id: id }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
