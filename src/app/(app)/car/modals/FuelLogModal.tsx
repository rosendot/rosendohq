'use client';

import { useState, useEffect } from 'react';
import type { FuelLog, FuelLogInsert, FuelType } from '@/types/car.types';
import BaseFormModal from '@/components/BaseFormModal';

interface FuelLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingLog: FuelLog | null;
    vehicleId: string;
    onSuccess: () => void;
}

export default function FuelLogModal({
    isOpen,
    onClose,
    editingLog,
    vehicleId,
    onSuccess,
}: FuelLogModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<FuelLogInsert>({
        vehicle_id: vehicleId,
        fill_date: new Date().toISOString().split('T')[0],
        odometer: null,
        gallons: null,
        total_cents: null,
        fuel_type: 'regular',
        is_full_tank: true,
        station_name: null,
        price_per_gallon_cents: null,
        trip_miles: null,
        mpg: null,
    });

    const resetForm = () => {
        setFormData({
            vehicle_id: vehicleId,
            fill_date: new Date().toISOString().split('T')[0],
            odometer: null,
            gallons: null,
            total_cents: null,
            fuel_type: 'regular',
            is_full_tank: true,
            station_name: null,
            price_per_gallon_cents: null,
            trip_miles: null,
            mpg: null,
        });
    };

    useEffect(() => {
        if (editingLog) {
            setFormData({
                vehicle_id: editingLog.vehicle_id,
                fill_date: editingLog.fill_date,
                odometer: editingLog.odometer,
                gallons: editingLog.gallons,
                total_cents: editingLog.total_cents,
                fuel_type: editingLog.fuel_type,
                is_full_tank: editingLog.is_full_tank,
                station_name: editingLog.station_name,
                price_per_gallon_cents: editingLog.price_per_gallon_cents,
                trip_miles: editingLog.trip_miles,
                mpg: editingLog.mpg,
            });
        } else {
            resetForm();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editingLog]);

    // Auto-calculate price per gallon and MPG
    const handleFormChange = (updates: Partial<FuelLogInsert>) => {
        const newData = { ...formData, ...updates };

        // Calculate price per gallon
        if (newData.total_cents && newData.gallons && newData.gallons > 0) {
            newData.price_per_gallon_cents = Math.round(newData.total_cents / newData.gallons);
        }

        // Calculate MPG if we have trip miles and gallons
        if (newData.trip_miles && newData.gallons && newData.gallons > 0 && newData.is_full_tank) {
            newData.mpg = Math.round((newData.trip_miles / newData.gallons) * 10) / 10;
        }

        setFormData(newData);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = editingLog
                ? `/api/car/fuel/${editingLog.id}`
                : '/api/car/fuel';
            const method = editingLog ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Failed to save fuel log');

            onClose();
            resetForm();
            onSuccess();
        } catch (error) {
            console.error('Error saving fuel log:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <BaseFormModal
            isOpen={isOpen}
            onClose={onClose}
            title={editingLog ? 'Edit Fuel Entry' : 'Add Fuel Entry'}
            onSubmit={handleSubmit}
            loading={loading}
            submitLabel={editingLog ? 'Update' : 'Add Entry'}
        >
            {/* Date and Station */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Fill Date *
                    </label>
                    <input
                        type="date"
                        required
                        value={formData.fill_date}
                        onChange={(e) => handleFormChange({ fill_date: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Station
                    </label>
                    <input
                        type="text"
                        value={formData.station_name || ''}
                        onChange={(e) => handleFormChange({ station_name: e.target.value || null })}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Shell, Costco"
                    />
                </div>
            </div>

            {/* Gallons and Total Cost */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Gallons
                    </label>
                    <input
                        type="number"
                        step="0.001"
                        value={formData.gallons || ''}
                        onChange={(e) => handleFormChange({ gallons: e.target.value ? parseFloat(e.target.value) : null })}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 12.5"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Total Cost
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.total_cents ? (formData.total_cents / 100).toFixed(2) : ''}
                            onChange={(e) => handleFormChange({ total_cents: e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null })}
                            className="w-full pl-8 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0.00"
                        />
                    </div>
                </div>
            </div>

            {/* Odometer and Trip Miles */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Odometer Reading
                    </label>
                    <input
                        type="number"
                        value={formData.odometer || ''}
                        onChange={(e) => handleFormChange({ odometer: e.target.value ? parseInt(e.target.value) : null })}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Current mileage"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Trip Miles (since last fill)
                    </label>
                    <input
                        type="number"
                        step="0.1"
                        value={formData.trip_miles || ''}
                        onChange={(e) => handleFormChange({ trip_miles: e.target.value ? parseFloat(e.target.value) : null })}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Miles driven"
                    />
                </div>
            </div>

            {/* Fuel Type */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Fuel Type
                </label>
                <select
                    value={formData.fuel_type || 'regular'}
                    onChange={(e) => handleFormChange({ fuel_type: e.target.value as FuelType })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="regular">Regular</option>
                    <option value="premium">Premium</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Electric</option>
                </select>
            </div>

            {/* Calculated Fields (Read-only) */}
            {(formData.price_per_gallon_cents || formData.mpg) && (
                <div className="grid grid-cols-2 gap-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                    {formData.price_per_gallon_cents && (
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Price/Gallon</p>
                            <p className="text-white font-medium">
                                ${(formData.price_per_gallon_cents / 100).toFixed(2)}
                            </p>
                        </div>
                    )}
                    {formData.mpg && (
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Calculated MPG</p>
                            <p className="text-green-400 font-medium">
                                {formData.mpg.toFixed(1)} MPG
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Full Tank Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer">
                <input
                    type="checkbox"
                    checked={formData.is_full_tank}
                    onChange={(e) => handleFormChange({ is_full_tank: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-300">Full tank (required for accurate MPG calculation)</span>
            </label>
        </BaseFormModal>
    );
}
