"use client";

import { useState, useEffect } from "react";
import type { InventoryItem } from "@/types/inventory.types";
import BaseFormModal from "@/components/BaseFormModal";

const CATEGORIES = [
  "Electronics",
  "Furniture",
  "Appliances",
  "Tools",
  "Clothing",
  "Books",
  "Kitchen",
  "Sports",
  "Other",
];
const LOCATIONS = [
  "Living Room",
  "Bedroom",
  "Kitchen",
  "Garage",
  "Storage",
  "Office",
  "Basement",
  "Attic",
];

interface InventoryItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: InventoryItem | null;
  onSuccess: (item: InventoryItem, isNew: boolean) => void;
}

export default function InventoryItemModal({
  isOpen,
  onClose,
  editingItem,
  onSuccess,
}: InventoryItemModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: CATEGORIES[0],
    location: LOCATIONS[0],
    quantity: 1,
    unit: "",
    acquired_at: new Date().toISOString().split("T")[0],
    purchasePrice: "",
    notes: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      category: CATEGORIES[0],
      location: LOCATIONS[0],
      quantity: 1,
      unit: "",
      acquired_at: new Date().toISOString().split("T")[0],
      purchasePrice: "",
      notes: "",
    });
  };

  useEffect(() => {
    if (!isOpen) return;
    if (editingItem) {
      setFormData({
        name: editingItem.name,
        category: editingItem.category || CATEGORIES[0],
        location: editingItem.location || LOCATIONS[0],
        quantity: editingItem.quantity,
        unit: editingItem.unit || "",
        acquired_at: editingItem.acquired_at || new Date().toISOString().split("T")[0],
        purchasePrice: editingItem.purchase_price_cents
          ? (editingItem.purchase_price_cents / 100).toFixed(2)
          : "",
        notes: editingItem.notes || "",
      });
    } else {
      resetForm();
    }
  }, [isOpen, editingItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        location: formData.location,
        quantity: formData.quantity,
        unit: formData.unit || null,
        acquired_at: formData.acquired_at || null,
        purchase_price_cents: formData.purchasePrice
          ? Math.round(parseFloat(formData.purchasePrice) * 100)
          : null,
        notes: formData.notes || null,
      };

      const url = editingItem ? `/api/inventory/${editingItem.id}` : "/api/inventory";
      const method = editingItem ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to save inventory item");

      const data = await response.json();
      onSuccess(data, !editingItem);
      onClose();
    } catch (error) {
      console.error("Error saving inventory item:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseFormModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingItem ? "Edit Item" : "Add New Item"}
      onSubmit={handleSubmit}
      loading={loading}
      submitLabel={editingItem ? "Update Item" : "Add Item"}
      submitColor="blue"
      maxWidth="md"
    >
      {/* Name */}
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-400">Name *</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Item name"
        />
      </div>

      {/* Category + Location */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-400">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-400">Location</label>
          <select
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quantity + Unit + Price */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-400">Quantity</label>
          <input
            type="number"
            min="0"
            value={formData.quantity}
            onChange={(e) =>
              setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })
            }
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-400">Unit</label>
          <input
            type="text"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="e.g., pcs"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-400">Price ($)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.purchasePrice}
            onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Acquired Date */}
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-400">Acquired Date</label>
        <input
          type="date"
          value={formData.acquired_at}
          onChange={(e) => setFormData({ ...formData, acquired_at: e.target.value })}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-400">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="h-20 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Optional notes..."
        />
      </div>
    </BaseFormModal>
  );
}
