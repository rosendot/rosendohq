// Shared constants, helpers, and form primitives for the reading module.
// Imported by the page (cards/rows), the detail page, and the add/edit sheets.
// "Shelf" Reel-style redesign — warm amber accent, status-grouped carousels.
import { ChevronDown } from "lucide-react";
import type { Book, BookStatus, BookFormat } from "@/types/reading.types";

/* ----------------------------- constants & maps ---------------------------- */

export const STATUS_ORDER: BookStatus[] = ["reading", "planned", "finished", "on_hold", "dropped"];

export const STATUSES: Record<BookStatus, { label: string; color: string }> = {
  planned: { label: "Planned", color: "#8b93a7" },
  reading: { label: "Reading", color: "#e0a449" },
  finished: { label: "Finished", color: "#3ad07f" },
  on_hold: { label: "On hold", color: "#f4b740" },
  dropped: { label: "Dropped", color: "#f06a6a" },
};

// Section headings per status (carousel rows), in STATUS_ORDER.
export const GROUP_LABELS: Record<BookStatus, string> = {
  reading: "Continue Reading",
  planned: "Plan to Read",
  finished: "Finished",
  on_hold: "On Hold",
  dropped: "Dropped",
};

export const FORMATS: Record<BookFormat, string> = {
  physical: "Physical",
  ebook: "eBook",
  audiobook: "Audiobook",
};

export const FORMAT_ORDER: BookFormat[] = ["physical", "ebook", "audiobook"];

const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/* -------------------------------- helpers ---------------------------------- */

// Stable hue from a title so each book gets a consistent gradient "cover".
function hueFor(s: string): number {
  let h = 0;
  for (let i = 0; i < (s || "x").length; i++) h = (h * 31 + (s || "x").charCodeAt(i)) % 360;
  return h;
}

// A book-jacket gradient + faint diagonal stripe, derived from the title.
export function coverFor(title: string): string {
  const h = hueFor(title);
  const a = `hsl(${h} 32% 20%)`;
  const b = `hsl(${(h + 28) % 360} 34% 12%)`;
  const stripe = `hsla(${h},40%,60%,.05)`;
  return `repeating-linear-gradient(115deg, transparent, transparent 13px, ${stripe} 13px, ${stripe} 14px), linear-gradient(155deg, ${a}, ${b})`;
}

export function alpha(hex: string, a: number): string {
  const n = hex.replace("#", "");
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export const isReading = (b: Book) => b.status === "reading";
export const hasPages = (b: Book) => !!b.total_pages && b.total_pages > 0;

export function pct(b: Book): number {
  if (b.status === "finished") return 100;
  return b.total_pages ? Math.round(Math.min(100, ((b.current_page || 0) / b.total_pages) * 100)) : 0;
}

export function starString(rating: number | null): string {
  const r = rating || 0;
  return r > 0 ? "★".repeat(r) + "☆".repeat(5 - r) : "";
}

export function recency(updatedAt: string | null): number {
  if (!updatedAt) return Number.POSITIVE_INFINITY;
  return Math.floor((Date.now() - new Date(updatedAt).getTime()) / 86_400_000);
}

// "Jun 22, 2026" or an em dash when empty.
export function fmtDate(d: string | null): string {
  if (!d) return "—";
  const dt = new Date(d + "T00:00:00");
  if (isNaN(dt.getTime())) return "—";
  return `${MON[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`;
}

/* ------------------------------- shared UI --------------------------------- */

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

// Draft shape shared by the add sheet and (on the detail page) edit mode.
export type BookDraft = {
  title: string;
  author: string;
  format: BookFormat | "";
  current_page: number | string;
  total_pages: number | string;
  started_at: string;
  finished_at: string;
  notes: string;
};

const FIELD_LABEL =
  "mb-1.5 block font-mono text-[10.5px] font-semibold uppercase tracking-[0.07em] text-[#6b6e80]";
const FIELD_INPUT =
  "w-full rounded-[11px] border border-white/[0.08] bg-[#16161f] px-3 py-2.5 text-[14px] text-[#f3f4f8] outline-none transition-colors focus:border-[#e0a449]/50 placeholder:text-[#5d6071] [color-scheme:dark]";

// The shared detail inputs (title, author, totals, dates, notes) used by the
// add sheet. Status/format/rating chips are rendered by the sheet itself since
// they wire to instant-vs-draft handlers differently.
export function BookFields<T extends BookDraft>({
  draft,
  setDraft,
}: {
  draft: T;
  setDraft: React.Dispatch<React.SetStateAction<T>>;
}) {
  const set = <K extends keyof T>(k: K, v: T[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const num = (v: string): number | string => (v === "" ? "" : Math.max(0, parseInt(v, 10) || 0));

  return (
    <div className="flex flex-col gap-4">
      {/* title */}
      <div>
        <label className={FIELD_LABEL}>Title</label>
        <input
          value={draft.title}
          onChange={(e) => set("title", e.target.value as T["title"])}
          placeholder="e.g. The Name of the Wind"
          className={FIELD_INPUT}
        />
      </div>

      {/* author */}
      <div>
        <label className={FIELD_LABEL}>Author</label>
        <input
          value={draft.author}
          onChange={(e) => set("author", e.target.value as T["author"])}
          placeholder="e.g. Patrick Rothfuss"
          className={FIELD_INPUT}
        />
      </div>

      {/* page totals */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={FIELD_LABEL}>Current page</label>
          <input
            type="number"
            min={0}
            value={draft.current_page}
            onChange={(e) => set("current_page", num(e.target.value) as T["current_page"])}
            placeholder="0"
            className={FIELD_INPUT}
          />
        </div>
        <div>
          <label className={FIELD_LABEL}>Total pages</label>
          <input
            type="number"
            min={0}
            value={draft.total_pages}
            onChange={(e) => set("total_pages", num(e.target.value) as T["total_pages"])}
            placeholder="0"
            className={FIELD_INPUT}
          />
        </div>
      </div>

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
          <label className={FIELD_LABEL}>Finished</label>
          <input
            type="date"
            value={draft.finished_at}
            onChange={(e) => set("finished_at", e.target.value as T["finished_at"])}
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
          placeholder="Why this book, where you heard of it, a reason if it's on hold…"
          rows={3}
          className={`${FIELD_INPUT} min-h-[72px] resize-y leading-relaxed`}
        />
      </div>
    </div>
  );
}

// A small chevron-styled select used for the format field where a chip set
// isn't appropriate. Exported in case the sheets want it.
export function FieldSelect({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${FIELD_INPUT} cursor-pointer appearance-none pr-8`}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6b6e80]" />
    </div>
  );
}
