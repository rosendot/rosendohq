// src/app/(app)/media/page.tsx
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Plus,
  Search,
  Play,
  Tv,
  Bell,
  MoreVertical,
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
import EditMediaSheet from "./modals/EditMediaSheet";
import AddMediaSheet from "./modals/AddMediaSheet";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import {
  STATUSES,
  TYPES,
  coverFor,
  isShow,
  progressPct,
  episodeLabel,
  starString,
  recency,
  yearOf,
  reminderLabel,
  nextFireMs,
  PlatformBadge,
} from "./media-utils";

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

      {/* ============ EDIT SHEET ============ */}
      {sheetItem && (
        <EditMediaSheet
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
      {showAdd && <AddMediaSheet onClose={() => setShowAdd(false)} onCreate={createItem} />}

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

