import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { RecipeStepUpdate } from "@/types/recipes.types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; stepId: string }> },
) {
  const supabase = await createClient();
  const { stepId } = await params;
  const body: RecipeStepUpdate = await request.json();

  const { data, error } = await supabase
    .from("recipe_step")
    .update(body)
    .eq("id", stepId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; stepId: string }> },
) {
  const supabase = await createClient();
  const { stepId } = await params;

  const { error } = await supabase.from("recipe_step").delete().eq("id", stepId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
