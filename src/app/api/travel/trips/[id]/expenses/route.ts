import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  const { data, error } = await supabase
    .from("trip_expense")
    .select("*")
    .eq("trip_id", id)
    .order("expense_date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  try {
    const body = await request.json();

    if (!body.description?.trim() || body.amount_cents === undefined || !body.expense_date) {
      return NextResponse.json(
        { error: "description, amount_cents, and expense_date are required" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("trip_expense")
      .insert([
        {
          trip_id: id,
          description: body.description.trim(),
          amount_cents: body.amount_cents,
          currency: body.currency || "USD",
          category: body.category?.trim() || null,
          expense_date: body.expense_date,
          notes: body.notes?.trim() || null,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
  }
}
