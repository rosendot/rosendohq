"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ChefHat,
  Plus,
  Search,
  X,
  Heart,
  Clock,
  Users,
  Star,
  ExternalLink,
  Trash2,
} from "lucide-react";
import type { Recipe, RecipeStatus, RecipeDifficulty } from "@/types/recipes.types";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import AddRecipeModal from "./modals/AddRecipeModal";

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
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function StarRating({ rating }: { rating: number | null }) {
  if (!rating) return null;
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={12}
          className={s <= rating ? "fill-amber-400 text-amber-400" : "text-gray-600"}
        />
      ))}
    </div>
  );
}

interface RecipeWithStats extends Recipe {
  cookCount?: number;
  avgRating?: number | null;
  lastNote?: string | null;
  lastCookedOn?: string | null;
}


export default function RecipesPage() {
  const [recipes, setRecipes] = useState<RecipeWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Recipe | null>(null);

  const fetchRecipes = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (filterCategory) params.set("category", filterCategory);
      if (filterStatus) params.set("status", filterStatus);

      const [recipesRes, statsRes, lastCookedRes] = await Promise.allSettled([
        fetch(`/api/recipes?${params}`),
        fetch("/api/recipes/stats"),
        fetch("/api/recipes/last-cooked"),
      ]);

      const recipesData: Recipe[] =
        recipesRes.status === "fulfilled" && recipesRes.value.ok
          ? await recipesRes.value.json()
          : [];

      // Merge stats and last cooked if available (best-effort)
      setRecipes(recipesData);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setLoading(false);
    }
  }, [search, filterCategory, filterStatus]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const filteredRecipes = recipes.filter((r) => {
    if (filterDifficulty && r.difficulty !== filterDifficulty) return false;
    return true;
  });

  async function toggleFavorite(recipe: Recipe) {
    const updated = { is_favorite: !recipe.is_favorite };
    setRecipes((prev) => prev.map((r) => (r.id === recipe.id ? { ...r, ...updated } : r)));
    await fetch(`/api/recipes/${recipe.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await fetch(`/api/recipes/${deleteTarget.id}`, { method: "DELETE" });
    setRecipes((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  const totalTime = (r: Recipe) =>
    r.prep_minutes || r.cook_minutes
      ? formatTime((r.prep_minutes ?? 0) + (r.cook_minutes ?? 0))
      : null;

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ChefHat className="text-amber-400" size={28} />
          <h1 className="text-2xl font-bold text-white">Recipes</h1>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
        >
          <Plus size={16} />
          Add Recipe
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search recipes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2 pr-3 pl-9 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-white">
              <X size={14} />
            </button>
          )}
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select
          value={filterDifficulty}
          onChange={(e) => setFilterDifficulty(e.target.value)}
          className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
        >
          <option value="">All Difficulties</option>
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Count */}
      <p className="mb-4 text-sm text-gray-400">
        {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? "s" : ""}
      </p>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl bg-gray-900" />
          ))}
        </div>
      ) : filteredRecipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <ChefHat size={48} className="mb-4 opacity-30" />
          <p className="text-lg font-medium">No recipes yet</p>
          <p className="text-sm">Add your first recipe to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="group relative flex flex-col rounded-xl border border-gray-800 bg-gray-900 p-5 transition-colors hover:border-gray-700"
            >
              {/* Card top actions */}
              <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={(e) => { e.preventDefault(); toggleFavorite(recipe); }}
                  className="rounded-lg p-1.5 text-gray-400 hover:text-amber-400"
                >
                  <Heart
                    size={16}
                    className={recipe.is_favorite ? "fill-amber-400 text-amber-400" : ""}
                  />
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); setDeleteTarget(recipe); }}
                  className="rounded-lg p-1.5 text-gray-400 hover:text-red-400"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Favorite indicator when not hovered */}
              {recipe.is_favorite && (
                <Heart
                  size={14}
                  className="absolute top-4 right-4 fill-amber-400 text-amber-400 group-hover:hidden"
                />
              )}

              <Link href={`/recipes/${recipe.id}`} className="flex flex-1 flex-col gap-3">
                {/* Badges */}
                <div className="flex flex-wrap gap-1.5">
                  {recipe.status && (
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[recipe.status]}`}>
                      {STATUSES.find((s) => s.value === recipe.status)?.label}
                    </span>
                  )}
                  {recipe.difficulty && (
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${DIFFICULTY_COLORS[recipe.difficulty]}`}>
                      {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
                    </span>
                  )}
                  {recipe.category && (
                    <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
                      {recipe.category.charAt(0).toUpperCase() + recipe.category.slice(1)}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-base font-semibold text-white leading-snug pr-6">
                  {recipe.title}
                </h3>

                {/* Cuisine */}
                {recipe.cuisine && (
                  <p className="text-xs text-gray-500">{recipe.cuisine}</p>
                )}

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                  {totalTime(recipe) && (
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {totalTime(recipe)}
                    </span>
                  )}
                  {recipe.servings && (
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      {recipe.servings} servings
                    </span>
                  )}
                  {recipe.avgRating && <StarRating rating={recipe.avgRating} />}
                </div>

                {/* Last cook note */}
                {recipe.lastNote && (
                  <p className="text-xs italic text-amber-400/80 border-l-2 border-amber-700 pl-2 line-clamp-2">
                    &ldquo;{recipe.lastNote}&rdquo;
                  </p>
                )}

                {/* Source */}
                {recipe.source_url && (
                  <span className="mt-auto flex items-center gap-1 text-xs text-gray-500">
                    <ExternalLink size={11} />
                    {new URL(recipe.source_url).hostname.replace("www.", "")}
                  </span>
                )}
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Add Recipe Modal */}
      <AddRecipeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={(created) => {
          setRecipes((prev) => [created, ...prev]);
          setShowAddModal(false);
        }}
      />

      <DeleteConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        itemName={deleteTarget?.title}
      />
    </div>
  );
}
