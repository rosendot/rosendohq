"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  SlidersHorizontal,
  Pencil,
  MoreHorizontal,
} from "lucide-react";
import type { Book, BookStatus, BookFormat } from "@/types/reading.types";
import {
  STATUS_ORDER,
  STATUSES,
  GROUP_LABELS,
  FORMATS,
  coverFor,
  alpha,
  isReading,
  hasPages,
  pct,
  starString,
  recency,
} from "./reading-utils";
import AddBookSheet from "./modals/AddBookSheet";
import EditBookSheet from "./modals/EditBookSheet";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

type SortKey = "updated" | "title" | "author" | "rating" | "progress";

const SORT_LABELS: Record<SortKey, string> = {
  updated: "Recently updated",
  title: "Title",
  author: "Author",
  rating: "Rating",
  progress: "Progress",
};

const FORMAT_CHIPS: { key: BookFormat | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "physical", label: "Physical" },
  { key: "ebook", label: "eBook" },
  { key: "audiobook", label: "Audiobook" },
];

export default function ReadingTracker() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [format, setFormat] = useState<BookFormat | "all">("all");
  const [sort, setSort] = useState<SortKey>("updated");
  const [sortOpen, setSortOpen] = useState(false);
  const [sheetId, setSheetId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchBooks();
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await fetch("/api/books");
      const data = await res.json();
      setBooks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching books:", err);
    } finally {
      setLoading(false);
    }
  };

  const flash = (msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };

  // Optimistic PATCH: apply locally, reconcile with response, refetch on error.
  const patchBook = async (id: string, body: Partial<Book>, msg?: string) => {
    setBooks((prev) => prev.map((b) => (b.id === id ? { ...b, ...body } : b)));
    if (msg) flash(msg);
    try {
      const res = await fetch(`/api/books/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("patch failed");
      const updated = await res.json();
      setBooks((prev) => prev.map((b) => (b.id === id ? updated : b)));
    } catch (err) {
      console.error("Error updating book:", err);
      fetchBooks();
    }
  };

  const createBook = async (body: Record<string, unknown>) => {
    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("create failed");
      const created = await res.json();
      setBooks((prev) => [created, ...prev]);
      setShowAdd(false);
      flash("Added to shelf");
    } catch (err) {
      console.error("Error creating book:", err);
    }
  };

  const setStatus = (b: Book, status: BookStatus) => {
    const body: Partial<Book> = { status };
    if (status === "finished") {
      if (b.total_pages) body.current_page = b.total_pages;
      if (!b.finished_at) body.finished_at = new Date().toISOString().slice(0, 10);
    }
    patchBook(b.id, body, `Status → ${STATUSES[status].label}`);
  };

  const setRating = (b: Book, r: number) => patchBook(b.id, { rating: r || null }, `Rated ${r} ★`);

  const setPage = (b: Book, p: number) => {
    const clamped = Math.max(0, Math.min(b.total_pages || 99999, p));
    const body: Partial<Book> = { current_page: clamped };
    if (b.status === "planned" && clamped > 0) body.status = "reading";
    if (b.total_pages && clamped >= b.total_pages) {
      body.status = "finished";
      if (!b.finished_at) body.finished_at = new Date().toISOString().slice(0, 10);
    }
    patchBook(b.id, body);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setBooks((prev) => prev.filter((b) => b.id !== id));
    setDeleteTarget(null);
    setSheetId(null);
    try {
      await fetch(`/api/books/${id}`, { method: "DELETE" });
      flash("Removed from shelf");
    } catch (err) {
      console.error("Error deleting book:", err);
      fetchBooks();
    }
  };

  // filter + group + sort
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = books.filter(
      (b) =>
        (format === "all" || b.format === format) &&
        (!q ||
          b.title.toLowerCase().includes(q) ||
          (b.author || "").toLowerCase().includes(q) ||
          (b.notes || "").toLowerCase().includes(q)),
    );

    const sortFn = (a: Book, b: Book) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "author") return (a.author || "").localeCompare(b.author || "");
      if (sort === "rating") return (b.rating || 0) - (a.rating || 0) || a.title.localeCompare(b.title);
      if (sort === "progress") return pct(b) - pct(a);
      return recency(a.updated_at) - recency(b.updated_at);
    };

    return STATUS_ORDER.map((status) => ({
      status,
      label: GROUP_LABELS[status],
      color: STATUSES[status].color,
      books: filtered.filter((b) => b.status === status).sort(sortFn),
    })).filter((g) => g.books.length > 0);
  }, [books, query, format, sort]);

  const totalFiltered = groups.reduce((n, g) => n + g.books.length, 0);
  const searchEmpty = !loading && books.length > 0 && totalFiltered === 0;
  const libraryEmpty = !loading && books.length === 0;

  const sheetBook = sheetId ? books.find((b) => b.id === sheetId) || null : null;

  return (
    <div
      className="min-h-screen overflow-x-hidden text-[#f3f4f8]"
      style={{
        background:
          "radial-gradient(1200px 620px at 72% -12%, rgba(224,164,73,.08), transparent 58%), #08080c",
      }}
    >
      {/* header */}
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-white/[0.06] bg-[#08080c]/80 px-[18px] py-[13px] backdrop-blur-xl">
        <label className="mx-auto flex max-w-[520px] flex-1 items-center gap-2.5 rounded-[11px] border border-white/[0.07] bg-[#13131b] px-3.5 py-[9px]">
          <Search className="h-4 w-4 flex-none text-[#6b6e80]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, author, notes"
            className="min-w-0 flex-1 border-none bg-transparent text-sm text-[#f3f4f8] outline-none placeholder:text-[#5d6071]"
          />
        </label>
        <button
          onClick={() => setShowAdd(true)}
          className="flex flex-none items-center gap-1.5 rounded-[11px] bg-[#e0a449] px-3.5 py-[9px] text-sm font-bold text-[#20160a]"
          style={{ boxShadow: "0 4px 14px rgba(224,164,73,.36)" }}
        >
          <Plus className="h-4 w-4" strokeWidth={2.4} />
          <span>Add book</span>
        </button>
      </header>

      <main className="mx-auto max-w-[1220px] pb-[120px]">
        {/* controls subbar */}
        {!loading && !libraryEmpty && (
          <div className="sticky top-[57px] z-30 flex items-center gap-2.5 border-b border-white/[0.05] bg-[#08080c]/[0.72] px-[18px] py-[11px] backdrop-blur-xl">
            <div className="scrollbar-hide flex min-w-0 flex-1 gap-[7px] overflow-x-auto">
              {FORMAT_CHIPS.map((ch) => {
                const active = format === ch.key;
                return (
                  <button
                    key={ch.key}
                    onClick={() => setFormat(ch.key)}
                    className="flex-none whitespace-nowrap rounded-[9px] border px-3.5 py-[7px] text-[13px] font-semibold"
                    style={{
                      background: active ? "#e0a449" : "#13131b",
                      color: active ? "#20160a" : "#9a9db0",
                      borderColor: active ? "#e0a449" : "rgba(255,255,255,.08)",
                    }}
                  >
                    {ch.label}
                  </button>
                );
              })}
            </div>
            <SortMenu sort={sort} open={sortOpen} setOpen={setSortOpen} onPick={setSort} />
          </div>
        )}

        <div className="px-[18px] pt-5">
          {loading && <LoadingSkeleton />}

          {libraryEmpty && (
            <div className="flex flex-col items-center justify-center gap-3.5 px-6 py-[84px] text-center">
              <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[20px] border border-[#e0a449]/25 bg-gradient-to-br from-[#e0a449]/20 to-[#e0a449]/[0.04]">
                <BookOpen className="h-8 w-8 text-[#e0a449]" strokeWidth={1.7} />
              </div>
              <h2 className="text-[21px] font-bold">Your shelf is empty</h2>
              <p className="max-w-[340px] text-sm text-[#9a9db0]">
                Add the first book you&apos;re reading or want to read, and it&apos;ll find its place
                on the shelf.
              </p>
              <button
                onClick={() => setShowAdd(true)}
                className="mt-1.5 flex items-center gap-1.5 rounded-[11px] bg-[#e0a449] px-5 py-2.5 text-sm font-bold text-[#20160a]"
                style={{ boxShadow: "0 4px 14px rgba(224,164,73,.36)" }}
              >
                <Plus className="h-4 w-4" strokeWidth={2.4} />
                Add a book
              </button>
            </div>
          )}

          {searchEmpty && (
            <div className="flex flex-col items-center gap-2.5 px-6 py-[72px] text-center">
              <div className="flex h-[54px] w-[54px] items-center justify-center rounded-[15px] border border-white/[0.08] bg-[#13131b]">
                <Search className="h-6 w-6 text-[#6b6e80]" />
              </div>
              <h3 className="text-base font-bold">Nothing on the shelf matches</h3>
              <p className="text-[13.5px] text-[#9a9db0]">
                Try a different search or clear your format filter.
              </p>
              <button
                onClick={() => {
                  setQuery("");
                  setFormat("all");
                }}
                className="mt-1 rounded-[9px] border border-white/10 bg-[#1a1a25] px-4 py-2.5 text-[13px] font-semibold"
              >
                Clear search
              </button>
            </div>
          )}

          {!loading &&
            !libraryEmpty &&
            !searchEmpty &&
            groups.map((g) => (
              <CardRow key={g.status} label={g.label} color={g.color} count={g.books.length}>
                {g.books.map((b) =>
                  isReading(b) ? (
                    <HeroCard
                      key={b.id}
                      book={b}
                      onOpen={() => router.push(`/reading/${b.id}`)}
                      onMenu={() => setSheetId(b.id)}
                    />
                  ) : (
                    <PosterCard
                      key={b.id}
                      book={b}
                      onOpen={() => router.push(`/reading/${b.id}`)}
                      onMenu={() => setSheetId(b.id)}
                    />
                  ),
                )}
              </CardRow>
            ))}
        </div>
      </main>

      {/* quick-action sheet */}
      {sheetBook && (
        <EditBookSheet
          book={sheetBook}
          onClose={() => setSheetId(null)}
          onStatus={(s) => setStatus(sheetBook, s)}
          onRate={(r) => setRating(sheetBook, r)}
          onSetPage={(p) => setPage(sheetBook, p)}
          onOpenDetail={() => router.push(`/reading/${sheetBook.id}`)}
          onDelete={() => setDeleteTarget(sheetBook)}
        />
      )}

      {/* add sheet */}
      {showAdd && <AddBookSheet onClose={() => setShowAdd(false)} onCreate={createBook} />}

      {/* delete confirm */}
      <DeleteConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        itemName={deleteTarget?.title || ""}
        title="Delete Book"
      />

      {/* toast */}
      {toast && (
        <div
          className="fixed bottom-[26px] left-1/2 z-[90] flex -translate-x-1/2 items-center gap-2.5 rounded-[12px] border border-[#e0a449]/40 bg-[#241c10] px-4 py-2.5 text-[13.5px] font-semibold text-[#f7eede]"
          style={{ boxShadow: "0 10px 30px rgba(0,0,0,.5)" }}
        >
          <Check className="h-4 w-4 text-[#e0a449]" strokeWidth={2.4} />
          {toast}
        </div>
      )}
    </div>
  );
}

/* -------------------------------- sort menu -------------------------------- */

function SortMenu({
  sort,
  open,
  setOpen,
  onPick,
}: {
  sort: SortKey;
  open: boolean;
  setOpen: (v: boolean) => void;
  onPick: (k: SortKey) => void;
}) {
  return (
    <div className="relative flex-none">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-[9px] border border-white/[0.08] bg-[#13131b] px-2.5 py-[7px] text-[13px] font-semibold text-[#f3f4f8]"
      >
        <SlidersHorizontal className="h-3.5 w-3.5 text-[#9a9db0]" />
        <span>{SORT_LABELS[sort]}</span>
        <ChevronDown className="h-[13px] w-[13px] text-[#6b6e80]" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-[1]" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-[42px] z-[2] min-w-[190px] rounded-[12px] border border-white/10 bg-[#15151f] p-1.5 shadow-[0_16px_40px_rgba(0,0,0,.55)]">
            {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => {
              const active = sort === k;
              return (
                <button
                  key={k}
                  onClick={() => {
                    onPick(k);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-[8px] px-[11px] py-[9px] text-left text-[13.5px] font-semibold"
                  style={{
                    background: active ? "rgba(224,164,73,.1)" : "transparent",
                    color: active ? "#f3f4f8" : "#c4c7d4",
                  }}
                >
                  <span>{SORT_LABELS[k]}</span>
                  {active && <Check className="h-[15px] w-[15px] text-[#e0a449]" strokeWidth={2.4} />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* --------------------------------- card row -------------------------------- */

function CardRow({
  label,
  color,
  count,
  children,
}: {
  label: string;
  color: string;
  count: number;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false, over: false });
  const touchX = useRef<number | null>(null);

  const measure = () => {
    const el = ref.current;
    if (!el) return;
    const over = el.scrollWidth - el.clientWidth > 4;
    setEdges({
      start: el.scrollLeft <= 2,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2,
      over,
    });
  };

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [children]);

  const scroll = (dir: number) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.85), behavior: "smooth" });
  };

  return (
    <section className="mb-8">
      <div className="mb-3.5 flex items-center gap-2.5">
        <span
          className="h-[9px] w-[9px] flex-none rounded-full"
          style={{ background: color, boxShadow: `0 0 9px ${alpha(color, 0.55)}` }}
        />
        <h2 className="whitespace-nowrap text-[17px] font-bold tracking-tight">{label}</h2>
        <span className="font-mono text-[12px] text-[#6b6e80]">{count}</span>
      </div>
      <div className="relative">
        {edges.over && !edges.start && (
          <button
            onClick={() => scroll(-1)}
            aria-label="Scroll left"
            className="absolute -left-[7px] top-[42%] z-[6] flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/[0.12] bg-[#12121a]/[0.92] text-[#dfe2ee] backdrop-blur shadow-[0_6px_18px_rgba(0,0,0,.5)]"
          >
            <ChevronLeft className="h-[18px] w-[18px]" strokeWidth={2.2} />
          </button>
        )}
        {edges.over && !edges.end && (
          <button
            onClick={() => scroll(1)}
            aria-label="Scroll right"
            className="absolute -right-[7px] top-[42%] z-[6] flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/[0.12] bg-[#12121a]/[0.92] text-[#dfe2ee] backdrop-blur shadow-[0_6px_18px_rgba(0,0,0,.5)]"
          >
            <ChevronRight className="h-[18px] w-[18px]" strokeWidth={2.2} />
          </button>
        )}
        <div
          ref={ref}
          onScroll={measure}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current == null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 50) scroll(dx < 0 ? 1 : -1);
            touchX.current = null;
          }}
          className="scrollbar-hide flex gap-3.5 overflow-x-auto px-px pb-3 pt-0.5"
        >
          {children}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- hero card ------------------------------- */

function HeroCard({
  book,
  onOpen,
  onMenu,
}: {
  book: Book;
  onOpen: () => void;
  onMenu: () => void;
}) {
  const percent = pct(book);
  return (
    <article className="flex w-[330px] flex-none overflow-hidden rounded-[16px] border border-white/[0.08] bg-[#101019]">
      <button
        onClick={onOpen}
        className="relative flex w-[116px] flex-none flex-col justify-between p-3 text-left"
        style={{ background: coverFor(book.title) }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.07] via-transparent to-[#08080c]/50" />
        <div className="relative line-clamp-5 font-serif text-[17px] font-semibold leading-[1.12] tracking-tight text-[#fdfaf3] [text-shadow:0_1px_8px_rgba(0,0,0,.4)]">
          {book.title}
        </div>
        {book.author && (
          <div className="relative font-mono text-[9px] uppercase tracking-[0.06em] text-white/70">
            {book.author}
          </div>
        )}
      </button>
      <div className="flex flex-1 flex-col p-3.5">
        <div className="mb-auto flex items-center justify-between gap-2">
          {book.format && (
            <span className="rounded-[6px] border border-white/[0.07] bg-[#1a1a25] px-[7px] py-[3px] font-mono text-[9.5px] font-semibold uppercase tracking-[0.07em] text-[#9a9db0]">
              {FORMATS[book.format]}
            </span>
          )}
          <button
            onClick={onMenu}
            aria-label="Quick actions"
            className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-[8px] border border-white/[0.08] bg-[#1a1a25] text-[#c9ccda]"
          >
            <MoreHorizontal className="h-[17px] w-[17px]" />
          </button>
        </div>
        <div className="mb-1 mt-3.5 flex items-baseline gap-1.5">
          <span className="text-[27px] font-bold leading-none text-[#f3f4f8]">
            p.{book.current_page || 0}
          </span>
          <span className="font-mono text-[12px] text-[#6b6e80]">/ {book.total_pages || 0}</span>
          <span className="ml-auto font-mono text-[12px] font-semibold text-[#e0a449]">
            {percent}%
          </span>
        </div>
        <div className="mb-3 h-1.5 overflow-hidden rounded-[6px] bg-[#1d1d28]">
          <div
            className="h-full rounded-[6px]"
            style={{ width: `${percent}%`, background: "linear-gradient(90deg,#cf8f33,#e9b65f)" }}
          />
        </div>
        <button
          onClick={onMenu}
          className="flex items-center justify-center gap-1.5 rounded-[10px] bg-[#e0a449] py-2.5 text-[13.5px] font-bold text-[#20160a]"
        >
          <Pencil className="h-[15px] w-[15px]" strokeWidth={2.2} />
          Update page
        </button>
      </div>
    </article>
  );
}

/* -------------------------------- poster card ------------------------------ */

function PosterCard({
  book,
  onOpen,
  onMenu,
}: {
  book: Book;
  onOpen: () => void;
  onMenu: () => void;
}) {
  const percent = pct(book);
  const showReason = (book.status === "on_hold" || book.status === "dropped") && !!book.notes;
  const reasonColor = STATUSES[book.status].color;

  return (
    <article className="flex w-[158px] flex-none flex-col overflow-hidden rounded-[14px] border border-white/[0.06] bg-[#101019]">
      <button
        onClick={onOpen}
        className="relative flex aspect-[2/3] w-full flex-col justify-between p-3.5 text-left"
        style={{ background: coverFor(book.title) }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] via-transparent to-[#08080c]/[0.52]" />
        <div className="absolute bottom-0 left-0 top-0 w-[5px] bg-gradient-to-r from-black/30 to-transparent" />
        <div className="relative line-clamp-4 font-serif text-[18px] font-semibold leading-[1.13] tracking-tight text-[#fdfaf3] [text-shadow:0_1px_8px_rgba(0,0,0,.4)]">
          {book.title}
        </div>
        {book.author && (
          <div className="relative font-mono text-[9px] uppercase tracking-[0.05em] text-white/[0.72]">
            {book.author}
          </div>
        )}
      </button>
      <div className="flex flex-1 flex-col p-[11px] pt-2.5">
        <div className="mb-2 flex items-center justify-between gap-1.5">
          {book.format && (
            <span className="rounded-[6px] border border-white/[0.07] bg-[#1a1a25] px-1.5 py-[3px] font-mono text-[9px] font-semibold uppercase tracking-[0.06em] text-[#9a9db0]">
              {FORMATS[book.format]}
            </span>
          )}
          {book.rating ? (
            <span className="text-[11px] tracking-[0.5px] text-[#e0a449]">
              {starString(book.rating)}
            </span>
          ) : null}
        </div>

        {hasPages(book) && (
          <div className="mb-2.5">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#9a9db0]">
                {book.current_page || 0} / {book.total_pages}
              </span>
              <span className="font-mono text-[10px] text-[#6b6e80]">{percent}%</span>
            </div>
            <div className="h-[5px] overflow-hidden rounded-[5px] bg-[#1d1d28]">
              <div
                className="h-full rounded-[5px]"
                style={{
                  width: `${percent}%`,
                  background: "linear-gradient(90deg,#cf8f33,#e9b65f)",
                }}
              />
            </div>
          </div>
        )}

        {showReason && (
          <div
            className="mb-2.5 flex gap-1.5 rounded-[8px] border px-2 py-[7px]"
            style={{ background: alpha(reasonColor, 0.08), borderColor: alpha(reasonColor, 0.22) }}
          >
            <span
              className="w-[3px] flex-none rounded-[3px]"
              style={{ background: reasonColor }}
            />
            <span className="line-clamp-3 text-[10.5px] leading-[1.35] text-[#c4c7d4]">
              {book.notes}
            </span>
          </div>
        )}

        <div className="mt-auto flex gap-1.5">
          <button
            onClick={onMenu}
            className="flex min-h-[36px] flex-1 items-center justify-center gap-1.5 rounded-[9px] border border-white/[0.08] bg-[#1a1a25] py-2 text-[12px] font-semibold text-[#dfe2ee]"
          >
            <Pencil className="h-[13px] w-[13px]" strokeWidth={2.2} />
            Log
          </button>
          <button
            onClick={onMenu}
            aria-label="More"
            className="flex min-h-[36px] w-9 flex-none items-center justify-center rounded-[9px] border border-white/[0.08] bg-[#1a1a25] text-[#c9ccda]"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

/* ------------------------------ loading skeleton --------------------------- */

function LoadingSkeleton() {
  return (
    <>
      {[0, 1].map((row) => (
        <div key={row} className="mb-8">
          <div className="mb-3.5 h-5 w-[170px] animate-pulse rounded-[7px] bg-[#15151f]" />
          <div className="flex gap-3.5 overflow-hidden">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="w-[158px] flex-none">
                <div className="aspect-[2/3] w-full animate-pulse rounded-[13px] bg-[#15151f]" />
                <div className="mt-2.5 h-3 w-[85%] animate-pulse rounded-[5px] bg-[#15151f]" />
                <div className="mt-2 h-2.5 w-[55%] animate-pulse rounded-[5px] bg-[#15151f]" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
