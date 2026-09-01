// src/app/api/books/search/describe/route.ts
// Open Library keeps descriptions on the *work* record, not in search results,
// so the add sheet fetches one only for the title the user actually picked.
import { NextResponse } from "next/server";

/**
 * Open Library descriptions are user-edited and carry junk: librarian notes
 * ("Duplicate of ..."), spam PDF links, and jacket-copy quote residue.
 */
function clean(raw: string | undefined | null): string | null {
  if (!raw) return null;
  let s = String(raw).replace(/\r/g, "").trim();

  if (/^duplicate of\b/i.test(s)) return null; // librarian metadata, not a blurb

  s = s.split(/\n\s*-{3,}\s*\n/)[0]; // horizontal-rule footer
  s = s.replace(/\[([^\]]*)\]\((?:https?:\/\/[^)]*)\)/g, "$1"); // [text](url) -> text
  s = s.replace(/https?:\/\/\S+/g, "");
  s = s.replace(/\(\s*source[^)]*\)/gi, "");
  s = s.replace(/["“]?--\s*BOOK JACKET\.?["”]?/i, "");
  s = s.replace(/\*\*/g, "");
  s = s.replace(/"\.\s*/g, "\n\n"); // jacket paragraphs separated by `".`
  s = s
    .split("\n")
    .map((l) => l.replace(/^"(?=[A-Z])/, "")) // unclosed opening quote
    .join("\n");
  s = s.replace(/\n{3,}/g, "\n\n").replace(/[ \t]{2,}/g, " ").trim();
  s = s.replace(/[\s\-–—]+$/, "").trim();

  // A lone quote means we stripped its partner; drop it.
  if ((s.match(/"/g) || []).length % 2) s = s.replace(/"([^"]*)$/, "$1").trim();

  return s.length > 40 ? s : null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = (searchParams.get("key") || "").trim();

  // Only ever fetch an Open Library works path — never an arbitrary URL.
  if (!/^\/works\/OL\d+W$/.test(key)) {
    return NextResponse.json({ error: "Invalid work key" }, { status: 400 });
  }

  try {
    const res = await fetch(`https://openlibrary.org${key}.json`, {
      headers: { "User-Agent": "RosendoHQ/1.0 (personal library)" },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return NextResponse.json({ description: null });

    const j = await res.json();
    const raw = typeof j.description === "string" ? j.description : j.description?.value;
    return NextResponse.json({ description: clean(raw) });
  } catch (error) {
    console.error("Book describe error:", error);
    return NextResponse.json({ description: null });
  }
}
