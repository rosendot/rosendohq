# Habits & Goals Module

## Overview

The Habits & Goals module tracks daily habits with completion logging, mood tracking, and a period-of-day label. Goals can be tracked manually or linked to a habit; linked goals auto-sync their `current_value` from `habit_log` rows via a database trigger. The UI uses a single page with three tabs: daily habit tracking, goals overview, and habit management.

## Architecture

### Frontend

- **Page**: `src/app/(app)/habits/page.tsx` — Single page with 3 tabs (Habits, Goals, Manage)
- **Modals** (all in `src/app/(app)/habits/modals/`):
  - `AddHabitModal.tsx` — Create habit with name, category, period, unit, target_per_day, every_n_days, sort order
  - `EditHabitModal.tsx` — Edit habit fields plus active/inactive toggle
  - `AddGoalModal.tsx` — Create goal with name, category, target, unit, dates, progress source (manual or linked habit)
  - `EditGoalModal.tsx` — Edit goal fields, update status, adjust current value (disabled when linked to a habit — auto-synced)
  - `HabitLogModal.tsx` — Log a habit completion for a specific date with value, time, mood (1-5 emoji scale), and note

### Pages

- **`src/app/(app)/habits/page.tsx`** — Index page with two tabs (Habits, Goals).
- **`src/app/(app)/habits/[habitId]/page.tsx`** — Per-habit detail page with 90-day heatmap, stats (current streak, longest in window, completion %, total logs), and recent log list.

### Page Layout — Habits Index

1. **Sticky date header** — Always visible at the top of the page. Shows "Today" + the long-form date (e.g. "Saturday, April 25") plus a small `done / scheduled` progress bar. Stays in place as you scroll.
2. **Stats row** — Active Habits count, This Week (7-day completion %), Active Goals.
3. **Tabs** — Habits / Goals.
4. **Filter chips (Habits tab)** — `All habits` (active only) / `Scheduled today` / `Done today` / `Pending today` / `Inactive`. Each chip has a count badge.
5. **Habit rows** — Grouped by category. Each row: name (link to detail page) + cadence badge + period + inactive badge / streak / 14-day strip (click any cell to toggle, today's cell has a blue ring) / edit / delete / log-details buttons. There is no separate "today toggle" column — you click today's cell in the strip.
6. **Goals tab** — Unchanged from before: cards with progress bars, status badges, due dates.

### Habit Detail Page Layout

1. **Header** — Back link + title + cadence/period/category/active badges + "Log today" / Edit / Delete buttons.
2. **Stats grid** — Current Streak (with flame), Longest in 90 days, Completion % over 90 days, Total Logs.
3. **Heatmap** — 90 days, GitHub-style grid with weekday rows (M/W/F labels). Today is ringed. Click any scheduled cell to toggle.
4. **Recent Logs** — Last 30 logs with date, time, mood, note, value. Each has an Edit button that opens `HabitLogModal` for that specific log's date.

### API Routes

All under `src/app/api/habits/`:

| Route | Methods | Table | Notes |
|-------|---------|-------|-------|
| `/` | GET, POST | `habit` | GET filters `is_active=true` by default; pass `?include_inactive=true` for all. Ordered by category → period → sort_order |
| `[id]/` | GET, PATCH, DELETE | `habit` | Full CRUD |
| `logs/` | GET, POST | `habit_log` | Filterable by `date`, `start_date`/`end_date` range, `habit_id` |
| `logs/[id]/` | PATCH, DELETE | `habit_log` | Update/delete individual logs |
| `goals/` | GET, POST | `goal` | GET joins `habit` via `habit_id`, ordered by status → due_date |
| `goals/[id]/` | GET, PATCH, DELETE | `goal` | GET joins `habit` via `habit_id` |

### Database Tables (Supabase)

| Table | Purpose |
|-------|---------|
| `habit` | Trackable habit. Recurrence is `every_n_days INT` (default 1) anchored to `anchor_date DATE` (default today). `target_per_day` is a top-level numeric. `period` is the time-of-day label (morning/midday/evening). |
| `habit_log` | Daily completion records with `value`, `note`, `time_of_day` (HH:MM), `mood` (1-5). UNIQUE(`owner_id`, `habit_id`, `log_date`). |
| `goal` | Goals with target/current values, due dates, status lifecycle. Can be manually tracked or auto-linked to a habit via `habit_id`. When linked, `current_value` is kept in sync by a trigger on `habit_log`. |

### Types

Defined in `src/types/habits.types.ts`:

- **Enums**: `GoalStatus` (active, completed, abandoned, on_hold), `GoalProgressSource` (habit, manual)
- **Interfaces**: `Habit` (with `every_n_days`, `target_per_day`, `anchor_date`, `period`), `HabitLog`, `Goal`
- No more `HabitSchedule` JSONB type.

### Database Views

| View | Purpose |
|------|---------|
| `v_habit_daily_totals` | Aggregates `habit_log` entries by owner, habit, and date — sums `value` per day. |
| `v_goal_progress` | For each goal, returns `progress_value`. If `progress_source = 'habit'`, sums matching `habit_log.value`; otherwise returns `current_value`. |

### Database Triggers

| Trigger | Purpose |
|---------|---------|
| `habit_log_sync_goal` (on `habit_log` AFTER INSERT/UPDATE/DELETE) | Recomputes `goal.current_value` for every goal where `progress_source = 'habit'` and `habit_id` matches the affected log's habit. Calls `sync_goal_current_value_for_habit(owner, habit_id)`. |
| `goal_sync_on_link` (on `goal` BEFORE INSERT/UPDATE OF progress_source, habit_id) | When a goal is linked to a habit, immediately backfills `current_value` from existing logs. |

## Key Patterns

- **Pattern B (habit-centric)**: the index page is a master list of habits with each row showing its own status — not a "today's todos" page. Today is the ringed cell on each habit's strip. Filter chips narrow the list (e.g. to "Scheduled today" or "Pending today") when you want a focused view.
- **Sticky date header** keeps "today" always visible without making the page about today.
- **Habit-centric main view**: there is no date picker. The index renders the full habit list and uses a 14-day window of logs to draw streaks and the strip per habit. One log fetch on mount; toggles are optimistic (no refetch).
- **Detail page** uses a 90-day window per habit, fetched on mount with a `?habit_id=` filter.
- **Recurrence is `every_n_days`**: 1 = daily, 2 = every other day, 7 = weekly. A habit shows on date D iff `(D - anchor_date) % every_n_days == 0`. No weekday bitmap, no JSONB.
- **Mini-strip backfill**: clicking any cell in a habit's 7-day strip toggles that day's completion. Cells for non-scheduled days are visually muted and disabled.
- **Streak**: walks backwards day-by-day from today, counting consecutive *scheduled* days completed. Today not being done yet does not break the streak.
- **Period label** (`habit.period`) is a UI grouping — morning/midday/evening. Logs use `habit_log.time_of_day` (Postgres `time`) for the actual HH:MM stamp; the two columns no longer share a name.
- **Habit-linked goals auto-sync**: do not write `current_value` from the client when `progress_source = 'habit'` — the trigger overwrites it.
- Habits are grouped by `period` (morning → midday → evening) then by `category` in the daily view
- Categories are client-side constants: oral_care, beard_care, hair_care, shower, body_care, supplements, exercise, mindfulness, productivity, other
- Mood is a 1-5 integer scale displayed as emoji faces (😫😕😐🙂😄)
- `completed_at` is auto-set when status changes to `completed`, cleared when changed back
- `owner_id` defaults to `auth.uid()` via RLS — never sent from the client
- All modals follow the pattern: separate Add and Edit modals
