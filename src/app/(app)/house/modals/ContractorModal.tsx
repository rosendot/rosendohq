"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import BaseFormModal from "@/components/BaseFormModal";
import type { HomeContractor, HomeContractorInsert } from "@/types/house.types";

interface ContractorModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingContractor: HomeContractor | null;
  onSuccess: () => void;
}

const specialties = [
  "General",
  "Plumbing",
  "Electrical",
  "HVAC",
  "Roofing",
  "Painting",
  "Landscaping",
  "Cleaning",
  "Pest Control",
  "Appliance Repair",
  "Flooring",
  "Carpentry",
  "Masonry",
  "Pool",
  "Security",
  "Other",
];

const EMPTY_FORM: HomeContractorInsert = {
  name: "",
  company: null,
  specialty: null,
  phone: null,
  email: null,
  website: null,
  address: null,
  rating: null,
  is_preferred: false,
  notes: null,
};

export default function ContractorModal({
  isOpen,
  onClose,
  editingContractor,
  onSuccess,
}: ContractorModalProps) {
  const [formData, setFormData] = useState<HomeContractorInsert>({ ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (editingContractor) {
      setFormData({
        name: editingContractor.name,
        company: editingContractor.company,
        specialty: editingContractor.specialty,
        phone: editingContractor.phone,
        email: editingContractor.email,
        website: editingContractor.website,
        address: editingContractor.address,
        rating: editingContractor.rating,
        is_preferred: editingContractor.is_preferred,
        notes: editingContractor.notes,
      });
    } else {
      setFormData({ ...EMPTY_FORM });
    }
  }, [isOpen, editingContractor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setLoading(true);

    try {
      const url = editingContractor
        ? `/api/house/contractors/${editingContractor.id}`
        : "/api/house/contractors";
      const method = editingContractor ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save contractor");

      onClose();
      onSuccess();
    } catch (error) {
      console.error("Error saving contractor:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseFormModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingContractor ? "Edit Contractor" : "Add Contractor"}
      onSubmit={handleSubmit}
      loading={loading}
      submitLabel={editingContractor ? "Update" : "Create"}
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
          placeholder="e.g., John Smith"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Company</label>
        <input
          type="text"
          value={formData.company || ""}
          onChange={(e) => setFormData({ ...formData, company: e.target.value || null })}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Specialty</label>
        <select
          value={formData.specialty || ""}
          onChange={(e) => setFormData({ ...formData, specialty: e.target.value || null })}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
        >
          <option value="">Select specialty...</option>
          {specialties.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Phone</label>
          <input
            type="tel"
            value={formData.phone || ""}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value || null })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Email</label>
          <input
            type="email"
            value={formData.email || ""}
            onChange={(e) => setFormData({ ...formData, email: e.target.value || null })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Website</label>
        <input
          type="url"
          value={formData.website || ""}
          onChange={(e) => setFormData({ ...formData, website: e.target.value || null })}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          placeholder="https://"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Address</label>
        <input
          type="text"
          value={formData.address || ""}
          onChange={(e) => setFormData({ ...formData, address: e.target.value || null })}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() =>
                setFormData({ ...formData, rating: formData.rating === star ? null : star })
              }
              className="transition-colors"
            >
              <Star
                className={`h-6 w-6 ${
                  formData.rating !== null && star <= formData.rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-600"
                }`}
              />
            </button>
          ))}
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
