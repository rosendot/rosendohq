import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { NutritionTargetUpdate } from "@/types/nutrition.types";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;
  const body: NutritionTargetUpdate = await request.json();

  const { data, error } = await supabase.from("nutrition_target").update(body).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  const { error } = await supabase.from("nutrition_target").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
