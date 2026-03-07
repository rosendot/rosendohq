// app/shopping/AddShoppingItemModal.tsx
'use client';

import { useState } from 'react';

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
    const [newItem, setNewItem] = useState({
        item_name: '',
        quantity: '',
        unit: '',
        category: '',
        priority: '',
        notes: '',
        aisle: '',
        needed_by: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!listId || !newItem.item_name.trim()) {
            alert('Please select a list and enter an item name');
            return;
        }

        try {
            const response = await fetch(`/api/shopping/lists/${listId}/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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

            if (!response.ok) throw new Error('Failed to add item');

            // Reset form
            setNewItem({
                item_name: '',
                quantity: '',
                unit: '',
                category: '',
                priority: '',
                notes: '',
                aisle: '',
                needed_by: ''
            });

            onSuccess();
            onClose();
        } catch (err) {
            console.error('Error adding item:', err);
            alert(err instanceof Error ? err.message : 'Failed to add item');
        }
    };

    const handleClose = () => {
        setNewItem({
            item_name: '',
            quantity: '',
            unit: '',
            category: '',
            priority: '',
            notes: '',
            aisle: '',
            needed_by: ''
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold text-white mb-4">Add Shopping Item</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-3">
                        {/* Item Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Item Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={newItem.item_name}
                                onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="e.g., Milk, Bread, Eggs"
                            />
                        </div>

                        {/* Quantity and Unit */}
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Quantity
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={newItem.quantity}
                                    onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="e.g., 2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Unit
                                </label>
                                <input
                                    type="text"
                                    value={newItem.unit}
                                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="e.g., lbs, pcs, bottles"
                                />
                            </div>
                        </div>

                        {/* Category and Aisle */}
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Category
                                </label>
                                <input
                                    type="text"
                                    value={newItem.category}
                                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="e.g., Dairy, Produce"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Aisle
                                </label>
                                <input
                                    type="text"
                                    value={newItem.aisle}
                                    onChange={(e) => setNewItem({ ...newItem, aisle: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="e.g., Aisle 5"
                                />
                            </div>
                        </div>

                        {/* Priority and Needed By */}
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Priority
                                </label>
                                <select
                                    value={newItem.priority}
                                    onChange={(e) => setNewItem({ ...newItem, priority: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="">None</option>
                                    <option value="1">1 - High</option>
                                    <option value="2">2 - Medium</option>
                                    <option value="3">3 - Low</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Needed By
                                </label>
                                <input
                                    type="date"
                                    value={newItem.needed_by}
                                    onChange={(e) => setNewItem({ ...newItem, needed_by: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Notes
                            </label>
                            <textarea
                                value={newItem.notes}
                                onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                                rows={3}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="Any additional details..."
                            />
                        </div>
                    </div>

                    {/* Modal Actions */}
                    <div className="flex gap-2 mt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-colors"
                        >
                            Add Item
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
