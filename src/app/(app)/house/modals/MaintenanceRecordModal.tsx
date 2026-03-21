"use client";

import { useState, useEffect } from "react";
import BaseFormModal from "@/components/BaseFormModal";
import type {
  HomeMaintenanceRecord,
  HomeMaintenanceRecordInsert,
  HomeArea,
  HomeMaintenanceStatus,
} from "@/types/house.types";

interface MaintenanceRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingRecord: HomeMaintenanceRecord | null;
  areas: HomeArea[];
  propertyId: string | null;
  onSuccess: () => void;
  initialData?: Partial<HomeMaintenanceRecordInsert>;
}

const emptyForm = (propertyId: string | null): HomeMaintenanceRecordInsert => ({
  property_id: propertyId || "",
  template_id: null,
  area_id: null,
  appliance_id: null,
  contractor_id: null,
  project_id: null,
  item: "",
  service_date: new Date().toISOString().split("T")[0],
  cost_cents: null,
  vendor: null,
  status: "pending",
  is_diy: true,
  notes: null,
});

export default function MaintenanceRecordModal({
  isOpen,
  onClose,
  editingRecord,
  areas,
  propertyId,
  onSuccess,
  initialData,
}: MaintenanceRecordModalProps) {
  const [formData, setFormData] = useState<HomeMaintenanceRecordInsert>(emptyForm(propertyId));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({ ...emptyForm(propertyId), ...initialData });
      } else if (editingRecord) {
        setFormData({
          property_id: editingRecord.property_id,
          template_id: editingRecord.template_id,
          area_id: editingRecord.area_id,
          appliance_id: editingRecord.appliance_id,
          contractor_id: editingRecord.contractor_id,
          project_id: editingRecord.project_id,
          item: editingRecord.item,
          service_date: editingRecord.service_date,
          cost_cents: editingRecord.cost_cents,
          vendor: editingRecord.vendor,
          status: editingRecord.status,
          is_diy: editingRecord.is_diy,
          notes: editingRecord.notes,
        });
      } else {
        setFormData(emptyForm(propertyId));
      }
    } else {
      setFormData(emptyForm(propertyId));
    }
  }, [isOpen, editingRecord, initialData, propertyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.item.trim()) return;
    setLoading(true);

    try {
      const url = editingRecord
        ? `/api/house/maintenance/records/${editingRecord.id}`
        : "/api/house/maintenance/records";
      const method = editingRecord ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save record");

      onClose();
      onSuccess();
    } catch (error) {
      console.error("Error saving maintenance record:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseFormModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingRecord ? "Edit Task" : "Add Task"}
      onSubmit={handleSubmit}
      loading={loading}
      submitLabel={editingRecord ? "Update" : "Create"}
      submitDisabled={!formData.item.trim()}
    >
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Task Name *</label>
        <input
          type="text"
          value={formData.item}
          onChange={(e) => setFormData({ ...formData, item: e.target.value })}
          required
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          placeholder="e.g., Clean bathroom, Take out trash"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Room</label>
          <select
            value={formData.area_id || ""}
            onChange={(e) => setFormData({ ...formData, area_id: e.target.value || null })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="">Select room...</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Due Date</label>
          <input
            type="date"
            value={formData.service_date || ""}
            onChange={(e) => setFormData({ ...formData, service_date: e.target.value || "" })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Status</label>
        <select
          value={formData.status || "pending"}
          onChange={(e) =>
            setFormData({
              ...formData,
              status: e.target.value as HomeMaintenanceStatus,
            })
          }
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
        >
          <option value="pending">Pending</option>
          <option value="scheduled">Scheduled</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="skipped">Skipped</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Notes</label>
        <textarea
          value={formData.notes || ""}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value || null })}
          rows={2}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          placeholder="Any additional details..."
        />
      </div>
    </BaseFormModal>
  );
}
