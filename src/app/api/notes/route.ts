import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { NoteInsert } from "@/types/database.types";

// GET all notes
export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");

  let query = supabase
    .from("note")
    .select("id, title, content_md, tags, created_at, updated_at")
    .order("updated_at", { ascending: false });

  if (search) {
    query = query.or(`title.ilike.%${search}%,content_md.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST - Create new note
export async function POST(request: Request) {
  const supabase = await createClient();
  try {
    const body: NoteInsert = await request.json();

    if (!body.title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const insertData: NoteInsert = {
      title: body.title.trim(),
      content_md: body.content_md?.trim() || null,
      tags: body.tags || [],
    };

    const { data, error } = await supabase.from("note").insert([insertData]).select().single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}
