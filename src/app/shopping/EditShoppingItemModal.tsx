// src/app/shopping/EditShoppingItemModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { ShoppingListItem } from '@/types/database.types';

interface EditShoppingItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    item: ShoppingListItem | null;
}

export default function EditShoppingItemModal({
    isOpen,
    onClose,
    onSuccess,
    item,
}: EditShoppingItemModalProps) {
    const [formData, setFormData] = useState({
        item_name: '',
        quantity: 1,
        unit: '',
        category: '',
        priority: 3,
        needed_by: '',
        notes: '',
        store_preference: '',
        aisle: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Populate form when item changes
    useEffect(() => {
        if (item) {
            setFormData({
                item_name: item.item_name || '',
                quantity: item.quantity ? Number(item.quantity) : 1,
                unit: item.unit || '',
                category: item.category || '',
                priority: item.priority || 3,
                needed_by: item.needed_by || '',
                notes: item.notes || '',
                store_preference: item.store_preference || '',
                aisle: item.aisle || '',
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
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
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
                throw new Error(errorData.error || 'Failed to update item');
            }

            onSuccess();
            onClose();
        } catch (err) {
            console.error('Error updating item:', err);
            setError(err instanceof Error ? err.message : 'Failed to update item');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !item) return null;

    const categories = [
        'Produce',
        'Meat',
        'Dairy',
        'Bakery',
        'Frozen',
        'Pantry',
        'Snacks',
        'Beverages',
        'Personal Care',
        'Household',
        'Other',
    ];

    const units = ['count', 'lbs', 'oz', 'kg', 'g', 'bunch', 'bag', 'box', 'can', 'bottle'];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-lg border border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <h2 className="text-xl font-semibold text-white">Edit Item</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-300 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Item Name */}
                        <div>
                            <label htmlFor="item_name" className="block text-sm font-medium text-gray-300 mb-2">
                                Item Name *
                            </label>
                            <input
                                type="text"
                                id="item_name"
                                required
                                value={formData.item_name}
                                onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Milk, Bread, Eggs"
                            />
                        </div>

                        {/* Quantity and Unit */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="quantity" className="block text-sm font-medium text-gray-300 mb-2">
                                    Quantity
                                </label>
                                <input
                                    type="number"
                                    id="quantity"
                                    min="0"
                                    step="0.01"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="unit" className="block text-sm font-medium text-gray-300 mb-2">
                                    Unit
                                </label>
                                <select
                                    id="unit"
                                    value={formData.unit}
                                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                                    Category
                                </label>
                                <select
                                    id="category"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                <label htmlFor="priority" className="block text-sm font-medium text-gray-300 mb-2">
                                    Priority (1-5)
                                </label>
                                <select
                                    id="priority"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="store_preference" className="block text-sm font-medium text-gray-300 mb-2">
                                    Store Preference
                                </label>
                                <input
                                    type="text"
                                    id="store_preference"
                                    value={formData.store_preference}
                                    onChange={(e) => setFormData({ ...formData, store_preference: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Aldi, Walmart"
                                />
                            </div>

                            <div>
                                <label htmlFor="aisle" className="block text-sm font-medium text-gray-300 mb-2">
                                    Aisle/Location
                                </label>
                                <input
                                    type="text"
                                    id="aisle"
                                    value={formData.aisle}
                                    onChange={(e) => setFormData({ ...formData, aisle: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Aisle 5, Produce"
                                />
                            </div>
                        </div>

                        {/* Needed By */}
                        <div>
                            <label htmlFor="needed_by" className="block text-sm font-medium text-gray-300 mb-2">
                                Needed By
                            </label>
                            <input
                                type="date"
                                id="needed_by"
                                value={formData.needed_by}
                                onChange={(e) => setFormData({ ...formData, needed_by: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Notes */}
                        <div>
                            <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-2">
                                Notes
                            </label>
                            <textarea
                                id="notes"
                                rows={3}
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Any additional notes or preferences..."
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !formData.item_name}
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-400 text-white rounded-lg font-medium transition-colors"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
