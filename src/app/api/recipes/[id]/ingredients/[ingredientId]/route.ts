import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { RecipeIngredientUpdate } from "@/types/recipes.types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; ingredientId: string }> },
) {
  const supabase = await createClient();
  const { ingredientId } = await params;
  const body: RecipeIngredientUpdate = await request.json();

  const { data, error } = await supabase
    .from("recipe_ingredient")
    .update(body)
    .eq("id", ingredientId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; ingredientId: string }> },
) {
  const supabase = await createClient();
  const { ingredientId } = await params;

  const { error } = await supabase.from("recipe_ingredient").delete().eq("id", ingredientId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
