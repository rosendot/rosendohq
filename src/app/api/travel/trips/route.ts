import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET() {
  const { data, error } = await supabase
    .from("trip")
    .select("*")
    .order("start_date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name?.trim() || !body.start_date || !body.end_date) {
      return NextResponse.json({ error: "Name, start_date, and end_date are required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("trip")
      .insert([
        {
          name: body.name.trim(),
          destination: body.destination?.trim() || null,
          start_date: body.start_date,
          end_date: body.end_date,
          status: body.status || "planning",
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
    return NextResponse.json({ error: "Failed to create trip" }, { status: 500 });
  }
}
