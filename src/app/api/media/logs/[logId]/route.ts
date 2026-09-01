// src/app/api/media/logs/[logId]/route.ts
// Individual watch-log CRUD. Flat route (not nested under the media item) so
// the detail page can delete a row it already holds the id for.
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { MediaLog } from "@/types/media.types";

export async function PATCH(request: Request, { params }: { params: Promise<{ logId: string }> }) {
  const supabase = await createClient();
  const { logId } = await params;
  const body: Partial<MediaLog> = await request.json();

  const updateData: Partial<MediaLog> = { ...body };
  delete updateData.id;
  delete updateData.owner_id;
  delete updateData.created_at;
  Object.keys(updateData).forEach((k) => {
    if (updateData[k as keyof MediaLog] === undefined) delete updateData[k as keyof MediaLog];
  });

  const { data, error } = await supabase
    .from("media_log")
    .update(updateData)
    .eq("id", logId)
    .select()
    .single();

  if (error) {
    console.error("Supabase media_log update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ logId: string }> }) {
  const supabase = await createClient();
  const { logId } = await params;

  const { error } = await supabase.from("media_log").delete().eq("id", logId);
  if (error) {
    console.error("Supabase media_log delete error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
