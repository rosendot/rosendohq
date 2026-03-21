"use client";

import { useState, useEffect } from "react";
import BaseFormModal from "@/components/BaseFormModal";
import type {
  HomeSupplyStockWithItem,
  HomeSupplyStockInsert,
  HomeSupplyItem,
  HomeArea,
} from "@/types/house.types";

interface SupplyStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingStock: HomeSupplyStockWithItem | null;
  items: HomeSupplyItem[];
  areas: HomeArea[];
  propertyId: string | null;
  onSuccess: () => void;
}

const emptyForm = (propertyId: string | null): HomeSupplyStockInsert => ({
  property_id: propertyId || "",
  supply_item_id: "",
  area_id: null,
  quantity: 0,
  min_quantity: 0,
});

export default function SupplyStockModal({
  isOpen,
  onClose,
  editingStock,
  items,
  areas,
  propertyId,
  onSuccess,
}: SupplyStockModalProps) {
  const [formData, setFormData] = useState<HomeSupplyStockInsert>(emptyForm(propertyId));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editingStock) {
        setFormData({
          property_id: editingStock.property_id,
          supply_item_id: editingStock.supply_item_id,
          area_id: editingStock.area_id,
          quantity: editingStock.quantity,
          min_quantity: editingStock.min_quantity,
        });
      } else {
        setFormData(emptyForm(propertyId));
      }
    }
  }, [isOpen, editingStock, propertyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supply_item_id) return;
    setLoading(true);

    try {
      const url = editingStock
        ? `/api/house/supplies/stock/${editingStock.id}`
        : "/api/house/supplies/stock";
      const method = editingStock ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save stock");

      onClose();
      onSuccess();
    } catch (error) {
      console.error("Error saving stock:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseFormModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingStock ? "Edit Stock" : "Add Stock"}
      onSubmit={handleSubmit}
      loading={loading}
      submitLabel={editingStock ? "Update" : "Add"}
      submitDisabled={!formData.supply_item_id}
      maxWidth="md"
    >
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Item *</label>
        <select
          value={formData.supply_item_id}
          onChange={(e) => setFormData({ ...formData, supply_item_id: e.target.value })}
          required
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
        >
          <option value="">Select item...</option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} {item.category ? `(${item.category})` : ""}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Area (optional)</label>
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
          <label className="mb-1 block text-sm font-medium text-gray-300">Quantity</label>
          <input
            type="number"
            min="0"
            value={formData.quantity}
            onChange={(e) =>
              setFormData({
                ...formData,
                quantity: parseInt(e.target.value) || 0,
              })
            }
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Minimum Quantity</label>
          <input
            type="number"
            min="0"
            value={formData.min_quantity || 0}
            onChange={(e) =>
              setFormData({
                ...formData,
                min_quantity: parseInt(e.target.value) || 0,
              })
            }
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>
    </BaseFormModal>
  );
}
