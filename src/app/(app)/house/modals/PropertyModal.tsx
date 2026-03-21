"use client";

import { useState, useEffect } from "react";
import BaseFormModal from "@/components/BaseFormModal";
import type { HomePropertyInsert } from "@/types/house.types";

interface PropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const emptyForm: HomePropertyInsert = {
  name: "",
  address1: null,
  address2: null,
  city: null,
  state: null,
  postal_code: null,
  country: null,
  notes: null,
};

export default function PropertyModal({ isOpen, onClose, onSuccess }: PropertyModalProps) {
  const [formData, setFormData] = useState<HomePropertyInsert>(emptyForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) setFormData(emptyForm);
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setLoading(true);

    try {
      const response = await fetch("/api/house/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Failed to create property");
      onClose();
      onSuccess();
    } catch (err) {
      console.error("Error creating property:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseFormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Property"
      onSubmit={handleSubmit}
      loading={loading}
      submitLabel="Create Property"
      loadingLabel="Creating..."
      submitDisabled={!formData.name.trim()}
    >
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Property Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          placeholder="e.g., Main House"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Address Line 1</label>
        <input
          type="text"
          value={formData.address1 || ""}
          onChange={(e) => setFormData({ ...formData, address1: e.target.value || null })}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Address Line 2</label>
        <input
          type="text"
          value={formData.address2 || ""}
          onChange={(e) => setFormData({ ...formData, address2: e.target.value || null })}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          placeholder="Apt, Suite, etc."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">City</label>
          <input
            type="text"
            value={formData.city || ""}
            onChange={(e) => setFormData({ ...formData, city: e.target.value || null })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">State</label>
          <input
            type="text"
            value={formData.state || ""}
            onChange={(e) => setFormData({ ...formData, state: e.target.value || null })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Postal Code</label>
          <input
            type="text"
            value={formData.postal_code || ""}
            onChange={(e) => setFormData({ ...formData, postal_code: e.target.value || null })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Country</label>
          <input
            type="text"
            value={formData.country || ""}
            onChange={(e) => setFormData({ ...formData, country: e.target.value || null })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          />
        </div>
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
