// src/components/wishlist/EditItemModal.tsx
"use client";

import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import BaseFormModal from "@/components/BaseFormModal";
import type { WishlistItem } from "@/types/wishlist.types";

type WishlistStatus = WishlistItem["status"];

interface EditItemModalProps {
  isOpen: boolean;
  item: WishlistItem | null;
  onClose: () => void;
  onSuccess: (updatedItem: WishlistItem) => void;
}

const STATUSES: { value: WishlistStatus; label: string }[] = [
  { value: "wanted", label: "Want" },
  { value: "considering", label: "Considering" },
  { value: "on_hold", label: "On Hold" },
  { value: "purchased", label: "Purchased" },
  { value: "declined", label: "Declined" },
];

const CATEGORIES = [
  "Electronics",
  "Books",
  "Clothing",
  "Home & Garden",
  "Sports & Outdoors",
  "Toys & Games",
  "Beauty",
  "Food & Grocery",
  "Other",
];

export default function EditItemModal({ isOpen, item, onClose, onSuccess }: EditItemModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    status: "wanted" as WishlistStatus,
    url: "",
    notes: "",
    priority: 3,
    price: "",
    currency: "USD",
    image_url: "",
    vendor: "",
    brand: "",
    color: "",
    size: "",
    purchased_at: "",
  });

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title || "",
        category: item.category || "",
        status: item.status || "wanted",
        url: item.url || "",
        notes: item.notes || "",
        priority: item.priority || 3,
        price: item.price_cents ? (item.price_cents / 100).toFixed(2) : "",
        currency: item.currency || "USD",
        image_url: item.image_url || "",
        vendor: item.vendor || "",
        brand: item.brand || "",
        color: item.color || "",
        size: item.size || "",
        purchased_at: item.purchased_at ? item.purchased_at.split("T")[0] : "",
      });
      setError(null);
    }
  }, [item]);

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    setLoading(true);
    setError(null);

    try {
      const price_cents = formData.price
        ? Math.round(parseFloat(formData.price) * 100)
        : null;

      const payload = {
        title: formData.title,
        category: formData.category || null,
        status: formData.status,
        url: formData.url || null,
        notes: formData.notes || null,
        priority: formData.priority,
        price_cents,
        currency: formData.currency,
        image_url: formData.image_url || null,
        vendor: formData.vendor || null,
        brand: formData.brand || null,
        color: formData.color || null,
        size: formData.size || null,
        purchased_at: formData.purchased_at || null,
      };

      const response = await fetch(`/api/wishlist/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update item");
      }

      const updatedItem = await response.json();
      onSuccess(updatedItem);
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
      onClose={handleClose}
      title="Edit Item"
      subtitle={`Added ${new Date(item.created_at).toLocaleDateString()}`}
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      submitLabel="Save Changes"
      submitIcon={<Save className="h-4 w-4" />}
      maxWidth="2xl"
    >
      {/* Basic Info Section */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-white">Basic Information</h3>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="e.g., Sony WH-1000XM5 Headphones"
            required
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="">Select category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Status</label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as WishlistStatus })
              }
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={loading}
            >
              {STATUSES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">
            Priority: {formData.priority}
          </label>
          <input
            type="range"
            min="1"
            max="5"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-700"
            disabled={loading}
          />
          <div className="mt-0.5 flex justify-between text-xs text-gray-500">
            <span>Low (1)</span>
            <span>Medium (3)</span>
            <span>High (5)</span>
          </div>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="space-y-3 border-t border-gray-800 pt-3">
        <h3 className="text-base font-semibold text-white">Product Details</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Brand</label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g., Sony"
              disabled={loading}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Vendor/Store</label>
            <input
              type="text"
              value={formData.vendor}
              onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g., Amazon"
              disabled={loading}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Color</label>
            <input
              type="text"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g., Black"
              disabled={loading}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Size</label>
            <input
              type="text"
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g., Large, 10.5"
              disabled={loading}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="col-span-1 sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-300">Price</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="0.00"
              disabled={loading}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Currency</label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="CAD">CAD</option>
              <option value="AUD">AUD</option>
            </select>
          </div>
        </div>

        {formData.status === "purchased" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Purchase Date</label>
            <input
              type="date"
              value={formData.purchased_at}
              onChange={(e) => setFormData({ ...formData, purchased_at: e.target.value })}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
        )}
      </div>

      {/* Links Section */}
      <div className="space-y-3 border-t border-gray-800 pt-3">
        <h3 className="text-base font-semibold text-white">Links & Media</h3>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Product URL</label>
          <input
            type="url"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="https://example.com/product"
            disabled={loading}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Image URL</label>
          <input
            type="url"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="https://example.com/image.jpg"
            disabled={loading}
          />
          {formData.image_url && (
            <div className="mt-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={formData.image_url}
                alt="Preview"
                className="h-24 w-24 rounded-lg border border-gray-700 object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Notes Section */}
      <div className="space-y-3 border-t border-gray-800 pt-3">
        <h3 className="text-base font-semibold text-white">Additional Notes</h3>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full resize-none rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Any additional notes about this item..."
            rows={3}
            disabled={loading}
          />
        </div>
      </div>
    </BaseFormModal>
  );
}
