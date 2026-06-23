"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { BookStatus, BookFormat } from "@/types/reading.types";
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
