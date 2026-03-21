"use client";

import { useState, useEffect } from "react";
import BaseFormModal from "@/components/BaseFormModal";
import type { HomeAppliance, HomeApplianceInsert, HomeArea } from "@/types/house.types";

interface ApplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingAppliance: HomeAppliance | null;
  areas: HomeArea[];
  propertyId: string | null;
  onSuccess: () => void;
}

const EMPTY_FORM: HomeApplianceInsert = {
  property_id: "",
  area_id: null,
  name: "",
  manufacturer: null,
  model: null,
  serial_number: null,
  purchase_date: null,
  purchase_price_cents: null,
  warranty_months: null,
  notes: null,
};

export default function ApplianceModal({
  isOpen,
  onClose,
  editingAppliance,
  areas,
  propertyId,
  onSuccess,
}: ApplianceModalProps) {
  const [formData, setFormData] = useState<HomeApplianceInsert>({ ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (editingAppliance) {
      setFormData({
        property_id: editingAppliance.property_id,
        area_id: editingAppliance.area_id,
        name: editingAppliance.name,
        manufacturer: editingAppliance.manufacturer,
        model: editingAppliance.model,
        serial_number: editingAppliance.serial_number,
        purchase_date: editingAppliance.purchase_date,
        purchase_price_cents: editingAppliance.purchase_price_cents,
        warranty_months: editingAppliance.warranty_months,
        notes: editingAppliance.notes,
      });
    } else {
      setFormData({ ...EMPTY_FORM, property_id: propertyId || "" });
    }
  }, [isOpen, editingAppliance, propertyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setLoading(true);

    try {
      const url = editingAppliance
        ? `/api/house/appliances/${editingAppliance.id}`
        : "/api/house/appliances";
      const method = editingAppliance ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save appliance");

      onClose();
      onSuccess();
    } catch (error) {
      console.error("Error saving appliance:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseFormModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingAppliance ? "Edit Appliance" : "Add Appliance"}
      onSubmit={handleSubmit}
      loading={loading}
      submitLabel={editingAppliance ? "Update" : "Create"}
      submitDisabled={!formData.name.trim()}
    >
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          placeholder="e.g., Refrigerator"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Area</label>
        <select
          value={formData.area_id || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              area_id: e.target.value || null,
            })
          }
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
        >
          <option value="">Select area...</option>
          {areas.map((area) => (
            <option key={area.id} value={area.id}>
              {area.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Manufacturer</label>
          <input
            type="text"
            value={formData.manufacturer || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                manufacturer: e.target.value || null,
              })
            }
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Model</label>
          <input
            type="text"
            value={formData.model || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                model: e.target.value || null,
              })
            }
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Serial Number</label>
        <input
          type="text"
          value={formData.serial_number || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              serial_number: e.target.value || null,
            })
          }
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Purchase Date</label>
          <input
            type="date"
            value={formData.purchase_date || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                purchase_date: e.target.value || null,
              })
            }
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Price ($)</label>
          <input
            type="number"
            step="0.01"
            value={formData.purchase_price_cents ? formData.purchase_price_cents / 100 : ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                purchase_price_cents: e.target.value
                  ? Math.round(parseFloat(e.target.value) * 100)
                  : null,
              })
            }
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            placeholder="0.00"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Warranty (months)</label>
        <input
          type="number"
          value={formData.warranty_months || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              warranty_months: e.target.value ? parseInt(e.target.value) : null,
            })
          }
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          placeholder="e.g., 12"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Notes</label>
        <textarea
          value={formData.notes || ""}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value || null })}
          rows={2}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
        />
      </div>
    </BaseFormModal>
  );
}
