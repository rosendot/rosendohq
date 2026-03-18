// src/app/habits/EditHabitModal.tsx
"use client";

import { useState, useEffect } from "react";
import { Save } from "lucide-react";
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
    time_of_day: "morning",
    unit: "",
    target_value: "",
    sort_order: "",
    schedule_days: [1, 2, 3, 4, 5, 6, 7] as number[],
    target_per_day: "",
    is_active: true,
  });

  useEffect(() => {
    if (habit) {
      const schedule = habit.schedule as HabitSchedule | null;
      setFormData({
        name: habit.name || "",
        category: habit.category || "",
        time_of_day: habit.time_of_day || "morning",
        unit: habit.unit || "",
        target_value: habit.target_value?.toString() || "",
        sort_order: habit.sort_order?.toString() || "",
        schedule_days: schedule?.days || [1, 2, 3, 4, 5, 6, 7],
        target_per_day: schedule?.target_per_day?.toString() || "",
        is_active: habit.is_active ?? true,
      });
      setError(null);
    }
  }, [habit]);

  const handleClose = () => {
    setError(null);
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
    if (!habit) return;

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
