"use client";

import { useState, useEffect, useRef } from "react";
import { X, Search, Loader2 } from "lucide-react";
import type { BookStatus, BookFormat } from "@/types/reading.types";
import type { BookSearchResult } from "@/app/api/books/search/route";
import {
  STATUS_ORDER,
  STATUSES,
  FORMAT_ORDER,
  FORMATS,
  SheetLabel,
  BookFields,
  type BookDraft,
} from "../reading-utils";

export default function AddBookSheet({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (body: Record<string, unknown>) => Promise<void>;
}) {
  const [status, setStatus] = useState<BookStatus>("planned");
  const [format, setFormat] = useState<BookFormat>("physical");
  const [rating, setRating] = useState(0);
  const [saving, setSaving] = useState(false);

  const [draft, setDraft] = useState<BookDraft>({
    title: "",
    author: "",
    format: "physical",
    current_page: "",
    total_pages: "",
    started_at: "",
    finished_at: "",
    notes: "",
  });

  // --- Open Library lookup -------------------------------------------------
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  // Artwork carried from the picked result through to the POST body.
  const [art, setArt] = useState<{
    cover_url: string | null;
    description: string | null;
    openlibrary_key: string | null;
  }>({ cover_url: null, description: null, openlibrary_key: null });
  const reqRef = useRef(0);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const seq = ++reqRef.current;
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/books/search?q=${encodeURIComponent(q)}`);
        if (seq !== reqRef.current) return; // a newer keystroke won
        setResults(res.ok ? await res.json() : []);
      } catch {
        if (seq === reqRef.current) setResults([]);
      } finally {
        if (seq === reqRef.current) setSearching(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  const pick = async (r: BookSearchResult) => {
    setPicked(r.key);
    setDraft((d) => ({
      ...d,
      title: r.title,
      author: r.author || d.author,
      total_pages: r.total_pages ?? d.total_pages,
    }));
    setArt({ cover_url: r.cover_url, description: null, openlibrary_key: r.key });
    // Descriptions live on the work record, so fetch once the pick is known.
    try {
      const res = await fetch(`/api/books/search/describe?key=${encodeURIComponent(r.key)}`);
      if (res.ok) {
        const { description } = await res.json();
        setArt((a) => (a.openlibrary_key === r.key ? { ...a, description } : a));
      }
    } catch {
      /* a missing blurb is not worth failing the add for */
    }
  };


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
      author: draft.author.trim() || null,
      status,
      format,
      rating: rating || null,
      current_page: numOrNull(draft.current_page) || 0,
      total_pages: numOrNull(draft.total_pages),
      started_at: draft.started_at || null,
      finished_at: draft.finished_at || null,
      notes: draft.notes.trim() || null,
      cover_url: art.cover_url,
      description: art.description,
      openlibrary_key: art.openlibrary_key,
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
        className="max-h-[92vh] w-full max-w-[520px] overflow-y-auto rounded-t-[22px] border border-white/[0.09] bg-[#101019]"
      >
        {/* sticky header */}
        <div className="sticky top-0 z-[2] flex items-center justify-between border-b border-white/[0.06] bg-[#101019]/[0.92] px-5 py-4 backdrop-blur">
          <h3 className="text-[17px] font-bold">Add a book</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] border border-white/[0.08] bg-[#1a1a25] text-[#9a9db0]"
          >
            <X className="h-4 w-4" strokeWidth={2.2} />
          </button>
        </div>

        <div className="flex flex-col gap-4 px-5 pb-5 pt-5">
          {/* find a title — prefills fields + attaches cover art */}
          <div>
            <SheetLabel>Find a title</SheetLabel>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b6e80]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Open Library…"
                className="w-full rounded-[11px] border border-white/[0.08] bg-[#16161f] py-2.5 pl-9 pr-9 text-[14px] text-[#f3f4f8] outline-none transition-colors placeholder:text-[#5d6071] focus:border-[#e0a449]/50"
              />
              {searching && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[#6b6e80]" />
              )}
            </div>

            {results.length > 0 && (
              <div className="mt-2 flex flex-col gap-1.5">
                {results.map((r) => {
                  const on = picked === r.key;
                  return (
                    <button
                      key={r.key}
                      onClick={() => pick(r)}
                      className="flex items-center gap-2.5 rounded-[11px] border p-2 text-left transition-colors"
                      style={{
                        background: on ? "rgba(224,164,73,.12)" : "#16161f",
                        borderColor: on ? "#e0a449" : "rgba(255,255,255,.08)",
                      }}
                    >
                      <div
                        className="h-[54px] w-[36px] flex-none rounded-[5px] bg-[#101019] bg-cover bg-center"
                        style={
                          r.cover_url ? { backgroundImage: `url(${r.cover_url})` } : undefined
                        }
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13.5px] font-semibold text-[#f3f4f8]">
                          {r.title}
                        </div>
                        <div className="truncate font-mono text-[11px] text-[#8b8fa3]">
                          {[r.author, r.year, r.total_pages ? `${r.total_pages}p` : null]
                            .filter(Boolean)
                            .join(" · ")}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            {!searching && query.trim().length >= 3 && results.length === 0 && (
              <p className="mt-2 text-[12.5px] text-[#6b6e80]">
                No matches — you can still type the details in by hand.
              </p>
            )}
          </div>

          {/* format chips */}
          <div>
            <SheetLabel>Format</SheetLabel>
            <div className="flex flex-wrap gap-1.5">
              {FORMAT_ORDER.map((k) => {
                const active = format === k;
                return (
                  <button
                    key={k}
                    onClick={() => setFormat(k)}
                    className="rounded-[10px] border px-3.5 py-2.5 text-[13px] font-semibold"
                    style={{
                      background: active ? "rgba(224,164,73,.14)" : "#16161f",
                      color: active ? "#e0a449" : "#9a9db0",
                      borderColor: active ? "#e0a449" : "rgba(255,255,255,.08)",
                    }}
                  >
                    {FORMATS[k]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* status chips */}
          <div>
            <SheetLabel>Status</SheetLabel>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_ORDER.map((k) => {
                const active = status === k;
                const c = STATUSES[k].color;
                return (
                  <button
                    key={k}
                    onClick={() => setStatus(k)}
                    className="flex items-center gap-1.5 rounded-[10px] border px-3 py-2.5 text-[13px] font-semibold"
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
          </div>

          {/* rating */}
          <div>
            <SheetLabel>Rating</SheetLabel>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => {
                const on = n <= rating;
                return (
                  <button
                    key={n}
                    onClick={() => setRating(n === rating ? 0 : n)}
                    aria-label={`Rate ${n}`}
                    className="flex h-[42px] w-[42px] items-center justify-center rounded-[10px] border border-white/[0.08] bg-[#16161f]"
                  >
                    <svg
                      width="21"
                      height="21"
                      viewBox="0 0 24 24"
                      fill={on ? "#e0a449" : "none"}
                      stroke={on ? "#e0a449" : "#5d6071"}
                      strokeWidth={1.6}
                    >
                      <path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 18.6 6.1 21.3l1.2-6.6L2.5 9.5l6.6-.9z" />
                    </svg>
                  </button>
                );
              })}
            </div>
          </div>

          {/* the rest of the fields */}
          <BookFields draft={draft} setDraft={setDraft} />
        </div>

        {/* sticky footer */}
        <div className="sticky bottom-0 flex gap-2.5 border-t border-white/[0.06] bg-[#101019]/[0.94] px-5 py-3.5 backdrop-blur">
          <button
            onClick={onClose}
            className="flex-none rounded-[11px] border border-white/10 bg-[#1a1a25] px-5 py-3.5 text-sm font-semibold text-[#dfe2ee] hover:bg-[#22222f]"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!draft.title.trim() || saving}
            className="flex flex-1 items-center justify-center rounded-[11px] bg-[#e0a449] py-3.5 text-sm font-bold text-[#20160a] transition-colors disabled:cursor-not-allowed disabled:bg-[#e0a449]/40"
            style={{ boxShadow: "0 4px 14px rgba(224,164,73,.34)" }}
          >
            {saving ? "Adding…" : "Add to shelf"}
          </button>
        </div>
      </div>
    </div>
  );
}
