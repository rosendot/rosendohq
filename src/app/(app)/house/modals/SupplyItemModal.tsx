"use client";

import { useState, useEffect } from "react";
import BaseFormModal from "@/components/BaseFormModal";
import type { HomeSupplyItemInsert } from "@/types/house.types";

interface SupplyItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const emptyForm = (): HomeSupplyItemInsert => ({
  name: "",
  category: null,
  unit: null,
  notes: null,
});

export default function SupplyItemModal({ isOpen, onClose, onSuccess }: SupplyItemModalProps) {
  const [formData, setFormData] = useState<HomeSupplyItemInsert>(emptyForm());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(emptyForm());
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setLoading(true);

    try {
      const response = await fetch("/api/house/supplies/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to create item");

      onClose();
      onSuccess();
    } catch (error) {
      console.error("Error creating item:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseFormModal
      isOpen={isOpen}
      onClose={onClose}
      title="New Supply Item"
      onSubmit={handleSubmit}
      loading={loading}
      submitLabel="Create"
      loadingLabel="Creating..."
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
          placeholder="Item name"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Category</label>
        <select
          value={formData.category || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              category: e.target.value || null,
            })
          }
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
        >
          <option value="">Select category...</option>
          <option value="cleaning">Cleaning</option>
          <option value="kitchen">Kitchen</option>
          <option value="bathroom">Bathroom</option>
          <option value="laundry">Laundry</option>
          <option value="tools">Tools</option>
          <option value="outdoor">Outdoor</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Unit</label>
          <input
            type="text"
            value={formData.unit || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                unit: e.target.value || null,
              })
            }
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            placeholder="e.g., rolls, bottles"
          />
        </div>
      </div>
    </BaseFormModal>
  );
}
