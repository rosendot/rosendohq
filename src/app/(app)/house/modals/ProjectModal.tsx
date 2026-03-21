"use client";

import { useState, useEffect } from "react";
import BaseFormModal from "@/components/BaseFormModal";
import type {
  HomeProject,
  HomeProjectInsert,
  HomeProjectStatus,
  HomeArea,
  HomeContractor,
} from "@/types/house.types";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProject: HomeProject | null;
  areas: HomeArea[];
  contractors: HomeContractor[];
  propertyId: string | null;
  onSuccess: () => void;
}

const EMPTY_FORM: HomeProjectInsert = {
  property_id: "",
  name: "",
  description: null,
  status: "planning",
  priority: null,
  category: null,
  estimated_cost_cents: null,
  area_id: null,
  contractor_id: null,
  budget_cents: null,
  actual_cost_cents: null,
  start_date: null,
  target_end_date: null,
  actual_end_date: null,
  notes: null,
};

export default function ProjectModal({
  isOpen,
  onClose,
  editingProject,
  areas,
  contractors,
  propertyId,
  onSuccess,
}: ProjectModalProps) {
  const [projectFormData, setProjectFormData] = useState<HomeProjectInsert>({ ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (editingProject) {
      setProjectFormData({
        property_id: editingProject.property_id,
        name: editingProject.name,
        description: editingProject.description,
        status: editingProject.status,
        priority: editingProject.priority,
        category: editingProject.category,
        estimated_cost_cents: editingProject.estimated_cost_cents,
        area_id: editingProject.area_id,
        contractor_id: editingProject.contractor_id,
        budget_cents: editingProject.budget_cents,
        actual_cost_cents: editingProject.actual_cost_cents,
        start_date: editingProject.start_date,
        target_end_date: editingProject.target_end_date,
        actual_end_date: editingProject.actual_end_date,
        notes: editingProject.notes,
      });
    } else {
      setProjectFormData({ ...EMPTY_FORM, property_id: propertyId || "" });
    }
  }, [isOpen, editingProject, propertyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectFormData.name.trim()) return;
    setLoading(true);

    try {
      const url = editingProject
        ? `/api/house/projects/${editingProject.id}`
        : "/api/house/projects";
      const method = editingProject ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectFormData),
      });

      if (!response.ok) throw new Error("Failed to save project");

      onClose();
      onSuccess();
    } catch (error) {
      console.error("Error saving project:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseFormModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingProject ? "Edit Project" : "New Project"}
      onSubmit={handleSubmit}
      loading={loading}
      submitLabel={editingProject ? "Update" : "Create"}
      submitDisabled={!projectFormData.name.trim()}
    >
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Name *</label>
        <input
          type="text"
          value={projectFormData.name}
          onChange={(e) => setProjectFormData({ ...projectFormData, name: e.target.value })}
          required
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          placeholder="Project name"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Description</label>
        <textarea
          value={projectFormData.description || ""}
          onChange={(e) =>
            setProjectFormData({
              ...projectFormData,
              description: e.target.value || null,
            })
          }
          rows={2}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Status</label>
          <select
            value={projectFormData.status || "planning"}
            onChange={(e) =>
              setProjectFormData({
                ...projectFormData,
                status: e.target.value as HomeProjectStatus,
              })
            }
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="planning">Planning</option>
            <option value="budgeting">Budgeting</option>
            <option value="in_progress">In Progress</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Priority</label>
          <select
            value={projectFormData.priority || ""}
            onChange={(e) =>
              setProjectFormData({
                ...projectFormData,
                priority: e.target.value ? parseInt(e.target.value) : null,
              })
            }
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="">None</option>
            <option value="1">1 - Low</option>
            <option value="2">2</option>
            <option value="3">3 - Medium</option>
            <option value="4">4</option>
            <option value="5">5 - High</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Area</label>
          <select
            value={projectFormData.area_id || ""}
            onChange={(e) =>
              setProjectFormData({
                ...projectFormData,
                area_id: e.target.value || null,
              })
            }
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="">Select area...</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Contractor</label>
          <select
            value={projectFormData.contractor_id || ""}
            onChange={(e) =>
              setProjectFormData({
                ...projectFormData,
                contractor_id: e.target.value || null,
              })
            }
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="">Select contractor...</option>
            {contractors.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Budget ($)</label>
        <input
          type="number"
          step="0.01"
          value={projectFormData.budget_cents ? projectFormData.budget_cents / 100 : ""}
          onChange={(e) =>
            setProjectFormData({
              ...projectFormData,
              budget_cents: e.target.value
                ? Math.round(parseFloat(e.target.value) * 100)
                : null,
            })
          }
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          placeholder="0.00"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Start Date</label>
          <input
            type="date"
            value={projectFormData.start_date || ""}
            onChange={(e) =>
              setProjectFormData({
                ...projectFormData,
                start_date: e.target.value || null,
              })
            }
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Target End Date</label>
          <input
            type="date"
            value={projectFormData.target_end_date || ""}
            onChange={(e) =>
              setProjectFormData({
                ...projectFormData,
                target_end_date: e.target.value || null,
              })
            }
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>
    </BaseFormModal>
  );
}
