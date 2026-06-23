// Shared constants, helpers, and form primitives for the media module.
// Imported by the page (cards/rows) and the add/edit sheets.
import { Film, Tv, Sparkles, ChevronDown } from "lucide-react";
import type { MediaItem, MediaType, MediaStatus, MediaReminder } from "@/types/media.types";

/* ----------------------------- constants & maps ---------------------------- */

export const STATUS_ORDER: MediaStatus[] = ["planned", "watching", "completed", "on_hold", "dropped"];

export const STATUSES: Record<MediaStatus, { label: string; color: string }> = {
  planned: { label: "Planned", color: "#8b93a7" },
  watching: { label: "Watching", color: "#4f8dff" },
  completed: { label: "Completed", color: "#3ad07f" },
  on_hold: { label: "On hold", color: "#f4b740" },
  dropped: { label: "Dropped", color: "#f06a6a" },
};

export const TYPES: Record<MediaType, { label: string; short: string; Icon: typeof Film }> = {
  movie: { label: "Movie", short: "MV", Icon: Film },
  show: { label: "TV", short: "TV", Icon: Tv },
  anime: { label: "Anime", short: "AN", Icon: Sparkles },
};

export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Maps a platform name fragment to a brand-colored badge. Mirrors the dispatcher.
export function platformBadge(platform: string | null): { name: string; bg: string; fg: string } {
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
export function coverFor(title: string): string {
  const hue = hueFor(title);
  const a = `hsl(${hue} 24% 15%)`;
  const b = `hsl(${hue} 26% 19%)`;
  return `repeating-linear-gradient(135deg, ${a}, ${a} 11px, ${b} 11px, ${b} 22px)`;
}

export const isShow = (t: MediaItem) => t.type === "show" || t.type === "anime";

// Approximate lifetime episodes watched from season + in-season progress.
function lifetimeWatched(t: MediaItem): number {
  const perSeason = t.episodes_in_season || 0;
  const season = t.current_season || 1;
  const ep = t.current_episode || 0;
  if (perSeason > 0 && season > 1) return (season - 1) * perSeason + ep;
  return ep;
}

export function progressPct(t: MediaItem): number {
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

export function episodeLabel(t: MediaItem): string {
  const parts: string[] = [];
  if (t.current_season) parts.push(`S${t.current_season}`);
  const ep = t.current_episode || 0;
  parts.push(t.episodes_in_season ? `E${ep} / ${t.episodes_in_season}` : `E${ep}`);
  return parts.join(" · ");
}

export function starString(rating: number | null): string {
  const r = rating || 0;
  return "★".repeat(r) + "☆".repeat(5 - r);
}

export function recency(updatedAt: string): string {
  const then = new Date(updatedAt).getTime();
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.round(days / 7)}w ago`;
  return `${Math.round(days / 30)}mo ago`;
}

export function yearOf(t: MediaItem): string {
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

export function reminderLabel(r: MediaReminder): string {
  return `${DAY_LABELS[r.day_of_week]} · ${time12(r.time_of_day)}`;
}

// ms until the next firing of a weekly reminder, computed in its own timezone.
export function nextFireMs(r: MediaReminder, now: Date = new Date()): number {
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

/* ------------------------------- shared UI --------------------------------- */

export function PlatformBadge({
  platform,
  className = "",
}: {
  platform: string | null;
  className?: string;
}) {
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

export function SheetLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
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
export type MediaDraft = {
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
export function MediaFields<T extends MediaDraft>({
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
