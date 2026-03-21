"use client";

import { useState, useEffect } from "react";
import BaseFormModal from "@/components/BaseFormModal";
import type { HomeProject, HomeProjectTaskInsert } from "@/types/house.types";

interface ProjectTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: HomeProject | null;
  onSuccess: (projectId: string) => void;
}

const EMPTY_FORM: HomeProjectTaskInsert = {
  project_id: "",
  name: "",
  description: null,
  status: "pending",
  sort_order: 0,
  estimated_cost_cents: null,
  actual_cost_cents: null,
  due_date: null,
  completed_date: null,
  assigned_to: null,
  notes: null,
};

export default function ProjectTaskModal({
  isOpen,
  onClose,
  project,
  onSuccess,
}: ProjectTaskModalProps) {
  const [taskFormData, setTaskFormData] = useState<HomeProjectTaskInsert>({ ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setTaskFormData({
      ...EMPTY_FORM,
      project_id: project?.id || "",
    });
  }, [isOpen, project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskFormData.name.trim() || !project) return;
    setLoading(true);

    try {
      const response = await fetch(`/api/house/projects/${project.id}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskFormData),
      });

      if (!response.ok) throw new Error("Failed to create task");

      onClose();
      onSuccess(project.id);
    } catch (error) {
      console.error("Error creating task:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseFormModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Task to ${project?.name ?? ""}`}
      onSubmit={handleSubmit}
      loading={loading}
      submitLabel="Add Task"
      loadingLabel="Adding..."
      submitDisabled={!taskFormData.name.trim()}
      maxWidth="md"
    >
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Task Name *</label>
        <input
          type="text"
          value={taskFormData.name}
          onChange={(e) => setTaskFormData({ ...taskFormData, name: e.target.value })}
          required
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          placeholder="Task name"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Description</label>
        <textarea
          value={taskFormData.description || ""}
          onChange={(e) =>
            setTaskFormData({
              ...taskFormData,
              description: e.target.value || null,
            })
          }
          rows={2}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Due Date</label>
        <input
          type="date"
          value={taskFormData.due_date || ""}
          onChange={(e) =>
            setTaskFormData({
              ...taskFormData,
              due_date: e.target.value || null,
            })
          }
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
        />
      </div>
    </BaseFormModal>
  );
}
