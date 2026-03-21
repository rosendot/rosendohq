"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ChefHat,
  Clock,
  Users,
  Star,
  Heart,
  ExternalLink,
  Edit,
  Trash2,
  Plus,
  X,
  Check,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  GripVertical,
} from "lucide-react";
import type {
  Recipe,
  RecipeIngredient,
  RecipeStep,
  RecipeCookLog,
  RecipeUpdate,
  RecipeIngredientInsert,
  RecipeStepInsert,
  RecipeStatus,
  RecipeDifficulty,
} from "@/types/recipes.types";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import CookLogModal from "../modals/CookLogModal";
import SendToShoppingModal from "../modals/SendToShoppingModal";

const CATEGORIES = ["breakfast", "lunch", "dinner", "snack", "dessert", "sauce", "marinade", "other"];
const DIFFICULTIES: RecipeDifficulty[] = ["easy", "medium", "hard"];
const STATUSES: { value: RecipeStatus; label: string }[] = [
  { value: "want_to_try", label: "Want to Try" },
  { value: "tried", label: "Tried" },
  { value: "regular_rotation", label: "Regular Rotation" },
];

const DIFFICULTY_COLORS: Record<RecipeDifficulty, string> = {
  easy: "bg-emerald-900/50 text-emerald-400",
  medium: "bg-amber-900/50 text-amber-400",
  hard: "bg-red-900/50 text-red-400",
};
const STATUS_COLORS: Record<RecipeStatus, string> = {
  want_to_try: "bg-blue-900/50 text-blue-400",
  tried: "bg-violet-900/50 text-violet-400",
  regular_rotation: "bg-emerald-900/50 text-emerald-400",
};

function formatTime(minutes: number | null): string {
  if (!minutes) return "";
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function StarRating({
  rating,
  interactive = false,
  onChange,
}: {
  rating: number | null;
  interactive?: boolean;
  onChange?: (r: number) => void;
}) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(s)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
        >
          <Star
            size={interactive ? 20 : 14}
            className={s <= (rating ?? 0) ? "fill-amber-400 text-amber-400" : "text-gray-600"}
          />
        </button>
      ))}
    </div>
  );
}

// Group ingredients by group_label
function groupIngredients(ingredients: RecipeIngredient[]): Map<string, RecipeIngredient[]> {
  const groups = new Map<string, RecipeIngredient[]>();
  for (const ing of ingredients) {
    const key = ing.group_label ?? "";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(ing);
  }
  return groups;
}

