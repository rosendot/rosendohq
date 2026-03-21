'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit2, AlertCircle } from 'lucide-react';
import SupplyStockModal from '../modals/SupplyStockModal';
import SupplyItemModal from '../modals/SupplyItemModal';
import type {
    HomeSupplyItem,
    HomeSupplyStockWithItem,
    HomeArea,
} from '@/types/house.types';

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
                        onClick={() => { setEditingStock(null); setShowStockModal(true); }}
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
                                            onClick={() => { setEditingStock(stockItem); setShowStockModal(true); }}
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

            <SupplyStockModal
                isOpen={showStockModal}
                onClose={() => setShowStockModal(false)}
                editingStock={editingStock}
                items={items}
                areas={areas}
                propertyId={propertyId}
                onSuccess={onRefresh}
            />

            <SupplyItemModal
                isOpen={showItemModal}
                onClose={() => setShowItemModal(false)}
                onSuccess={onRefresh}
            />
        </div>
    );
}
