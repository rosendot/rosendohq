"use client";

import { useState, useEffect } from "react";
import BaseFormModal from "@/components/BaseFormModal";
import type { HomeArea, HomeAreaInsert } from "@/types/house.types";

interface AreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingArea: HomeArea | null;
  propertyId: string | null;
  onSuccess: () => void;
}

const areaTypes = [
  "bedroom",
  "bathroom",
  "kitchen",
  "living_room",
  "dining_room",
  "office",
  "garage",
  "basement",
  "attic",
  "laundry",
  "closet",
  "hallway",
  "patio",
  "deck",
  "yard",
  "other",
];

const emptyForm = (propertyId: string | null): HomeAreaInsert => ({
  property_id: propertyId || "",
  name: "",
  type: null,
  notes: null,
});

export default function AreaModal({
  isOpen,
  onClose,
  editingArea,
  propertyId,
  onSuccess,
}: AreaModalProps) {
  const [formData, setFormData] = useState<HomeAreaInsert>(emptyForm(propertyId));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editingArea) {
        setFormData({
          property_id: editingArea.property_id,
          name: editingArea.name,
          type: editingArea.type,
          notes: editingArea.notes,
        });
      } else {
        setFormData(emptyForm(propertyId));
      }
    }
  }, [isOpen, editingArea, propertyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setLoading(true);

    try {
      const url = editingArea ? `/api/house/areas/${editingArea.id}` : "/api/house/areas";
      const method = editingArea ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save area");

      onClose();
      onSuccess();
    } catch (error) {
      console.error("Error saving area:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseFormModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingArea ? "Edit Area" : "Add Area"}
      onSubmit={handleSubmit}
      loading={loading}
      submitLabel={editingArea ? "Update" : "Create"}
      submitDisabled={!formData.name.trim()}
      maxWidth="md"
    >
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          placeholder="e.g., Master Bedroom"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Type</label>
        <select
          value={formData.type || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              type: e.target.value || null,
            })
          }
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
        >
          <option value="">Select type...</option>
          {areaTypes.map((type) => (
            <option key={type} value={type}>
              {type.replace("_", " ")}
            </option>
          ))}
        </select>
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
