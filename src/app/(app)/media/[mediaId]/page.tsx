"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Pencil,
  Trash2,
  Play,
  CheckCheck,
  Bell,
  Check,
  X,
  Star,
  Plus,
} from "lucide-react";
import type { MediaItem, MediaStatus, MediaReminder, MediaLog } from "@/types/media.types";
import {
  STATUS_ORDER,
  STATUSES,
  TYPES,
  coverStyle,
  isShow,
  progressPct,
  episodeLabel,
  progressDetail,
  episodeInSeason,
  starString,
  recency,
  reminderLabel,
  PlatformBadge,
  MediaFields,
  type MediaDraft,
} from "../media-utils";
import ReminderModal from "../modals/ReminderModal";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

const LABEL = "mb-2.5 font-mono text-[10.5px] font-semibold uppercase tracking-widest text-[#6b6e80]";
const PANEL = "rounded-[16px] border border-white/[0.07] bg-[#101019] p-5";
const FIELD =
  "w-full rounded-[10px] border border-white/[0.08] bg-[#101019] px-3 py-2.5 text-[13.5px] text-[#f3f4f8] outline-none transition-colors focus:border-[#4f8dff]/50 placeholder:text-[#5d6071] [color-scheme:dark]";

const HEATMAP_DAYS = 119; // 17 whole weeks, so the grid ends on a clean column
const todayISO = () => new Date().toISOString().slice(0, 10);
const dateMinusDays = (iso: string, n: number) => {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};
const fmtLogDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

