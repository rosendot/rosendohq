// app/shopping/AddShoppingItemModal.tsx
"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import BaseFormModal from "@/components/BaseFormModal";

interface AddShoppingItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  listId: string;
}

export default function AddShoppingItemModal({
  isOpen,
  onClose,
  onSuccess,
  listId,
}: AddShoppingItemModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newItem, setNewItem] = useState({
    item_name: "",
    quantity: "",
    unit: "",
    category: "",
    priority: "",
    notes: "",
    aisle: "",
    needed_by: "",
  });

  const resetForm = () => {
    setNewItem({
      item_name: "",
      quantity: "",
      unit: "",
      category: "",
      priority: "",
      notes: "",
      aisle: "",
      needed_by: "",
    });
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listId || !newItem.item_name.trim()) {
      setError("Please select a list and enter an item name");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/shopping/lists/${listId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_name: newItem.item_name,
          quantity: newItem.quantity ? parseFloat(newItem.quantity) : null,
          unit: newItem.unit || null,
          category: newItem.category || null,
          priority: newItem.priority ? parseInt(newItem.priority) : null,
          notes: newItem.notes || null,
          aisle: newItem.aisle || null,
          needed_by: newItem.needed_by || null,
        }),
      });

      if (!response.ok) throw new Error("Failed to add item");

      resetForm();
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error adding item:", err);
      setError(err instanceof Error ? err.message : "Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseFormModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Shopping Item"
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      submitLabel="Add Item"
      loadingLabel="Adding..."
      submitIcon={<Plus className="h-4 w-4" />}
      maxWidth="2xl"
    >
      {/* Item Name */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Item Name *</label>
        <input
          type="text"
          required
          value={newItem.item_name}
          onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
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
            step="0.01"
            value={newItem.quantity}
            onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="e.g., 2"
            disabled={loading}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Unit</label>
          <input
            type="text"
            value={newItem.unit}
            onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="e.g., lbs, pcs, bottles"
            disabled={loading}
          />
        </div>
      </div>

      {/* Category and Aisle */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Category</label>
          <input
            type="text"
            value={newItem.category}
            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="e.g., Dairy, Produce"
            disabled={loading}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Aisle</label>
          <input
            type="text"
            value={newItem.aisle}
            onChange={(e) => setNewItem({ ...newItem, aisle: e.target.value })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="e.g., Aisle 5"
            disabled={loading}
          />
        </div>
      </div>

      {/* Priority and Needed By */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Priority</label>
          <select
            value={newItem.priority}
            onChange={(e) => setNewItem({ ...newItem, priority: e.target.value })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={loading}
          >
            <option value="">None</option>
            <option value="1">1 - Highest</option>
            <option value="2">2 - High</option>
            <option value="3">3 - Medium</option>
            <option value="4">4 - Low</option>
            <option value="5">5 - Lowest</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Needed By</label>
          <input
            type="date"
            value={newItem.needed_by}
            onChange={(e) => setNewItem({ ...newItem, needed_by: e.target.value })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={loading}
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Notes</label>
        <textarea
          value={newItem.notes}
          onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
          rows={3}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Any additional details..."
          disabled={loading}
        />
      </div>
    </BaseFormModal>
  );
}
