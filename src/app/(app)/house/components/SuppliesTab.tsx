'use client';

import { useState } from 'react';
import { Plus, X, Trash2, Edit2, AlertCircle } from 'lucide-react';
import type {
    HomeSupplyItem,
    HomeSupplyItemInsert,
    HomeSupplyStockInsert,
    HomeSupplyStockWithItem,
    HomeArea,
} from '@/types/database.types';

interface SuppliesTabProps {
    stock: HomeSupplyStockWithItem[];
    items: HomeSupplyItem[];
    areas: HomeArea[];
    propertyId: string | null;
    onRefresh: () => void;
}

export default function SuppliesTab({
    stock,
    items,
    areas,
    propertyId,
    onRefresh,
}: SuppliesTabProps) {
    const [showStockModal, setShowStockModal] = useState(false);
    const [showItemModal, setShowItemModal] = useState(false);
    const [editingStock, setEditingStock] = useState<HomeSupplyStockWithItem | null>(null);
    const [loading, setLoading] = useState(false);

    const [stockFormData, setStockFormData] = useState<HomeSupplyStockInsert>({
        property_id: propertyId || '',
        supply_item_id: '',
        area_id: null,
        quantity: 0,
        min_quantity: 0,
    });

    const [itemFormData, setItemFormData] = useState<HomeSupplyItemInsert>({
        name: '',
        category: null,
        unit: null,
        notes: null,
    });

    const resetStockForm = () => {
        setStockFormData({
            property_id: propertyId || '',
            supply_item_id: '',
            area_id: null,
            quantity: 0,
            min_quantity: 0,
        });
        setEditingStock(null);
    };

    const resetItemForm = () => {
        setItemFormData({
            name: '',
            category: null,
            unit: null,
            notes: null,
        });
    };

    const openStockModal = (stockItem?: HomeSupplyStockWithItem) => {
        if (stockItem) {
            setEditingStock(stockItem);
            setStockFormData({
                property_id: stockItem.property_id,
                supply_item_id: stockItem.supply_item_id,
                area_id: stockItem.area_id,
                quantity: stockItem.quantity,
                min_quantity: stockItem.min_quantity,
            });
        } else {
            resetStockForm();
        }
        setShowStockModal(true);
    };

    const handleStockSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stockFormData.supply_item_id) return;
        setLoading(true);

        try {
            const url = editingStock
                ? `/api/house/supplies/stock/${editingStock.id}`
                : '/api/house/supplies/stock';
            const method = editingStock ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(stockFormData),
            });

            if (!response.ok) throw new Error('Failed to save stock');

            setShowStockModal(false);
            resetStockForm();
            onRefresh();
        } catch (error) {
            console.error('Error saving stock:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleItemSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!itemFormData.name.trim()) return;
        setLoading(true);

        try {
            const response = await fetch('/api/house/supplies/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itemFormData),
            });

            if (!response.ok) throw new Error('Failed to create item');

            setShowItemModal(false);
            resetItemForm();
            onRefresh();
        } catch (error) {
            console.error('Error creating item:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteStock = async (id: string) => {
        if (!confirm('Are you sure you want to delete this stock entry?')) return;

        try {
            const response = await fetch(`/api/house/supplies/stock/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete');
            onRefresh();
        } catch (error) {
            console.error('Error deleting stock:', error);
        }
    };

    const handleQuantityChange = async (stockItem: HomeSupplyStockWithItem, delta: number) => {
        const newQuantity = Math.max(0, stockItem.quantity + delta);

        try {
            const response = await fetch(`/api/house/supplies/stock/${stockItem.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ current_quantity: newQuantity }),
            });
            if (!response.ok) throw new Error('Failed to update quantity');
            onRefresh();
        } catch (error) {
            console.error('Error updating quantity:', error);
        }
    };

    const isLowStock = (stockItem: HomeSupplyStockWithItem) => {
        return stockItem.quantity <= (stockItem.min_quantity || 0);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Supplies & Stock</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowItemModal(true)}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        New Item
                    </button>
                    <button
                        onClick={() => openStockModal()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Stock
                    </button>
                </div>
            </div>

            {stock.length === 0 ? (
                <div className="bg-gray-900 rounded-lg border border-gray-800 p-12 text-center">
                    <p className="text-gray-500">No supplies tracked yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stock.map((stockItem) => {
                        const lowStock = isLowStock(stockItem);
                        const area = areas.find((a) => a.id === stockItem.area_id);

                        return (
                            <div
                                key={stockItem.id}
                                className={`p-4 bg-gray-900 rounded-lg border transition-colors ${
                                    lowStock ? 'border-orange-500/30' : 'border-gray-800'
                                }`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-white">
                                                {stockItem.home_supply_item?.name || 'Unknown Item'}
                                            </h3>
                                            {lowStock && (
                                                <AlertCircle className="w-4 h-4 text-orange-400" />
                                            )}
                                        </div>
                                        {stockItem.home_supply_item?.category && (
                                            <p className="text-sm text-gray-400 capitalize">
                                                {stockItem.home_supply_item.category}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => openStockModal(stockItem)}
                                            className="p-1 text-gray-400 hover:text-white transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteStock(stockItem.id)}
                                            className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleQuantityChange(stockItem, -1)}
                                            className="w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors"
                                        >
                                            -
                                        </button>
                                        <span
                                            className={`text-2xl font-bold min-w-[3ch] text-center ${
                                                lowStock ? 'text-orange-400' : 'text-white'
                                            }`}
                                        >
                                            {stockItem.quantity}
                                        </span>
                                        <button
                                            onClick={() => handleQuantityChange(stockItem, 1)}
                                            className="w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-gray-400">
                                            Min: {stockItem.min_quantity || 0}
                                        </div>
                                        {stockItem.home_supply_item?.unit && (
                                            <div className="text-xs text-gray-500">
                                                {stockItem.home_supply_item.unit}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="text-sm text-gray-400 space-y-1">
                                    {area && <div>Location: {area.name}</div>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Stock Modal */}
            {showStockModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-white">
                                {editingStock ? 'Edit Stock' : 'Add Stock'}
                            </h2>
                            <button
                                onClick={() => setShowStockModal(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleStockSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Item *
                                </label>
                                <select
                                    value={stockFormData.supply_item_id}
                                    onChange={(e) =>
                                        setStockFormData({ ...stockFormData, supply_item_id: e.target.value })
                                    }
                                    required
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                >
                                    <option value="">Select item...</option>
                                    {items.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.name} {item.category ? `(${item.category})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Area (optional)
                                </label>
                                <select
                                    value={stockFormData.area_id || ''}
                                    onChange={(e) =>
                                        setStockFormData({
                                            ...stockFormData,
                                            area_id: e.target.value || null,
                                        })
                                    }
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
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
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Quantity
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={stockFormData.quantity}
                                        onChange={(e) =>
                                            setStockFormData({
                                                ...stockFormData,
                                                quantity: parseInt(e.target.value) || 0,
                                            })
                                        }
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Minimum Quantity
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={stockFormData.min_quantity || 0}
                                        onChange={(e) =>
                                            setStockFormData({
                                                ...stockFormData,
                                                min_quantity: parseInt(e.target.value) || 0,
                                            })
                                        }
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowStockModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !stockFormData.supply_item_id}
                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : editingStock ? 'Update' : 'Add'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Item Modal */}
            {showItemModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-white">New Supply Item</h2>
                            <button
                                onClick={() => setShowItemModal(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleItemSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    value={itemFormData.name}
                                    onChange={(e) =>
                                        setItemFormData({ ...itemFormData, name: e.target.value })
                                    }
                                    required
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    placeholder="Item name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Category
                                </label>
                                <select
                                    value={itemFormData.category || ''}
                                    onChange={(e) =>
                                        setItemFormData({
                                            ...itemFormData,
                                            category: e.target.value || null,
                                        })
                                    }
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                >
                                    <option value="">Select category...</option>
                                    <option value="cleaning">Cleaning</option>
                                    <option value="kitchen">Kitchen</option>
                                    <option value="bathroom">Bathroom</option>
                                    <option value="laundry">Laundry</option>
                                    <option value="tools">Tools</option>
                                    <option value="outdoor">Outdoor</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Unit
                                    </label>
                                    <input
                                        type="text"
                                        value={itemFormData.unit || ''}
                                        onChange={(e) =>
                                            setItemFormData({
                                                ...itemFormData,
                                                unit: e.target.value || null,
                                            })
                                        }
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                        placeholder="e.g., rolls, bottles"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowItemModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !itemFormData.name.trim()}
                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Creating...' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
