# Nutrition Module

## Overview

The Nutrition Tracker module tracks daily meals, macronutrients (calories, protein, carbs, fat), water intake, and nutrition goals. Currently **UI-only** — the frontend uses hardcoded mock data and local state. Supabase tables and views exist but are not yet connected.

## Architecture

### Frontend

- **Page**: `src/app/nutrition/page.tsx` — Single page with date selector, daily summary, meal sections, and sidebar with water/macro/calorie trackers
- **No components directory** — `MacroProgress` is an inline component in `page.tsx`
- **No API routes** — all data is local `useState` with hardcoded mock meals and goals

### Page Layout

Two-column grid (2/3 main + 1/3 sidebar):

**Main Content:**
1. **Header** — Title + Set Goals and Add Meal buttons
2. **Date Selector** — Date input to select which day to view
3. **Daily Summary** — 4-stat grid: Calories, Protein, Carbs, Fat (current vs goal)
4. **Meal Sections** — 4 sections (breakfast, lunch, dinner, snack) each showing logged meals with macros and calorie subtotals

**Sidebar:**
1. **Water Intake** — Progress bar + quick-add buttons (+250ml, +500ml, +1L), capped at daily goal
2. **Macro Progress** — Protein, carbs, fat progress bars with current/goal values
3. **Calorie Progress** — Large calorie display with gradient progress bar and remaining/over indicator

**Modals** — Add Meal and Set Goals modals exist as placeholders ("form would go here")

### Database Tables (Supabase)

| Table | Purpose |
|-------|---------|
| `food_item` | Reusable food catalog with name, serving size, and macro values per serving. Not property-scoped. |
| `meal` | A meal occasion on a specific date (e.g., breakfast on 2025-01-15). Uses an enum for meal name (breakfast/lunch/dinner/snack). |
| `meal_entry` | Individual food items within a meal. Links to `meal` and optionally to `food_item`, or uses `custom_name` for one-off entries. Stores servings count and per-entry macros. |
| `nutrition_target` | Daily macro goals with date ranges (start/end). Supports changing targets over time. |

### Database Views

| View | Purpose |
|------|---------|
| `v_daily_macros` | Aggregates meal entries by owner and date — sums calories, protein, carbs, and fat for each day. |
| `v_daily_macros_vs_target` | Extends `v_daily_macros` by joining the current active nutrition target — shows actual vs target macros side by side. Uses most recent target where start_date <= today and end_date is null or >= today. |

### Types

No types defined in `src/types/database.types.ts` for this module. The frontend uses local `Meal`, `MealType`, and `NutritionGoal` interfaces defined inline in `page.tsx`.

## Key Patterns

- UI-only module — needs API routes and Supabase integration to become functional
- DB uses a three-tier meal structure: `food_item` (catalog) → `meal` (occasion) → `meal_entry` (line items) — similar to the house supply system
- `meal_entry` supports both catalog items (`food_item_id`) and ad-hoc entries (`custom_name`) — one should be set
- `meal.name` is a Postgres enum (breakfast/lunch/dinner/snack), not a text field
- `nutrition_target` supports date ranges for changing goals over time; `v_daily_macros_vs_target` picks the most recent active target
- Frontend tracks water intake locally but DB has no water tracking table
- Frontend stores macros as plain numbers; DB uses `numeric` type
- Modals are placeholder stubs — no actual forms implemented yet
- `owner_id` has a hardcoded default UUID in DB tables
