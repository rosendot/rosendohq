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

// Maps platform name fragments to Discord embed colors (decimal RGB).
// Mirrors the UI's getPlatformColor() so reminders feel visually consistent with cards.
function getPlatformEmbedColor(platform: string | null): number {
  if (!platform) return 0x4b5563; // gray-600
  const p = platform.toLowerCase();
  if (p.includes("netflix")) return 0xe50914;
  if (p.includes("hulu")) return 0x1ce783;
  if (p.includes("disney")) return 0x113ccf;
  if (p.includes("prime") || p.includes("amazon")) return 0x00a8e1;
  if (p.includes("max") || p.includes("hbo")) return 0x9b4dca;
  if (p.includes("apple")) return 0x1f1f1f;
  if (p.includes("peacock")) return 0xfacc15;
  if (p.includes("paramount")) return 0x0064ff;
  if (p.includes("crunchyroll")) return 0xf47521;
  if (p.includes("funimation")) return 0x8b5cf6;
  if (p.includes("hidive")) return 0x60a5fa;
  if (p.includes("youtube")) return 0xff0000;
  if (p.includes("tubi")) return 0xfb923c;
  if (p.includes("pluto")) return 0xfacc15;
  if (p.includes("showtime")) return 0xb91c1c;
  if (p.includes("starz")) return 0x111827;
  if (p.includes("amc")) return 0x374151;
  return 0x4b5563;
}

function formatProgress(item: MediaItem): string {
  if (item.current_season && item.current_episode) {
    const ep = item.episodes_in_season
      ? `Episode ${item.current_episode} / ${item.episodes_in_season}`
      : `Episode ${item.current_episode}`;
    const season = item.total_seasons
      ? `Season ${item.current_season} of ${item.total_seasons}`
      : `Season ${item.current_season}`;
    return `${season} • ${ep}`;
  }
  if (item.current_season) return `Season ${item.current_season}`;
  if (item.current_episode) return `Episode ${item.current_episode}`;
  return "Just getting started";
}

function buildEmbedPayload(item: MediaItem, reminder: { day_of_week: number; time_of_day: string; timezone: string }) {
  const dayLabels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const [h, m] = reminder.time_of_day.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 || 12;
  const timeStr = `${display}:${m} ${ampm}`;

  const typeLabel =
    item.type === "anime" ? "Anime" : item.type === "show" ? "TV Show" : "Movie";

  const fields: Array<{ name: string; value: string; inline?: boolean }> = [
    { name: "Progress", value: formatProgress(item), inline: true },
    { name: "Type", value: typeLabel, inline: true },
  ];
  if (item.platform) {
    fields.push({ name: "Platform", value: item.platform, inline: true });
  }
  if (item.rating) {
    fields.push({ name: "Your Rating", value: "★".repeat(item.rating) + "☆".repeat(5 - item.rating), inline: true });
  }

  return {
    embeds: [
      {
        title: `📺 ${item.title}`,
        description: "Time to keep watching",
        color: getPlatformEmbedColor(item.platform),
        fields,
        footer: {
          text: `Weekly reminder • ${dayLabels[reminder.day_of_week]} ${timeStr}`,
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };
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
        body: JSON.stringify(buildEmbedPayload(r.media_item, r)),
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
