import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("v_daily_macros_vs_target")
    .select("*")
    .eq("day", date)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
