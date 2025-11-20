// src/components/wishlist/AddItemModal.tsx
'use client';

import { useState } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';

type WishlistStatus = 'wanted' | 'considering' | 'on_hold' | 'purchased' | 'declined';

interface WishlistItem {
    id: string;
    title: string;
    category?: string;
    status: WishlistStatus;
    url?: string;
    notes?: string;
    priority?: number;
    price_cents?: number;
    currency?: string;
    image_url?: string;
    purchased_at?: string;
    vendor?: string;
    brand?: string;
    color?: string;
    size?: string;
    created_at: string;
}

interface AddItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newItem: WishlistItem) => void;
}

const STATUSES: { value: WishlistStatus; label: string }[] = [
    { value: 'wanted', label: 'Want' },
    { value: 'considering', label: 'Considering' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'purchased', label: 'Purchased' },
    { value: 'declined', label: 'Declined' }
];

const CATEGORIES = [
    'Electronics',
    'Books',
    'Clothing',
    'Home & Garden',
    'Sports & Outdoors',
    'Toys & Games',
    'Beauty',
    'Food & Grocery',
    'Other'
];

export default function AddItemModal({ isOpen, onClose, onSuccess }: AddItemModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        category: '',
        status: 'wanted' as WishlistStatus,
        url: '',
        notes: '',
        priority: 3,
        price: '',
        currency: 'USD',
        image_url: '',
        vendor: '',
        brand: '',
        color: '',
        size: '',
    });

    const resetForm = () => {
        setFormData({
            title: '',
            category: '',
            status: 'wanted',
            url: '',
            notes: '',
            priority: 3,
            price: '',
            currency: 'USD',
            image_url: '',
            vendor: '',
            brand: '',
            color: '',
            size: '',
        });
        setError(null);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Convert price to cents
            const price_cents = formData.price ? Math.round(parseFloat(formData.price) * 100) : null;

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
            };

            const response = await fetch('/api/wishlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add item');
            }

            const newItem = await response.json();

            // Success!
            resetForm();
            onSuccess(newItem);
            onClose();
        } catch (err) {
            console.error('Error adding item:', err);
            setError(err instanceof Error ? err.message : 'Failed to add item');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-gray-900 rounded-lg border border-gray-800 w-full max-w-2xl my-8">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    <h2 className="text-xl font-bold text-white">Add Wishlist Item</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-white transition-colors"
                        disabled={loading}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {/* Error Message */}
                    {error && (
                        <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
                            {error}
                        </div>
                    )}

                    {/* Basic Info Section */}
                    <div className="space-y-3">
                        <h3 className="text-base font-semibold text-white">Basic Information</h3>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Title *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="e.g., Sony WH-1000XM5 Headphones"
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* Category & Status */}
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Category
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    disabled={loading}
                                >
                                    <option value="">Select category</option>
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Status
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as WishlistStatus })}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    disabled={loading}
                                >
                                    {STATUSES.map(({ value, label }) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Priority */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Priority: {formData.priority}
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="5"
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                disabled={loading}
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-0.5">
                                <span>Low (1)</span>
                                <span>Medium (3)</span>
                                <span>High (5)</span>
                            </div>
                        </div>
                    </div>

                    {/* Product Details Section */}
                    <div className="space-y-3 pt-3 border-t border-gray-800">
                        <h3 className="text-base font-semibold text-white">Product Details</h3>

                        {/* Brand & Vendor */}
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Brand
                                </label>
                                <input
                                    type="text"
                                    value={formData.brand}
                                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="e.g., Sony"
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Vendor/Store
                                </label>
                                <input
                                    type="text"
                                    value={formData.vendor}
                                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="e.g., Amazon"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Color & Size */}
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Color
                                </label>
                                <input
                                    type="text"
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="e.g., Black"
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Size
                                </label>
                                <input
                                    type="text"
                                    value={formData.size}
                                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="e.g., Large, 10.5"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Price & Currency */}
                        <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Price
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="0.00"
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Currency
                                </label>
                                <select
                                    value={formData.currency}
                                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                    </div>

                    {/* Links Section */}
                    <div className="space-y-3 pt-3 border-t border-gray-800">
                        <h3 className="text-base font-semibold text-white">Links & Media</h3>

                        {/* Product URL */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Product URL
                            </label>
                            <input
                                type="url"
                                value={formData.url}
                                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="https://example.com/product"
                                disabled={loading}
                            />
                        </div>

                        {/* Image URL */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Image URL
                            </label>
                            <input
                                type="url"
                                value={formData.image_url}
                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="https://example.com/image.jpg"
                                disabled={loading}
                            />
                            {formData.image_url && (
                                <div className="mt-1.5">
                                    <img
                                        src={formData.image_url}
                                        alt="Preview"
                                        className="w-24 h-24 object-cover rounded-lg border border-gray-700"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div className="space-y-3 pt-3 border-t border-gray-800">
                        <h3 className="text-base font-semibold text-white">Additional Notes</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Notes
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                                placeholder="Any additional notes about this item..."
                                rows={3}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors border border-gray-700"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    Add Item
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}