export default function MediaDetailPage({ params }: { params: Promise<{ mediaId: string }> }) {
  const router = useRouter();
  const [mediaId, setMediaId] = useState("");
  const [item, setItem] = useState<MediaItem | null>(null);
  const [reminders, setReminders] = useState<MediaReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<MediaDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // watch history
  const [logs, setLogs] = useState<MediaLog[]>([]);
  const [logFormOpen, setLogFormOpen] = useState(false);
  const [logDraft, setLogDraft] = useState({ log_date: todayISO(), progress: "", note: "" });
  const [savingLog, setSavingLog] = useState(false);

  useEffect(() => {
    params.then((p) => setMediaId(p.mediaId));
  }, [params]);

  useEffect(() => {
    if (!mediaId) return;
    void load();
  }, [mediaId]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [itemRes, remRes, logRes] = await Promise.all([
        fetch(`/api/media/${mediaId}`),
        fetch(`/api/media/reminders?mediaItemId=${mediaId}`),
        fetch(`/api/media/${mediaId}/logs`),
      ]);
      if (!itemRes.ok) throw new Error("Title not found");
      setItem(await itemRes.json());
      if (remRes.ok) {
        const r = await remRes.json();
        setReminders(Array.isArray(r) ? r : []);
      }
      if (logRes.ok) {
        const l = await logRes.json();
        setLogs(Array.isArray(l) ? l : []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const patch = async (body: Partial<MediaItem>, msg?: string) => {
    if (!item) return;
    setItem({ ...item, ...body });
    try {
      const res = await fetch(`/api/media/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("patch");
      setItem(await res.json());
      if (msg) flash(msg);
    } catch {
      void load();
    }
  };

  /* ------------------------------ actions -------------------------------- */

  const setStatus = (status: MediaStatus) => {
    if (!item) return;
    const body: Partial<MediaItem> = { status };
    if (status === "completed" && !item.completed_at) {
      body.completed_at = new Date().toISOString().slice(0, 10);
    }
    void patch(body, `Status → ${STATUSES[status].label}`);
  };

  const setRating = (r: number) => {
    if (!item) return;
    void patch({ rating: r === item.rating ? null : r || null }, "Rating updated");
  };

  // Append a watch-history row. Fire-and-forget: a failed log should never
  // block the progress update the user actually asked for.
  const addLog = async (progress: number, log_date = todayISO(), note?: string) => {
    if (!item) return;
    try {
      const res = await fetch(`/api/media/${item.id}/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progress, log_date, note: note || null }),
      });
      if (!res.ok) return;
      const created = await res.json();
      setLogs((prev) => [created, ...prev]);
    } catch {
      /* history is best-effort */
    }
  };

  const bump = (delta: number) => {
    if (!item || !isShow(item)) return;
    const perSeason = item.episodes_in_season || 0;
    const lastSeason = item.total_seasons || 0;
    let ep = episodeInSeason(item) + delta;
    let season = Math.max(1, item.current_season || 1);
    if (perSeason > 0 && ep > perSeason) {
      if (!lastSeason || season < lastSeason) {
        season += 1;
        ep = 1;
      } else {
        ep = perSeason;
      }
    }
    if (ep < 1) {
      if (season > 1) {
        season -= 1;
        ep = perSeason || 1;
      } else {
        ep = 0;
      }
    }
    const body: Partial<MediaItem> = { current_episode: ep, current_season: season };
    if (item.status === "planned") body.status = "watching";
    void patch(body, delta > 0 ? `S${season} · E${ep}` : undefined);
    // Only forward progress is a "watched" event; stepping back is a correction.
    if (delta > 0) void addLog(ep);
  };

  const markWatched = () => {
    if (!item) return;
    const body: Partial<MediaItem> = {
      status: "completed",
      completed_at: item.completed_at || new Date().toISOString().slice(0, 10),
    };
    if (isShow(item)) {
      body.current_season = item.total_seasons || item.current_season || 1;
      body.current_episode =
        item.episodes_in_season || item.total_episodes || item.current_episode || 0;
    }
    void patch(body, "Marked watched");
  };

  const saveLog = async () => {
    const ep = parseInt(logDraft.progress, 10);
    if (isNaN(ep)) return;
    setSavingLog(true);
    await addLog(ep, logDraft.log_date || todayISO(), logDraft.note);
    setSavingLog(false);
    setLogFormOpen(false);
    setLogDraft({ log_date: todayISO(), progress: "", note: "" });
    flash("Session logged");
  };

  const deleteLog = async (logId: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== logId));
    try {
      await fetch(`/api/media/logs/${logId}`, { method: "DELETE" });
    } catch {
      void load();
    }
  };

  const startEdit = () => {
    if (!item) return;
    setDraft({
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
    setEditing(true);
  };

  const numOrNull = (v: number | string) => {
    if (v === "" || v === null) return null;
    const n = typeof v === "number" ? v : parseInt(v, 10);
    return isNaN(n) ? null : n;
  };

  const saveEdit = async () => {
    if (!draft || !draft.title.trim()) return;
    setSaving(true);
    await patch(
      {
        title: draft.title.trim(),
        type: draft.type,
        platform: draft.platform.trim() || null,
        total_seasons: numOrNull(draft.total_seasons),
        episodes_in_season: numOrNull(draft.episodes_in_season),
        total_episodes: numOrNull(draft.total_episodes),
        notes: draft.notes.trim() || null,
        started_at: draft.started_at || null,
        completed_at: draft.completed_at || null,
      },
      "Saved",
    );
    setSaving(false);
    setEditing(false);
  };

  const confirmDelete = async () => {
    if (!item) return;
    try {
      await fetch(`/api/media/${item.id}`, { method: "DELETE" });
    } finally {
      router.push("/media");
    }
  };

  /* --------------------------- derived history ---------------------------- */

  // How many log entries fall on each date — drives the heatmap intensity.
  const countsByDate = useMemo(() => {
    const m: Record<string, number> = {};
    for (const l of logs) m[l.log_date] = (m[l.log_date] || 0) + 1;
    return m;
  }, [logs]);

  const stats = useMemo(() => {
    const today = todayISO();
    const weekAgo = dateMinusDays(today, 6); // inclusive 7-day window
    const thisWeek = logs.filter((l) => l.log_date >= weekAgo).length;

    // Consecutive days with at least one entry, walking back from today.
    // Today not being logged yet does not break a streak that ran through
    // yesterday, matching how the habits module counts.
    let streak = 0;
    let cursor = today;
    if (!countsByDate[cursor]) cursor = dateMinusDays(cursor, 1);
    while (countsByDate[cursor]) {
      streak += 1;
      cursor = dateMinusDays(cursor, 1);
    }

    const dates = logs.map((l) => l.log_date).sort();
    const span = dates.length
      ? Math.max(
          1,
          Math.round(
            (new Date(dates[dates.length - 1] + "T00:00:00").getTime() -
              new Date(dates[0] + "T00:00:00").getTime()) /
              604_800_000,
          ),
        )
      : 0;

    return {
      thisWeek,
      total: logs.length,
      streak,
      perWeek: span > 0 ? (logs.length / span).toFixed(1) : "—",
    };
  }, [logs, countsByDate]);

  // 119 days, oldest first, padded so each column is a Mon–Sun week.
  const heatmapWeeks = useMemo(() => {
    const today = todayISO();
    const days: string[] = [];
    for (let i = HEATMAP_DAYS - 1; i >= 0; i--) days.push(dateMinusDays(today, i));
    const first = new Date(days[0] + "T00:00:00");
    const dow = first.getDay() === 0 ? 7 : first.getDay(); // 1=Mon..7=Sun
    const padded: (string | null)[] = [...Array(dow - 1).fill(null), ...days];
    const weeks: (string | null)[][] = [];
    for (let i = 0; i < padded.length; i += 7) weeks.push(padded.slice(i, i + 7));
    return weeks;
  }, []);

  /* ------------------------------- render -------------------------------- */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08080c] px-5 py-6 text-[#f3f4f8]">
        <div className="mb-6 h-4 w-32 animate-pulse rounded bg-[#13131c]" />
        <div className="mb-5 flex flex-col gap-5 lg:flex-row">
          <div className="h-[300px] w-full animate-pulse rounded-[16px] bg-[#13131c] lg:w-[520px]" />
          <div className="flex-1 space-y-3">
            <div className="h-8 w-2/3 animate-pulse rounded bg-[#13131c]" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-[#13131c]" />
            <div className="h-[38px] w-full animate-pulse rounded bg-[#13131c]" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3.5 bg-[#08080c] px-5 text-center text-[#f3f4f8]">
        <h2 className="text-[21px] font-bold">{error || "Not found"}</h2>
        <Link href="/media" className="text-sm font-semibold text-[#4f8dff]">
          Back to library
        </Link>
      </div>
    );
  }

  const show = isShow(item);
  const pct = progressPct(item);
  const art = item.backdrop_url || item.poster_url;

  return (
    <div className="min-h-screen bg-[#08080c] pb-24 text-[#f3f4f8]">
      {/* back */}
      <div className="px-5 pt-5">
        <Link
          href="/media"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#9a9db0] transition-colors hover:text-[#f3f4f8]"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to library
        </Link>
      </div>

      {/* ============================== HERO ============================== */}
      <section className="px-5 pt-4">
        <div className="flex flex-col gap-5 lg:flex-row">
          {/* artwork */}
          <div
            className="relative aspect-video w-full flex-none overflow-hidden rounded-[16px] border border-white/[0.07] lg:w-[520px]"
            style={coverStyle(item.title, art)}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#08080c]/80 via-transparent to-[#08080c]/40" />
            <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-[8px] bg-[#08080c]/70 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide backdrop-blur-sm">
              {TYPES[item.type].label}
            </span>
            <span className="absolute right-3 top-3">
              <PlatformBadge platform={item.platform} />
            </span>
          </div>

          {/* summary */}
          <div className="flex min-w-0 flex-1 flex-col">
            <h1 className="text-[30px] font-bold leading-tight tracking-tight">{item.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span
                className="inline-flex items-center gap-1.5 rounded-[8px] px-2.5 py-1 text-[12px] font-semibold"
                style={{
                  background: `${STATUSES[item.status].color}1f`,
                  color: STATUSES[item.status].color,
                }}
              >
                <span
                  className="h-[7px] w-[7px] rounded-full"
                  style={{ background: STATUSES[item.status].color }}
                />
                {STATUSES[item.status].label}
              </span>
              <span className="font-mono text-[12px] text-[#6b6e80]">
                updated {recency(item.updated_at)}
              </span>
            </div>

            {/* rating */}
            <div className="mt-4">
              <div className={LABEL}>Your rating</div>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => {
                  const on = n <= (item.rating || 0);
                  return (
                    <button
                      key={n}
                      onClick={() => setRating(n)}
                      aria-label={`Rate ${n}`}
                      className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/[0.08] transition-colors"
                      style={{ background: on ? "rgba(244,183,64,.12)" : "#16161f" }}
                    >
                      <Star
                        className="h-5 w-5"
                        style={{ fill: on ? "#f4b740" : "none", color: on ? "#f4b740" : "#5d6071" }}
                        strokeWidth={1.6}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* progress */}
            {show && (
              <div className="mt-5">
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="font-mono text-[13px] text-[#dfe2ee]">{episodeLabel(item)}</span>
                  <span className="font-mono text-[13px] font-semibold text-[#4f8dff]">{pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-md bg-[#1d1d28]">
                  <div
                    className="h-full rounded-md transition-all"
                    style={{
                      width: `${pct}%`,
                      background: "linear-gradient(90deg,#4f8dff,#73a6ff)",
                    }}
                  />
                </div>
                <div className="mt-1.5 font-mono text-[11.5px] text-[#6b6e80]">
                  {progressDetail(item) ?? "tracking"}
                </div>
              </div>
            )}

            {/* actions */}
            <div className="mt-5 flex flex-wrap gap-2">
              {show && (
                <>
                  <button
                    onClick={() => bump(-1)}
                    aria-label="Previous episode"
                    className="flex h-11 w-11 items-center justify-center rounded-[11px] border border-white/[0.08] bg-[#1a1a25] text-[#dfe2ee] hover:bg-[#22222f]"
                  >
                    <span className="text-xl leading-none">−</span>
                  </button>
                  <button
                    onClick={() => bump(1)}
                    className="flex items-center gap-1.5 rounded-[11px] bg-[#4f8dff] px-5 py-3 text-[13.5px] font-bold text-[#04122b] transition-transform active:scale-95"
                  >
                    <Play className="h-[15px] w-[15px] fill-[#04122b]" />
                    Next episode
                  </button>
                </>
              )}
              {item.status !== "completed" && (
                <button
                  onClick={markWatched}
                  className="flex items-center gap-1.5 rounded-[11px] border border-[#3ad07f]/30 bg-[#3ad07f]/[0.14] px-5 py-3 text-[13.5px] font-bold text-[#3ad07f] transition-colors hover:bg-[#3ad07f]/[0.24]"
                >
                  <CheckCheck className="h-[17px] w-[17px]" strokeWidth={2.2} />
                  {show ? "Mark all watched" : "Mark watched"}
                </button>
              )}
              <button
                onClick={editing ? () => setEditing(false) : startEdit}
                className="flex items-center gap-1.5 rounded-[11px] border border-white/[0.08] bg-[#1a1a25] px-4 py-3 text-[13.5px] font-semibold text-[#dfe2ee] hover:bg-[#22222f]"
              >
                {editing ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                {editing ? "Cancel" : "Edit"}
              </button>
              <button
                onClick={() => setShowDelete(true)}
                aria-label="Delete title"
                className="flex h-11 w-11 items-center justify-center rounded-[11px] border border-[#f06a6a]/25 bg-[#f06a6a]/10 text-[#f06a6a] hover:bg-[#f06a6a]/[0.18]"
              >
                <Trash2 className="h-[18px] w-[18px]" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ STATUS ============================== */}
      <section className="px-5 pt-7">
        <div className={LABEL}>Status</div>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_ORDER.map((k) => {
            const active = item.status === k;
            const c = STATUSES[k].color;
            return (
              <button
                key={k}
                onClick={() => setStatus(k)}
                className="flex items-center gap-1.5 rounded-[10px] border px-4 py-2.5 text-[13px] font-semibold transition-colors"
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
      </section>

      {/* ===================== DETAILS + REMINDERS ======================== */}
      <section className="grid grid-cols-1 gap-5 px-5 pt-7 lg:grid-cols-2">
        {/* details */}
        <div className={PANEL}>
          <div className="mb-4 flex items-center justify-between">
            <div className={`${LABEL} !mb-0`}>Details</div>
            {editing && (
              <button
                onClick={saveEdit}
                disabled={!draft?.title.trim() || saving}
                className="flex items-center gap-1.5 rounded-[9px] bg-[#4f8dff] px-3.5 py-2 text-[12.5px] font-bold text-[#04122b] disabled:bg-[#4f8dff]/40"
              >
                <Check className="h-3.5 w-3.5" strokeWidth={2.6} />
                {saving ? "Saving…" : "Save"}
              </button>
            )}
          </div>

          {editing && draft ? (
            <MediaFields
              draft={draft}
              setDraft={setDraft as React.Dispatch<React.SetStateAction<MediaDraft>>}
            />
          ) : (
            <dl className="flex flex-col gap-3 text-[13.5px]">
              <Row label="Type" value={TYPES[item.type].label} />
              <Row label="Platform" value={item.platform || "—"} />
              {show && (
                <>
                  <Row label="Seasons" value={item.total_seasons?.toString() || "—"} />
                  <Row label="Episodes / season" value={item.episodes_in_season?.toString() || "—"} />
                  <Row label="Total episodes" value={item.total_episodes?.toString() || "—"} />
                </>
              )}
              <Row label="Started" value={item.started_at || "—"} />
              <Row label="Completed" value={item.completed_at || "—"} />
              <Row label="Rating" value={item.rating ? starString(item.rating) : "—"} />
              <div className="mt-1 border-t border-white/[0.06] pt-3">
                <div className="mb-1.5 font-mono text-[10.5px] uppercase tracking-widest text-[#6b6e80]">
                  Notes
                </div>
                <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-[#c9ccda]">
                  {item.notes || <span className="text-[#6b6e80]">No notes yet.</span>}
                </p>
              </div>
            </dl>
          )}
        </div>

        {/* reminders */}
        <div className={PANEL}>
          <div className="mb-4 flex items-center justify-between">
            <div className={`${LABEL} !mb-0`}>Reminders</div>
            <button
              onClick={() => setShowReminders(true)}
              className="flex items-center gap-1.5 text-[12.5px] font-semibold text-[#4f8dff]"
            >
              <Bell className="h-3.5 w-3.5" />
              Manage
            </button>
          </div>
          {reminders.length === 0 ? (
            <p className="text-[13px] text-[#6b6e80]">
              No weekly reminders yet. Add one to get a Discord ping when a new episode is due.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {reminders.map((r) => (
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
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =========================== WATCH HISTORY ======================== */}
      {show && (
        <section className="px-5 pt-5">
          <div className={PANEL}>
            <div className="mb-4 flex items-center justify-between">
              <div className={`${LABEL} !mb-0`}>Watch history</div>
              <button
                onClick={() => setLogFormOpen((v) => !v)}
                className="flex items-center gap-1.5 text-[12.5px] font-semibold text-[#4f8dff]"
              >
                {logFormOpen ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                {logFormOpen ? "Cancel" : "Log a session"}
              </button>
            </div>

            {/* stats strip */}
            <div className="mb-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <Stat label="This week" value={stats.thisWeek} />
              <Stat label="Sessions" value={stats.total} />
              <Stat label="Streak" value={stats.streak ? `${stats.streak}d` : "—"} />
              <Stat label="Per week" value={stats.perWeek} />
            </div>

            {/* add form */}
            {logFormOpen && (
              <div className="mb-5 grid grid-cols-1 gap-3 rounded-[12px] border border-white/[0.07] bg-[#16161f] p-3.5 sm:grid-cols-[150px_110px_1fr_auto]">
                <input
                  type="date"
                  value={logDraft.log_date}
                  onChange={(e) => setLogDraft((d) => ({ ...d, log_date: e.target.value }))}
                  className={FIELD}
                />
                <input
                  type="number"
                  min={0}
                  placeholder="Episode"
                  value={logDraft.progress}
                  onChange={(e) => setLogDraft((d) => ({ ...d, progress: e.target.value }))}
                  className={FIELD}
                />
                <input
                  placeholder="Note (optional)"
                  value={logDraft.note}
                  onChange={(e) => setLogDraft((d) => ({ ...d, note: e.target.value }))}
                  className={FIELD}
                />
                <button
                  onClick={saveLog}
                  disabled={logDraft.progress === "" || savingLog}
                  className="rounded-[10px] bg-[#4f8dff] px-4 py-2.5 text-[13px] font-bold text-[#04122b] disabled:bg-[#4f8dff]/40"
                >
                  {savingLog ? "Saving…" : "Add"}
                </button>
              </div>
            )}

            {/* heatmap */}
            <div className="mb-5">
              <div className="mb-2.5 font-mono text-[10.5px] uppercase tracking-widest text-[#6b6e80]">
                Last {HEATMAP_DAYS} days
              </div>
              <div className="flex gap-1 overflow-x-auto pb-1">
                <div className="mr-1 flex flex-col gap-1 font-mono text-[9px] text-[#4a4d5a]">
                  {["M", "", "W", "", "F", "", ""].map((d, i) => (
                    <div key={i} className="flex h-[11px] items-center">
                      {d}
                    </div>
                  ))}
                </div>
                {heatmapWeeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-1">
                    {Array.from({ length: 7 }).map((_, di) => {
                      const date = week[di];
                      if (!date) return <div key={di} className="h-[11px] w-[11px]" />;
                      const n = countsByDate[date] || 0;
                      const isToday = date === todayISO();
                      // 0 = empty, then three intensity steps.
                      const bg =
                        n === 0
                          ? "#16161f"
                          : n === 1
                            ? "rgba(79,141,255,.35)"
                            : n === 2
                              ? "rgba(79,141,255,.62)"
                              : "#4f8dff";
                      return (
                        <div
                          key={di}
                          title={`${fmtLogDate(date)}${n ? ` · ${n} episode${n > 1 ? "s" : ""}` : ""}`}
                          className={`h-[11px] w-[11px] rounded-[2px] ${
                            isToday ? "ring-1 ring-[#4f8dff] ring-offset-1 ring-offset-[#101019]" : ""
                          }`}
                          style={{ background: bg, border: n === 0 ? "1px solid rgba(255,255,255,.05)" : "none" }}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* session list */}
            {logs.length === 0 ? (
              <p className="text-[13px] text-[#6b6e80]">
                No sessions yet. Advancing the episode counter records one automatically.
              </p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {logs.slice(0, 30).map((l) => (
                  <div
                    key={l.id}
                    className="group flex items-center gap-3 rounded-[10px] border border-white/[0.06] bg-[#16161f] px-3 py-2.5"
                  >
                    <span className="w-[92px] flex-none font-mono text-[11.5px] text-[#9a9db0]">
                      {fmtLogDate(l.log_date)}
                    </span>
                    <span className="flex-none rounded-[6px] bg-[#4f8dff]/[0.14] px-2 py-0.5 font-mono text-[11px] font-bold text-[#4f8dff]">
                      E{l.progress}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[12.5px] text-[#c9ccda]">
                      {l.note || ""}
                    </span>
                    <button
                      onClick={() => deleteLog(l.id)}
                      aria-label="Delete log entry"
                      className="flex-none text-[#4a4d5a] opacity-0 transition-opacity hover:text-[#f06a6a] group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {logs.length > 30 && (
                  <p className="pt-1 text-center font-mono text-[11px] text-[#6b6e80]">
                    showing 30 of {logs.length}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[80] -translate-x-1/2 rounded-[11px] border border-white/[0.1] bg-[#1a1a25] px-4 py-2.5 text-[13px] font-semibold shadow-xl">
          {toast}
        </div>
      )}

      <ReminderModal
        isOpen={showReminders}
        onClose={() => {
          setShowReminders(false);
          void load();
        }}
        item={item}
        initialReminders={reminders}
      />

      <DeleteConfirmationModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={confirmDelete}
        itemName={item.title}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[11px] border border-white/[0.06] bg-[#16161f] px-3 py-2.5">
      <div className="font-mono text-[9.5px] uppercase tracking-widest text-[#6b6e80]">{label}</div>
      <div className="mt-1 text-[18px] font-bold leading-none">{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="font-mono text-[11.5px] uppercase tracking-wide text-[#6b6e80]">{label}</dt>
      <dd className="min-w-0 truncate text-right text-[#dfe2ee]">{value}</dd>
    </div>
  );
}
