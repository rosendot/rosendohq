"use client";

import { useState } from "react";
import { Plus, X, Star } from "lucide-react";
import type { MediaStatus } from "@/types/media.types";
import { STATUS_ORDER, STATUSES, SheetLabel, MediaFields, type MediaDraft } from "../media-utils";

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
