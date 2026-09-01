# Design Prompt — Redesign the Media Tracker UI

## Role & goal

You are a senior product designer. Redesign the **UI of a Media Tracker screen** for a personal life-management web app. This is a **visual redesign only** — I just want a beautiful, modern, polished interface design. Don't worry about real data, APIs, or wiring anything up; that gets handled separately. Focus entirely on layout, visual hierarchy, components, and states.

The vibe: a **personal Letterboxd / Trakt / AniList hybrid** — information-dense but clean, dark-themed, and mobile-first. Make it feel like a premium app I'd actually enjoy opening every day.

## Visual style

- **Dark theme**: near-black page background (`gray-950`-ish), with `gray-800`/`gray-900` surfaces for cards and controls.
- **Accent color: blue** (vivid blue for primary actions, active states, progress bars).
- Clean sans-serif type, clear hierarchy, generous-but-efficient spacing.
- Modern touches welcome: subtle gradients, soft borders, rounded corners, gentle shadows, tasteful micro-interactions.
- Icon-driven where it helps (lucide-style line icons).

## What this screen does

It tracks **movies, TV shows, and anime** the user is watching, plans to watch, or has finished. Each title has:

- A **type**: movie, TV show, or anime
- A **status**: planned (plan to watch), watching, completed, on hold, or dropped
- A **platform** it's on (Netflix, Hulu, Disney+, Prime, Max/HBO, Apple TV, Crunchyroll, etc.) — shown as a **brand-colored badge**
- A **1–5 star rating**
- **Progress** for shows/anime: current season / total seasons, current episode / episodes-in-season, total episodes
- Optional **notes**
- **Started** and **completed** dates
- Optional **weekly watch reminders** (e.g. "every Tuesday at 7:00 PM") that ping the user — a title can have one or more

## Pain points in the current design (please solve these)

1. Everything is in **horizontal scrolling carousels** (one per status) — hard to scan a big library or compare titles, and it means lots of vertical scrolling on mobile.
2. The cards **cram too much in** (rating, progress, dates, reminders, notes all at once) and read busy.
3. There's **no overview / stats** — no sense of how many you're watching, how many finished, etc.
4. **No sorting** and no single "see everything" view.
5. Changing a title's **status requires opening an edit form** — no quick inline way to do it.
6. Quick actions are **hidden until you hover** — poor discoverability, bad on touch.

## What I want you to design

Propose a stronger layout and visuals. Things to consider (use your judgment, show me the best version):

- **A main library view** that scales to a large collection — e.g. a responsive **card grid** with an optional **compact list view** toggle. Keep a special **"Continue Watching"** rail/section up top since that's the daily-use surface.
- **An overview / stats strip** near the top — counts like Watching / Planned / Completed, maybe "finished this year," currently-watching highlight, etc.
- **Filter + sort controls**: filter by type (movie/show/anime) and status; sort by recently updated, title, rating, progress.
- **A refined title card** with clear hierarchy: cover/placeholder, title, type icon, brand-colored platform badge, star rating, progress bar + "S2 E4 / 12"-style label, and primary actions that are **always visible on touch** (not hover-only).
- **Inline quick actions** designed right on the card or in a hover/press menu: change status, bump episode (+1), set rating, set/snooze a reminder.
- **A great "Continue Watching" treatment** — make resuming a show feel effortless: progress %, next episode, last-watched recency.
- **Reminders surfacing**: an elegant way to show upcoming reminders (e.g. a small "up next" strip or per-card indicator) plus the reminder editor.
- **The Add/Edit Title form** and the **Reminder management** UI (add / pause / resume / delete weekly reminders).
- **Empty states, loading skeletons, and error states** for the main views.
- **Mobile-first**: everything works one-handed on a phone, touch targets are comfortable, no hover-only critical actions.

## Deliverables

1. A short **design rationale** — your layout decisions and what you changed vs. the pain points above.
2. **Wireframes / mockups** for: the desktop library view (grid + the list-view alternative), the title card (with its quick actions), the "Continue Watching" section, the mobile layout, the Add/Edit form, and the reminder editor.
3. The **high-fidelity visual design** of the recommended direction.

Start by restating your understanding, propose **2–3 layout directions** with a clear recommendation, then design the recommended one in full.
