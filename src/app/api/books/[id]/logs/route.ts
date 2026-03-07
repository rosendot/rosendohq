// src/app/api/books/[id]/logs/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ReadingLogInsert } from "@/types/database.types";

// GET all logs for a specific book
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  const { data, error } = await supabase
    .from("reading_log")
    .select("*")
    .eq("book_id", id)
    .order("log_date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST - Create new reading log entry
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;
  const body: Partial<ReadingLogInsert> = await request.json();

  const insertData: ReadingLogInsert = {
    book_id: id,
    log_date: body.log_date || new Date().toISOString().split("T")[0],
    pages: body.pages || null,
    minutes: body.minutes || null,
    note: body.note || null,
  };

  const { data, error } = await supabase.from("reading_log").insert([insertData]).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