type PageMode = "view" | "edit" | "cook";

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const recipeId = params.recipeId as string;

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [steps, setSteps] = useState<RecipeStep[]>([]);
  const [cookLogs, setCookLogs] = useState<RecipeCookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<PageMode>("view");

  // Edit form state
  const [editForm, setEditForm] = useState<RecipeUpdate>({});

  // Ingredient editing
  const [newIngredient, setNewIngredient] = useState<Partial<RecipeIngredientInsert>>({});
  const [deletingIngredient, setDeletingIngredient] = useState<string | null>(null);

  // Step editing
  const [newStepInstruction, setNewStepInstruction] = useState("");
  const [deletingStep, setDeletingStep] = useState<string | null>(null);

  // Cook log
  const [showLogModal, setShowLogModal] = useState(false);

  // Shopping modal
  const [showShoppingModal, setShowShoppingModal] = useState(false);

  // Cook mode
  const [cookStep, setCookStep] = useState(0);

  // Delete recipe
  const [showDeleteRecipe, setShowDeleteRecipe] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [recipeRes, ingredientsRes, stepsRes, logsRes] = await Promise.all([
        fetch(`/api/recipes/${recipeId}`),
        fetch(`/api/recipes/${recipeId}/ingredients`),
        fetch(`/api/recipes/${recipeId}/steps`),
        fetch(`/api/recipes/${recipeId}/logs`),
      ]);

      if (!recipeRes.ok) { router.push("/recipes"); return; }

      const [r, i, s, l] = await Promise.all([
        recipeRes.json(),
        ingredientsRes.ok ? ingredientsRes.json() : [],
        stepsRes.ok ? stepsRes.json() : [],
        logsRes.ok ? logsRes.json() : [],
      ]);

      setRecipe(r);
      setEditForm(r);
      setIngredients(i);
      setSteps(s);
      setCookLogs(l);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [recipeId, router]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function saveEdit() {
    if (!recipe) return;
    const res = await fetch(`/api/recipes/${recipe.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    if (res.ok) {
      const updated = await res.json();
      setRecipe(updated);
      setMode("view");
    }
  }

  async function toggleFavorite() {
    if (!recipe) return;
    const updated = { is_favorite: !recipe.is_favorite };
    setRecipe((r) => r ? { ...r, ...updated } : r);
    await fetch(`/api/recipes/${recipe.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
  }

  async function deleteRecipe() {
    if (!recipe) return;
    await fetch(`/api/recipes/${recipe.id}`, { method: "DELETE" });
    router.push("/recipes");
  }

  // Ingredient CRUD
  async function addIngredient() {
    if (!newIngredient.name?.trim()) return;
    const res = await fetch(`/api/recipes/${recipeId}/ingredients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newIngredient,
        sort_order: ingredients.length,
      }),
    });
    if (res.ok) {
      const created = await res.json();
      setIngredients((prev) => [...prev, created]);
      setNewIngredient({});
    }
  }

  async function deleteIngredient(id: string) {
    await fetch(`/api/recipes/${recipeId}/ingredients/${id}`, { method: "DELETE" });
    setIngredients((prev) => prev.filter((i) => i.id !== id));
  }

  // Step CRUD
  async function addStep() {
    if (!newStepInstruction.trim()) return;
    const nextNum = steps.length > 0 ? Math.max(...steps.map((s) => s.step_number)) + 1 : 1;
    const res = await fetch(`/api/recipes/${recipeId}/steps`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step_number: nextNum, instruction: newStepInstruction.trim() }),
    });
    if (res.ok) {
      const created = await res.json();
      setSteps((prev) => [...prev, created]);
      setNewStepInstruction("");
    }
  }

  async function deleteStep(id: string) {
    await fetch(`/api/recipes/${recipeId}/steps/${id}`, { method: "DELETE" });
    setSteps((prev) => prev.filter((s) => s.id !== id));
  }

  async function deleteLog(id: string) {
    await fetch(`/api/recipes/${recipeId}/logs/${id}`, { method: "DELETE" });
    setCookLogs((prev) => prev.filter((l) => l.id !== id));
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 p-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-800 mb-6" />
        <div className="h-64 animate-pulse rounded-xl bg-gray-900" />
      </div>
    );
  }

  if (!recipe) return null;

  // ── COOK MODE ──────────────────────────────────────────────────────────────
  if (mode === "cook") {
    const sortedSteps = [...steps].sort((a, b) => a.step_number - b.step_number);
    const current = sortedSteps[cookStep];
    const groups = groupIngredients(ingredients);

    return (
      <div className="flex min-h-screen bg-gray-950">
        {/* Ingredient sidebar */}
        <aside className="hidden w-72 shrink-0 border-r border-gray-800 bg-gray-900 p-6 lg:flex lg:flex-col">
          <div className="mb-4 flex items-center gap-2">
            <ChefHat size={18} className="text-amber-400" />
            <span className="text-sm font-semibold text-white">Ingredients</span>
          </div>
          <div className="space-y-4 overflow-y-auto">
            {Array.from(groups.entries()).map(([group, ings]) => (
              <div key={group}>
                {group && <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-500">{group}</p>}
                <ul className="space-y-1">
                  {ings.map((ing) => (
                    <li key={ing.id} className="text-sm text-gray-300">
                      {ing.quantity && <span className="text-amber-400">{ing.quantity}{ing.unit ? ` ${ing.unit}` : ""} </span>}
                      {ing.name}
                      {ing.is_optional && <span className="ml-1 text-xs text-gray-500">(optional)</span>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        {/* Steps */}
        <div className="flex flex-1 flex-col items-center justify-between p-8">
          <div className="flex w-full items-center justify-between">
            <button onClick={() => setMode("view")} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white">
              <X size={16} /> Exit Cook Mode
            </button>
            <span className="text-sm text-gray-500">
              Step {cookStep + 1} of {sortedSteps.length}
            </span>
          </div>

          {/* Step display */}
          <div className="flex max-w-2xl flex-1 flex-col items-center justify-center text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-600 text-2xl font-bold text-white">
              {cookStep + 1}
            </div>
            <p className="text-2xl leading-relaxed text-white lg:text-3xl">
              {current?.instruction}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex w-full max-w-sm items-center justify-between gap-4">
            <button
              onClick={() => setCookStep((s) => Math.max(0, s - 1))}
              disabled={cookStep === 0}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-700 py-4 text-white disabled:opacity-30 hover:bg-gray-800"
            >
              <ChevronLeft size={20} /> Previous
            </button>
            {cookStep < sortedSteps.length - 1 ? (
              <button
                onClick={() => setCookStep((s) => s + 1)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-600 py-4 text-white hover:bg-amber-700"
              >
                Next <ChevronRight size={20} />
              </button>
            ) : (
              <button
                onClick={() => { setMode("view"); setShowLogModal(true); }}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-4 text-white hover:bg-emerald-700"
              >
                <Check size={20} /> Done — Log Cook
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── VIEW / EDIT MODE ───────────────────────────────────────────────────────
  const ingredientGroups = groupIngredients(ingredients);
  const sortedSteps = [...steps].sort((a, b) => a.step_number - b.step_number);
  const lastLog = cookLogs[0];

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      {/* Back */}
      <Link href="/recipes" className="mb-6 flex items-center gap-2 text-sm text-gray-400 hover:text-white">
        <ArrowLeft size={16} /> Back to Recipes
      </Link>

      {/* Header */}
      <div className="mb-8 rounded-xl border border-gray-800 bg-gray-900 p-6">
        {mode === "view" ? (
          <>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {/* Badges */}
                <div className="mb-3 flex flex-wrap gap-2">
                  {recipe.status && (
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[recipe.status]}`}>
                      {STATUSES.find((s) => s.value === recipe.status)?.label}
                    </span>
                  )}
                  {recipe.difficulty && (
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${DIFFICULTY_COLORS[recipe.difficulty]}`}>
                      {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
                    </span>
                  )}
                  {recipe.category && (
                    <span className="rounded-full bg-gray-800 px-2.5 py-0.5 text-xs text-gray-400">
                      {recipe.category.charAt(0).toUpperCase() + recipe.category.slice(1)}
                    </span>
                  )}
                  {recipe.cuisine && (
                    <span className="rounded-full bg-gray-800 px-2.5 py-0.5 text-xs text-gray-400">
                      {recipe.cuisine}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl font-bold text-white">{recipe.title}</h1>
                {recipe.description && <p className="mt-2 text-gray-400">{recipe.description}</p>}

                {/* Meta */}
                <div className="mt-4 flex flex-wrap gap-5 text-sm text-gray-400">
                  {recipe.prep_minutes && (
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} />
                      Prep: {formatTime(recipe.prep_minutes)}
                    </span>
                  )}
                  {recipe.cook_minutes && (
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} />
                      Cook: {formatTime(recipe.cook_minutes)}
                    </span>
                  )}
                  {recipe.servings && (
                    <span className="flex items-center gap-1.5">
                      <Users size={14} />
                      {recipe.servings} servings
                    </span>
                  )}
                  {cookLogs.length > 0 && (
                    <span className="flex items-center gap-1.5">
                      <BookOpen size={14} />
                      Cooked {cookLogs.length} time{cookLogs.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {recipe.source_url && (
                  <a
                    href={recipe.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex items-center gap-1.5 text-sm text-amber-400 hover:underline"
                  >
                    <ExternalLink size={13} />
                    {new URL(recipe.source_url).hostname.replace("www.", "")}
                  </a>
                )}

                {recipe.notes && (
                  <p className="mt-3 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-300">
                    {recipe.notes}
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex shrink-0 flex-col gap-2">
                <button
                  onClick={() => { setMode("edit"); setEditForm(recipe); }}
                  className="flex items-center gap-2 rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800"
                >
                  <Edit size={14} /> Edit
                </button>
                <button
                  onClick={toggleFavorite}
                  className={`flex items-center gap-2 rounded-lg border border-gray-700 px-3 py-2 text-sm hover:bg-gray-800 ${recipe.is_favorite ? "text-amber-400" : "text-gray-300"}`}
                >
                  <Heart size={14} className={recipe.is_favorite ? "fill-amber-400" : ""} />
                  {recipe.is_favorite ? "Favorited" : "Favorite"}
                </button>
                <button
                  onClick={() => setShowDeleteRecipe(true)}
                  className="flex items-center gap-2 rounded-lg border border-red-900/50 px-3 py-2 text-sm text-red-400 hover:bg-red-900/20"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>

            {/* Cook actions */}
            <div className="mt-6 flex flex-wrap gap-3 border-t border-gray-800 pt-5">
              {steps.length > 0 && (
                <button
                  onClick={() => { setCookStep(0); setMode("cook"); }}
                  className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
                >
                  <ChefHat size={16} /> Cook Mode
                </button>
              )}
              <button
                onClick={() => setShowLogModal(true)}
                className="flex items-center gap-2 rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
              >
                <BookOpen size={16} /> Log a Cook
              </button>
              {ingredients.length > 0 && (
                <button
                  onClick={() => setShowShoppingModal(true)}
                  className="flex items-center gap-2 rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                >
                  <ShoppingCart size={16} /> Add to Shopping List
                </button>
              )}
            </div>
          </>
        ) : (
          /* Edit mode header */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Edit Recipe</h2>
              <div className="flex gap-2">
                <button onClick={() => setMode("view")} className="rounded-lg border border-gray-700 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-800">
                  Cancel
                </button>
                <button onClick={saveEdit} className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700">
                  Save
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-300">Title</label>
              <input
                type="text"
                value={editForm.title ?? ""}
                onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <label className="mb-1 block text-sm text-gray-300">Category</label>
                <select
                  value={editForm.category ?? ""}
                  onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value || null }))}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="">None</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-300">Difficulty</label>
                <select
                  value={editForm.difficulty ?? ""}
                  onChange={(e) => setEditForm((p) => ({ ...p, difficulty: (e.target.value || null) as RecipeDifficulty | null }))}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="">None</option>
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-300">Status</label>
                <select
                  value={editForm.status ?? "want_to_try"}
                  onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value as RecipeStatus }))}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-300">Cuisine</label>
                <input
                  type="text"
                  value={editForm.cuisine ?? ""}
                  onChange={(e) => setEditForm((p) => ({ ...p, cuisine: e.target.value || null }))}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-sm text-gray-300">Servings</label>
                <input
                  type="number"
                  min="1"
                  value={editForm.servings ?? ""}
                  onChange={(e) => setEditForm((p) => ({ ...p, servings: e.target.value ? parseInt(e.target.value) : null }))}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-300">Prep (min)</label>
                <input
                  type="number"
                  min="0"
                  value={editForm.prep_minutes ?? ""}
                  onChange={(e) => setEditForm((p) => ({ ...p, prep_minutes: e.target.value ? parseInt(e.target.value) : null }))}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-300">Cook (min)</label>
                <input
                  type="number"
                  min="0"
                  value={editForm.cook_minutes ?? ""}
                  onChange={(e) => setEditForm((p) => ({ ...p, cook_minutes: e.target.value ? parseInt(e.target.value) : null }))}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-300">Source URL</label>
              <input
                type="url"
                value={editForm.source_url ?? ""}
                onChange={(e) => setEditForm((p) => ({ ...p, source_url: e.target.value || null }))}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-300">Description</label>
              <textarea
                rows={2}
                value={editForm.description ?? ""}
                onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value || null }))}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-300">Notes</label>
              <textarea
                rows={2}
                value={editForm.notes ?? ""}
                onChange={(e) => setEditForm((p) => ({ ...p, notes: e.target.value || null }))}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Ingredients */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h2 className="mb-4 text-base font-semibold text-white">Ingredients</h2>

          {ingredients.length === 0 && mode === "view" && (
            <p className="text-sm text-gray-500">No ingredients added yet.</p>
          )}

          {Array.from(ingredientGroups.entries()).map(([group, ings]) => (
            <div key={group} className="mb-4">
              {group && (
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">{group}</p>
              )}
              <ul className="space-y-1.5">
                {ings.map((ing) => (
                  <li key={ing.id} className="group flex items-center justify-between gap-2">
                    <span className="text-sm text-gray-300">
                      {ing.quantity && (
                        <span className="text-amber-400 font-medium">
                          {ing.quantity}{ing.unit ? ` ${ing.unit}` : ""}{" "}
                        </span>
                      )}
                      {ing.name}
                      {ing.is_optional && <span className="ml-1 text-xs text-gray-500">(optional)</span>}
                    </span>
                    {mode === "edit" && (
                      <button
                        onClick={() => deleteIngredient(ing.id)}
                        className="shrink-0 rounded p-0.5 text-gray-600 opacity-0 hover:text-red-400 group-hover:opacity-100"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {mode === "edit" && (
            <div className="mt-4 space-y-2 border-t border-gray-800 pt-4">
              <p className="text-xs font-medium text-gray-400">Add Ingredient</p>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  placeholder="Qty"
                  value={newIngredient.quantity ?? ""}
                  onChange={(e) => setNewIngredient((p) => ({ ...p, quantity: e.target.value ? parseFloat(e.target.value) : undefined }))}
                  className="rounded-lg border border-gray-700 bg-gray-800 px-2 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <input
                  type="text"
                  placeholder="Unit (tbsp...)"
                  value={newIngredient.unit ?? ""}
                  onChange={(e) => setNewIngredient((p) => ({ ...p, unit: e.target.value || undefined }))}
                  className="rounded-lg border border-gray-700 bg-gray-800 px-2 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <input
                  type="text"
                  placeholder="Name *"
                  value={newIngredient.name ?? ""}
                  onChange={(e) => setNewIngredient((p) => ({ ...p, name: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && addIngredient()}
                  className="rounded-lg border border-gray-700 bg-gray-800 px-2 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Group (Chicken, Rice...)"
                  value={newIngredient.group_label ?? ""}
                  onChange={(e) => setNewIngredient((p) => ({ ...p, group_label: e.target.value || undefined }))}
                  className="col-span-2 rounded-lg border border-gray-700 bg-gray-800 px-2 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <button
                  onClick={addIngredient}
                  disabled={!newIngredient.name?.trim()}
                  className="flex items-center justify-center gap-1 rounded-lg bg-amber-600 text-sm text-white hover:bg-amber-700 disabled:opacity-50"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Steps */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h2 className="mb-4 text-base font-semibold text-white">Steps</h2>

          {steps.length === 0 && mode === "view" && (
            <p className="text-sm text-gray-500">No steps added yet.</p>
          )}

          <ol className="space-y-3">
            {sortedSteps.map((step, idx) => (
              <li key={step.id} className="group flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white">
                  {idx + 1}
                </span>
                <div className="flex flex-1 items-start justify-between gap-2">
                  <p className="text-sm text-gray-300 leading-relaxed">{step.instruction}</p>
                  {mode === "edit" && (
                    <button
                      onClick={() => deleteStep(step.id)}
                      className="shrink-0 rounded p-0.5 text-gray-600 opacity-0 hover:text-red-400 group-hover:opacity-100"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ol>

          {mode === "edit" && (
            <div className="mt-4 space-y-2 border-t border-gray-800 pt-4">
              <p className="text-xs font-medium text-gray-400">Add Step</p>
              <textarea
                rows={2}
                placeholder="Describe this step..."
                value={newStepInstruction}
                onChange={(e) => setNewStepInstruction(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <button
                onClick={addStep}
                disabled={!newStepInstruction.trim()}
                className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-sm text-white hover:bg-amber-700 disabled:opacity-50"
              >
                <Plus size={14} /> Add Step
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cook History */}
      <div className="mt-6 rounded-xl border border-gray-800 bg-gray-900 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Cook History</h2>
          <button
            onClick={() => setShowLogModal(true)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-700 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-800"
          >
            <Plus size={14} /> Log a Cook
          </button>
        </div>

        {cookLogs.length === 0 ? (
          <p className="text-sm text-gray-500">No cooks logged yet.</p>
        ) : (
          <div className="space-y-3">
            {cookLogs.map((log) => (
              <div
                key={log.id}
                className="group flex items-start justify-between gap-4 rounded-lg border border-gray-800 bg-gray-800/50 px-4 py-3"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="font-medium text-white">
                      {new Date(log.cooked_on + "T00:00:00").toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    {log.rating && <StarRating rating={log.rating} />}
                    {log.servings_made && (
                      <span className="text-gray-400">{log.servings_made} servings</span>
                    )}
                  </div>
                  {log.notes && (
                    <p className="text-sm italic text-amber-400/80 border-l-2 border-amber-700 pl-2">
                      &ldquo;{log.notes}&rdquo;
                    </p>
                  )}
                </div>
                <button
                  onClick={() => deleteLog(log.id)}
                  className="shrink-0 rounded p-1 text-gray-600 opacity-0 hover:text-red-400 group-hover:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log a Cook Modal */}
      <CookLogModal
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        recipeId={recipeId}
        onSuccess={(created) => {
          setCookLogs((prev) => [created, ...prev]);
          setShowLogModal(false);
        }}
      />

      {/* Shopping Modal */}
      <SendToShoppingModal
        isOpen={showShoppingModal}
        onClose={() => setShowShoppingModal(false)}
        recipeId={recipeId}
        ingredientCount={ingredients.length}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteRecipe}
        onClose={() => setShowDeleteRecipe(false)}
        onConfirm={deleteRecipe}
        itemName={recipe.title}
      />
    </div>
  );
}
