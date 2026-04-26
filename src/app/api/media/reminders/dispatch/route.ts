import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { MediaReminder, MediaItem } from "@/types/media.types";

type ReminderWithItem = MediaReminder & { media_item: MediaItem | null };

function getLocalParts(now: Date, timezone: string) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(now).map((p) => [p.type, p.value]));
  const weekdayMap: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };
  const day_of_week = weekdayMap[parts.weekday];
  const local_date = `${parts.year}-${parts.month}-${parts.day}`;
  const hour = parts.hour === "24" ? "00" : parts.hour;
  const local_minutes = parseInt(hour) * 60 + parseInt(parts.minute);
  return { day_of_week, local_date, local_minutes };
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":");
  return parseInt(h) * 60 + parseInt(m);
}

function buildMessage(item: MediaItem): string {
  const isShow = item.type === "show" || item.type === "anime";
  let progress = "";
  if (isShow) {
    if (item.current_season && item.current_episode) {
      progress = ` — S${item.current_season}E${item.current_episode}`;
    } else if (item.current_season) {
      progress = ` — Season ${item.current_season}`;
    } else if (item.current_episode) {
      progress = ` — Episode ${item.current_episode}`;
    }
  }
  const platform = item.platform ? ` (${item.platform})` : "";
  return `📺 Time to watch **${item.title}**${progress}${platform}`;
}

export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const provided = request.headers.get("x-cron-secret");
  if (!cronSecret || provided !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const webhookUrl = process.env.DISCORD_REMINDER_WEBHOOK_URL;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Supabase env not configured" }, { status: 500 });
  }
  if (!webhookUrl) {
    return NextResponse.json({ error: "DISCORD_REMINDER_WEBHOOK_URL not configured" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: reminders, error } = await supabase
    .from("media_reminder")
    .select("*, media_item:media_item_id(*)")
    .eq("is_active", true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const now = new Date();
  const sent: string[] = [];
  const skipped: string[] = [];
  const failed: string[] = [];

  for (const r of (reminders ?? []) as ReminderWithItem[]) {
    if (!r.media_item) {
      skipped.push(`${r.id} (no media item)`);
      continue;
    }

    const { day_of_week, local_date, local_minutes } = getLocalParts(now, r.timezone);

    if (day_of_week !== r.day_of_week) {
      skipped.push(`${r.id} (wrong day)`);
      continue;
    }
    if (local_minutes < timeToMinutes(r.time_of_day)) {
      skipped.push(`${r.id} (not yet)`);
      continue;
    }
    if (r.last_sent_on === local_date) {
      skipped.push(`${r.id} (already sent today)`);
      continue;
    }

    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: buildMessage(r.media_item) }),
      });
      if (!res.ok) {
        failed.push(`${r.id} (discord ${res.status})`);
        continue;
      }
      await supabase
        .from("media_reminder")
        .update({ last_sent_on: local_date, updated_at: new Date().toISOString() })
        .eq("id", r.id);
      sent.push(r.id);
    } catch (e) {
      failed.push(`${r.id} (${(e as Error).message})`);
    }
  }

  return NextResponse.json({
    checked: reminders?.length ?? 0,
    sent_count: sent.length,
    sent,
    skipped_count: skipped.length,
    failed_count: failed.length,
    failed,
  });
}
