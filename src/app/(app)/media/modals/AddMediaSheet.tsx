"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, X, Star, Search, Loader2, Check } from "lucide-react";
import type { MediaStatus, MediaType } from "@/types/media.types";
import type { MediaSearchResult } from "@/app/api/media/search/route";
import {
  STATUS_ORDER,
  STATUSES,
  TYPES,
  SheetLabel,
  MediaFields,
  coverStyle,
  type MediaDraft,
} from "../media-utils";

export default function AddMediaSheet({
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

  // --- lookup state -------------------------------------------------------
  const [lookupType, setLookupType] = useState<MediaType>("movie");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MediaSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  // Artwork carried from the picked result through to the POST body.
  const [art, setArt] = useState<{
    poster_url: string | null;
    backdrop_url: string | null;
    tmdb_id: number | null;
    anilist_id: number | null;
    overview: string | null;
  } | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const reqRef = useRef(0);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setSearching(false);
      setSearchError(null);
      return;
    }
    setSearching(true);
    const seq = ++reqRef.current;
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/media/search?q=${encodeURIComponent(q)}&type=${lookupType}`,
        );
        if (seq !== reqRef.current) return; // a newer keystroke won
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
        setSearchError(null);
      } catch {
        if (seq !== reqRef.current) return;
        setResults([]);
        setSearchError("Lookup unavailable — you can still fill this in by hand.");
      } finally {
        if (seq === reqRef.current) setSearching(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [query, lookupType]);

  const applyResult = (r: MediaSearchResult) => {
    setPicked(r.external_id);
    setArt({
      poster_url: r.poster_url,
      backdrop_url: r.backdrop_url,
      tmdb_id: r.source === "tmdb" ? r.external_id : null,
      anilist_id: r.source === "anilist" ? r.external_id : null,
      overview: r.overview,
    });
    setDraft((d) => ({
      ...d,
      title: r.title,
      type: lookupType,
      platform: r.platform || d.platform,
      total_seasons: r.total_seasons ?? d.total_seasons,
      episodes_in_season: r.episodes_in_season ?? d.episodes_in_season,
      total_episodes: r.total_episodes ?? d.total_episodes,
    }));
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
      // Artwork only rides along when the title came from a lookup result.
      poster_url: art?.poster_url ?? null,
      backdrop_url: art?.backdrop_url ?? null,
      tmdb_id: art?.tmdb_id ?? null,
      overview: art?.overview ?? null,
      anilist_id: art?.anilist_id ?? null,
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
          {/* lookup */}
          <SheetLabel>Find a title</SheetLabel>
          <div className="mb-2 flex gap-1.5">
            {(["movie", "show", "anime"] as MediaType[]).map((k) => {
              const active = lookupType === k;
              return (
                <button
                  key={k}
                  onClick={() => {
                    setLookupType(k);
                    setDraft((d) => ({ ...d, type: k }));
                  }}
                  className="flex-1 rounded-[9px] border py-2 text-[12.5px] font-semibold transition-colors"
                  style={{
                    background: active ? "rgba(79,141,255,.12)" : "#16161f",
                    color: active ? "#f3f4f8" : "#9a9db0",
                    borderColor: active ? "#4f8dff" : "rgba(255,255,255,.08)",
                  }}
                >
                  {TYPES[k].label}
                </button>
              );
            })}
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b6e80]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${TYPES[lookupType].label.toLowerCase()}s…`}
              className="w-full rounded-[10px] border border-white/[0.08] bg-[#16161f] py-2.5 pl-9 pr-9 text-[14px] text-[#f3f4f8] outline-none transition-colors placeholder:text-[#5d6071] focus:border-[#4f8dff]/50"
            />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[#6b6e80]" />
            )}
            {!searching && query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6b6e80] hover:text-[#9a9db0]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {searchError && (
            <div className="mt-2 rounded-[9px] border border-[#f4b740]/25 bg-[#f4b740]/[0.07] px-3 py-2 text-[12px] text-[#f4b740]">
              {searchError}
            </div>
          )}

          {results.length > 0 && (
            <div className="mt-2 max-h-[248px] overflow-y-auto rounded-[11px] border border-white/[0.07] bg-[#0c0c14]">
              {results.map((r) => {
                const on = picked === r.external_id;
                return (
                  <button
                    key={`${r.source}-${r.external_id}`}
                    onClick={() => applyResult(r)}
                    className="flex w-full items-center gap-3 border-b border-white/[0.05] px-2.5 py-2 text-left last:border-b-0 hover:bg-white/[0.04]"
                  >
                    <div
                      className="h-[54px] w-[38px] flex-none overflow-hidden rounded-[6px]"
                      style={coverStyle(r.title, r.poster_url)}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13.5px] font-semibold text-[#f3f4f8]">
                        {r.title}
                      </div>
                      <div className="mt-0.5 truncate font-mono text-[11px] text-[#6b6e80]">
                        {[r.year, r.platform, r.total_episodes ? `${r.total_episodes} eps` : null]
                          .filter(Boolean)
                          .join(" · ") || r.subtitle || "—"}
                      </div>
                    </div>
                    {on && <Check className="h-4 w-4 flex-none text-[#3ad07f]" strokeWidth={2.6} />}
                  </button>
                );
              })}
            </div>
          )}

          {art?.poster_url && (
            <div className="mt-2 flex items-center gap-2 text-[12px] text-[#3ad07f]">
              <Check className="h-3.5 w-3.5" strokeWidth={2.6} />
              Artwork attached
            </div>
          )}

          <div className="my-5 h-px bg-white/[0.06]" />

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
