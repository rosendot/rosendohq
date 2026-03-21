"use client";

import { useState, useEffect } from "react";
import BaseFormModal from "@/components/BaseFormModal";
import type { HomeMaintenanceTemplate, HomeMaintenanceTemplateInsert } from "@/types/house.types";

interface MaintenanceTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTemplate: HomeMaintenanceTemplate | null;
  propertyId: string | null;
  onSuccess: () => void;
}

const choreCategories = [
  "Cleaning",
  "Laundry",
  "Kitchen",
  "Bathroom",
  "Bedroom",
  "Living Room",
  "Outdoor",
  "Maintenance",
  "Organization",
  "Other",
];

const emptyForm = (propertyId: string | null): HomeMaintenanceTemplateInsert => ({
  property_id: propertyId,
  name: "",
  interval_months: null,
  interval_days: null,
  priority: null,
  estimated_cost_cents: null,
  category: null,
  notes: null,
});

export default function MaintenanceTemplateModal({
  isOpen,
  onClose,
  editingTemplate,
  propertyId,
  onSuccess,
}: MaintenanceTemplateModalProps) {
  const [templateFormData, setTemplateFormData] = useState<HomeMaintenanceTemplateInsert>(
    emptyForm(propertyId),
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editingTemplate) {
        setTemplateFormData({
          property_id: editingTemplate.property_id,
          name: editingTemplate.name,
          interval_months: editingTemplate.interval_months,
          interval_days: editingTemplate.interval_days,
          priority: editingTemplate.priority,
          estimated_cost_cents: editingTemplate.estimated_cost_cents,
          category: editingTemplate.category,
          notes: editingTemplate.notes,
        });
      } else {
        setTemplateFormData(emptyForm(propertyId));
      }
    } else {
      setTemplateFormData(emptyForm(propertyId));
    }
  }, [isOpen, editingTemplate, propertyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateFormData.name.trim()) return;
    setLoading(true);

    try {
      const url = editingTemplate
        ? `/api/house/maintenance/templates/${editingTemplate.id}`
        : "/api/house/maintenance/templates";
      const method = editingTemplate ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(templateFormData),
      });

      if (!response.ok) throw new Error("Failed to save template");

      onClose();
      onSuccess();
    } catch (error) {
      console.error("Error saving template:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseFormModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingTemplate ? "Edit Recurring Chore" : "Add Recurring Chore"}
      onSubmit={handleSubmit}
      loading={loading}
      submitLabel={editingTemplate ? "Update" : "Create"}
      submitDisabled={!templateFormData.name.trim()}
    >
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Chore Name *</label>
        <input
          type="text"
          value={templateFormData.name}
          onChange={(e) => setTemplateFormData({ ...templateFormData, name: e.target.value })}
          required
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          placeholder="e.g., Clean toilet, Vacuum living room"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Category</label>
        <select
          value={templateFormData.category || ""}
          onChange={(e) =>
            setTemplateFormData({ ...templateFormData, category: e.target.value || null })
          }
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
        >
          <option value="">Select category...</option>
          {choreCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">Frequency</label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs text-gray-500">Days</label>
            <select
              value={templateFormData.interval_days || ""}
              onChange={(e) =>
                setTemplateFormData({
                  ...templateFormData,
                  interval_days: e.target.value ? parseInt(e.target.value) : null,
                  interval_months: e.target.value ? null : templateFormData.interval_months,
                })
              }
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select...</option>
              <option value="1">Daily</option>
              <option value="2">Every 2 days</option>
              <option value="3">Every 3 days</option>
              <option value="7">Weekly</option>
              <option value="14">Every 2 weeks</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Months</label>
            <select
              value={templateFormData.interval_months || ""}
              onChange={(e) =>
                setTemplateFormData({
                  ...templateFormData,
                  interval_months: e.target.value ? parseInt(e.target.value) : null,
                  interval_days: e.target.value ? null : templateFormData.interval_days,
                })
              }
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select...</option>
              <option value="1">Monthly</option>
              <option value="2">Every 2 months</option>
              <option value="3">Quarterly</option>
              <option value="6">Every 6 months</option>
              <option value="12">Yearly</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Notes</label>
        <textarea
          value={templateFormData.notes || ""}
          onChange={(e) =>
            setTemplateFormData({ ...templateFormData, notes: e.target.value || null })
          }
          rows={2}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          placeholder="Any additional details..."
        />
      </div>
    </BaseFormModal>
  );
}
