// src/app/habits/AddHabitModal.tsx
"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import BaseFormModal from "@/components/BaseFormModal";
import type { Habit } from "@/types/habits.types";

const CATEGORIES = [
  { value: "oral_care", label: "Oral Care" },
  { value: "beard_care", label: "Beard Care" },
  { value: "hair_care", label: "Hair Care" },
  { value: "shower", label: "Shower" },
  { value: "body_care", label: "Body Care" },
  { value: "supplements", label: "Supplements" },
  { value: "exercise", label: "Exercise" },
  { value: "mindfulness", label: "Mindfulness" },
  { value: "productivity", label: "Productivity" },
  { value: "other", label: "Other" },
];

const PERIODS = [
  { value: "morning", label: "Morning" },
  { value: "midday", label: "Midday" },
  { value: "evening", label: "Evening" },
];

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (habit: Habit) => void;
}

export default function AddHabitModal({ isOpen, onClose, onSuccess }: AddHabitModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    period: "morning",
    unit: "",
    sort_order: "",
    every_n_days: "1",
    target_per_day: "1",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      period: "morning",
      unit: "",
      sort_order: "",
      every_n_days: "1",
      target_per_day: "1",
    });
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: formData.name.trim(),
        category: formData.category || null,
        period: formData.period || null,
        unit: formData.unit.trim() || null,
        sort_order: formData.sort_order ? parseInt(formData.sort_order) : null,
        every_n_days: Math.max(1, parseInt(formData.every_n_days) || 1),
        target_per_day: formData.target_per_day ? parseFloat(formData.target_per_day) : 1,
        is_active: true,
      };

      const response = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add habit");
      }

      const newHabit = await response.json();
      resetForm();
      onSuccess(newHabit);
      onClose();
    } catch (err) {
      console.error("Error adding habit:", err);
      setError(err instanceof Error ? err.message : "Failed to add habit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseFormModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Habit"
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      submitLabel="Add Habit"
      loadingLabel="Adding..."
      submitColor="violet"
      submitIcon={<Plus className="h-4 w-4" />}
    >
      {/* Name */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Habit Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="e.g., Brush teeth"
          required
          disabled={loading}
        />
      </div>

      {/* Category & Period */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={loading}
          >
            <option value="">Select category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Period</label>
          <select
            value={formData.period}
            onChange={(e) => setFormData({ ...formData, period: e.target.value })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={loading}
          >
            {PERIODS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Unit & Target per day */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Unit (optional)</label>
          <input
            type="text"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="e.g., times, minutes"
            disabled={loading}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Target per Day</label>
          <input
            type="number"
            min="1"
            step="1"
            value={formData.target_per_day}
            onChange={(e) => setFormData({ ...formData, target_per_day: e.target.value })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="1"
            disabled={loading}
          />
        </div>
      </div>

      {/* Repeat every N days */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">
          Repeat every (days)
        </label>
        <input
          type="number"
          min="1"
          step="1"
          value={formData.every_n_days}
          onChange={(e) => setFormData({ ...formData, every_n_days: e.target.value })}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="1 = daily, 2 = every other day, 7 = weekly"
          disabled={loading}
        />
        <p className="mt-1 text-xs text-gray-500">
          1 = daily · 2 = every other day · 7 = weekly. Counted from today.
        </p>
      </div>

      {/* Sort Order */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Sort Order (optional)</label>
        <input
          type="number"
          min="0"
          value={formData.sort_order}
          onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Lower numbers appear first"
          disabled={loading}
        />
      </div>
    </BaseFormModal>
  );
}
