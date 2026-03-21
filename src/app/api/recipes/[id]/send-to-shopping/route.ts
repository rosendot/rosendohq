import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;
  const { listId } = await request.json();

  if (!listId) {
    return NextResponse.json({ error: "listId is required" }, { status: 400 });
  }

  // Fetch all ingredients for this recipe
  const { data: ingredients, error: fetchError } = await supabase
    .from("recipe_ingredient")
    .select("*")
    .eq("recipe_id", id)
    .order("sort_order", { ascending: true });

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });
  if (!ingredients || ingredients.length === 0) {
    return NextResponse.json({ error: "No ingredients found for this recipe" }, { status: 400 });
  }

  // Map ingredients to shopping list items
  const shoppingItems = ingredients.map((ing) => ({
    list_id: listId,
    item_name: ing.name,
    quantity: ing.quantity ?? null,
    unit: ing.unit ?? null,
    category: ing.group_label ?? null,
    is_done: false,
  }));

  const { data, error } = await supabase
    .from("shopping_list_item")
    .insert(shoppingItems)
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ added: data.length }, { status: 201 });
}
