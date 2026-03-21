# Recipes Module

## Overview

The Recipes module is a personal cooking library with structured ingredient tracking, ordered steps, cook history, and two key integrations: pushing ingredients directly to a Shopping list and (planned) linking a cooked recipe to a Nutrition meal entry. The UI uses a two-page pattern — a library grid and a per-recipe detail page with three modes (view, edit, cook).

## Architecture

### Frontend

- **Library Page**: `src/app/(app)/recipes/page.tsx` — Card grid with search, category/status/difficulty filters, favorite toggle, last cook note surfaced on each card
- **Detail Page**: `src/app/(app)/recipes/[recipeId]/page.tsx` — Three modes toggled inline:
  - **View mode** — Recipe header with badges/meta, ingredients grouped by `group_label`, ordered steps, cook history section, action buttons
  - **Edit mode** — Inline form for all recipe fields, add/remove ingredient rows, add/remove step rows
  - **Cook mode** — Distraction-free full-screen step navigator. Ingredient list shown in a left sidebar on desktop. "Done" button on the last step auto-opens the Log a Cook modal

### Modals

All modals are inline in their respective page files (no separate modal component files):
- **Add Recipe** — in `page.tsx` (library). Title, category, difficulty, servings, prep/cook time, cuisine, status, source URL, description
- **Log a Cook** — in `[recipeId]/page.tsx`. Date, star rating, servings made, free-text notes (the iteration journal)
- **Add to Shopping List** — in `[recipeId]/page.tsx`. Dropdown of existing shopping lists; confirms before bulk-inserting all ingredients

### API Routes

All under `src/app/api/recipes/`:

| Route | Methods | Table | Notes |
|-------|---------|-------|-------|
| `/` | GET, POST | `recipe` | GET filterable by `search` (ilike title/description), `category`, `status`. Orders by `updated_at` desc. |
| `[id]/` | GET, PATCH, DELETE | `recipe` | PATCH sets `updated_at` server-side |
| `[id]/ingredients/` | GET, POST | `recipe_ingredient` | Ordered by `group_label` asc, `sort_order` asc |
| `[id]/ingredients/[ingredientId]/` | PATCH, DELETE | `recipe_ingredient` | |
| `[id]/steps/` | GET, POST | `recipe_step` | Ordered by `step_number` asc |
| `[id]/steps/[stepId]/` | PATCH, DELETE | `recipe_step` | |
| `[id]/logs/` | GET, POST | `recipe_cook_log` | Ordered by `cooked_on` desc |
| `[id]/logs/[logId]/` | PATCH, DELETE | `recipe_cook_log` | |
| `[id]/send-to-shopping/` | POST | `shopping_list_item` | Body: `{ listId }`. Maps each `recipe_ingredient` row to a `shopping_list_item` insert — `name→item_name`, `quantity`, `unit`, `group_label→category` |

### Database Tables (Supabase)

| Table | Purpose |
|-------|---------|
| `recipe` | Core recipe with title, description, category (text), cuisine (text), servings, prep_minutes, cook_minutes, difficulty (easy/medium/hard), source_url, notes, is_favorite, status (want_to_try/tried/regular_rotation), timestamps |
| `recipe_ingredient` | Structured ingredients with name, quantity (numeric), unit, group_label (for grouped display, e.g. "Chicken", "Rice"), sort_order, is_optional |
| `recipe_step` | Ordered instructions with step_number and instruction text |
| `recipe_cook_log` | Cook history per recipe with cooked_on (date), servings_made, rating (1-5), free-text notes, optional linked_meal_id (future Nutrition integration) |

### Types

Defined in `src/types/recipes.types.ts`:

- **Types**: `RecipeDifficulty` (easy, medium, hard), `RecipeStatus` (want_to_try, tried, regular_rotation)
- **Interfaces**: `Recipe`, `RecipeIngredient`, `RecipeStep`, `RecipeCookLog`
- **Insert/Update types**: Standard pattern — `Omit<T, 'id' | 'owner_id' | 'created_at'>` for inserts, `Partial<...>` for updates

### Database Views

| View | Purpose |
|------|---------|
| `v_recipe_last_cooked` | `DISTINCT ON (recipe_id)` — returns the most recent cook log per recipe (cooked_on, rating, last_note). Used to surface iteration notes on library cards. |
| `v_recipe_cook_stats` | Aggregates per recipe: cook_count, avg_rating (rounded to 1 decimal), last_cooked_on. |

Note: The views exist but the library page currently fetches stats inline (the `/api/recipes/stats` and `/api/recipes/last-cooked` routes don't exist yet — the page gracefully ignores failures from those calls). These routes should be added when cook stats need to appear on cards.

## Key Patterns

- **Two-page architecture** (like Reading module): library page → detail page via `Link href={/recipes/${recipe.id}}`
- **Cook mode** is a full page takeover (not a modal) — the sidebar shows ingredients while the main area steps through instructions one at a time
- **Ingredients are grouped** by `group_label` in both view mode and cook mode sidebar — allows recipes like "Burrito Bowl" to show Chicken / Rice / Crema / Extras sections
- **Cook log notes** are shown in amber italic with a left border — the "iteration journal" pattern. The most recent note should appear on the library card (pending the stats API route)
- **Shopping integration**: `send-to-shopping` route reads all `recipe_ingredient` rows and bulk-inserts into `shopping_list_item`, mapping `group_label` as the shopping category so items group naturally in the shopping list
- **Nutrition integration** (Phase 2 — not yet built): `recipe_cook_log.linked_meal_id` is the FK reserved for linking a logged cook to a `meal` row in the Nutrition module
- `category` and `difficulty` are plain text columns (not Postgres enums) — frontend constants define the allowed values
- `status` is a plain text column with three values: `want_to_try`, `tried`, `regular_rotation`
- All cascade deletes are set — deleting a recipe removes all its ingredients, steps, and cook logs
- RLS enabled on all four tables — ingredients/steps policy checks `recipe_id IN (SELECT id FROM recipe WHERE owner_id = auth.uid())`
- Amber color theme (`text-amber-400`, `bg-amber-600`) throughout, matching the ChefHat icon used in the Notes module's recipes category
