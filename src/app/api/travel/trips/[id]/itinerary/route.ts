import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  const { data, error } = await supabase
    .from("itinerary_item")
    .select("*")
    .eq("trip_id", id)
    .order("at", { ascending: true });

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

    if (!body.at || !body.type) {
      return NextResponse.json({ error: "at and type are required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("itinerary_item")
      .insert([
        {
          trip_id: id,
          at: body.at,
          type: body.type,
          title: body.title?.trim() || null,
          details: body.details || null,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create itinerary item" }, { status: 500 });
  }
}
