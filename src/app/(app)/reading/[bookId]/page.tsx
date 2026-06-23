"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Pencil, Trash2, Plus } from "lucide-react";
import type { Book, BookFormat, ReadingLog, Highlight } from "@/types/reading.types";
import {
  STATUS_ORDER,
  STATUSES,
  FORMAT_ORDER,
  FORMATS,
  coverFor,
  alpha,
  hasPages,
  pct,
  starString,
  fmtDate,
} from "../reading-utils";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const todayISO = () => new Date().toISOString().slice(0, 10);
const daysAgoISO = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

export default function BookDetailPage({ params }: { params: Promise<{ bookId: string }> }) {
  const router = useRouter();
  const [bookId, setBookId] = useState("");
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // edit mode (draft of book fields)
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Partial<Book>>({});
  const [saving, setSaving] = useState(false);

  // reading logs
  const [logs, setLogs] = useState<ReadingLog[]>([]);
  const [sFormOpen, setSFormOpen] = useState(false);
  const [sDraft, setSDraft] = useState({ log_date: todayISO(), pages: "", minutes: "", note: "" });
  const [savingLog, setSavingLog] = useState(false);

  // highlights
  const [hFormOpen, setHFormOpen] = useState(false);
  const [hDraft, setHDraft] = useState({ text: "", location: "" });

  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    params.then((p) => setBookId(p.bookId));
  }, [params]);

  useEffect(() => {
    if (!bookId) return;
    fetchBook();
    fetchLogs();
  }, [bookId]);

  const fetchBook = async () => {
    try {
      const res = await fetch(`/api/books/${bookId}`);
      if (!res.ok) throw new Error("Book not found");
      const data = await res.json();
      setBook(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load book");
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch(`/api/books/${bookId}/logs`);
      if (res.ok) setLogs(await res.json());
    } catch (err) {
      console.error("Error fetching reading logs:", err);
    }
  };

  /* ----------------------------- book mutations ---------------------------- */

  const patchBook = async (body: Partial<Book>) => {
    setBook((prev) => (prev ? { ...prev, ...body } : prev));
    try {
      const res = await fetch(`/api/books/${bookId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) setBook(await res.json());
    } catch (err) {
      console.error("Error updating book:", err);
      fetchBook();
    }
  };

  const startEdit = () => {
    if (!book) return;
    setDraft({
      title: book.title,
      author: book.author,
      status: book.status,
      format: book.format,
      rating: book.rating,
      current_page: book.current_page,
      total_pages: book.total_pages,
      started_at: book.started_at,
      finished_at: book.finished_at,
      notes: book.notes,
    });
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setDraft({});
  };

  const saveEdit = async () => {
    if (!book) return;
    setSaving(true);
    const body: Partial<Book> = {
      ...draft,
      title: (draft.title || "").trim() || "Untitled",
      author: (draft.author || "")?.toString().trim() || null,
    };
    await patchBook(body);
    setSaving(false);
    setEditing(false);
    setDraft({});
  };

  const handleDelete = async () => {
    try {
      await fetch(`/api/books/${bookId}`, { method: "DELETE" });
      router.push("/reading");
    } catch (err) {
      console.error("Error deleting book:", err);
    }
  };

  /* ------------------------------- sessions -------------------------------- */

  const addSession = async () => {
    if (!book) return;
    const pages = parseInt(sDraft.pages, 10) || 0;
    const minutes = parseInt(sDraft.minutes, 10) || 0;
    setSavingLog(true);
    try {
      const res = await fetch(`/api/books/${bookId}/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          log_date: sDraft.log_date,
          pages: pages || null,
          minutes: minutes || null,
          note: sDraft.note.trim() || null,
        }),
      });
      if (res.ok) {
        setSDraft({ log_date: todayISO(), pages: "", minutes: "", note: "" });
        setSFormOpen(false);
        fetchLogs();
        // advance page / status like the design's local model
        if (pages) {
          const next = Math.max(0, Math.min(book.total_pages || 99999, (book.current_page || 0) + pages));
          const body: Partial<Book> = { current_page: next };
          if (book.status === "planned") body.status = "reading";
          patchBook(body);
        }
      }
    } catch (err) {
      console.error("Error adding session:", err);
    } finally {
      setSavingLog(false);
    }
  };

  const deleteSession = async (logId: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== logId));
    try {
      await fetch(`/api/books/logs/${logId}`, { method: "DELETE" });
    } catch (err) {
      console.error("Error deleting session:", err);
      fetchLogs();
    }
  };

  /* ------------------------------ highlights ------------------------------- */

  const highlights: Highlight[] = book?.highlights || [];

  const saveHighlights = (next: Highlight[]) =>
    patchBook({ highlights: next.length ? next : [] });

  const addHighlight = () => {
    const text = hDraft.text.trim();
    if (!text) return;
    const next: Highlight[] = [
      { text, location: hDraft.location.trim(), created_at: new Date().toISOString() },
      ...highlights,
    ];
    saveHighlights(next);
    setHDraft({ text: "", location: "" });
    setHFormOpen(false);
  };

  const deleteHighlight = (idx: number) =>
    saveHighlights(highlights.filter((_, i) => i !== idx));

  /* --------------------------------- stats --------------------------------- */

  const logStats = useMemo(() => {
    const weekCut = daysAgoISO(6);
    const weekPages = logs
      .filter((l) => (l.log_date || "") >= weekCut)
      .reduce((a, l) => a + (l.pages || 0), 0);
    const days = new Set(logs.map((l) => l.log_date).filter(Boolean));
    let streak = 0;
    const d = new Date();
    if (!days.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1);
    for (let i = 0; i < 400; i++) {
      const key = d.toISOString().slice(0, 10);
      if (days.has(key)) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else break;
    }
    return [
      { value: weekPages, label: "Pages this week" },
      { value: logs.length, label: "Total sessions" },
      { value: `${streak} ${streak === 1 ? "day" : "days"}`, label: "Current streak" },
    ];
  }, [logs]);

  const sortedLogs = useMemo(
    () => [...logs].sort((a, b) => (b.log_date || "").localeCompare(a.log_date || "")),
    [logs],
  );

  /* --------------------------------- render -------------------------------- */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08080c] p-8">
        <p className="text-[#9a9db0]">Loading…</p>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-[#08080c] p-8">
        <p className="text-[#f06a6a]">{error || "Book not found"}</p>
        <Link href="/reading" className="mt-4 inline-block text-[#e0a449] hover:underline">
          ← Back to shelf
        </Link>
      </div>
    );
  }

  const st = STATUSES[book.status];
  const percent = pct(book);
  const FIELD_INPUT =
    "w-full rounded-[9px] border border-white/[0.08] bg-[#16161f] px-[11px] py-[9px] text-[14px] text-[#f3f4f8] outline-none focus:border-[#e0a449]/50 [color-scheme:dark]";
  const FIELD_LABEL = "mb-1 block text-[11px] text-[#9a9db0]";

  return (
    <div
      className="min-h-screen text-[#f3f4f8]"
      style={{
        background:
          "radial-gradient(1200px 620px at 72% -12%, rgba(224,164,73,.06), transparent 58%), #08080c",
      }}
    >
      <main className="mx-auto max-w-[780px] px-[18px] pb-[120px] pt-4">
        <button
          onClick={() => router.push("/reading")}
          className="mb-3.5 flex items-center gap-1.5 py-1.5 text-[13.5px] font-semibold text-[#9a9db0]"
        >
          <ChevronLeft className="h-[17px] w-[17px]" strokeWidth={2.2} />
          Back to shelf
        </button>

        {/* hero */}
        <section className="mb-3.5 flex flex-wrap gap-[18px]">
          <div
            className="relative flex aspect-[2/3] w-[150px] flex-none flex-col justify-between overflow-hidden rounded-[14px] p-4 shadow-[0_18px_40px_rgba(0,0,0,.45)]"
            style={{ background: coverFor(draft.title || book.title) }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.09] via-transparent to-[#08080c]/[0.55]" />
            <div className="absolute bottom-0 left-0 top-0 w-[6px] bg-gradient-to-r from-black/[0.34] to-transparent" />
            <div className="relative font-serif text-[21px] font-semibold leading-[1.1] tracking-tight text-[#fdfaf3] [text-shadow:0_1px_10px_rgba(0,0,0,.45)]">
              {draft.title || book.title}
            </div>
            <div className="relative font-mono text-[10px] uppercase tracking-[0.05em] text-white/[0.74]">
              {(editing ? draft.author : book.author) || ""}
            </div>
          </div>

          <div className="flex min-w-[230px] flex-1 flex-col">
            {!editing ? (
              <>
                <div className="mb-2.5 flex flex-wrap items-center gap-2">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-[7px] border px-[9px] py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.04em]"
                    style={{
                      color: st.color,
                      background: alpha(st.color, 0.12),
                      borderColor: alpha(st.color, 0.3),
                    }}
                  >
                    <span className="h-[7px] w-[7px] rounded-full" style={{ background: st.color }} />
                    {st.label}
                  </span>
                  {book.format && (
                    <span className="rounded-[7px] border border-white/[0.07] bg-[#1a1a25] px-[9px] py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.04em] text-[#9a9db0]">
                      {FORMATS[book.format]}
                    </span>
                  )}
                </div>
                <h1 className="mb-1.5 font-serif text-[27px] font-semibold leading-[1.1] tracking-tight">
                  {book.title}
                </h1>
                {book.author && <div className="mb-2.5 text-[15px] text-[#9a9db0]">{book.author}</div>}
                {book.rating ? (
                  <div className="mb-3 text-[17px] tracking-[1px] text-[#e0a449]">
                    {starString(book.rating)}
                  </div>
                ) : null}

                {hasPages(book) && (
                  <div className="mb-3">
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="font-mono text-[12px] text-[#9a9db0]">
                        {book.current_page || 0} / {book.total_pages} pages
                      </span>
                      <span className="font-mono text-[12px] font-semibold text-[#e0a449]">
                        {percent}%
                      </span>
                    </div>
                    <div className="h-[7px] overflow-hidden rounded-[7px] bg-[#1d1d28]">
                      <div
                        className="h-full rounded-[7px]"
                        style={{
                          width: `${percent}%`,
                          background: "linear-gradient(90deg,#cf8f33,#e9b65f)",
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="mb-3.5 flex flex-wrap gap-[18px]">
                  <div>
                    <div className="mb-[3px] font-mono text-[9.5px] uppercase tracking-[0.08em] text-[#6b6e80]">
                      Started
                    </div>
                    <div className="text-[13.5px] text-[#dfe2ee]">{fmtDate(book.started_at)}</div>
                  </div>
                  <div>
                    <div className="mb-[3px] font-mono text-[9.5px] uppercase tracking-[0.08em] text-[#6b6e80]">
                      Finished
                    </div>
                    <div className="text-[13.5px] text-[#dfe2ee]">{fmtDate(book.finished_at)}</div>
                  </div>
                </div>

                <div className="mt-auto flex gap-2.5">
                  <button
                    onClick={startEdit}
                    className="flex items-center gap-1.5 rounded-[10px] border border-white/10 bg-[#1a1a25] px-4 py-2.5 text-[13.5px] font-semibold text-[#f3f4f8]"
                  >
                    <Pencil className="h-[15px] w-[15px]" strokeWidth={2.1} />
                    Edit
                  </button>
                  <button
                    onClick={() => setShowDelete(true)}
                    aria-label="Delete"
                    className="flex w-[42px] flex-none items-center justify-center rounded-[10px] border border-[#f06a6a]/25 bg-[#f06a6a]/10 text-[#f06a6a]"
                  >
                    <Trash2 className="h-[17px] w-[17px]" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[#e0a449]">
                  Editing
                </div>
                <input
                  value={draft.title || ""}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  placeholder="Title"
                  className="mb-2 w-full rounded-[10px] border border-white/[0.08] bg-[#16161f] px-3 py-2.5 font-serif text-[19px] font-semibold text-[#f3f4f8] outline-none"
                />
                <input
                  value={draft.author || ""}
                  onChange={(e) => setDraft({ ...draft, author: e.target.value })}
                  placeholder="Author"
                  className="mb-2.5 w-full rounded-[10px] border border-white/[0.08] bg-[#16161f] px-3 py-2.5 text-[14px] text-[#f3f4f8] outline-none"
                />

                {/* status chips */}
                <div className="mb-2.5 flex flex-wrap gap-1.5">
                  {STATUS_ORDER.map((k) => {
                    const active = draft.status === k;
                    const c = STATUSES[k].color;
                    return (
                      <button
                        key={k}
                        onClick={() => setDraft({ ...draft, status: k })}
                        className="flex items-center gap-1.5 rounded-[9px] border px-[11px] py-[7px] text-[12.5px] font-semibold"
                        style={{
                          background: active ? "rgba(255,255,255,.07)" : "#16161f",
                          color: active ? "#f3f4f8" : "#9a9db0",
                          borderColor: active ? c : "rgba(255,255,255,.08)",
                        }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />
                        {STATUSES[k].label}
                      </button>
                    );
                  })}
                </div>

                {/* format chips */}
                <div className="mb-2.5 flex flex-wrap gap-1.5">
                  {FORMAT_ORDER.map((k) => {
                    const active = draft.format === k;
                    return (
                      <button
                        key={k}
                        onClick={() => setDraft({ ...draft, format: k as BookFormat })}
                        className="rounded-[9px] border px-[11px] py-[7px] text-[12.5px] font-semibold"
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

                {/* rating */}
                <div className="mb-2.5 flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((n) => {
                    const on = n <= (draft.rating || 0);
                    return (
                      <button
                        key={n}
                        onClick={() => setDraft({ ...draft, rating: draft.rating === n ? null : n })}
                        aria-label={`Rate ${n}`}
                        className="flex h-[38px] w-[38px] items-center justify-center rounded-[9px] border border-white/[0.08] bg-[#16161f]"
                      >
                        <svg
                          width="19"
                          height="19"
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

                {/* page + date grid */}
                <div className="mb-2.5 grid grid-cols-2 gap-2.5">
                  <div>
                    <label className={FIELD_LABEL}>Current page</label>
                    <input
                      type="number"
                      value={draft.current_page ?? 0}
                      onChange={(e) =>
                        setDraft({ ...draft, current_page: parseInt(e.target.value, 10) || 0 })
                      }
                      className={FIELD_INPUT}
                    />
                  </div>
                  <div>
                    <label className={FIELD_LABEL}>Total pages</label>
                    <input
                      type="number"
                      value={draft.total_pages ?? ""}
                      onChange={(e) =>
                        setDraft({ ...draft, total_pages: parseInt(e.target.value, 10) || null })
                      }
                      className={FIELD_INPUT}
                    />
                  </div>
                  <div>
                    <label className={FIELD_LABEL}>Started</label>
                    <input
                      type="date"
                      value={draft.started_at || ""}
                      onChange={(e) => setDraft({ ...draft, started_at: e.target.value || null })}
                      className={FIELD_INPUT}
                    />
                  </div>
                  <div>
                    <label className={FIELD_LABEL}>Finished</label>
                    <input
                      type="date"
                      value={draft.finished_at || ""}
                      onChange={(e) => setDraft({ ...draft, finished_at: e.target.value || null })}
                      className={FIELD_INPUT}
                    />
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <button
                    onClick={saveEdit}
                    disabled={saving}
                    className="flex-1 rounded-[10px] bg-[#e0a449] py-2.5 text-sm font-bold text-[#20160a] disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="flex-none rounded-[10px] border border-white/10 bg-[#1a1a25] px-[18px] py-2.5 text-sm font-semibold text-[#dfe2ee]"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </section>

        {/* notes */}
        {!editing ? (
          <section className="mb-3.5 rounded-[14px] border border-white/[0.06] bg-[#101019] px-4 py-[15px]">
            <div className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6b6e80]">
              Notes
            </div>
            {book.notes ? (
              <p className="whitespace-pre-wrap text-[14.5px] leading-relaxed text-[#dfe2ee]">
                {book.notes}
              </p>
            ) : (
              <button
                onClick={startEdit}
                className="text-[13.5px] text-[#6b6e80]"
              >
                No notes yet — add a thought…
              </button>
            )}
          </section>
        ) : (
          <section className="mb-3.5">
            <label className="mb-2 block font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6b6e80]">
              Notes
            </label>
            <textarea
              value={draft.notes || ""}
              onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
              placeholder="Your thoughts on this book…"
              className="min-h-[80px] w-full resize-y rounded-[12px] border border-white/[0.08] bg-[#16161f] px-[13px] py-3 text-[14.5px] leading-relaxed text-[#f3f4f8] outline-none"
            />
          </section>
        )}

        {/* reading log */}
        <section className="mb-3.5 rounded-[16px] border border-white/[0.06] bg-[#101019] px-4 py-[17px]">
          <div className="mb-3.5 flex items-center justify-between">
            <h2 className="text-base font-bold tracking-tight">Reading log</h2>
            <button
              onClick={() => {
                setSFormOpen((v) => !v);
                setSDraft({ log_date: todayISO(), pages: "", minutes: "", note: "" });
              }}
              className="flex items-center gap-1.5 rounded-[9px] border border-[#e0a449]/30 bg-[#e0a449]/[0.14] px-3 py-[7px] text-[12.5px] font-semibold text-[#e0a449]"
            >
              <Plus className="h-[13px] w-[13px]" strokeWidth={2.4} />
              Add session
            </button>
          </div>

          {/* stats strip */}
          <div className="mb-[15px] flex gap-2.5">
            {logStats.map((s) => (
              <div
                key={s.label}
                className="flex-1 rounded-[12px] border border-white/[0.06] bg-[#16161f] px-3 py-[11px]"
              >
                <div className="text-[21px] font-bold leading-none text-[#f3f4f8]">{s.value}</div>
                <div className="mt-[5px] font-mono text-[9.5px] uppercase tracking-[0.06em] text-[#6b6e80]">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {sFormOpen && (
            <div className="mb-3.5 flex flex-col gap-2.5 rounded-[12px] border border-white/[0.07] bg-[#16161f] p-3">
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="mb-1 block text-[10.5px] text-[#9a9db0]">Date</label>
                  <input
                    type="date"
                    value={sDraft.log_date}
                    onChange={(e) => setSDraft({ ...sDraft, log_date: e.target.value })}
                    className="w-full rounded-[8px] border border-white/[0.08] bg-[#101019] px-[9px] py-2 text-[12.5px] text-[#f3f4f8] outline-none [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10.5px] text-[#9a9db0]">Pages</label>
                  <input
                    type="number"
                    value={sDraft.pages}
                    onChange={(e) => setSDraft({ ...sDraft, pages: e.target.value })}
                    placeholder="0"
                    className="w-full rounded-[8px] border border-white/[0.08] bg-[#101019] px-[9px] py-2 text-[12.5px] text-[#f3f4f8] outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10.5px] text-[#9a9db0]">Minutes</label>
                  <input
                    type="number"
                    value={sDraft.minutes}
                    onChange={(e) => setSDraft({ ...sDraft, minutes: e.target.value })}
                    placeholder="0"
                    className="w-full rounded-[8px] border border-white/[0.08] bg-[#101019] px-[9px] py-2 text-[12.5px] text-[#f3f4f8] outline-none"
                  />
                </div>
              </div>
              <input
                value={sDraft.note}
                onChange={(e) => setSDraft({ ...sDraft, note: e.target.value })}
                placeholder="Optional note — where you stopped, a thought…"
                className="w-full rounded-[8px] border border-white/[0.08] bg-[#101019] px-2.5 py-2.5 text-[13px] text-[#f3f4f8] outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setSFormOpen(false)}
                  className="rounded-[9px] border border-white/10 px-3.5 py-2 text-[12.5px] font-semibold text-[#9a9db0]"
                >
                  Cancel
                </button>
                <button
                  onClick={addSession}
                  disabled={savingLog || (!sDraft.pages && !sDraft.minutes)}
                  className="rounded-[9px] bg-[#e0a449] px-4 py-2 text-[12.5px] font-bold text-[#20160a] disabled:opacity-50"
                >
                  {savingLog ? "Logging…" : "Log it"}
                </button>
              </div>
            </div>
          )}

          {sortedLogs.length === 0 ? (
            <div className="py-6 text-center text-[13.5px] text-[#6b6e80]">
              No sessions logged yet. Track a sitting to watch your progress build.
            </div>
          ) : (
            <div className="flex flex-col">
              {sortedLogs.map((l) => {
                const dt = l.log_date ? new Date(l.log_date + "T00:00:00") : null;
                return (
                  <div
                    key={l.id}
                    className="flex gap-3.5 border-t border-white/[0.05] py-3 first:border-t-0"
                  >
                    <div className="w-[46px] flex-none text-center">
                      <div className="text-[18px] font-bold leading-none text-[#f3f4f8]">
                        {dt ? dt.getDate() : "–"}
                      </div>
                      <div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-[#6b6e80]">
                        {dt ? MON[dt.getMonth()] : ""}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-[3px] flex items-center gap-2">
                        {l.pages ? (
                          <span className="font-mono text-[12.5px] font-semibold text-[#e0a449]">
                            {l.pages} pages
                          </span>
                        ) : null}
                        {l.pages && l.minutes ? (
                          <span className="h-[3px] w-[3px] rounded-full bg-[#3d3f4d]" />
                        ) : null}
                        {l.minutes ? (
                          <span className="font-mono text-[12px] text-[#9a9db0]">{l.minutes} min</span>
                        ) : null}
                      </div>
                      {l.note && (
                        <div className="text-[13px] leading-snug text-[#b9bccb]">{l.note}</div>
                      )}
                    </div>
                    <button
                      onClick={() => deleteSession(l.id)}
                      aria-label="Delete session"
                      className="flex h-[30px] w-[30px] flex-none items-center justify-center text-[#4d4f5c] hover:text-[#f06a6a]"
                    >
                      <Trash2 className="h-[15px] w-[15px]" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* highlights */}
        <section className="rounded-[16px] border border-white/[0.06] bg-[#101019] px-4 py-[17px]">
          <div className="mb-3.5 flex items-center justify-between">
            <h2 className="text-base font-bold tracking-tight">Highlights</h2>
            <button
              onClick={() => {
                setHFormOpen((v) => !v);
                setHDraft({ text: "", location: "" });
              }}
              className="flex items-center gap-1.5 rounded-[9px] border border-[#e0a449]/30 bg-[#e0a449]/[0.14] px-3 py-[7px] text-[12.5px] font-semibold text-[#e0a449]"
            >
              <Plus className="h-[13px] w-[13px]" strokeWidth={2.4} />
              Add highlight
            </button>
          </div>

          {hFormOpen && (
            <div className="mb-3.5 flex flex-col gap-2.5 rounded-[12px] border border-white/[0.07] bg-[#16161f] p-3">
              <textarea
                value={hDraft.text}
                onChange={(e) => setHDraft({ ...hDraft, text: e.target.value })}
                placeholder="Type or paste the passage…"
                className="min-h-[64px] w-full resize-y rounded-[9px] border border-white/[0.08] bg-[#101019] px-[11px] py-2.5 font-serif text-[15px] italic leading-relaxed text-[#f3f4f8] outline-none"
              />
              <div className="flex items-center gap-2.5">
                <input
                  value={hDraft.location}
                  onChange={(e) => setHDraft({ ...hDraft, location: e.target.value })}
                  placeholder="Location — e.g. Page 42, Ch. 3"
                  className="flex-1 rounded-[9px] border border-white/[0.08] bg-[#101019] px-[11px] py-2.5 text-[13px] text-[#f3f4f8] outline-none"
                />
                <button
                  onClick={() => setHFormOpen(false)}
                  className="rounded-[9px] border border-white/10 px-3.5 py-2.5 text-[12.5px] font-semibold text-[#9a9db0]"
                >
                  Cancel
                </button>
                <button
                  onClick={addHighlight}
                  disabled={!hDraft.text.trim()}
                  className="rounded-[9px] bg-[#e0a449] px-4 py-2.5 text-[12.5px] font-bold text-[#20160a] disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          )}

          {highlights.length === 0 ? (
            <div className="py-6 text-center text-[13.5px] text-[#6b6e80]">
              No highlights yet. Save a passage worth remembering.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {highlights.map((h, i) => (
                <figure
                  key={i}
                  className="relative m-0 rounded-[13px] border border-[#e0a449]/[0.16] px-4 py-3.5 pl-[18px]"
                  style={{ background: "linear-gradient(150deg,#16140f,#13131b)" }}
                >
                  <span className="absolute left-[13px] top-1.5 font-serif text-[40px] leading-none text-[#e0a449]/[0.32]">
                    &ldquo;
                  </span>
                  <blockquote className="m-0 mb-2 pl-[18px] font-serif text-[16px] italic leading-relaxed text-[#ece9e0]">
                    {h.text}
                  </blockquote>
                  <figcaption className="flex items-center gap-2.5 pl-[18px]">
                    {h.location && (
                      <span className="font-mono text-[10px] uppercase tracking-[0.05em] text-[#e0a449]">
                        {h.location}
                      </span>
                    )}
                    <button
                      onClick={() => deleteHighlight(i)}
                      aria-label="Delete highlight"
                      className="ml-auto flex h-7 w-7 items-center justify-center text-[#4d4f5c] hover:text-[#f06a6a]"
                    >
                      <Trash2 className="h-[14px] w-[14px]" />
                    </button>
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </section>
      </main>

      <DeleteConfirmationModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        itemName={book.title}
        title="Delete Book"
      />
    </div>
  );
}
