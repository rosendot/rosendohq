import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function PATCH(request: Request, { params }: { params: Promise<{ expenseId: string }> }) {
  const { expenseId } = await params;
  const body = await request.json();

  const updateData: Record<string, unknown> = {};
  if (body.description !== undefined) updateData.description = body.description.trim();
  if (body.amount_cents !== undefined) updateData.amount_cents = body.amount_cents;
  if (body.currency !== undefined) updateData.currency = body.currency;
  if (body.category !== undefined) updateData.category = body.category?.trim() || null;
  if (body.expense_date !== undefined) updateData.expense_date = body.expense_date;
  if (body.notes !== undefined) updateData.notes = body.notes?.trim() || null;

  const { data, error } = await supabase
    .from("trip_expense")
    .update(updateData)
    .eq("id", expenseId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ expenseId: string }> }) {
  const { expenseId } = await params;

  const { error } = await supabase.from("trip_expense").delete().eq("id", expenseId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
