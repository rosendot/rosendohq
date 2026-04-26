import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { MediaReminderInsert } from "@/types/media.types";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const mediaItemId = searchParams.get("mediaItemId");

  let query = supabase
    .from("media_reminder")
    .select("*")
    .order("day_of_week", { ascending: true })
    .order("time_of_day", { ascending: true });

  if (mediaItemId) {
    query = query.eq("media_item_id", mediaItemId);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  try {
    const body: MediaReminderInsert = await request.json();

    if (
      !body.media_item_id ||
      body.day_of_week === undefined ||
      body.day_of_week === null ||
      !body.time_of_day
    ) {
      return NextResponse.json(
        { error: "media_item_id, day_of_week, and time_of_day are required" },
        { status: 400 }
      );
    }

    const insertData: MediaReminderInsert = {
      media_item_id: body.media_item_id,
      day_of_week: body.day_of_week,
      time_of_day: body.time_of_day,
      timezone: body.timezone || "America/New_York",
      is_active: body.is_active ?? true,
    };

    const { data, error } = await supabase
      .from("media_reminder")
      .insert([insertData])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create reminder" }, { status: 500 });
  }
}
