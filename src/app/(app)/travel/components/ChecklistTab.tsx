"use client";

import { useState } from "react";
import { Plus, Trash2, Package, CheckSquare, Square } from "lucide-react";
import type { TripPackingItem } from "@/types/travel.types";

interface ChecklistTabProps {
  tripId: string;
  packingItems: TripPackingItem[];
  setPackingItems: React.Dispatch<React.SetStateAction<TripPackingItem[]>>;
  onDelete: (type: string, id: string, name: string) => void;
}

export default function ChecklistTab({ tripId, packingItems, setPackingItems, onDelete }: ChecklistTabProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ item: "", qty: 1, category: "" });

  const packedCount = packingItems.filter((p) => p.packed).length;
  const packingTotal = packingItems.length;
  const packingPercent = packingTotal > 0 ? Math.round((packedCount / packingTotal) * 100) : 0;

  const packingByCategory = packingItems.reduce(
    (acc, item) => {
      const cat = item.category || "Uncategorized";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    },
    {} as Record<string, TripPackingItem[]>,
  );

  const create = async () => {
    if (!form.item.trim()) return;
    const res = await fetch(`/api/travel/trips/${tripId}/packing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trip_id: tripId,
        item: form.item.trim(),
        qty: form.qty,
        packed: false,
        category: form.category.trim() || null,
        sort_order: packingItems.length,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setPackingItems((prev) => [...prev, data]);
      setForm({ item: "", qty: 1, category: "" });
      setShowAdd(false);
    }
  };

  const togglePacked = async (item: TripPackingItem) => {
    const res = await fetch(`/api/travel/packing/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packed: !item.packed }),
    });
    if (res.ok) {
      const data = await res.json();
      setPackingItems((prev) => prev.map((p) => (p.id === data.id ? data : p)));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          {packedCount} of {packingTotal} packed ({packingPercent}%)
        </p>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-sm text-white shadow-md transition-all duration-200 hover:from-emerald-600 hover:to-emerald-700"
        >
          <Plus className="h-4 w-4" /> Add Item
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-gray-800">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${packingPercent}%` }}
        />
      </div>

      {showAdd && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Add Packing Item</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-300">Item*</label>
                <input
                  type="text"
                  value={form.item}
                  onChange={(e) => setForm({ ...form, item: e.target.value })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="e.g., Passport"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Qty</label>
                <input
                  type="number"
                  min={1}
                  value={form.qty}
                  onChange={(e) => setForm({ ...form, qty: parseInt(e.target.value) || 1 })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">Category</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="e.g., Clothing, Electronics, Toiletries"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={create}
                disabled={!form.item.trim()}
                className="rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-white shadow-md transition-all duration-200 hover:from-emerald-600 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAdd(false);
                  setForm({ item: "", qty: 1, category: "" });
                }}
                className="rounded-lg bg-gray-700 px-4 py-2 text-white transition-all duration-200 hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Packing items grouped by category */}
      {Object.entries(packingByCategory)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([category, items]) => (
          <div key={category} className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <h4 className="mb-3 text-sm font-medium text-gray-400">{category}</h4>
            <div className="space-y-1">
              {items
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-gray-800/50"
                  >
                    <button onClick={() => togglePacked(item)} className="flex-shrink-0">
                      {item.packed ? (
                        <CheckSquare className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <Square className="h-5 w-5 text-gray-600" />
                      )}
                    </button>
                    <span
                      className={`flex-1 text-sm ${item.packed ? "text-gray-500 line-through" : "text-white"}`}
                    >
                      {item.item}
                      {item.qty && item.qty > 1 && <span className="ml-1 text-gray-500">x{item.qty}</span>}
                    </span>
                    <button
                      onClick={() => onDelete("packing", item.id, item.item)}
                      className="text-gray-600 transition-colors hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        ))}

      {packingItems.length === 0 && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 py-12 text-center text-gray-500">
          <Package className="mx-auto mb-2 h-8 w-8" />
          <p>No packing items yet.</p>
        </div>
      )}
    </div>
  );
}
