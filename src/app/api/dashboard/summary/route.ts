// src/app/api/dashboard/summary/route.ts
// One round trip for the whole dashboard. The widgets previously fanned out to
// a dozen module endpoints from the client, which meant a dozen waterfalls and
// several 404s for routes that do not exist.
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export type DashboardSummary = {
  today: string;
  habits: {
    scheduledToday: number;
    doneToday: number;
    activeTotal: number;
    pending: { id: string; name: string; category: string | null; period: string | null }[];
  };
  media: {
    watching: number;
    planned: number;
    completed: number;
    continueWatching: {
      id: string;
      title: string;
      type: string;
      poster_url: string | null;
      current_season: number | null;
      current_episode: number | null;
      episodes_in_season: number | null;
      updated_at: string;
    }[];
  };
  reading: {
    reading: number;
    planned: number;
    finished: number;
    current: {
      id: string;
      title: string;
      author: string | null;
      cover_url: string | null;
      current_page: number | null;
      total_pages: number | null;
    }[];
  };
  shopping: { open: number; done: number; lists: { id: string; name: string; open: number }[] };
  wishlist: { wanted: number };
  notes: { total: number };
};

const iso = (d: Date) => d.toISOString().slice(0, 10);
const daysBetween = (a: string, b: string) =>
  Math.round((Date.parse(a + "T00:00:00") - Date.parse(b + "T00:00:00")) / 86400000);

/** Mirrors the habits page: a habit shows on D iff |D - anchor| % every_n_days === 0. */
function scheduledOn(
  h: { every_n_days: number | null; anchor_date: string | null },
  date: string
): boolean {
  const n = h.every_n_days || 1;
  if (n === 1) return true;
  if (!h.anchor_date) return true;
  return Math.abs(daysBetween(date, h.anchor_date)) % n === 0;
}

export async function GET() {
  const supabase = await createClient();
  const today = iso(new Date());

  const [habitsRes, logsRes, mediaRes, booksRes, listsRes, itemsRes, wishRes, notesRes] =
    await Promise.all([
      supabase.from("habit").select("id,name,category,period,every_n_days,anchor_date").eq("is_active", true),
      supabase.from("habit_log").select("habit_id").eq("log_date", today),
      supabase
        .from("media_item")
        .select(
          "id,title,type,status,poster_url,current_season,current_episode,episodes_in_season,updated_at"
        ),
      supabase
        .from("book")
        .select("id,title,author,status,cover_url,current_page,total_pages,updated_at"),
      supabase.from("shopping_list").select("id,name"),
      supabase.from("shopping_list_item").select("id,list_id,is_done"),
      supabase.from("wishlist_item").select("id,status"),
      supabase.from("note").select("id"),
    ]);

  const habits = habitsRes.data ?? [];
  const loggedToday = new Set((logsRes.data ?? []).map((l) => l.habit_id));
  const dueToday = habits.filter((h) => scheduledOn(h, today));
  const pending = dueToday.filter((h) => !loggedToday.has(h.id));

  const media = mediaRes.data ?? [];
  const books = booksRes.data ?? [];
  const items = itemsRes.data ?? [];
  const lists = listsRes.data ?? [];

  const byStatus = (rows: { status: string }[], s: string) =>
    rows.filter((r) => r.status === s).length;

  const summary: DashboardSummary = {
    today,
    habits: {
      scheduledToday: dueToday.length,
      doneToday: dueToday.length - pending.length,
      activeTotal: habits.length,
      pending: pending.slice(0, 6).map((h) => ({
        id: h.id,
        name: h.name,
        category: h.category,
        period: h.period,
      })),
    },
    media: {
      watching: byStatus(media, "watching"),
      planned: byStatus(media, "planned"),
      completed: byStatus(media, "completed"),
      continueWatching: media
        .filter((m) => m.status === "watching")
        .sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1))
        .slice(0, 6)
        .map((m) => ({
          id: m.id,
          title: m.title,
          type: m.type,
          poster_url: m.poster_url,
          current_season: m.current_season,
          current_episode: m.current_episode,
          episodes_in_season: m.episodes_in_season,
          updated_at: m.updated_at,
        })),
    },
    reading: {
      reading: byStatus(books, "reading"),
      planned: byStatus(books, "planned"),
      finished: byStatus(books, "finished"),
      current: books
        .filter((b) => b.status === "reading" || b.status === "planned")
        .sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1))
        .slice(0, 4)
        .map((b) => ({
          id: b.id,
          title: b.title,
          author: b.author,
          cover_url: b.cover_url,
          current_page: b.current_page,
          total_pages: b.total_pages,
        })),
    },
    shopping: {
      open: items.filter((i) => !i.is_done).length,
      done: items.filter((i) => i.is_done).length,
      lists: lists
        .map((l) => ({
          id: l.id,
          name: l.name,
          open: items.filter((i) => i.list_id === l.id && !i.is_done).length,
        }))
        .sort((a, b) => b.open - a.open),
    },
    wishlist: { wanted: (wishRes.data ?? []).filter((w) => w.status === "wanted").length },
    notes: { total: (notesRes.data ?? []).length },
  };

  return NextResponse.json(summary);
}
