// src/app/api/books/search/route.ts
// Title lookup for the add sheet. Proxies Open Library, which needs no API key.
// Ranking matters here: a bare title search surfaces summaries, workbooks, and
// study guides above the real book, so candidates are scored before returning.
import { NextResponse } from "next/server";

export type BookSearchResult = {
  source: "openlibrary";
  key: string; // "/works/OL17930368W"
  title: string;
  author: string | null;
  year: number | null;
  description: string | null; // filled lazily — only for the picked result
  cover_url: string | null;
  total_pages: number | null;
  edition_count: number;
};

const FIELDS =
  "key,title,author_name,number_of_pages_median,first_publish_year,cover_i,edition_count";

// Editions nobody means when they type a book's name.
const VARIANT =
  /\b(summary|summaries|workbook|study guide|analysis of|conversation starters|adapted|adaptation|young adults?|boxed set|abridged|journal)\b/i;

const norm = (s: string) =>
  (s || "")
    .toLowerCase()
    .replace(/[‘’']/g, "'")
    .replace(/[^a-z0-9' ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

type OlDoc = {
  key?: string;
  title?: string;
  author_name?: string[];
  number_of_pages_median?: number;
  first_publish_year?: number;
  cover_i?: number;
  edition_count?: number;
};

function score(doc: OlDoc, q: string): number {
  let s = 0;
  const t = norm(doc.title || "");
  const want = norm(q);

  if (t === want) s += 50;
  else if (t.startsWith(want) || want.startsWith(t)) s += 32;
  else if (t.includes(want)) s += 18;
  else s -= 15;

  // Summaries and workbooks are never what the user typed.
  if (VARIANT.test(doc.title || "")) s -= 60;

  if (doc.cover_i) s += 15;
  else s -= 25;

  const p = doc.number_of_pages_median;
  if (p && p >= 100 && p <= 1500) s += 8;

  // Widely-catalogued works are the real editions; 1-edition rows are usually
  // stubs with no cover, no page count, and no description.
  const ed = doc.edition_count || 0;
  if (ed >= 20) s += 14;
  else if (ed >= 5) s += 8;
  else if (ed <= 1) s -= 8;

  return s;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();
  if (!q) return NextResponse.json([]);

  try {
    const url =
      `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}` +
      `&limit=12&fields=${FIELDS}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "RosendoHQ/1.0 (personal library)" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Open Library unavailable" }, { status: 502 });
    }

    const docs: OlDoc[] = (await res.json())?.docs ?? [];
    const results: BookSearchResult[] = docs
      .filter((d) => d.key && d.title)
      .map((d) => ({ d, s: score(d, q) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, 6)
      .map(({ d }) => ({
        source: "openlibrary" as const,
        key: d.key!,
        title: d.title!,
        author: d.author_name?.[0] ?? null,
        year: d.first_publish_year ?? null,
        description: null,
        cover_url: d.cover_i
          ? `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg`
          : null,
        total_pages: d.number_of_pages_median ?? null,
        edition_count: d.edition_count ?? 0,
      }));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Book search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
