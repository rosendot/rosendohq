# Habits & Goals Module

## Overview

The Habits & Goals module tracks daily habits with completion logging, mood tracking, and time-of-day scheduling. Goals can be tracked manually or linked to habits for automatic progress. The UI uses a single page with three tabs: daily habit tracking, goals overview, and habit management.

## Architecture

### Frontend

- **Page**: `src/app/habits/page.tsx` — Single page with 3 tabs (Habits, Goals, Manage)
- **Modals** (all in `src/app/habits/`):
  - `AddHabitModal.tsx` — Create habit with name, category, time of day, unit, target, schedule days, sort order
  - `EditHabitModal.tsx` — Edit habit fields plus active/inactive toggle
  - `AddGoalModal.tsx` — Create goal with name, category, target, unit, dates, progress source (manual or linked habit)
  - `EditGoalModal.tsx` — Edit goal fields, update status (active/completed/on_hold/abandoned), adjust current value
  - `HabitLogModal.tsx` — Log a habit completion for a specific date with value, time, mood (1-5 emoji scale), and note

### Page Tabs

1. **Habits Tab** — Daily view with date picker, habits grouped by time of day (morning/midday/evening) then by category. Each habit shows a checkbox grid for quick completion and opens `HabitLogModal` for detailed logging. Shows completion streaks and today's progress.
2. **Goals Tab** — Lists goals with progress bars, status badges, linked habit info, and due dates.
3. **Manage Tab** — Lists all habits (active and inactive) with edit/delete actions. No grouping, just a flat list for management.

### API Routes

All under `src/app/api/habits/`:

| Route | Methods | Table | Notes |
|-------|---------|-------|-------|
| `/` | GET, POST | `habit` | GET filters `is_active=true`, ordered by category → time_of_day → sort_order |
| `[id]/` | GET, PATCH, DELETE | `habit` | Full CRUD |
| `logs/` | GET, POST | `habit_log` | Filterable by `date`, `start_date`/`end_date` range, `habit_id` |
| `logs/[id]/` | PATCH, DELETE | `habit_log` | Update/delete individual logs |
| `goals/` | GET, POST | `goal` | GET joins `habit` via `habit_id`, ordered by status → due_date |
| `goals/[id]/` | GET, PATCH, DELETE | `goal` | GET joins `habit` via `habit_id` |

### Database Tables (Supabase)

| Table | Purpose |
|-------|---------|
| `habit` | Defines trackable habits with name, category, time of day, unit, target, schedule (JSONB with days array and target_per_day), sort order, active flag |
| `habit_log` | Daily completion records for habits with value, note, time of day (HH:MM string), and mood (1-5 integer scale) |
| `goal` | Goals with target/current values, due dates, status lifecycle. Can be manually tracked or auto-linked to a habit via `habit_id` |

### Types

Defined in `src/types/database.types.ts`:

- **Enums**: `GoalStatus` (active, completed, abandoned, on_hold), `GoalProgressSource` (habit, manual)
- **Interfaces**: `Habit`, `HabitLog`, `Goal`, `HabitSchedule`
- **`HabitSchedule`**: JSONB structure `{ days: number[], target_per_day: number | null }` — days are ISO weekday numbers (1=Mon through 7=Sun)
- **Insert/Update types**: Standard pattern — `Omit<T, 'id' | 'created_at'>` for inserts, `Partial<...>` for updates

### Database Views

| View | Purpose |
|------|---------|
| `v_habit_daily_totals` | Aggregates `habit_log` entries by owner, habit, and date — sums `value` to produce a single total per habit per day. |
| `v_goal_progress` | Computes `progress_value` for goals: if `progress_source` is `habit`, sums all matching `habit_log.value`; otherwise returns 0. Includes goal fields (name, target, unit, due date). |

## Key Patterns

- Habits are grouped by `time_of_day` (morning → midday → evening) then by `category` in the daily view
- Categories are client-side constants: oral_care, beard_care, hair_care, shower, body_care, supplements, exercise, mindfulness, productivity, other
- `schedule` is a JSONB column storing `{ days: [1,2,3,4,5,6,7], target_per_day: 1 }` — controls which days a habit is active
- Habit logs are fetched in a date range (±7 days from selected date) and cached client-side; range expands on navigation
- Mood is a 1-5 integer scale displayed as emoji faces (😫😕😐🙂😄)
- `time_of_day` on `habit_log` is a time string (HH:MM), different from `time_of_day` on `habit` which is a period label (morning/midday/evening)
- Goals can auto-track progress from a linked habit (`progress_source: 'habit'`, `habit_id` set) — when linked, `current_value` is disabled in the edit form
- `completed_at` is auto-set when status changes to `completed`, cleared when changed back
- `owner_id` is hardcoded in add modals as a constant (`OWNER_ID`)
- All modals follow the pattern: separate Add and Edit modals (not a shared modal like in car module)
