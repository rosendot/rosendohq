// src/app/habits/AddHabitModal.tsx
"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import BaseFormModal from "@/components/BaseFormModal";
import type { Habit, HabitSchedule } from "@/types/habits.types";

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

const TIME_OF_DAY = [
  { value: "morning", label: "Morning" },
  { value: "midday", label: "Midday" },
  { value: "evening", label: "Evening" },
];

const DAYS_OF_WEEK = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 7, label: "Sun" },
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
    time_of_day: "morning",
    unit: "",
    target_value: "",
    sort_order: "",
    schedule_days: [1, 2, 3, 4, 5, 6, 7] as number[],
    target_per_day: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      time_of_day: "morning",
      unit: "",
      target_value: "",
      sort_order: "",
      schedule_days: [1, 2, 3, 4, 5, 6, 7],
      target_per_day: "",
    });
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const toggleDay = (day: number) => {
    setFormData((prev) => ({
      ...prev,
      schedule_days: prev.schedule_days.includes(day)
        ? prev.schedule_days.filter((d) => d !== day)
        : [...prev.schedule_days, day].sort((a, b) => a - b),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const schedule: HabitSchedule = {
        days: formData.schedule_days,
        target_per_day: formData.target_per_day ? parseFloat(formData.target_per_day) : null,
      };

      const payload = {
        name: formData.name.trim(),
        category: formData.category || null,
        time_of_day: formData.time_of_day || null,
        unit: formData.unit.trim() || null,
        target_value: formData.target_value ? parseFloat(formData.target_value) : null,
        sort_order: formData.sort_order ? parseInt(formData.sort_order) : null,
        schedule,
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

      {/* Category & Time of Day */}
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
          <label className="mb-1 block text-sm font-medium text-gray-300">Time of Day</label>
          <select
            value={formData.time_of_day}
            onChange={(e) => setFormData({ ...formData, time_of_day: e.target.value })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={loading}
          >
            {TIME_OF_DAY.map((time) => (
              <option key={time.value} value={time.value}>
                {time.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Unit & Target Value */}
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

      {/* Schedule Days */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">
          Schedule (days of week)
        </label>
        <div className="flex gap-2">
          {DAYS_OF_WEEK.map((day) => (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleDay(day.value)}
              className={`flex-1 rounded py-2 text-xs font-medium transition-all ${
                formData.schedule_days.includes(day.value)
                  ? "bg-violet-500 text-white"
                  : "bg-gray-700 text-gray-400 hover:bg-gray-600"
              }`}
              disabled={loading}
            >
              {day.label}
            </button>
          ))}
        </div>
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
