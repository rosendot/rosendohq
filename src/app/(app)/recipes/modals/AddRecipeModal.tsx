"use client";

import { useState, useEffect } from "react";
import BaseFormModal from "@/components/BaseFormModal";
import type { Recipe, RecipeInsert, RecipeStatus, RecipeDifficulty } from "@/types/recipes.types";

const CATEGORIES = ["breakfast", "lunch", "dinner", "snack", "dessert", "sauce", "marinade", "other"];
const DIFFICULTIES: RecipeDifficulty[] = ["easy", "medium", "hard"];
const STATUSES: { value: RecipeStatus; label: string }[] = [
  { value: "want_to_try", label: "Want to Try" },
  { value: "tried", label: "Tried" },
  { value: "regular_rotation", label: "Regular Rotation" },
];

interface AddRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (recipe: Recipe) => void;
}

const INITIAL_FORM: RecipeInsert = {
  title: "",
  description: null,
  category: null,
  cuisine: null,
  servings: null,
  prep_minutes: null,
  cook_minutes: null,
  difficulty: null,
  source_url: null,
  notes: null,
  is_favorite: false,
  status: "want_to_try",
};

export default function AddRecipeModal({ isOpen, onClose, onSuccess }: AddRecipeModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<RecipeInsert>({ ...INITIAL_FORM });

  useEffect(() => {
    if (isOpen) {
      setFormData({ ...INITIAL_FORM });
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: RecipeInsert = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description?.trim() || null,
        cuisine: formData.cuisine?.trim() || null,
        source_url: formData.source_url?.trim() || null,
        notes: formData.notes?.trim() || null,
      };

      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create recipe");
      }

      const created = await response.json();
      onSuccess(created);
      onClose();
    } catch (err) {
      console.error("Error creating recipe:", err);
      setError(err instanceof Error ? err.message : "Failed to create recipe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseFormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Recipe"
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      submitLabel="Create Recipe"
      loadingLabel="Creating..."
      submitColor="amber"
      submitDisabled={!formData.title.trim()}
    >
      {/* Title */}
      <div>
        <label className="mb-1.5 block text-sm text-gray-300">Title *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
          placeholder="Burrito Bowl Meal Prep"
          required
          autoFocus
          disabled={loading}
        />
      </div>

      {/* Category + Difficulty */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm text-gray-300">Category</label>
          <select
            value={formData.category || ""}
            onChange={(e) => setFormData({ ...formData, category: e.target.value || null })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            disabled={loading}
          >
            <option value="">None</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-gray-300">Difficulty</label>
          <select
            value={formData.difficulty || ""}
            onChange={(e) =>
              setFormData({ ...formData, difficulty: (e.target.value as RecipeDifficulty) || null })
            }
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            disabled={loading}
          >
            <option value="">None</option>
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Servings + Prep + Cook */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="mb-1.5 block text-sm text-gray-300">Servings</label>
          <input
            type="number"
            min="1"
            value={formData.servings ?? ""}
            onChange={(e) =>
              setFormData({ ...formData, servings: e.target.value ? parseInt(e.target.value) : null })
            }
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
            disabled={loading}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-gray-300">Prep (min)</label>
          <input
            type="number"
            min="0"
            value={formData.prep_minutes ?? ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                prep_minutes: e.target.value ? parseInt(e.target.value) : null,
              })
            }
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
            disabled={loading}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-gray-300">Cook (min)</label>
          <input
            type="number"
            min="0"
            value={formData.cook_minutes ?? ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                cook_minutes: e.target.value ? parseInt(e.target.value) : null,
              })
            }
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
            disabled={loading}
          />
        </div>
      </div>

      {/* Cuisine + Status */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm text-gray-300">Cuisine</label>
          <input
            type="text"
            value={formData.cuisine || ""}
            onChange={(e) => setFormData({ ...formData, cuisine: e.target.value || null })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
            placeholder="Mexican, Italian..."
            disabled={loading}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-gray-300">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as RecipeStatus })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            disabled={loading}
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Source URL */}
      <div>
        <label className="mb-1.5 block text-sm text-gray-300">Source URL</label>
        <input
          type="url"
          value={formData.source_url || ""}
          onChange={(e) => setFormData({ ...formData, source_url: e.target.value || null })}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
          placeholder="https://..."
          disabled={loading}
        />
      </div>

      {/* Description */}
      <div>
        <label className="mb-1.5 block text-sm text-gray-300">Description</label>
        <textarea
          value={formData.description || ""}
          onChange={(e) => setFormData({ ...formData, description: e.target.value || null })}
          className="w-full resize-none rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
          placeholder="Brief description..."
          rows={2}
          disabled={loading}
        />
      </div>
    </BaseFormModal>
  );
}
