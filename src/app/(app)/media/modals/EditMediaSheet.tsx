"use client";

import { useState } from "react";
import { Bell, Plus, X, Trash2, Star, Check } from "lucide-react";
import type { MediaItem, MediaStatus, MediaReminder } from "@/types/media.types";
import {
  STATUS_ORDER,
  STATUSES,
  TYPES,
  isShow,
  coverFor,
  episodeLabel,
  reminderLabel,
  PlatformBadge,
  SheetLabel,
  MediaFields,
} from "../media-utils";

export default function EditMediaSheet({
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
                <Bell className="h-4 w-4 flex-none" style={{ color: r.is_active ? "#4f8dff" : "#6b6e80" }} />
                <span className="flex-1 font-mono text-[12.5px] text-[#dfe2ee]">{reminderLabel(r)}</span>
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
