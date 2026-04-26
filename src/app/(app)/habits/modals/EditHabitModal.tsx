// src/app/habits/EditHabitModal.tsx
"use client";

import { useState, useEffect } from "react";
import { Save } from "lucide-react";
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

interface EditHabitModalProps {
  isOpen: boolean;
  habit: Habit | null;
  onClose: () => void;
  onSuccess: (habit: Habit) => void;
}

export default function EditHabitModal({ isOpen, habit, onClose, onSuccess }: EditHabitModalProps) {
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
    is_active: true,
  });

  useEffect(() => {
    if (habit) {
      setFormData({
        name: habit.name || "",
        category: habit.category || "",
        period: habit.period || "morning",
        unit: habit.unit || "",
        sort_order: habit.sort_order?.toString() || "",
        every_n_days: (habit.every_n_days || 1).toString(),
        target_per_day: (habit.target_per_day ?? habit.target_value ?? 1).toString(),
        is_active: habit.is_active ?? true,
      });
      setError(null);
    }
  }, [habit]);

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habit) return;

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
        is_active: formData.is_active,
      };

      const response = await fetch(`/api/habits/${habit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update habit");
      }

      const updatedHabit = await response.json();
      onSuccess(updatedHabit);
      onClose();
    } catch (err) {
      console.error("Error updating habit:", err);
      setError(err instanceof Error ? err.message : "Failed to update habit");
    } finally {
      setLoading(false);
    }
  };

  if (!habit) return null;

  return (
    <BaseFormModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Habit"
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      submitLabel="Save Changes"
      submitColor="violet"
      submitIcon={<Save className="h-4 w-4" />}
    >
      {/* Active Toggle */}
      <div className="flex items-center justify-between rounded-lg bg-gray-800/50 p-3">
        <span className="text-sm font-medium text-gray-300">Active</span>
        <button
          type="button"
          onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
          className={`relative h-6 w-11 rounded-full transition-colors ${
            formData.is_active ? "bg-violet-500" : "bg-gray-600"
          }`}
          disabled={loading}
        >
          <div
            className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
              formData.is_active ? "left-6" : "left-1"
            }`}
          />
        </button>
      </div>

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
          disabled={loading}
        />
        <p className="mt-1 text-xs text-gray-500">
          1 = daily · 2 = every other day · 7 = weekly. Counted from this habit&apos;s anchor date.
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
