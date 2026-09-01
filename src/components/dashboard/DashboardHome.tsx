"use client";

// The dashboard proper. Everything here is live Supabase data pulled in one
// request from /api/dashboard/summary — no placeholder numbers.
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Heart,
  Home,
  Package,
  Car,
  BookOpen,
  Film,
  Target,
  ChefHat,
  Apple,
  Plane,
  StickyNote,
  ArrowRight,
  Check,
} from "lucide-react";
import type { DashboardSummary } from "@/app/api/dashboard/summary/route";

/* ------------------------------- primitives ------------------------------- */

const CARD =
  "rounded-[16px] border border-white/[0.07] bg-[#101019] transition-colors hover:border-white/[0.14]";
const LABEL =
  "font-mono text-[10px] font-semibold uppercase tracking-[0.09em] text-[#6b6e80]";

function Panel({
  title,
  href,
  action,
  children,
}: {
  title: string;
  href?: string;
  action?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`${CARD} flex flex-col p-[18px]`}>
      <div className="mb-3.5 flex items-baseline justify-between gap-3">
        <h2 className={LABEL}>{title}</h2>
        {href && (
          <Link
            href={href}
            className="group inline-flex items-center gap-1 text-[12px] font-medium text-[#8b8fa3] transition-colors hover:text-[#f3f4f8]"
          >
            {action ?? "Open"}
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-1 text-[13px] text-[#5d6071]">{children}</p>;
}

/* --------------------------------- widgets -------------------------------- */

function TodayHero({ s }: { s: DashboardSummary }) {
  const { scheduledToday, doneToday } = s.habits;
  const pctDone = scheduledToday ? Math.round((doneToday / scheduledToday) * 100) : 0;
  const date = new Date(s.today + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <section className={`${CARD} mb-4 p-[22px]`}>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="min-w-0">
          <div className={`${LABEL} mb-1.5`}>Today</div>
          <h1 className="text-[26px] font-bold leading-tight tracking-tight text-[#f3f4f8]">
            {date}
          </h1>
          <p className="mt-1 text-[13.5px] text-[#8b8fa3]">
            {scheduledToday === 0
              ? "Nothing scheduled today."
              : doneToday === scheduledToday
                ? `All ${scheduledToday} habits done — nice.`
                : `${doneToday} of ${scheduledToday} habits done.`}
          </p>
        </div>

        <div className="flex min-w-[190px] flex-1 flex-col gap-1.5">
          <div className="flex items-baseline justify-between">
            <span className={LABEL}>Habits</span>
            <span className="font-mono text-[12px] text-[#8b8fa3]">{pctDone}%</span>
          </div>
          <div className="h-[7px] overflow-hidden rounded-full bg-white/[0.07]">
            <div
              className="h-full rounded-full bg-[#7c5cff] transition-[width] duration-500"
              style={{ width: `${pctDone}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function StatRow({ s }: { s: DashboardSummary }) {
  const stats: { label: string; value: number; href: string; tint: string }[] = [
    { label: "Habits left today", value: s.habits.scheduledToday - s.habits.doneToday, href: "/habits", tint: "#7c5cff" },
    { label: "Items to buy", value: s.shopping.open, href: "/shopping", tint: "#4f8dff" },
    { label: "Shows in progress", value: s.media.watching, href: "/media", tint: "#f0699b" },
    { label: "Books on the shelf", value: s.reading.planned + s.reading.reading, href: "/reading", tint: "#e0a449" },
  ];

  return (
    <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((st) => (
        <Link key={st.label} href={st.href} className={`${CARD} group p-4`}>
          <div
            className="mb-2 h-[3px] w-7 rounded-full transition-all group-hover:w-11"
            style={{ background: st.tint }}
          />
          <div className="text-[27px] font-bold leading-none text-[#f3f4f8]">{st.value}</div>
          <div className="mt-1.5 text-[12.5px] leading-snug text-[#8b8fa3]">{st.label}</div>
        </Link>
      ))}
    </div>
  );
}

function HabitsPanel({ s }: { s: DashboardSummary }) {
  const { pending, scheduledToday, doneToday } = s.habits;
  return (
    <Panel title="Habits left today" href="/habits" action="All habits">
      {scheduledToday === 0 ? (
        <Empty>No habits scheduled for today.</Empty>
      ) : pending.length === 0 ? (
        <div className="flex items-center gap-2 py-1 text-[13.5px] text-[#3ad07f]">
          <Check className="h-4 w-4" strokeWidth={2.5} />
          All {doneToday} done for today.
        </div>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {pending.map((h) => (
            <li
              key={h.id}
              className="flex items-center gap-2.5 rounded-[10px] bg-[#16161f] px-3 py-2.5"
            >
              <span className="h-1.5 w-1.5 flex-none rounded-full bg-[#7c5cff]" />
              <span className="min-w-0 flex-1 truncate text-[13.5px] text-[#dfe2ee]">{h.name}</span>
              {h.period && (
                <span className="flex-none font-mono text-[10px] uppercase tracking-[0.05em] text-[#6b6e80]">
                  {h.period}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function ContinueWatchingPanel({ s }: { s: DashboardSummary }) {
  const rows = s.media.continueWatching;
  return (
    <Panel title="Continue watching" href="/media" action="Library">
      {rows.length === 0 ? (
        <Empty>Nothing in progress.</Empty>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.slice(0, 4).map((m) => {
            const per = m.episodes_in_season || 0;
            const ep = Math.max(0, m.current_episode || 0);
            const label = per > 0 ? `E${Math.min(ep, per)} / ${per}` : `E${ep}`;
            return (
              <li key={m.id}>
                <Link
                  href={`/media/${m.id}`}
                  className="flex items-center gap-3 rounded-[10px] bg-[#16161f] p-2 transition-colors hover:bg-[#1c1c28]"
                >
                  <div
                    className="h-[46px] w-[32px] flex-none rounded-[5px] bg-[#101019] bg-cover bg-center"
                    style={
                      m.poster_url ? { backgroundImage: `url(${m.poster_url})` } : undefined
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13.5px] font-medium text-[#f3f4f8]">
                      {m.title}
                    </div>
                    <div className="font-mono text-[11px] text-[#8b8fa3]">
                      {(m.current_season || 1) > 1 ? `S${m.current_season} · ` : ""}
                      {label}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

function ShelfPanel({ s }: { s: DashboardSummary }) {
  const rows = s.reading.current;
  return (
    <Panel title="On the shelf" href="/reading" action="Library">
      {rows.length === 0 ? (
        <Empty>No books yet.</Empty>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((b) => {
            const pct =
              b.total_pages && b.total_pages > 0
                ? Math.round(((b.current_page || 0) / b.total_pages) * 100)
                : 0;
            return (
              <li key={b.id}>
                <Link
                  href={`/reading/${b.id}`}
                  className="flex items-center gap-3 rounded-[10px] bg-[#16161f] p-2 transition-colors hover:bg-[#1c1c28]"
                >
                  <div
                    className="h-[46px] w-[31px] flex-none rounded-[5px] bg-[#14141c] bg-cover bg-center"
                    style={b.cover_url ? { backgroundImage: `url(${b.cover_url})` } : undefined}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13.5px] font-medium text-[#f3f4f8]">
                      {b.title}
                    </div>
                    <div className="truncate font-mono text-[11px] text-[#8b8fa3]">
                      {b.author || "—"}
                      {b.total_pages ? ` · ${pct}%` : ""}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

function ShoppingPanel({ s }: { s: DashboardSummary }) {
  const lists = s.shopping.lists.filter((l) => l.open > 0);
  return (
    <Panel title="Shopping" href="/shopping" action="Lists">
      {s.shopping.open === 0 ? (
        <Empty>Nothing left to buy.</Empty>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {lists.slice(0, 5).map((l) => (
            <li
              key={l.id}
              className="flex items-center gap-3 rounded-[10px] bg-[#16161f] px-3 py-2.5"
            >
              <span className="min-w-0 flex-1 truncate text-[13.5px] text-[#dfe2ee]">{l.name}</span>
              <span className="flex-none rounded-[6px] bg-[#4f8dff]/[0.16] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#4f8dff]">
                {l.open}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

/* --------------------------------- modules -------------------------------- */

const MODULES = [
  { name: "Shopping", href: "/shopping", icon: ShoppingCart },
  { name: "Wishlist", href: "/wishlist", icon: Heart },
  { name: "House", href: "/house", icon: Home },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Car", href: "/car", icon: Car },
  { name: "Library", href: "/reading", icon: BookOpen },
  { name: "Media", href: "/media", icon: Film },
  { name: "Habits", href: "/habits", icon: Target },
  { name: "Recipes", href: "/recipes", icon: ChefHat },
  { name: "Nutrition", href: "/nutrition", icon: Apple },
  { name: "Travel", href: "/travel", icon: Plane },
  { name: "Notes", href: "/notes", icon: StickyNote },
];

function ModuleGrid() {
  return (
    <section>
      <h2 className={`${LABEL} mb-3`}>Everything else</h2>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        {MODULES.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className={`${CARD} flex items-center gap-2.5 px-3.5 py-3 text-[13px] font-medium text-[#c9cddb] hover:text-[#f3f4f8]`}
          >
            <m.icon className="h-4 w-4 flex-none text-[#6b6e80]" strokeWidth={2} />
            <span className="truncate">{m.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------- page ---------------------------------- */

function Skeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-4 h-[118px] rounded-[16px] bg-[#101019]" />
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-[96px] rounded-[16px] bg-[#101019]" />
        ))}
      </div>
      <div className="mb-4 grid gap-3 lg:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-[212px] rounded-[16px] bg-[#101019]" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-[46px] rounded-[16px] bg-[#101019]" />
        ))}
      </div>
    </div>
  );
}

export default function DashboardHome() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/dashboard/summary");
        if (!res.ok) throw new Error(String(res.status));
        setData(await res.json());
      } catch {
        setFailed(true);
      }
    })();
  }, []);

  if (failed) {
    return (
      <div className={`${CARD} p-5 text-[13.5px] text-[#8b8fa3]`}>
        Could not load your dashboard.{" "}
        <button onClick={() => location.reload()} className="text-[#4f8dff] hover:underline">
          Retry
        </button>
      </div>
    );
  }

  if (!data) return <Skeleton />;

  return (
    <>
      <TodayHero s={data} />
      <StatRow s={data} />
      <div className="mb-4 grid gap-3 lg:grid-cols-2">
        <HabitsPanel s={data} />
        <ContinueWatchingPanel s={data} />
        <ShelfPanel s={data} />
        <ShoppingPanel s={data} />
      </div>
      <ModuleGrid />
    </>
  );
}
