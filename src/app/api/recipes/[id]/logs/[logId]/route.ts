import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { RecipeCookLogUpdate } from "@/types/recipes.types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; logId: string }> },
) {
  const supabase = await createClient();
  const { logId } = await params;
  const body: RecipeCookLogUpdate = await request.json();

  const { data, error } = await supabase
    .from("recipe_cook_log")
    .update(body)
    .eq("id", logId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; logId: string }> },
) {
  const supabase = await createClient();
  const { logId } = await params;

  const { error } = await supabase.from("recipe_cook_log").delete().eq("id", logId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
