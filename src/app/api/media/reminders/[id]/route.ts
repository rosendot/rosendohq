import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { MediaReminderUpdate } from "@/types/media.types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;
  const body: MediaReminderUpdate = await request.json();

  const updateData: MediaReminderUpdate = {
    ...body,
    updated_at: new Date().toISOString(),
  };

  Object.keys(updateData).forEach((key) => {
    if (updateData[key as keyof MediaReminderUpdate] === undefined) {
      delete updateData[key as keyof MediaReminderUpdate];
    }
  });

  const { data, error } = await supabase
    .from("media_reminder")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;

  const { error } = await supabase.from("media_reminder").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
