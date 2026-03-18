// src/app/habits/EditGoalModal.tsx
"use client";

import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import BaseFormModal from "@/components/BaseFormModal";
import type { Goal, Habit, GoalStatus, GoalProgressSource } from "@/types/habits.types";

const CATEGORIES = [
  { value: "health", label: "Health" },
  { value: "fitness", label: "Fitness" },
  { value: "finance", label: "Finance" },
  { value: "learning", label: "Learning" },
  { value: "career", label: "Career" },
  { value: "personal", label: "Personal" },
  { value: "other", label: "Other" },
];

const STATUSES: { value: GoalStatus; label: string; color: string }[] = [
  { value: "active", label: "Active", color: "bg-blue-500" },
  { value: "completed", label: "Completed", color: "bg-green-500" },
  { value: "on_hold", label: "On Hold", color: "bg-yellow-500" },
  { value: "abandoned", label: "Abandoned", color: "bg-red-500" },
];

interface EditGoalModalProps {
  isOpen: boolean;
  goal: Goal | null;
  habits: Habit[];
  onClose: () => void;
  onSuccess: (goal: Goal) => void;
}

export default function EditGoalModal({
  isOpen,
  goal,
  habits,
  onClose,
  onSuccess,
}: EditGoalModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    target_value: "",
    current_value: "",
    unit: "",
    due_date: "",
    started_at: "",
    status: "active" as GoalStatus,
    progress_source: "manual" as GoalProgressSource,
    habit_id: "",
  });

  useEffect(() => {
    if (goal) {
      setFormData({
        name: goal.name || "",
        category: goal.category || "",
        target_value: goal.target_value?.toString() || "",
        current_value: goal.current_value?.toString() || "0",
        unit: goal.unit || "",
        due_date: goal.due_date ? goal.due_date.split("T")[0] : "",
        started_at: goal.started_at ? goal.started_at.split("T")[0] : "",
        status: goal.status || "active",
        progress_source: goal.progress_source || "manual",
        habit_id: goal.habit_id || "",
      });
      setError(null);
    }
  }, [goal]);

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal) return;

    setLoading(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = {
        name: formData.name.trim(),
        category: formData.category || null,
        target_value: formData.target_value ? parseFloat(formData.target_value) : null,
        current_value: formData.current_value ? parseFloat(formData.current_value) : 0,
        unit: formData.unit.trim() || null,
        due_date: formData.due_date || null,
        started_at: formData.started_at || null,
        status: formData.status,
        progress_source: formData.progress_source,
        habit_id:
          formData.progress_source === "habit" && formData.habit_id ? formData.habit_id : null,
      };

      if (formData.status === "completed" && goal.status !== "completed") {
        payload.completed_at = new Date().toISOString();
      } else if (formData.status !== "completed") {
        payload.completed_at = null;
      }

      const response = await fetch(`/api/habits/goals/${goal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update goal");
      }

      const updatedGoal = await response.json();
      onSuccess(updatedGoal);
      onClose();
    } catch (err) {
      console.error("Error updating goal:", err);
      setError(err instanceof Error ? err.message : "Failed to update goal");
    } finally {
      setLoading(false);
    }
  };

  if (!goal) return null;

  return (
    <BaseFormModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Goal"
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      submitLabel="Save Changes"
      submitColor="violet"
      submitIcon={<Save className="h-4 w-4" />}
    >
      {/* Status */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">Status</label>
        <div className="grid grid-cols-4 gap-2">
          {STATUSES.map((status) => (
            <button
              key={status.value}
              type="button"
              onClick={() => setFormData({ ...formData, status: status.value })}
              className={`rounded-lg px-2 py-2 text-xs font-medium transition-all ${
                formData.status === status.value
                  ? `${status.color} text-white`
                  : "bg-gray-700 text-gray-400 hover:bg-gray-600"
              }`}
              disabled={loading}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

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

      {/* Progress */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Current</label>
          <input
            type="number"
            min="0"
            step="any"
            value={formData.current_value}
            onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={loading || formData.progress_source === "habit"}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Target</label>
          <input
            type="number"
            min="0"
            step="any"
            value={formData.target_value}
            onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
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
            placeholder="e.g., books"
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
        </div>
      )}
    </BaseFormModal>
  );
}
