// src/app/shopping/EditShoppingItemModal.tsx
"use client";

import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import BaseFormModal from "@/components/BaseFormModal";
import type { ShoppingListItem } from "@/types/shopping.types";

interface EditShoppingItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item: ShoppingListItem | null;
}

const categories = [
  "Produce",
  "Meat",
  "Dairy",
  "Bakery",
  "Frozen",
  "Pantry",
  "Snacks",
  "Beverages",
  "Personal Care",
  "Household",
  "Other",
];

const units = ["count", "lbs", "oz", "kg", "g", "bunch", "bag", "box", "can", "bottle"];

export default function EditShoppingItemModal({
  isOpen,
  onClose,
  onSuccess,
  item,
}: EditShoppingItemModalProps) {
  const [formData, setFormData] = useState({
    item_name: "",
    quantity: 1,
    unit: "",
    category: "",
    priority: 3,
    needed_by: "",
    notes: "",
    store_preference: "",
    aisle: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setFormData({
        item_name: item.item_name || "",
        quantity: item.quantity ? Number(item.quantity) : 1,
        unit: item.unit || "",
        category: item.category || "",
        priority: item.priority || 3,
        needed_by: item.needed_by || "",
        notes: item.notes || "",
        store_preference: item.store_preference || "",
        aisle: item.aisle || "",
      });
      setError(null);
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/shopping/items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_name: formData.item_name,
          quantity: formData.quantity || null,
          unit: formData.unit || null,
          category: formData.category || null,
          priority: formData.priority || null,
          needed_by: formData.needed_by || null,
          notes: formData.notes || null,
          store_preference: formData.store_preference || null,
          aisle: formData.aisle || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update item");
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error updating item:", err);
      setError(err instanceof Error ? err.message : "Failed to update item");
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  return (
    <BaseFormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Item"
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      submitLabel="Save Changes"
      submitIcon={<Save className="h-4 w-4" />}
      submitDisabled={!formData.item_name}
      maxWidth="2xl"
    >
      {/* Item Name */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Item Name *</label>
        <input
          type="text"
          required
          value={formData.item_name}
          onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="e.g., Milk, Bread, Eggs"
          disabled={loading}
        />
      </div>

      {/* Quantity and Unit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Quantity</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.quantity}
            onChange={(e) =>
              setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })
            }
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={loading}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Unit</label>
          <select
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={loading}
          >
            <option value="">None</option>
            {units.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category and Priority */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={loading}
          >
            <option value="">None</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Priority (1-5)</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={loading}
          >
            <option value={1}>1 - Highest</option>
            <option value={2}>2 - High</option>
            <option value={3}>3 - Medium</option>
            <option value={4}>4 - Low</option>
            <option value={5}>5 - Lowest</option>
          </select>
        </div>
      </div>

      {/* Store and Aisle */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Store Preference</label>
          <input
            type="text"
            value={formData.store_preference}
            onChange={(e) => setFormData({ ...formData, store_preference: e.target.value })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="e.g., Aldi, Walmart"
            disabled={loading}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Aisle/Location</label>
          <input
            type="text"
            value={formData.aisle}
            onChange={(e) => setFormData({ ...formData, aisle: e.target.value })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="e.g., Aisle 5, Produce"
            disabled={loading}
          />
        </div>
      </div>

      {/* Needed By */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Needed By</label>
        <input
          type="date"
          value={formData.needed_by}
          onChange={(e) => setFormData({ ...formData, needed_by: e.target.value })}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={loading}
        />
      </div>

      {/* Notes */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Notes</label>
        <textarea
          rows={3}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Any additional notes or preferences..."
          disabled={loading}
        />
      </div>
    </BaseFormModal>
  );
}
