// src/app/(app)/media/page.tsx
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Plus,
  Search,
  Play,
  Film,
  Tv,
  Sparkles,
  Star,
  Bell,
  MoreVertical,
  X,
  Trash2,
  List as ListIcon,
  Check,
  AlertTriangle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  PauseCircle,
  CircleSlash,
} from "lucide-react";
import type { MediaItem, MediaType, MediaStatus, MediaReminder } from "@/types/media.types";
import ReminderModal from "./modals/ReminderModal";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

/* ----------------------------- constants & maps ---------------------------- */

const STATUS_ORDER: MediaStatus[] = ["planned", "watching", "completed", "on_hold", "dropped"];

const STATUSES: Record<MediaStatus, { label: string; color: string }> = {
  planned: { label: "Planned", color: "#8b93a7" },
  watching: { label: "Watching", color: "#4f8dff" },
  completed: { label: "Completed", color: "#3ad07f" },
  on_hold: { label: "On hold", color: "#f4b740" },
  dropped: { label: "Dropped", color: "#f06a6a" },
};

const TYPES: Record<MediaType, { label: string; short: string; Icon: typeof Film }> = {
  movie: { label: "Movie", short: "MV", Icon: Film },
  show: { label: "TV", short: "TV", Icon: Tv },
  anime: { label: "Anime", short: "AN", Icon: Sparkles },
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Maps a platform name fragment to a brand-colored badge. Mirrors the dispatcher.
function platformBadge(platform: string | null): { name: string; bg: string; fg: string } {
  if (!platform) return { name: "—", bg: "#1a1a25", fg: "#9a9db0" };
  const p = platform.toLowerCase();
  const hit = (bg: string, fg: string) => ({ name: platform, bg, fg });
  if (p.includes("netflix")) return hit("#e50914", "#fff");
  if (p.includes("hulu")) return hit("#1ce783", "#04130b");
  if (p.includes("disney")) return hit("#1a3df0", "#fff");
  if (p.includes("prime") || p.includes("amazon")) return hit("#1ba9e6", "#04141d");
  if (p.includes("max") || p.includes("hbo")) return hit("#5b2fd6", "#fff");
  if (p.includes("apple")) return hit("#e9e9ef", "#0a0a0f");
  if (p.includes("peacock")) return hit("#facc15", "#1a1400");
  if (p.includes("paramount")) return hit("#0064ff", "#fff");
  if (p.includes("crunchyroll")) return hit("#f47521", "#170a02");
  if (p.includes("funimation")) return hit("#8b5cf6", "#fff");
  if (p.includes("hidive")) return hit("#60a5fa", "#04122b");
  if (p.includes("youtube")) return hit("#ff0000", "#fff");
  if (p.includes("tubi")) return hit("#fb923c", "#170a02");
  return hit("#3a3a48", "#fff");
}

/* -------------------------------- helpers ---------------------------------- */

// Stable hue from a title so each card gets a consistent gradient "cover".
function hueFor(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return h;
}
function coverFor(title: string): string {
  const hue = hueFor(title);
  const a = `hsl(${hue} 24% 15%)`;
  const b = `hsl(${hue} 26% 19%)`;
  return `repeating-linear-gradient(135deg, ${a}, ${a} 11px, ${b} 11px, ${b} 22px)`;
}

const isShow = (t: MediaItem) => t.type === "show" || t.type === "anime";

function progressPct(t: MediaItem): number {
  if (isShow(t)) {
    if (t.total_episodes && t.total_episodes > 0) {
      // best signal: completed episodes across the whole run
      const watched = lifetimeWatched(t);
      return Math.round(Math.min(100, (watched / t.total_episodes) * 100));
    }
    if (t.episodes_in_season && t.episodes_in_season > 0) {
      return Math.round(Math.min(100, ((t.current_episode || 0) / t.episodes_in_season) * 100));
    }
  }
  return t.status === "completed" ? 100 : 0;
}

// Approximate lifetime episodes watched from season + in-season progress.
function lifetimeWatched(t: MediaItem): number {
  const perSeason = t.episodes_in_season || 0;
  const season = t.current_season || 1;
  const ep = t.current_episode || 0;
  if (perSeason > 0 && season > 1) return (season - 1) * perSeason + ep;
  return ep;
}

function episodeLabel(t: MediaItem): string {
  const parts: string[] = [];
  if (t.current_season) parts.push(`S${t.current_season}`);
  const ep = t.current_episode || 0;
  parts.push(t.episodes_in_season ? `E${ep} / ${t.episodes_in_season}` : `E${ep}`);
  return parts.join(" · ");
}

function starString(rating: number | null): string {
  const r = rating || 0;
  return "★".repeat(r) + "☆".repeat(5 - r);
}

function recency(updatedAt: string): string {
  const then = new Date(updatedAt).getTime();
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.round(days / 7)}w ago`;
  return `${Math.round(days / 30)}mo ago`;
}

function yearOf(t: MediaItem): string {
  const d = t.started_at || t.completed_at || t.created_at;
  return d ? new Date(d).getFullYear().toString() : "";
}

function time12(t: string): string {
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 || 12;
  return `${display}:${m} ${ampm}`;
}

function reminderLabel(r: MediaReminder): string {
  return `${DAY_LABELS[r.day_of_week]} · ${time12(r.time_of_day)}`;
}

// ms until the next firing of a weekly reminder, computed in its own timezone.
function nextFireMs(r: MediaReminder, now: Date = new Date()): number {
  try {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: r.timezone,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = Object.fromEntries(fmt.formatToParts(now).map((p) => [p.type, p.value]));
    const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    const localDow = map[parts.weekday];
    const hour = parts.hour === "24" ? 0 : parseInt(parts.hour);
    const localMin = hour * 60 + parseInt(parts.minute);
    const [th, tm] = r.time_of_day.split(":");
    const targetMin = parseInt(th) * 60 + parseInt(tm);
    let dayDiff = (r.day_of_week - localDow + 7) % 7;
    const minDiff = targetMin - localMin;
    if (dayDiff === 0 && minDiff <= 0) dayDiff = 7;
    return dayDiff * 86_400_000 + minDiff * 60_000;
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

/* ================================== PAGE =================================== */

export default function MediaTrackerPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [reminders, setReminders] = useState<MediaReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<MediaType | "all">("all");
  const [sort, setSort] = useState<"updated" | "title" | "rating" | "progress">("updated");

  const [sheetId, setSheetId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [reminderItem, setReminderItem] = useState<MediaItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const [itemsRes, remRes] = await Promise.all([
        fetch("/api/media"),
        fetch("/api/media/reminders"),
      ]);
      if (!itemsRes.ok) throw new Error("items");
      const itemsData = await itemsRes.json();
      setItems(Array.isArray(itemsData) ? itemsData : []);
      if (remRes.ok) {
        const remData = await remRes.json();
        setReminders(Array.isArray(remData) ? remData : []);
      }
    } catch (e) {
      console.error("Error loading media:", e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const flash = (msg: string) => {
    setToast(msg);
    window.clearTimeout((flash as unknown as { _t?: number })._t);
    (flash as unknown as { _t?: number })._t = window.setTimeout(() => setToast(null), 2200);
  };

  const fetchReminders = async () => {
    try {
      const res = await fetch("/api/media/reminders");
      if (!res.ok) return;
      const data = await res.json();
      setReminders(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error fetching reminders:", e);
    }
  };

  /* ------------------------------ mutations ------------------------------- */

  const patchItem = async (id: string, body: Partial<MediaItem>, msg?: string) => {
    // optimistic
    setItems((prev) => prev.map((t) => (t.id === id ? { ...t, ...body } : t)));
    try {
      const res = await fetch(`/api/media/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("patch");
      const updated = await res.json();
      setItems((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      if (msg) flash(msg);
    } catch (e) {
      console.error("Update failed:", e);
      void load();
    }
  };

  const setStatus = (t: MediaItem, status: MediaStatus) => {
    const body: Partial<MediaItem> = { status };
    if (status === "completed" && !t.completed_at) {
      body.completed_at = new Date().toISOString().slice(0, 10);
    }
    void patchItem(t.id, body, `Status → ${STATUSES[status].label}`);
  };

  const setRating = (t: MediaItem, rating: number) => {
    void patchItem(t.id, { rating: rating || null }, rating ? `Rated ${rating} ★` : "Rating cleared");
  };

  const bump = (t: MediaItem, delta: number) => {
    if (!isShow(t)) return;
    const perSeason = t.episodes_in_season || 0;
    let ep = (t.current_episode || 0) + delta;
    let season = t.current_season || 1;
    if (perSeason > 0 && ep > perSeason) {
      season += 1;
      ep = 1;
    }
    if (ep < 1) {
      season = Math.max(1, season - 1);
      ep = perSeason || 1;
    }
    const body: Partial<MediaItem> = { current_episode: ep, current_season: season };
    if (t.status === "planned") body.status = "watching";
    void patchItem(t.id, body, delta > 0 ? `Marked watched · S${season} · E${ep}` : undefined);
  };

  const createItem = async (body: Record<string, unknown>) => {
    try {
      const res = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("create");
      const created = await res.json();
      setItems((prev) => [created, ...prev]);
      setShowAdd(false);
      flash("Added to library");
    } catch (e) {
      console.error("Create failed:", e);
      void load();
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setItems((prev) => prev.filter((t) => t.id !== id));
    setDeleteTarget(null);
    setSheetId(null);
    try {
      const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("delete");
      flash("Title removed");
    } catch (e) {
      console.error("Delete failed:", e);
      void load();
    }
  };

  /* ------------------------------ derived data ---------------------------- */

  const remindersByItem = useMemo(
    () =>
      reminders.reduce<Record<string, MediaReminder[]>>((acc, r) => {
        (acc[r.media_item_id] ||= []).push(r);
        return acc;
      }, {}),
    [reminders],
  );

  const upcoming = useMemo(() => {
    return reminders
      .filter((r) => r.is_active)
      .map((r) => ({ r, ms: nextFireMs(r), item: items.find((i) => i.id === r.media_item_id) }))
      .filter((x) => x.item)
      .sort((a, b) => a.ms - b.ms)
      .slice(0, 6);
  }, [reminders, items]);

  // Filter (type + search) then sort, then split into status groups.
  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = items.filter(
      (t) =>
        (typeFilter === "all" || t.type === typeFilter) &&
        (!q ||
          t.title.toLowerCase().includes(q) ||
          (t.notes || "").toLowerCase().includes(q) ||
          (t.platform || "").toLowerCase().includes(q)),
    );
    const sorted = filtered.slice().sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "rating") return (b.rating || 0) - (a.rating || 0) || a.title.localeCompare(b.title);
      if (sort === "progress") return progressPct(b) - progressPct(a);
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
    const by = (s: MediaStatus) => sorted.filter((t) => t.status === s);
    return {
      total: filtered.length,
      watching: by("watching"),
      planned: by("planned"),
      completed: by("completed"),
      on_hold: by("on_hold"),
      dropped: by("dropped"),
    };
  }, [items, query, typeFilter, sort]);

  const sheetItem = sheetId ? items.find((t) => t.id === sheetId) || null : null;

  const openAdd = () => setShowAdd(true);

  /* --------------------------------- UI ----------------------------------- */

  return (
    <div
      className="min-h-screen text-[#f3f4f8]"
      style={{
        fontFamily: "system-ui, sans-serif",
        background:
          "radial-gradient(1200px 600px at 70% -10%, rgba(79,141,255,.07), transparent 60%), #08080c",
      }}
    >
      {/* ============ HEADER ============ */}
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-white/[0.06] bg-[#08080c]/80 px-4 py-3 backdrop-blur-xl sm:px-5">
        <label className="flex min-w-0 flex-1 items-center gap-2.5 rounded-[11px] border border-white/[0.07] bg-[#13131b] px-3 py-2.5">
          <Search className="h-4 w-4 flex-none text-[#6b6e80]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your library"
            className="min-w-0 flex-1 bg-transparent text-sm text-[#f3f4f8] outline-none placeholder:text-[#5d6071]"
          />
        </label>
        <button
          onClick={openAdd}
          className="flex flex-none items-center gap-1.5 rounded-[11px] bg-[#4f8dff] px-3.5 py-2.5 text-sm font-bold text-[#04122b] transition-transform active:scale-95"
          style={{ boxShadow: "0 4px 14px rgba(79,141,255,.35)" }}
        >
          <Plus className="h-4 w-4" strokeWidth={2.4} />
          <span className="hidden sm:inline">Add</span>
        </button>
      </header>

      <main className="mx-auto max-w-[1200px] px-4 pb-28 pt-5 sm:px-5">
        {/* ============ ERROR ============ */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center gap-3.5 px-6 py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-[18px] border border-[#f06a6a]/30 bg-[#f06a6a]/[0.12]">
              <AlertTriangle className="h-7 w-7 text-[#f06a6a]" />
            </div>
            <h2 className="text-xl font-bold">Couldn&apos;t load your library</h2>
            <p className="max-w-xs text-sm text-[#9a9db0]">
              Something went wrong syncing your titles. Check your connection and try again.
            </p>
            <button
              onClick={() => void load()}
              className="mt-1.5 rounded-[10px] border border-white/10 bg-[#1a1a25] px-[18px] py-2.5 text-sm font-semibold transition-colors hover:bg-[#22222f]"
            >
              Try again
            </button>
          </div>
        )}

        {/* ============ LOADING ============ */}
        {loading && (
          <>
            <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-[78px] animate-pulse rounded-[14px] bg-[#13131c]" />
              ))}
            </div>
            <div className="mb-3.5 h-5 w-44 animate-pulse rounded-md bg-[#13131c]" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i}>
                  <div className="aspect-[2/3] w-full animate-pulse rounded-[13px] bg-[#13131c]" />
                  <div className="mt-2.5 h-3 w-4/5 animate-pulse rounded bg-[#13131c]" />
                  <div className="mt-1.5 h-2.5 w-1/2 animate-pulse rounded bg-[#13131c]" />
                </div>
              ))}
            </div>
          </>
        )}

        {/* ============ EMPTY ============ */}
        {!loading && !error && items.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3.5 px-6 py-20 text-center">
            <div
              className="flex h-[72px] w-[72px] items-center justify-center rounded-[20px] border border-[#4f8dff]/20"
              style={{ background: "linear-gradient(150deg,rgba(79,141,255,.18),rgba(79,141,255,.04))" }}
            >
              <Tv className="h-8 w-8 text-[#4f8dff]" />
            </div>
            <h2 className="text-[21px] font-bold">Your library is empty</h2>
            <p className="max-w-sm text-sm text-[#9a9db0]">
              Add the first movie, show, or anime you&apos;re watching and it&apos;ll show up here, ready
              to track.
            </p>
            <button
              onClick={openAdd}
              className="mt-1.5 flex items-center gap-1.5 rounded-[11px] bg-[#4f8dff] px-5 py-2.5 text-sm font-bold text-[#04122b]"
              style={{ boxShadow: "0 4px 14px rgba(79,141,255,.35)" }}
            >
              <Plus className="h-4 w-4" strokeWidth={2.4} />
              Add a title
            </button>
          </div>
        )}

        {/* ============ NORMAL ============ */}
        {!loading && !error && items.length > 0 && (
          <>
            {/* UP NEXT */}
            {upcoming.length > 0 && (
              <section className="mb-6 flex flex-wrap items-center gap-2.5">
                <div className="flex flex-none items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#4f8dff]">
                  <Bell className="h-3.5 w-3.5" />
                  Up next
                </div>
                <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {upcoming.map(({ r, item }) => (
                    <button
                      key={r.id}
                      onClick={() => setReminderItem(item!)}
                      className="flex flex-none items-center gap-2.5 rounded-[11px] border border-white/[0.08] bg-[#13131b] px-3 py-2 text-left transition-colors hover:bg-[#1a1a25]"
                    >
                      <span
                        className="h-[7px] w-[7px] flex-none rounded-full bg-[#4f8dff]"
                        style={{ boxShadow: "0 0 8px rgba(79,141,255,.7)" }}
                      />
                      <span className="flex flex-col gap-px">
                        <span className="whitespace-nowrap text-[13px] font-semibold">
                          {item!.title}
                        </span>
                        <span className="whitespace-nowrap text-[10.5px] text-[#9a9db0]">
                          {reminderLabel(r)}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* TYPE FILTER + SORT */}
            <section className="mb-6 flex flex-wrap items-center gap-2">
              <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <Chip label="All" active={typeFilter === "all"} onClick={() => setTypeFilter("all")} />
                {(["movie", "show", "anime"] as MediaType[]).map((ty) => (
                  <Chip
                    key={ty}
                    label={ty === "show" ? "TV" : TYPES[ty].label + "s"}
                    active={typeFilter === ty}
                    onClick={() => setTypeFilter(typeFilter === ty ? "all" : ty)}
                  />
                ))}
              </div>
              <SortMenu value={sort} onChange={setSort} />
            </section>

            {/* CONTINUE WATCHING (watching group, wide cards) */}
            {grouped.watching.length > 0 && (
              <CardRow label="Continue watching" count={grouped.watching.length} color={STATUSES.watching.color}>
                {grouped.watching.map((t) => (
                  <ContinueCard
                    key={t.id}
                    item={t}
                    onResume={() => (isShow(t) ? bump(t, 1) : setStatus(t, "completed"))}
                    onMenu={() => setSheetId(t.id)}
                  />
                ))}
              </CardRow>
            )}

            {/* OTHER STATUS GROUPS — each a scrollable row */}
            {(
              [
                ["planned", "Plan to Watch"],
                ["completed", "Completed"],
                ["on_hold", "On Hold"],
                ["dropped", "Dropped"],
              ] as [Exclude<MediaStatus, "watching">, string][]
            ).map(([key, label]) =>
              grouped[key].length > 0 ? (
                <CardRow key={key} label={label} count={grouped[key].length} color={STATUSES[key].color}>
                  {grouped[key].map((t) => (
                    <PosterCard
                      key={t.id}
                      item={t}
                      onMenu={() => setSheetId(t.id)}
                      onBump={() => bump(t, 1)}
                    />
                  ))}
                </CardRow>
              ) : null,
            )}

            {/* no results after filtering */}
            {grouped.total === 0 && (
              <div className="flex flex-col items-center gap-2.5 px-6 py-16 text-center">
                <div className="flex h-[54px] w-[54px] items-center justify-center rounded-[15px] border border-white/[0.08] bg-[#13131b]">
                  <Search className="h-6 w-6 text-[#6b6e80]" />
                </div>
                <h3 className="text-base font-bold">No titles match</h3>
                <p className="text-[13.5px] text-[#9a9db0]">Try clearing your filters or search.</p>
                <button
                  onClick={() => {
                    setTypeFilter("all");
                    setQuery("");
                  }}
                  className="mt-1 rounded-[9px] border border-white/10 bg-[#1a1a25] px-4 py-2 text-[13px] font-semibold hover:bg-[#22222f]"
                >
                  Clear filters
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* ============ QUICK-ACTION SHEET ============ */}
      {sheetItem && (
        <QuickSheet
          item={sheetItem}
          reminders={remindersByItem[sheetItem.id] || []}
          onClose={() => setSheetId(null)}
          onStatus={(s) => setStatus(sheetItem, s)}
          onRate={(r) => setRating(sheetItem, r)}
          onBump={(d) => bump(sheetItem, d)}
          onManageReminders={() => {
            setReminderItem(sheetItem);
            setSheetId(null);
          }}
          onSaveDetails={async (body) => {
            await patchItem(sheetItem.id, body, "Saved");
            setSheetId(null);
          }}
          onDelete={() => setDeleteTarget(sheetItem)}
        />
      )}

      {/* ============ ADD SHEET ============ */}
      {showAdd && <AddSheet onClose={() => setShowAdd(false)} onCreate={createItem} />}

      {/* ============ REMINDER MODAL ============ */}
      <ReminderModal
        isOpen={reminderItem !== null}
        onClose={() => {
          setReminderItem(null);
          void fetchReminders();
        }}
        item={reminderItem}
        initialReminders={reminderItem ? remindersByItem[reminderItem.id] : undefined}
      />

      {/* ============ DELETE CONFIRM ============ */}
      <DeleteConfirmationModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        itemName={deleteTarget?.title}
      />

      {/* ============ TOAST ============ */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 z-[90] flex -translate-x-1/2 items-center gap-2.5 rounded-xl border border-[#4f8dff]/35 bg-[#1c2535] px-4 py-2.5 text-[13.5px] font-semibold text-[#eaf1ff]"
          style={{ boxShadow: "0 10px 30px rgba(0,0,0,.5)" }}
        >
          <Check className="h-4 w-4 text-[#4f8dff]" strokeWidth={2.4} />
          {toast}
        </div>
      )}
    </div>
  );
}

/* ============================== SUBCOMPONENTS ============================== */

// Horizontal scrollable row with arrow buttons (edge-aware) + touch swipe.
function CardRow({
  label,
  count,
  color,
  children,
}: {
  label: string;
  count: number;
  color: string;
  children: React.ReactNode;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [children]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: (dir === "left" ? -1 : 1) * el.clientWidth * 0.8, behavior: "smooth" });
    setTimeout(checkScroll, 300);
  };

  const onTouchEnd = () => {
    if (touchStart.current === null || touchEnd.current === null) return;
    const dist = touchStart.current - touchEnd.current;
    if (dist > 50 && canRight) scroll("right");
    if (dist < -50 && canLeft) scroll("left");
    touchStart.current = null;
    touchEnd.current = null;
  };

  const arrowCls = (enabled: boolean) =>
    `flex h-7 w-7 items-center justify-center rounded-lg border transition-colors ${
      enabled
        ? "border-white/[0.08] bg-[#1a1a25] text-[#c9ccda] hover:bg-[#22222f]"
        : "cursor-not-allowed border-white/[0.04] bg-[#13131b] text-[#3a3d4a]"
    }`;

  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-baseline gap-2.5">
          <h2 className="flex items-center gap-2 whitespace-nowrap text-[17px] font-bold tracking-tight">
            <span className="h-2 w-2 rounded-full" style={{ background: color }} />
            {label}
          </h2>
          <span className="font-mono text-[12px] text-[#6b6e80]">{count}</span>
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => scroll("left")} disabled={!canLeft} aria-label="Scroll left" className={arrowCls(canLeft)}>
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => scroll("right")} disabled={!canRight} aria-label="Scroll right" className={arrowCls(canRight)}>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        onTouchStart={(e) => {
          touchEnd.current = null;
          touchStart.current = e.targetTouches[0].clientX;
        }}
        onTouchMove={(e) => {
          touchEnd.current = e.targetTouches[0].clientX;
        }}
        onTouchEnd={onTouchEnd}
        className="flex gap-3.5 overflow-x-auto pb-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
    </section>
  );
}

