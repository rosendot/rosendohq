"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import BaseFormModal from "@/components/BaseFormModal";
import type { RecipeCookLog } from "@/types/recipes.types";

interface CookLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipeId: string;
  onSuccess: (log: RecipeCookLog) => void;
}

export default function CookLogModal({ isOpen, onClose, recipeId, onSuccess }: CookLogModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    cooked_on: new Date().toISOString().split("T")[0],
    rating: null as number | null,
    servings_made: null as number | null,
    notes: "",
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        cooked_on: new Date().toISOString().split("T")[0],
        rating: null,
        servings_made: null,
        notes: "",
      });
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        recipe_id: recipeId,
        cooked_on: formData.cooked_on,
        rating: formData.rating,
        servings_made: formData.servings_made,
        notes: formData.notes.trim() || null,
        linked_meal_id: null,
      };

      const response = await fetch(`/api/recipes/${recipeId}/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save cook log");
      }

      const created = await response.json();
      onSuccess(created);
      onClose();
    } catch (err) {
      console.error("Error saving cook log:", err);
      setError(err instanceof Error ? err.message : "Failed to save cook log");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseFormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Log a Cook"
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      submitLabel="Save Log"
      submitColor="amber"
      submitDisabled={!formData.cooked_on}
      maxWidth="md"
    >
      {/* Date */}
      <div>
        <label className="mb-1.5 block text-sm text-gray-300">Date</label>
        <input
          type="date"
          value={formData.cooked_on}
          onChange={(e) => setFormData({ ...formData, cooked_on: e.target.value })}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
          disabled={loading}
        />
      </div>

      {/* Rating */}
      <div>
        <label className="mb-1.5 block text-sm text-gray-300">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() =>
                setFormData({ ...formData, rating: formData.rating === star ? null : star })
              }
              className="rounded p-1 transition-colors hover:bg-gray-700"
              disabled={loading}
            >
              <Star
                className={`h-6 w-6 ${
                  formData.rating !== null && star <= formData.rating
                    ? "fill-amber-400 text-amber-400"
                    : "text-gray-600"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Servings Made */}
      <div>
        <label className="mb-1.5 block text-sm text-gray-300">Servings Made</label>
        <input
          type="number"
          min="1"
          value={formData.servings_made ?? ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              servings_made: e.target.value ? parseInt(e.target.value) : null,
            })
          }
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
          disabled={loading}
        />
      </div>

      {/* Notes */}
      <div>
        <label className="mb-1.5 block text-sm text-gray-300">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full resize-none rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
          placeholder="Add more onion powder next time..."
          rows={3}
          disabled={loading}
        />
      </div>
    </BaseFormModal>
  );
}
