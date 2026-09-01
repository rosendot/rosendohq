// src/app/api/media/search/route.ts
// Title lookup for the add sheet. Proxies TMDB (movies/shows) and AniList (anime)
// server-side so the TMDB token never reaches the browser.
import { NextResponse } from "next/server";
import type { MediaType } from "@/types/media.types";

export type MediaSearchResult = {
  source: "tmdb" | "anilist";
  external_id: number;
  title: string;
  subtitle: string | null; // original/romaji title when it differs
  year: string | null;
  overview: string | null;
  poster_url: string | null;
  backdrop_url: string | null;
  platform: string | null;
  total_seasons: number | null;
  episodes_in_season: number | null;
  total_episodes: number | null;
};

const TMDB_IMG = "https://image.tmdb.org/t/p";

type TmdbHit = {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  release_date?: string;
  first_air_date?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
};

async function tmdb(path: string, token: string) {
  const res = await fetch(`https://api.themoviedb.org/3${path}`, {
    headers: { Authorization: `Bearer ${token}`, accept: "application/json" },
    // TMDB data is stable; let Next cache briefly to keep typing responsive.
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  return res.json();
}

async function searchTmdb(q: string, type: "movie" | "show", token: string) {
  const kind = type === "movie" ? "movie" : "tv";
  const data = await tmdb(
    `/search/${kind}?query=${encodeURIComponent(q)}&include_adult=false&language=en-US&page=1`,
    token,
  );
  const hits: TmdbHit[] = (data.results || []).slice(0, 8);

  // Detail calls carry season/episode counts and networks, which search omits.
  return Promise.all(
    hits.map(async (h): Promise<MediaSearchResult> => {
      const base: MediaSearchResult = {
        source: "tmdb",
        external_id: h.id,
        title: h.title || h.name || "Untitled",
        subtitle: null,
        year: (h.release_date || h.first_air_date || "").slice(0, 4) || null,
        overview: h.overview || null,
        poster_url: h.poster_path ? `${TMDB_IMG}/w500${h.poster_path}` : null,
        backdrop_url: h.backdrop_path ? `${TMDB_IMG}/w780${h.backdrop_path}` : null,
        platform: null,
        total_seasons: null,
        episodes_in_season: null,
        total_episodes: null,
      };
      const orig = h.original_title || h.original_name;
      if (orig && orig !== base.title) base.subtitle = orig;

      if (kind === "tv") {
        try {
          const d = await tmdb(`/tv/${h.id}?language=en-US`, token);
          base.total_seasons = d.number_of_seasons ?? null;
          base.total_episodes = d.number_of_episodes ?? null;
          base.platform = d.networks?.[0]?.name ?? null;
          const regular = (d.seasons || []).filter(
            (s: { season_number: number; episode_count: number }) => s.season_number > 0,
          );
          if (regular.length) base.episodes_in_season = regular[0].episode_count ?? null;
        } catch {
          // Detail enrichment is best-effort — the search hit is still usable.
        }
      }
      return base;
    }),
  );
}

const ANILIST_QUERY = `query ($s: String) {
  Page(page: 1, perPage: 8) {
    media(search: $s, type: ANIME, sort: SEARCH_MATCH) {
      id episodes format seasonYear
      title { romaji english }
      description(asHtml: false)
      coverImage { extraLarge large }
      bannerImage
    }
  }
}`;

type AniListHit = {
  id: number;
  episodes: number | null;
  format: string | null;
  seasonYear: number | null;
  title: { romaji: string | null; english: string | null };
  description: string | null;
  coverImage: { extraLarge: string | null; large: string | null } | null;
  bannerImage: string | null;
};

async function searchAniList(q: string): Promise<MediaSearchResult[]> {
  const res = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify({ query: ANILIST_QUERY, variables: { s: q } }),
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`AniList ${res.status}`);
  const json = await res.json();
  const hits: AniListHit[] = json.data?.Page?.media || [];

  return hits.map((m) => {
    const title = m.title.english || m.title.romaji || "Untitled";
    const romaji = m.title.romaji;
    return {
      source: "anilist" as const,
      external_id: m.id,
      title,
      subtitle: romaji && romaji !== title ? romaji : null,
      year: m.seasonYear ? String(m.seasonYear) : null,
      // AniList descriptions carry light HTML even with asHtml:false.
      overview: m.description ? m.description.replace(/<[^>]*>/g, "").trim() : null,
      poster_url: m.coverImage?.extraLarge || m.coverImage?.large || null,
      backdrop_url: m.bannerImage || null,
      platform: null,
      total_seasons: null,
      episodes_in_season: m.episodes ?? null,
      total_episodes: m.episodes ?? null,
    };
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();
  const type = (searchParams.get("type") || "movie") as MediaType;

  if (q.length < 2) return NextResponse.json([]);

  try {
    if (type === "anime") {
      return NextResponse.json(await searchAniList(q));
    }
    const token = process.env.TMDB_READ_ACCESS_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "TMDB_READ_ACCESS_TOKEN is not configured" },
        { status: 501 },
      );
    }
    return NextResponse.json(await searchTmdb(q, type === "show" ? "show" : "movie", token));
  } catch (e) {
    console.error("Media search error:", e);
    return NextResponse.json({ error: "Lookup failed" }, { status: 502 });
  }
}
