// src/app/api/media/[id]/logs/route.ts
// Watch history for one media item. Rows are written automatically when the
// episode stepper advances, and manually from the detail page's log form.
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { MediaLogInsert } from "@/types/media.types";

// GET all logs for a media item, newest first.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const since = searchParams.get("since"); // YYYY-MM-DD, inclusive

  let query = supabase
    .from("media_log")
    .select("*")
    .eq("media_item_id", id)
    .order("log_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (since) query = query.gte("log_date", since);

  const { data, error } = await query;
  if (error) {
    console.error("Supabase media_log fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// POST a new log entry.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;
  try {
    const body: Partial<MediaLogInsert> = await request.json();

    if (body.progress === undefined || body.progress === null) {
      return NextResponse.json({ error: "progress is required" }, { status: 400 });
    }

    const insertData = {
      // owner_id set by the DB default (auth.uid())
      media_item_id: id,
      log_date: body.log_date || new Date().toISOString().slice(0, 10),
      progress: body.progress,
      note: body.note?.trim() || null,
    };

    const { data, error } = await supabase.from("media_log").insert([insertData]).select().single();

    if (error) {
      console.error("Supabase media_log insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Failed to create log" }, { status: 500 });
  }
}
