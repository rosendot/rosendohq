"use client";

import { ChevronRight, Trash2, X } from "lucide-react";
import type { Book, BookStatus } from "@/types/reading.types";
import { STATUS_ORDER, STATUSES, coverFor, hasPages, pct } from "../reading-utils";

// Quick-action sheet opened from a card's ⋮. Every action here applies
// instantly (the page wires optimistic PATCHes). Full editing lives on the
// detail page via "Open full details".
export default function EditBookSheet({
  book,
  onClose,
  onStatus,
  onRate,
  onSetPage,
  onOpenDetail,
  onDelete,
}: {
  book: Book;
  onClose: () => void;
  onStatus: (s: BookStatus) => void;
  onRate: (r: number) => void;
  onSetPage: (p: number) => void;
  onOpenDetail: () => void;
  onDelete: () => void;
}) {
  const showPages = hasPages(book);
  const current = book.current_page || 0;
  const total = book.total_pages || 0;
  const percent = pct(book);

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

        {/* header: cover + title + author */}
        <div className="mb-5 flex items-start gap-3.5">
          <div
            className="relative h-[78px] w-[52px] flex-none overflow-hidden rounded-[9px]"
            style={{ background: coverFor(book.title) }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] via-transparent to-[#08080c]/40" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[19px] font-semibold leading-snug tracking-tight">
              {book.title}
            </div>
            {book.author && <div className="mt-0.5 text-[13.5px] text-[#9a9db0]">{book.author}</div>}
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
        <div className="mb-2.5 font-mono text-[10.5px] font-semibold uppercase tracking-widest text-[#6b6e80]">
          Status
        </div>
        <div className="mb-5 flex flex-wrap gap-1.5">
          {STATUS_ORDER.map((k) => {
            const active = book.status === k;
            const c = STATUSES[k].color;
            return (
              <button
                key={k}
                onClick={() => onStatus(k)}
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

        {/* rating */}
        <div className="mb-2.5 font-mono text-[10.5px] font-semibold uppercase tracking-widest text-[#6b6e80]">
          Your rating
        </div>
        <div className="mb-5 flex gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => {
            const on = n <= (book.rating || 0);
            return (
              <button
                key={n}
                onClick={() => onRate(n === book.rating ? 0 : n)}
                aria-label={`Rate ${n}`}
                className="flex h-11 w-11 items-center justify-center rounded-[11px] border border-white/[0.08]"
                style={{ background: on ? "rgba(224,164,73,.12)" : "#16161f" }}
              >
                <svg
                  width="22"
                  height="22"
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

        {/* page stepper */}
        {showPages && (
          <>
            <div className="mb-2.5 flex items-center justify-between">
              <span className="font-mono text-[10.5px] font-semibold uppercase tracking-widest text-[#6b6e80]">
                Current page
              </span>
              <span className="font-mono text-[11px] font-semibold text-[#e0a449]">{percent}%</span>
            </div>
            <div className="mb-3 flex items-center gap-2.5">
              <button
                onClick={() => onSetPage(current - 10)}
                aria-label="Minus 10 pages"
                className="flex h-[46px] w-[46px] flex-none items-center justify-center rounded-[11px] border border-white/[0.08] bg-[#1a1a25] font-mono text-[11px] font-bold text-[#dfe2ee]"
              >
                −10
              </button>
              <div className="flex flex-1 items-baseline justify-center gap-1.5 rounded-[11px] border border-white/[0.07] bg-[#16161f] py-[11px]">
                <input
                  type="number"
                  value={current}
                  onChange={(e) => onSetPage(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-[62px] border-none bg-transparent text-right text-[22px] font-bold text-[#f3f4f8] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="font-mono text-[12px] text-[#6b6e80]">/ {total}</span>
              </div>
              <button
                onClick={() => onSetPage(current + 10)}
                aria-label="Plus 10 pages"
                className="flex h-[46px] w-[46px] flex-none items-center justify-center rounded-[11px] bg-[#e0a449] font-mono text-[11px] font-bold text-[#20160a]"
              >
                +10
              </button>
            </div>
            <div className="mb-5 h-1.5 overflow-hidden rounded-[6px] bg-[#1d1d28]">
              <div
                className="h-full rounded-[6px] transition-[width] duration-200"
                style={{
                  width: `${percent}%`,
                  background: "linear-gradient(90deg,#cf8f33,#e9b65f)",
                }}
              />
            </div>
          </>
        )}

        {/* footer */}
        <div className="flex gap-2.5">
          <button
            onClick={onOpenDetail}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-[11px] border border-white/10 bg-[#1a1a25] py-3.5 text-sm font-semibold text-[#f3f4f8] hover:bg-[#22222f]"
          >
            Open full details
            <ChevronRight className="h-4 w-4" strokeWidth={2.1} />
          </button>
          <button
            onClick={onDelete}
            aria-label="Delete book"
            className="flex w-[50px] flex-none items-center justify-center rounded-[11px] border border-[#f06a6a]/25 bg-[#f06a6a]/10 text-[#f06a6a] hover:bg-[#f06a6a]/[0.18]"
          >
            <Trash2 className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