function PlatformBadge({ platform, className = "" }: { platform: string | null; className?: string }) {
  const p = platformBadge(platform);
  if (!platform) return null;
  return (
    <span
      className={`inline-flex items-center rounded-[7px] px-1.5 py-1 font-mono text-[9.5px] font-bold ${className}`}
      style={{ background: p.bg, color: p.fg }}
    >
      {p.name}
    </span>
  );
}

function ContinueCard({
  item,
  onResume,
  onMenu,
}: {
  item: MediaItem;
  onResume: () => void;
  onMenu: () => void;
}) {
  const pct = progressPct(item);
  return (
    <article className="w-[300px] flex-none snap-start overflow-hidden rounded-2xl border border-white/[0.07] bg-[#101019]">
      <div
        className="relative flex aspect-video w-full items-end p-3"
        style={{ background: coverFor(item.title) }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080c]/[0.92] via-[#08080c]/10 to-transparent" />
        <span className="absolute left-2.5 top-2.5 font-mono text-[10px] uppercase tracking-wider text-white/50">
          {TYPES[item.type].label}
        </span>
        <span className="absolute right-2.5 top-2.5">
          <PlatformBadge platform={item.platform} />
        </span>
        <div className="relative z-[1]">
          <div className="truncate text-[17px] font-bold leading-tight tracking-tight">
            {item.title}
          </div>
          <div className="mt-0.5 font-mono text-[11.5px] text-[#b9bccb]">
            {isShow(item) ? episodeLabel(item) : "Film"}
          </div>
        </div>
      </div>
      <div className="px-3.5 pb-3.5 pt-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-[11px] text-[#6b6e80]">
            last watched {recency(item.updated_at)}
          </span>
          <span className="font-mono text-[11px] font-semibold text-[#4f8dff]">{pct}%</span>
        </div>
        <div className="mb-3 h-1.5 overflow-hidden rounded-md bg-[#1d1d28]">
          <div
            className="h-full rounded-md"
            style={{ width: `${pct}%`, background: "linear-gradient(90deg,#4f8dff,#73a6ff)" }}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={onResume}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-[10px] bg-[#4f8dff] py-2.5 text-[13.5px] font-bold text-[#04122b] transition-transform active:scale-95"
          >
            <Play className="h-[15px] w-[15px] fill-[#04122b]" />
            {isShow(item) ? "Next ep" : "Mark seen"}
          </button>
          <button
            onClick={onMenu}
            aria-label="Quick actions"
            className="flex w-11 flex-none items-center justify-center rounded-[10px] border border-white/[0.08] bg-[#1a1a25] text-[#c9ccda] hover:bg-[#22222f]"
          >
            <MoreVertical className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </article>
  );
}

// Surfaces the "why" behind on-hold / dropped items (stored in notes) as a
// status-tinted callout pinned to the bottom of the card.
function ReasonNote({ item }: { item: MediaItem }) {
  const note = (item.notes || "").trim();
  if (!note || (item.status !== "on_hold" && item.status !== "dropped")) return null;
  const onHold = item.status === "on_hold";
  const color = onHold ? "#f4b740" : "#f06a6a";
  const label = onHold ? "On hold" : "Dropped";
  return (
    <div
      className="mb-2.5 rounded-[9px] border px-2.5 py-2"
      style={{ background: `${color}14`, borderColor: `${color}33` }}
    >
      <div
        className="mb-1 flex items-center gap-1 font-mono text-[9px] font-semibold uppercase tracking-wider"
        style={{ color }}
      >
        {onHold ? <PauseCircle className="h-3 w-3" /> : <CircleSlash className="h-3 w-3" />}
        {label}
      </div>
      <p className="line-clamp-2 text-[11.5px] italic leading-snug text-[#c9ccda]">{note}</p>
    </div>
  );
}

function PosterCard({ item, onMenu, onBump }: { item: MediaItem; onMenu: () => void; onBump: () => void }) {
  const Type = TYPES[item.type];
  const show = isShow(item);
  const pct = progressPct(item);
  return (
    <article className="flex w-[168px] flex-none flex-col overflow-hidden rounded-[14px] border border-white/[0.06] bg-[#101019]">
      <div
        className="relative flex aspect-[2/3] w-full items-end p-2.5"
        style={{ background: coverFor(item.title) }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080c]/70 to-transparent to-[45%]" />
        <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-[7px] bg-[#08080c]/60 px-1.5 py-1 font-mono text-[9.5px] font-semibold uppercase tracking-wide text-[#dfe2ee] backdrop-blur-sm">
          <Type.Icon className="h-2.5 w-2.5" />
          {Type.label}
        </span>
        <span className="absolute right-2.5 top-2.5">
          <PlatformBadge platform={item.platform} />
        </span>
      </div>
      <div className="flex flex-1 flex-col px-3 pb-3 pt-2.5">
        <div className="mb-1.5 line-clamp-2 min-h-[36px] text-[14.5px] font-bold leading-tight tracking-tight">
          {item.title}
        </div>
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-[11px] text-[#6b6e80]">{yearOf(item)}</span>
          <span className="text-xs tracking-[1px] text-[#f4b740]">{starString(item.rating)}</span>
        </div>
        {show && (
          <div className="mb-2.5">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="font-mono text-[10.5px] text-[#9a9db0]">{episodeLabel(item)}</span>
              <span className="font-mono text-[10.5px] text-[#6b6e80]">{pct}%</span>
            </div>
            <div className="h-[5px] overflow-hidden rounded-md bg-[#1d1d28]">
              <div
                className="h-full rounded-md"
                style={{ width: `${pct}%`, background: "linear-gradient(90deg,#4f8dff,#73a6ff)" }}
              />
            </div>
          </div>
        )}
        <ReasonNote item={item} />
        <div className="mt-auto flex gap-1.5">
          {show && (
            <button
              onClick={onBump}
              aria-label="Mark next episode"
              className="flex min-h-[38px] flex-1 items-center justify-center gap-1.5 rounded-[9px] border border-[#4f8dff]/30 bg-[#4f8dff]/[0.14] font-mono text-[12px] font-bold text-[#4f8dff]"
            >
              +1
            </button>
          )}
          <button
            onClick={onMenu}
            aria-label="Quick actions"
            className={`flex min-h-[38px] items-center justify-center rounded-[9px] border border-white/[0.08] bg-[#1a1a25] text-[#c9ccda] hover:bg-[#22222f] ${
              show ? "w-[42px] flex-none" : "flex-1 gap-1.5 text-[12.5px] font-semibold text-[#dfe2ee]"
            }`}
          >
            {show ? <MoreVertical className="h-[17px] w-[17px]" /> : <><MoreVertical className="h-[15px] w-[15px]" />Actions</>}
          </button>
        </div>
      </div>
    </article>
  );
}

function Chip({
  label,
  active,
  onClick,
  dot,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  dot?: string;
}) {
  const bg = active ? (dot ? "rgba(255,255,255,.06)" : "#4f8dff") : "#13131b";
  const fg = active ? (dot ? "#f3f4f8" : "#04122b") : "#9a9db0";
  const border = active ? (dot ? "rgba(255,255,255,.18)" : "#4f8dff") : "rgba(255,255,255,.08)";
  return (
    <button
      onClick={onClick}
      className="flex flex-none items-center gap-1.5 whitespace-nowrap rounded-[9px] border px-3 py-1.5 text-[13px] font-semibold"
      style={{ background: bg, color: fg, borderColor: border }}
    >
      {dot && <span className="h-[7px] w-[7px] rounded-full" style={{ background: dot }} />}
      {label}
    </button>
  );
}

type SortKey = "updated" | "title" | "rating" | "progress";
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "updated", label: "Recently updated" },
  { key: "title", label: "Title (A–Z)" },
  { key: "rating", label: "Rating" },
  { key: "progress", label: "Progress" },
];

// Dark, theme-matched replacement for a native <select>.
function SortMenu({ value, onChange }: { value: SortKey; onChange: (v: SortKey) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = SORT_OPTIONS.find((o) => o.key === value) ?? SORT_OPTIONS[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative flex-none">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex items-center gap-1.5 rounded-[9px] border bg-[#13131b] py-1.5 pl-2.5 pr-2.5 text-[13px] font-semibold text-[#f3f4f8] transition-colors hover:bg-[#1a1a25] ${
          open ? "border-[#4f8dff]/50" : "border-white/[0.08]"
        }`}
      >
        <ListIcon className="h-3.5 w-3.5 text-[#6b6e80]" />
        {current.label}
        <ChevronDown
          className={`h-3.5 w-3.5 text-[#6b6e80] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute right-0 z-50 mt-1.5 w-[180px] overflow-hidden rounded-[11px] border border-white/[0.1] bg-[#13131b] p-1 shadow-[0_12px_34px_rgba(0,0,0,.55)]"
        >
          {SORT_OPTIONS.map((o) => {
            const active = o.key === value;
            return (
              <button
                key={o.key}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(o.key);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-2 rounded-[8px] px-2.5 py-2 text-left text-[13px] font-medium transition-colors ${
                  active ? "bg-[#4f8dff]/[0.14] text-[#f3f4f8]" : "text-[#9a9db0] hover:bg-white/[0.05] hover:text-[#f3f4f8]"
                }`}
              >
                {o.label}
                {active && <Check className="h-3.5 w-3.5 flex-none text-[#4f8dff]" strokeWidth={2.6} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ----------------------------- quick-action sheet -------------------------- */

function QuickSheet({
  item,
  reminders,
  onClose,
  onStatus,
  onRate,
  onBump,
  onManageReminders,
  onSaveDetails,
  onDelete,
}: {
  item: MediaItem;
  reminders: MediaReminder[];
  onClose: () => void;
  onStatus: (s: MediaStatus) => void;
  onRate: (r: number) => void;
  onBump: (d: number) => void;
  onManageReminders: () => void;
  onSaveDetails: (body: Partial<MediaItem>) => Promise<void>;
  onDelete: () => void;
}) {
  const show = isShow(item);

  // Draft for the non-instant detail fields (title/type/platform/totals/notes/dates).
  const [draft, setDraft] = useState({
    title: item.title,
    type: item.type,
    platform: item.platform || "",
    total_seasons: item.total_seasons ?? "",
    episodes_in_season: item.episodes_in_season ?? "",
    total_episodes: item.total_episodes ?? "",
    notes: item.notes || "",
    started_at: item.started_at || "",
    completed_at: item.completed_at || "",
  });
  const [saving, setSaving] = useState(false);

  const numOrNull = (v: number | string) => {
    if (v === "" || v === null) return null;
    const n = typeof v === "number" ? v : parseInt(v, 10);
    return isNaN(n) ? null : n;
  };

  const dirty =
    draft.title.trim() !== item.title ||
    draft.type !== item.type ||
    (draft.platform.trim() || "") !== (item.platform || "") ||
    numOrNull(draft.total_seasons) !== item.total_seasons ||
    numOrNull(draft.episodes_in_season) !== item.episodes_in_season ||
    numOrNull(draft.total_episodes) !== item.total_episodes ||
    (draft.notes.trim() || "") !== (item.notes || "") ||
    (draft.started_at || "") !== (item.started_at || "") ||
    (draft.completed_at || "") !== (item.completed_at || "");

  const handleSave = async () => {
    if (!draft.title.trim()) return;
    setSaving(true);
    await onSaveDetails({
      title: draft.title.trim(),
      type: draft.type,
      platform: draft.platform.trim() || null,
      total_seasons: numOrNull(draft.total_seasons),
      episodes_in_season: numOrNull(draft.episodes_in_season),
      total_episodes: numOrNull(draft.total_episodes),
      notes: draft.notes.trim() || null,
      started_at: draft.started_at || null,
      completed_at: draft.completed_at || null,
    });
    setSaving(false);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-end justify-center bg-[#040408]/[0.66] backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[88vh] w-full max-w-[460px] overflow-y-auto rounded-t-[22px] border border-white/[0.09] bg-[#101019] px-[18px] pb-6 pt-2"
      >
        <div className="mx-auto mb-4 mt-2 h-1 w-[38px] rounded bg-white/[0.18]" />

        <div className="mb-5 flex items-start gap-3.5">
          <div
            className="h-[84px] w-[58px] flex-none rounded-[10px]"
            style={{ background: coverFor(draft.title || item.title) }}
          />
          <div className="min-w-0 flex-1">
            <div className="text-[18px] font-bold leading-snug tracking-tight">
              {draft.title || "Untitled"}
            </div>
            <div className="mt-1.5 flex items-center gap-1.5">
              <PlatformBadge platform={draft.platform || null} className="!text-[10px]" />
              <span className="font-mono text-[11px] uppercase tracking-wide text-[#9a9db0]">
                {TYPES[draft.type].label}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[9px] border border-white/[0.08] bg-[#1a1a25] text-[#9a9db0]"
          >
            <X className="h-4 w-4" strokeWidth={2.2} />
          </button>
        </div>

        {/* status */}
        <SheetLabel>Status</SheetLabel>
        <div className="mb-5 flex flex-wrap gap-1.5">
          {STATUS_ORDER.map((k) => {
            const active = item.status === k;
            const c = STATUSES[k].color;
            return (
              <button
                key={k}
                onClick={() => onStatus(k)}
                className="flex items-center gap-1.5 rounded-[10px] border px-3.5 py-2.5 text-[13px] font-semibold"
                style={{
                  background: active ? "rgba(255,255,255,.07)" : "#16161f",
                  color: active ? "#f3f4f8" : "#9a9db0",
                  borderColor: active ? c : "rgba(255,255,255,.08)",
                }}
              >
                <span className="h-[7px] w-[7px] rounded-full" style={{ background: c }} />
                {STATUSES[k].label}
              </button>
            );
          })}
        </div>

        {/* rating */}
        <SheetLabel>Your rating</SheetLabel>
        <div className="mb-5 flex gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => {
            const on = n <= (item.rating || 0);
            return (
              <button
                key={n}
                onClick={() => onRate(n === item.rating ? 0 : n)}
                aria-label={`Rate ${n}`}
                className="flex h-11 w-11 items-center justify-center rounded-[11px] border border-white/[0.08]"
                style={{ background: on ? "rgba(244,183,64,.12)" : "#16161f" }}
              >
                <Star
                  className="h-[22px] w-[22px]"
                  style={{ fill: on ? "#f4b740" : "none", color: on ? "#f4b740" : "#5d6071" }}
                  strokeWidth={1.6}
                />
              </button>
            );
          })}
        </div>

        {/* episode stepper */}
        {show && (
          <>
            <SheetLabel>Progress</SheetLabel>
            <div className="mb-5 flex items-center gap-3 rounded-[13px] border border-white/[0.07] bg-[#16161f] px-3.5 py-3">
              <button
                onClick={() => onBump(-1)}
                aria-label="Previous episode"
                className="flex h-10 w-10 flex-none items-center justify-center rounded-[10px] border border-white/[0.08] bg-[#1a1a25] text-[#dfe2ee]"
              >
                <span className="text-xl leading-none">−</span>
              </button>
              <div className="flex-1 text-center">
                <div className="text-[18px] font-bold">{episodeLabel(item)}</div>
                <div className="mt-0.5 font-mono text-[11px] text-[#6b6e80]">
                  {item.total_episodes ? `of ${item.total_episodes} total eps` : "tracking"}
                </div>
              </div>
              <button
                onClick={() => onBump(1)}
                aria-label="Next episode"
                className="flex h-10 w-10 flex-none items-center justify-center rounded-[10px] bg-[#4f8dff] text-[#04122b]"
              >
                <Plus className="h-[18px] w-[18px]" strokeWidth={2.4} />
              </button>
            </div>
          </>
        )}

        {/* reminders summary */}
        <div className="mb-2.5 flex items-center justify-between">
          <SheetLabel className="!mb-0">Reminders</SheetLabel>
          <button
            onClick={onManageReminders}
            className="flex items-center gap-1 text-[12.5px] font-semibold text-[#4f8dff]"
          >
            <Bell className="h-3.5 w-3.5" />
            Manage
          </button>
        </div>
        <div className="mb-5 flex flex-col gap-2">
          {reminders.length === 0 ? (
            <div className="py-2 text-[13px] text-[#6b6e80]">No weekly reminders yet.</div>
          ) : (
            reminders.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-2.5 rounded-[11px] border border-white/[0.07] bg-[#16161f] px-3 py-2.5"
                style={{ opacity: r.is_active ? 1 : 0.5 }}
              >
                <Bell
                  className="h-4 w-4 flex-none"
                  style={{ color: r.is_active ? "#4f8dff" : "#6b6e80" }}
                />
                <span className="flex-1 font-mono text-[12.5px] text-[#dfe2ee]">
                  {reminderLabel(r)}
                </span>
                <span
                  className="font-mono text-[10px] uppercase tracking-wide"
                  style={{ color: r.is_active ? "#3ad07f" : "#6b6e80" }}
                >
                  {r.is_active ? "Active" : "Paused"}
                </span>
              </div>
            ))
          )}
        </div>

        {/* details */}
        <SheetLabel>Details</SheetLabel>
        <div className="mb-5">
          <MediaFields draft={draft} setDraft={setDraft} />
        </div>

        {/* footer */}
        <div className="flex gap-2.5">
          <button
            onClick={onDelete}
            aria-label="Delete title"
            className="flex w-[50px] flex-none items-center justify-center rounded-[11px] border border-[#f06a6a]/25 bg-[#f06a6a]/10 text-[#f06a6a] hover:bg-[#f06a6a]/[0.18]"
          >
            <Trash2 className="h-[18px] w-[18px]" />
          </button>
          <button
            onClick={handleSave}
            disabled={!draft.title.trim() || saving || !dirty}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-[11px] bg-[#4f8dff] py-3.5 text-sm font-bold text-[#04122b] transition-colors disabled:cursor-not-allowed disabled:bg-[#4f8dff]/40"
            style={{ boxShadow: dirty ? "0 4px 14px rgba(79,141,255,.32)" : "none" }}
          >
            <Check className="h-4 w-4" strokeWidth={2.6} />
            {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SheetLabel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`mb-2.5 font-mono text-[10.5px] font-semibold uppercase tracking-widest text-[#6b6e80] ${className}`}
    >
      {children}
    </div>
  );
}

/* ------------------------------ shared form -------------------------------- */

// Draft shape shared by the edit sheet and the add sheet's detail fields.
type MediaDraft = {
  title: string;
  type: MediaType;
  platform: string;
  total_seasons: number | string;
  episodes_in_season: number | string;
  total_episodes: number | string;
  notes: string;
  started_at: string;
  completed_at: string;
};

const FIELD_LABEL = "mb-1.5 block text-[11.5px] font-medium text-[#9a9db0]";
const FIELD_INPUT =
  "w-full rounded-[10px] border border-white/[0.08] bg-[#16161f] px-3 py-2.5 text-[14px] text-[#f3f4f8] outline-none transition-colors focus:border-[#4f8dff]/50 placeholder:text-[#5d6071] [color-scheme:dark]";

// All editable detail inputs (title, type, platform, totals, notes, dates).
// Used identically by the edit sheet and the add sheet.
function MediaFields<T extends MediaDraft>({
  draft,
  setDraft,
}: {
  draft: T;
  setDraft: React.Dispatch<React.SetStateAction<T>>;
}) {
  const set = <K extends keyof T>(k: K, v: T[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const num = (v: string): number | string => (v === "" ? "" : Math.max(0, parseInt(v, 10) || 0));
  const isShowType = draft.type === "show" || draft.type === "anime";

  return (
    <div className="flex flex-col gap-3.5">
      {/* title */}
      <div>
        <label className={FIELD_LABEL}>Title</label>
        <input
          value={draft.title}
          onChange={(e) => set("title", e.target.value as T["title"])}
          placeholder="e.g. Severance"
          className={FIELD_INPUT}
        />
      </div>

      {/* type + platform */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={FIELD_LABEL}>Type</label>
          <div className="relative">
            <select
              value={draft.type}
              onChange={(e) => set("type", e.target.value as T["type"])}
              className={`${FIELD_INPUT} cursor-pointer appearance-none pr-8`}
            >
              <option value="movie" className="bg-[#16161f]">
                Movie
              </option>
              <option value="show" className="bg-[#16161f]">
                TV Show
              </option>
              <option value="anime" className="bg-[#16161f]">
                Anime
              </option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6b6e80]" />
          </div>
        </div>
        <div>
          <label className={FIELD_LABEL}>Platform</label>
          <input
            value={draft.platform}
            onChange={(e) => set("platform", e.target.value as T["platform"])}
            placeholder="Netflix, Hulu…"
            className={FIELD_INPUT}
          />
        </div>
      </div>

      {/* season/episode totals (shows/anime only) */}
      {isShowType && (
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={FIELD_LABEL}>Total seasons</label>
            <input
              type="number"
              min={0}
              value={draft.total_seasons}
              onChange={(e) => set("total_seasons", num(e.target.value) as T["total_seasons"])}
              className={FIELD_INPUT}
            />
          </div>
          <div>
            <label className={FIELD_LABEL}>Eps / season</label>
            <input
              type="number"
              min={0}
              value={draft.episodes_in_season}
              onChange={(e) => set("episodes_in_season", num(e.target.value) as T["episodes_in_season"])}
              className={FIELD_INPUT}
            />
          </div>
          <div>
            <label className={FIELD_LABEL}>Total eps</label>
            <input
              type="number"
              min={0}
              value={draft.total_episodes}
              onChange={(e) => set("total_episodes", num(e.target.value) as T["total_episodes"])}
              className={FIELD_INPUT}
            />
          </div>
        </div>
      )}

      {/* dates */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={FIELD_LABEL}>Started</label>
          <input
            type="date"
            value={draft.started_at}
            onChange={(e) => set("started_at", e.target.value as T["started_at"])}
            className={FIELD_INPUT}
          />
        </div>
        <div>
          <label className={FIELD_LABEL}>Completed</label>
          <input
            type="date"
            value={draft.completed_at}
            onChange={(e) => set("completed_at", e.target.value as T["completed_at"])}
            className={FIELD_INPUT}
          />
        </div>
      </div>

      {/* notes */}
      <div>
        <label className={FIELD_LABEL}>Notes</label>
        <textarea
          value={draft.notes}
          onChange={(e) => set("notes", e.target.value as T["notes"])}
          placeholder="Reason it's on hold, thoughts, where you left off…"
          rows={3}
          className={`${FIELD_INPUT} min-h-[72px] resize-y leading-relaxed`}
        />
      </div>
    </div>
  );
}

/* -------------------------------- add sheet -------------------------------- */

function AddSheet({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (body: Record<string, unknown>) => Promise<void>;
}) {
  const [status, setStatus] = useState<MediaStatus>("planned");
  const [rating, setRating] = useState(0);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<MediaDraft>({
    title: "",
    type: "movie",
    platform: "",
    total_seasons: "",
    episodes_in_season: "",
    total_episodes: "",
    notes: "",
    started_at: "",
    completed_at: "",
  });

  const numOrNull = (v: number | string) => {
    if (v === "" || v === null) return null;
    const n = typeof v === "number" ? v : parseInt(v, 10);
    return isNaN(n) ? null : n;
  };

  const handleCreate = async () => {
    if (!draft.title.trim()) return;
    setSaving(true);
    await onCreate({
      title: draft.title.trim(),
      type: draft.type,
      status,
      rating: rating || null,
      platform: draft.platform.trim() || null,
      current_episode: 0,
      current_season: draft.type === "movie" ? null : 1,
      total_seasons: numOrNull(draft.total_seasons),
      episodes_in_season: numOrNull(draft.episodes_in_season),
      total_episodes: numOrNull(draft.total_episodes),
      notes: draft.notes.trim() || null,
      started_at: draft.started_at || null,
      completed_at: draft.completed_at || null,
    });
    setSaving(false);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[70] flex items-end justify-center bg-[#040408]/[0.7] backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-[480px] overflow-y-auto rounded-t-[22px] border border-white/[0.09] bg-[#101019]"
      >
        {/* sticky header */}
        <div className="sticky top-0 z-[2] flex items-center justify-between border-b border-white/[0.06] bg-[#101019]/95 px-[18px] py-4 backdrop-blur">
          <h3 className="text-[17px] font-bold">Add a title</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] border border-white/[0.08] bg-[#1a1a25] text-[#9a9db0]"
          >
            <X className="h-4 w-4" strokeWidth={2.2} />
          </button>
        </div>

        <div className="px-[18px] pb-6 pt-5">
          {/* status */}
          <SheetLabel>Status</SheetLabel>
          <div className="mb-5 flex flex-wrap gap-1.5">
            {STATUS_ORDER.map((k) => {
              const active = status === k;
              const c = STATUSES[k].color;
              return (
                <button
                  key={k}
                  onClick={() => setStatus(k)}
                  className="flex items-center gap-1.5 rounded-[10px] border px-3.5 py-2.5 text-[13px] font-semibold"
                  style={{
                    background: active ? "rgba(255,255,255,.07)" : "#16161f",
                    color: active ? "#f3f4f8" : "#9a9db0",
                    borderColor: active ? c : "rgba(255,255,255,.08)",
                  }}
                >
                  <span className="h-[7px] w-[7px] rounded-full" style={{ background: c }} />
                  {STATUSES[k].label}
                </button>
              );
            })}
          </div>

          {/* rating */}
          <SheetLabel>Your rating</SheetLabel>
          <div className="mb-5 flex gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => {
              const on = n <= rating;
              return (
                <button
                  key={n}
                  onClick={() => setRating(n === rating ? 0 : n)}
                  aria-label={`Rate ${n}`}
                  className="flex h-11 w-11 items-center justify-center rounded-[11px] border border-white/[0.08]"
                  style={{ background: on ? "rgba(244,183,64,.12)" : "#16161f" }}
                >
                  <Star
                    className="h-[22px] w-[22px]"
                    style={{ fill: on ? "#f4b740" : "none", color: on ? "#f4b740" : "#5d6071" }}
                    strokeWidth={1.6}
                  />
                </button>
              );
            })}
          </div>

          {/* details */}
          <SheetLabel>Details</SheetLabel>
          <MediaFields draft={draft} setDraft={setDraft} />
        </div>

        {/* sticky footer */}
        <div className="sticky bottom-0 flex gap-2.5 border-t border-white/[0.06] bg-[#101019]/95 px-[18px] py-3.5 backdrop-blur">
          <button
            onClick={onClose}
            className="flex-none rounded-[11px] border border-white/10 bg-[#1a1a25] px-5 py-3.5 text-sm font-semibold hover:bg-[#22222f]"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!draft.title.trim() || saving}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-[11px] bg-[#4f8dff] py-3.5 text-sm font-bold text-[#04122b] transition-colors disabled:cursor-not-allowed disabled:bg-[#4f8dff]/40"
            style={{ boxShadow: "0 4px 14px rgba(79,141,255,.32)" }}
          >
            <Plus className="h-4 w-4" strokeWidth={2.6} />
            {saving ? "Adding…" : "Add to library"}
          </button>
        </div>
      </div>
    </div>
  );
}
