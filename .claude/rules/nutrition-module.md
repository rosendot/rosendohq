# Nutrition Module

## Overview

The Nutrition Tracker module logs daily meals across the four standard slots (breakfast/lunch/dinner/snack), tracks macros (calories, protein, carbs, fat) per entry, and supports daily macro targets. Connected to Supabase with API routes covering food catalog, meals, meal entries, and nutrition targets.

## Architecture

### Frontend

- **Page**: `src/app/(app)/nutrition/page.tsx` — Single page with date selector, daily summary, four meal sections (one per `MealName`), and sidebar with macro/calorie progress
- **Modals** (in `src/app/(app)/nutrition/modals/`):
  - `AddMealEntryModal.tsx` — Adds a meal entry to a specific date+meal slot. Two modes: "Custom" (free-text name with macros) and "From Library" (pick from `food_item` catalog). Optionally saves the custom entry to the food library for reuse. Auto-creates the parent `meal` row if one does not yet exist for that date/slot.
  - `SetGoalsModal.tsx` — Creates or updates the active `nutrition_target` (calories + protein/carbs/fat in grams)
- **Uses**: `BaseFormModal`, `DeleteConfirmationModal` from `@/components/`

### Page Layout

1. **Header** — Title + "Set Goals" + "Add Entry" buttons
2. **Date Selector** — Single date input controls all data on the page
3. **Two-Column Grid** (main 2/3 + sidebar 1/3):
   - **Main**: Daily Summary (calories, protein, carbs, fat with target comparison) + four meal sections (each with inline `+` to add to that specific slot, list of entries with delete buttons)
   - **Sidebar**: Macro Progress bars + Calorie Progress with remaining/over indicator + "no goals set" hint when no active target exists

### API Routes

All under `src/app/api/nutrition/`:

| Route | Methods | Table | Notes |
|-------|---------|-------|-------|
| `foods/` | GET, POST | `food_item` | GET filterable by `search` (ilike on name), ordered by name asc |
| `foods/[id]/` | GET, PATCH, DELETE | `food_item` | Full CRUD |
| `meals/` | GET, POST | `meal` | GET filterable by `date`, ordered by `meal_date` desc |
| `meals/[id]/` | GET, PATCH, DELETE | `meal` | Full CRUD |
| `meals/[id]/entries/` | GET, POST | `meal_entry` | Entries nested under meal. Validates that either `food_item_id` or `custom_name` is set |
| `entries/[id]/` | PATCH, DELETE | `meal_entry` | Update/delete individual entry (not nested under meal) |
| `targets/` | GET, POST | `nutrition_target` | GET supports `active=true` to filter to current targets (start_date <= today AND (end_date IS NULL OR end_date >= today)) |
| `targets/[id]/` | PATCH, DELETE | `nutrition_target` | Update/delete a target |
| `daily/` | GET | `v_daily_macros_vs_target` | Pass `?date=YYYY-MM-DD`. Returns one row with totals + active target side-by-side. Uses `.maybeSingle()` since days with no entries return no row |

### Database Tables (Supabase)

| Table | Purpose |
|-------|---------|
| `food_item` | Reusable food catalog with name, serving_size (text), and macros per serving (calories, protein_g, carbs_g, fat_g as numeric) |
| `meal` | A meal occasion on a specific date. `name` is a Postgres enum (`meal_name`) with values breakfast/lunch/dinner/snack |
| `meal_entry` | Line items within a meal. Links to `meal_id` and either `food_item_id` (catalog reference) or `custom_name` (ad-hoc). Stores `servings` (numeric, default 1) plus per-entry macro totals (already multiplied by servings) |
| `nutrition_target` | Daily macro goals with `start_date` (default CURRENT_DATE) and optional `end_date`. Most recent active target is the one in effect |

### Database Views

| View | Purpose |
|------|---------|
| `v_daily_macros` | Sums meal_entry macros per owner per `meal.meal_date` |
| `v_daily_macros_vs_target` | Joins `v_daily_macros` with the most recent active `nutrition_target` per owner — exposes `calories`, `protein_g`, `carbs_g`, `fat_g` plus `target_*` counterparts |

### Types

Defined in `src/types/nutrition.types.ts`:

- **Type**: `MealName` — Union: breakfast, lunch, dinner, snack
- **Interfaces**: `FoodItem`, `Meal`, `MealEntry`, `NutritionTarget`, `DailyMacros` (the `v_daily_macros_vs_target` row shape)
- **Insert/Update types**: Standard pattern — `Omit<T, 'id' | 'owner_id' | 'created_at'>` for inserts, `Partial<...>` for updates. `MealEntryUpdate` also omits `meal_id` (entries don't move between meals)

## Key Patterns

- **Per-entry macro storage**: `meal_entry` stores already-multiplied macro totals (servings × per-serving values). The frontend does the multiplication when posting an entry. This keeps the daily totals view (`v_daily_macros`) a simple SUM
- **Either food_item_id or custom_name**: Every entry must reference one. The "From Library" mode picks an existing `food_item`; "Custom" mode either saves to the library (when "Save to food library" is checked) or stores `custom_name` directly
- **Auto-create parent meal**: When adding an entry, the modal checks if a `meal` row already exists for that date+meal name. If not, it creates one before inserting the entry
- **Single active target**: The page reads `targets?active=true` and uses the first row. `SetGoalsModal` PATCHes that row when one exists, otherwise POSTs a new one with `start_date = today`, `end_date = null`
- **Date filter** drives the entire page — meals fetched per day, entries fetched per meal, food catalog fetched once
- All numeric DB values arrive as strings via the JSON wire format — frontend wraps with `Number()` before arithmetic
- RLS: `auth.uid() = owner_id` on all four tables; `owner_id` defaults to `auth.uid()` on insert
- Water intake from the original UI was dropped — there is no DB table for it; if needed in the future, add a `water_log` table or a daily `water_ml` column on a new daily-summary table
- Blue color theme matching the module's sidebar color
