// src/app/habits/AddGoalModal.tsx
"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import BaseFormModal from "@/components/BaseFormModal";
import type { Goal, Habit, GoalProgressSource } from "@/types/habits.types";

const CATEGORIES = [
  { value: "health", label: "Health" },
  { value: "fitness", label: "Fitness" },
  { value: "finance", label: "Finance" },
  { value: "learning", label: "Learning" },
  { value: "career", label: "Career" },
  { value: "personal", label: "Personal" },
  { value: "other", label: "Other" },
];

interface AddGoalModalProps {
  isOpen: boolean;
  habits: Habit[];
  onClose: () => void;
  onSuccess: (goal: Goal) => void;
}

export default function AddGoalModal({ isOpen, habits, onClose, onSuccess }: AddGoalModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    target_value: "",
    unit: "",
    due_date: "",
    started_at: new Date().toISOString().split("T")[0],
    progress_source: "manual" as GoalProgressSource,
    habit_id: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      target_value: "",
      unit: "",
      due_date: "",
      started_at: new Date().toISOString().split("T")[0],
      progress_source: "manual",
      habit_id: "",
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
        target_value: formData.target_value ? parseFloat(formData.target_value) : null,
        current_value: 0,
        unit: formData.unit.trim() || null,
        due_date: formData.due_date || null,
        started_at: formData.started_at || null,
        progress_source: formData.progress_source,
        habit_id:
          formData.progress_source === "habit" && formData.habit_id ? formData.habit_id : null,
        status: "active",
      };

      const response = await fetch("/api/habits/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add goal");
      }

      const newGoal = await response.json();
      resetForm();
      onSuccess(newGoal);
      onClose();
    } catch (err) {
      console.error("Error adding goal:", err);
      setError(err instanceof Error ? err.message : "Failed to add goal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseFormModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Goal"
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      submitLabel="Add Goal"
      loadingLabel="Adding..."
      submitColor="violet"
      submitIcon={<Plus className="h-4 w-4" />}
    >
      {/* Name */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Goal Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="e.g., Read 12 books this year"
          required
          disabled={loading}
        />
      </div>

      {/* Category */}
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

      {/* Target Value & Unit */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Target Value</label>
          <input
            type="number"
            min="0"
            step="any"
            value={formData.target_value}
            onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="e.g., 12"
            disabled={loading}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Unit</label>
          <input
            type="text"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="e.g., books, miles, hours"
            disabled={loading}
          />
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Start Date</label>
          <input
            type="date"
            value={formData.started_at}
            onChange={(e) => setFormData({ ...formData, started_at: e.target.value })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={loading}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Due Date</label>
          <input
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={loading}
          />
        </div>
      </div>

      {/* Progress Source */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">Progress Tracking</label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, progress_source: "manual", habit_id: "" })}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
              formData.progress_source === "manual"
                ? "bg-violet-500 text-white"
                : "bg-gray-700 text-gray-400 hover:bg-gray-600"
            }`}
            disabled={loading}
          >
            Manual
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, progress_source: "habit" })}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
              formData.progress_source === "habit"
                ? "bg-violet-500 text-white"
                : "bg-gray-700 text-gray-400 hover:bg-gray-600"
            }`}
            disabled={loading}
          >
            Link to Habit
          </button>
        </div>
      </div>

      {/* Habit Selection */}
      {formData.progress_source === "habit" && (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Select Habit</label>
          <select
            value={formData.habit_id}
            onChange={(e) => setFormData({ ...formData, habit_id: e.target.value })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={loading}
          >
            <option value="">Select a habit</option>
            {habits.map((habit) => (
              <option key={habit.id} value={habit.id}>
                {habit.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Progress will be automatically tracked from this habit&apos;s completions
          </p>
        </div>
      )}
    </BaseFormModal>
  );
}
