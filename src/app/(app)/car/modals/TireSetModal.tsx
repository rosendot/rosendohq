'use client';

import { useState, useEffect } from 'react';
import type { TireSet, TireSetInsert, TireStatus } from '@/types/car.types';
import BaseFormModal from '@/components/BaseFormModal';

interface TireSetModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingTire: TireSet | null;
    vehicleId: string;
    onSuccess: () => void;
}

export default function TireSetModal({
    isOpen,
    onClose,
    editingTire,
    vehicleId,
    onSuccess,
}: TireSetModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<TireSetInsert>({
        vehicle_id: vehicleId,
        brand: null,
        model: null,
        size: null,
        purchase_date: null,
        purchase_price_cents: null,
        mileage_installed: null,
        mileage_removed: null,
        tread_depth_initial: null,
        tread_depth_current: null,
        position: 'all',
        status: 'active',
        notes: null,
    });

    const resetForm = () => {
        setFormData({
            vehicle_id: vehicleId,
            brand: null,
            model: null,
            size: null,
            purchase_date: null,
            purchase_price_cents: null,
            mileage_installed: null,
            mileage_removed: null,
            tread_depth_initial: null,
            tread_depth_current: null,
            position: 'all',
            status: 'active',
            notes: null,
        });
    };

    useEffect(() => {
        if (editingTire) {
            setFormData({
                vehicle_id: editingTire.vehicle_id,
                brand: editingTire.brand,
                model: editingTire.model,
                size: editingTire.size,
                purchase_date: editingTire.purchase_date,
                purchase_price_cents: editingTire.purchase_price_cents,
                mileage_installed: editingTire.mileage_installed,
                mileage_removed: editingTire.mileage_removed,
                tread_depth_initial: editingTire.tread_depth_initial,
                tread_depth_current: editingTire.tread_depth_current,
                position: editingTire.position,
                status: editingTire.status,
                notes: editingTire.notes,
            });
        } else {
            resetForm();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editingTire]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = editingTire
                ? `/api/car/tires/${editingTire.id}`
                : '/api/car/tires';
            const method = editingTire ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Failed to save tire set');

            onClose();
            resetForm();
            onSuccess();
        } catch (error) {
            console.error('Error saving tire set:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <BaseFormModal
            isOpen={isOpen}
            onClose={onClose}
            title={editingTire ? 'Edit Tire Set' : 'Add Tire Set'}
            onSubmit={handleSubmit}
            loading={loading}
            submitLabel={editingTire ? 'Update' : 'Add Tire Set'}
            loadingLabel="Saving..."
            submitColor="blue"
        >
            {/* Brand and Model */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Brand
                    </label>
                    <input
                        type="text"
                        value={formData.brand || ''}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value || null })}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Michelin"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Model
                    </label>
                    <input
                        type="text"
                        value={formData.model || ''}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value || null })}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Pilot Sport 4S"
                    />
                </div>
            </div>

            {/* Size and Position */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Size
                    </label>
                    <input
                        type="text"
                        value={formData.size || ''}
                        onChange={(e) => setFormData({ ...formData, size: e.target.value || null })}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 225/45R17"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Position
                    </label>
                    <select
                        value={formData.position || 'all'}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All (Full Set)</option>
                        <option value="front">Front Only</option>
                        <option value="rear">Rear Only</option>
                    </select>
                </div>
            </div>

            {/* Purchase Info */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Purchase Date
                    </label>
                    <input
                        type="date"
                        value={formData.purchase_date || ''}
                        onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value || null })}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Purchase Price
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.purchase_price_cents ? (formData.purchase_price_cents / 100).toFixed(2) : ''}
                            onChange={(e) => setFormData({ ...formData, purchase_price_cents: e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null })}
                            className="w-full pl-8 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0.00"
                        />
                    </div>
                </div>
            </div>

            {/* Mileage */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Mileage Installed
                    </label>
                    <input
                        type="number"
                        value={formData.mileage_installed || ''}
                        onChange={(e) => setFormData({ ...formData, mileage_installed: e.target.value ? parseInt(e.target.value) : null })}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="When installed"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Mileage Removed
                    </label>
                    <input
                        type="number"
                        value={formData.mileage_removed || ''}
                        onChange={(e) => setFormData({ ...formData, mileage_removed: e.target.value ? parseInt(e.target.value) : null })}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="When removed"
                    />
                </div>
            </div>

            {/* Tread Depth */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Initial Tread Depth (32nds)
                    </label>
                    <input
                        type="number"
                        step="0.1"
                        value={formData.tread_depth_initial || ''}
                        onChange={(e) => setFormData({ ...formData, tread_depth_initial: e.target.value ? parseFloat(e.target.value) : null })}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 10"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Current Tread Depth (32nds)
                    </label>
                    <input
                        type="number"
                        step="0.1"
                        value={formData.tread_depth_current || ''}
                        onChange={(e) => setFormData({ ...formData, tread_depth_current: e.target.value ? parseFloat(e.target.value) : null })}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 6"
                    />
                </div>
            </div>

            {/* Status */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                </label>
                <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as TireStatus })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="active">Active</option>
                    <option value="removed">Removed (In Storage)</option>
                    <option value="sold">Sold</option>
                    <option value="disposed">Disposed</option>
                </select>
            </div>

            {/* Notes */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notes
                </label>
                <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value || null })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                    placeholder="Additional details..."
                />
            </div>
        </BaseFormModal>
    );
}
