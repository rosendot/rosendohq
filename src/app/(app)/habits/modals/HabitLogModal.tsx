// src/app/habits/HabitLogModal.tsx
"use client";

import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import BaseFormModal from "@/components/BaseFormModal";
import type { Habit, HabitLog } from "@/types/habits.types";

const MOOD_OPTIONS = [
  { value: 1, label: "\u{1F62B}", description: "Terrible" },
  { value: 2, label: "\u{1F615}", description: "Bad" },
  { value: 3, label: "\u{1F610}", description: "Okay" },
  { value: 4, label: "\u{1F642}", description: "Good" },
  { value: 5, label: "\u{1F604}", description: "Great" },
];

interface HabitLogModalProps {
  isOpen: boolean;
  habit: Habit | null;
  existingLog: HabitLog | null;
  selectedDate: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function HabitLogModal({
  isOpen,
  habit,
  existingLog,
  selectedDate,
  onClose,
  onSuccess,
}: HabitLogModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    value: "",
    note: "",
    mood: null as number | null,
    time_of_day: "",
  });

  useEffect(() => {
    if (habit) {
      const targetValue = habit.target_per_day || habit.target_value || 1;

      if (existingLog) {
        setFormData({
          value: existingLog.value?.toString() || targetValue.toString(),
          note: existingLog.note || "",
          mood: existingLog.mood,
          time_of_day: existingLog.time_of_day || "",
        });
      } else {
        setFormData({
          value: targetValue.toString(),
          note: "",
          mood: null,
          time_of_day: new Date().toTimeString().slice(0, 5),
        });
      }
      setError(null);
    }
  }, [habit, existingLog]);

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
        habit_id: habit.id,
        log_date: selectedDate,
        value: parseFloat(formData.value) || 1,
        note: formData.note.trim() || null,
        mood: formData.mood,
        time_of_day: formData.time_of_day || null,
      };

      const url = existingLog ? `/api/habits/logs/${existingLog.id}` : "/api/habits/logs";

      const method = existingLog ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save log");
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error saving log:", err);
      setError(err instanceof Error ? err.message : "Failed to save log");
    } finally {
      setLoading(false);
    }
  };

  if (!habit) return null;

  const targetValue = habit.target_per_day || habit.target_value || 1;

  return (
    <BaseFormModal
      isOpen={isOpen}
      onClose={handleClose}
      title={habit.name}
      subtitle={new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      })}
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      submitLabel="Save"
      submitColor="violet"
      submitIcon={<Save className="h-4 w-4" />}
      maxWidth="md"
    >
      {/* Value */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">
          {habit.unit ? `${habit.unit} completed` : "Completed"}
        </label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min="0"
            step="1"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={loading}
          />
          <span className="text-sm text-gray-400">/ {targetValue}</span>
        </div>
      </div>

      {/* Time */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Time (optional)</label>
        <input
          type="time"
          value={formData.time_of_day}
          onChange={(e) => setFormData({ ...formData, time_of_day: e.target.value })}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={loading}
        />
      </div>

      {/* Mood */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">
          How are you feeling? (optional)
        </label>
        <div className="flex gap-2">
          {MOOD_OPTIONS.map((mood) => (
            <button
              key={mood.value}
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  mood: formData.mood === mood.value ? null : mood.value,
                })
              }
              className={`flex-1 rounded-lg py-2 text-xl transition-all ${
                formData.mood === mood.value
                  ? "border-2 border-violet-500 bg-violet-500/30"
                  : "border-2 border-transparent bg-gray-800 hover:bg-gray-700"
              }`}
              title={mood.description}
              disabled={loading}
            >
              {mood.label}
            </button>
          ))}
        </div>
      </div>

      {/* Note */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Note (optional)</label>
        <textarea
          value={formData.note}
          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
          className="w-full resize-none rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Add a note about this session..."
          rows={3}
          disabled={loading}
        />
      </div>
    </BaseFormModal>
  );
}
