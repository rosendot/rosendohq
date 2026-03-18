import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { NoteUpdate } from "@/types/notes.types";

// GET single note
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  const { data, error } = await supabase.from("note").select("*").eq("id", id).single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}

// PATCH - Update note
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;
  const body: NoteUpdate = await request.json();

  const updateData: NoteUpdate = {
    ...body,
    updated_at: new Date().toISOString(),
  };

  Object.keys(updateData).forEach((key) => {
    if (updateData[key as keyof NoteUpdate] === undefined) {
      delete updateData[key as keyof NoteUpdate];
    }
  });

  const { data, error } = await supabase.from("note").update(updateData).eq("id", id).select().single();

  if (error) {
    console.error("Supabase update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE note
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  const { error } = await supabase.from("note").delete().eq("id", id);

  if (error) {
    console.error("Supabase delete error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
