"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Package, MapPin, DollarSign, Search, Trash2, Edit2, X } from "lucide-react";
import type { InventoryItem } from "@/types/inventory.types";
import InventoryItemModal from "./modals/InventoryItemModal";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

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

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InventoryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/inventory");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setItems(data);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/inventory/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setItems(items.filter((i) => i.id !== deleteTarget.id));
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setDeleteTarget(null);
    }
  };

  const filteredItems = items.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      (item.notes || "").toLowerCase().includes(q);
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesLocation = selectedLocation === "all" || item.location === selectedLocation;
    return matchesSearch && matchesCategory && matchesLocation;
  });

  const totalValue = filteredItems.reduce(
    (sum, item) => sum + (item.purchase_price_cents || 0) * item.quantity,
    0,
  );
  const totalItems = filteredItems.reduce((sum, item) => sum + item.quantity, 0);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 p-8 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 h-10 w-48 animate-pulse rounded bg-gray-800" />
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg border border-gray-800 bg-gray-900" />
            ))}
          </div>
          <div className="mb-6 h-20 animate-pulse rounded-lg border border-gray-800 bg-gray-900" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 animate-pulse rounded-lg border border-gray-800 bg-gray-900" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-8 text-white">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-1 text-2xl font-bold">Inventory</h1>
            <p className="text-sm text-gray-400">Track your possessions and their locations</p>
          </div>
          <button
            onClick={() => {
              setEditingItem(null);
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium transition-colors hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </button>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
            <div className="mb-2 flex items-center gap-3">
              <Package className="h-5 w-5 text-blue-400" />
              <h3 className="text-sm font-medium text-gray-400">Total Items</h3>
            </div>
            <p className="text-3xl font-bold">{totalItems}</p>
          </div>
          <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
            <div className="mb-2 flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-green-400" />
              <h3 className="text-sm font-medium text-gray-400">Total Value</h3>
            </div>
            <p className="text-3xl font-bold">{formatCurrency(totalValue)}</p>
          </div>
          <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
            <div className="mb-2 flex items-center gap-3">
              <MapPin className="h-5 w-5 text-purple-400" />
              <h3 className="text-sm font-medium text-gray-400">Locations</h3>
            </div>
            <p className="text-3xl font-bold">{new Set(items.map((i) => i.location).filter(Boolean)).size}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-lg border border-gray-800 bg-gray-900 p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items..."
                className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 focus:outline-none"
            >
              <option value="all">All Locations</option>
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-gray-800 bg-gray-900 p-5 transition-colors hover:border-gray-700"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-semibold">{item.name}</h3>
                  <div className="mt-1 space-y-0.5">
                    {item.category && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Package className="h-3.5 w-3.5" />
                        {item.category}
                      </div>
                    )}
                    {item.location && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <MapPin className="h-3.5 w-3.5" />
                        {item.location}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditingItem(item);
                      setShowAddModal(true);
                    }}
                    className="rounded p-1.5 text-gray-500 transition-colors hover:bg-gray-800 hover:text-blue-400"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(item)}
                    className="rounded p-1.5 text-gray-500 transition-colors hover:bg-gray-800 hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 border-t border-gray-800 pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Quantity</span>
                  <span className="font-medium">
                    {item.quantity}
                    {item.unit ? ` ${item.unit}` : ""}
                  </span>
                </div>
                {item.purchase_price_cents != null && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Value</span>
                    <span className="font-medium text-green-400">
                      {formatCurrency(item.purchase_price_cents * item.quantity)}
                    </span>
                  </div>
                )}
                {item.acquired_at && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Acquired</span>
                    <span className="font-medium">
                      {new Date(item.acquired_at + "T00:00:00").toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
                {item.notes && (
                  <p className="border-t border-gray-800 pt-2 text-xs text-gray-500">{item.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="py-16 text-center">
            <Package className="mx-auto mb-3 h-12 w-12 text-gray-700" />
            <p className="text-gray-400">
              {items.length === 0 ? "No items yet. Add your first item." : "No items match your filters."}
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <InventoryItemModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingItem(null);
        }}
        editingItem={editingItem}
        onSuccess={(item, isNew) => {
          if (isNew) {
            setItems((prev) => [item, ...prev]);
          } else {
            setItems((prev) => prev.map((i) => (i.id === editingItem!.id ? item : i)));
          }
          setShowAddModal(false);
          setEditingItem(null);
        }}
      />

      <DeleteConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        itemName={deleteTarget?.name || ""}
      />
    </div>
  );
}
