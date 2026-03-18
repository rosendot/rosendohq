'use client';

import { useState } from 'react';
import { Plus, X, Trash2, Edit2, Fuel, TrendingUp, Calendar, MapPin, DollarSign } from 'lucide-react';
import type { FuelLog, FuelLogInsert, FuelType } from '@/types/car.types';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

interface FuelTabProps {
    fuelLogs: FuelLog[];
    vehicleId: string;
    onRefresh: () => void;
}

export default function FuelTab({
    fuelLogs,
    vehicleId,
    onRefresh,
}: FuelTabProps) {
    const [showModal, setShowModal] = useState(false);
    const [editingLog, setEditingLog] = useState<FuelLog | null>(null);
    const [loading, setLoading] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        show: boolean;
        id: string | null;
        name: string;
    }>({ show: false, id: null, name: '' });

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

    // Calculate stats
    const logsWithMpg = fuelLogs.filter(f => f.mpg && f.mpg > 0);
    const avgMpg = logsWithMpg.length > 0
        ? logsWithMpg.reduce((sum, f) => sum + (f.mpg || 0), 0) / logsWithMpg.length
        : null;
    const totalGallons = fuelLogs.reduce((sum, f) => sum + (f.gallons || 0), 0);
    const totalSpent = fuelLogs.reduce((sum, f) => sum + (f.total_cents || 0), 0);
    const avgPricePerGallon = fuelLogs.length > 0 && totalGallons > 0
        ? totalSpent / totalGallons
        : null;

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
        setEditingLog(null);
    };

    const openModal = (log?: FuelLog) => {
        if (log) {
            setEditingLog(log);
            setFormData({
                vehicle_id: log.vehicle_id,
                fill_date: log.fill_date,
                odometer: log.odometer,
                gallons: log.gallons,
                total_cents: log.total_cents,
                fuel_type: log.fuel_type,
                is_full_tank: log.is_full_tank,
                station_name: log.station_name,
                price_per_gallon_cents: log.price_per_gallon_cents,
                trip_miles: log.trip_miles,
                mpg: log.mpg,
            });
        } else {
            resetForm();
        }
        setShowModal(true);
    };

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

            setShowModal(false);
            resetForm();
            onRefresh();
        } catch (error) {
            console.error('Error saving fuel log:', error);
        } finally {
            setLoading(false);
        }
    };

    const showDeleteConfirmation = (log: FuelLog) => {
        setDeleteConfirmation({
            show: true,
            id: log.id,
            name: `Fuel entry on ${new Date(log.fill_date).toLocaleDateString()}`,
        });
    };

    const handleDelete = async () => {
        if (!deleteConfirmation.id) return;

        try {
            const response = await fetch(`/api/car/fuel/${deleteConfirmation.id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete');
            setDeleteConfirmation({ show: false, id: null, name: '' });
            onRefresh();
        } catch (error) {
            console.error('Error deleting fuel log:', error);
        }
    };

    const formatCurrency = (cents: number | null) => {
        if (!cents) return '--';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(cents / 100);
    };

    return (
        <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Avg MPG</span>
                        <TrendingUp className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {avgMpg ? avgMpg.toFixed(1) : '--'}
                    </div>
                </div>

                <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Total Gallons</span>
                        <Fuel className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {totalGallons.toFixed(1)}
                    </div>
                </div>

                <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Total Spent</span>
                        <DollarSign className="w-4 h-4 text-red-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {formatCurrency(totalSpent)}
                    </div>
                </div>

                <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Avg $/Gallon</span>
                        <DollarSign className="w-4 h-4 text-orange-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {avgPricePerGallon ? `$${(avgPricePerGallon / 100).toFixed(2)}` : '--'}
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-white">Fuel Logs</h2>
                    <p className="text-gray-400 text-sm mt-1">
                        {fuelLogs.length} fill-up{fuelLogs.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Fuel Entry
                </button>
            </div>

            {/* Fuel Logs List */}
            {fuelLogs.length === 0 ? (
                <div className="bg-gray-900 rounded-lg border border-gray-800 p-12 text-center">
                    <Fuel className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-400">No fuel logs yet</p>
                    <button
                        onClick={() => openModal()}
                        className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        Add First Fill-up
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {fuelLogs.map((log) => (
                        <div
                            key={log.id}
                            className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors group"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="flex items-center gap-2 text-white">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <span className="font-medium">
                                                {new Date(log.fill_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {log.station_name && (
                                            <div className="flex items-center gap-1 text-gray-400 text-sm">
                                                <MapPin className="w-3 h-3" />
                                                {log.station_name}
                                            </div>
                                        )}
                                        <button
                                            onClick={() => openModal(log)}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-gray-700 text-gray-400 rounded transition-all"
                                            title="Edit"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => showDeleteConfirmation(log)}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-600/20 text-red-400 rounded transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                                        {log.gallons && (
                                            <span>
                                                <span className="text-gray-500">Gallons:</span> {log.gallons.toFixed(2)}
                                            </span>
                                        )}
                                        {log.odometer && (
                                            <span>
                                                <span className="text-gray-500">Odometer:</span> {log.odometer.toLocaleString()} mi
                                            </span>
                                        )}
                                        {log.trip_miles && (
                                            <span>
                                                <span className="text-gray-500">Trip:</span> {log.trip_miles.toFixed(1)} mi
                                            </span>
                                        )}
                                        {!log.is_full_tank && (
                                            <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 text-xs rounded">
                                                Partial fill
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-white">
                                        {formatCurrency(log.total_cents)}
                                    </div>
                                    {log.mpg && (
                                        <div className="text-sm text-green-400 font-medium">
                                            {log.mpg.toFixed(1)} MPG
                                        </div>
                                    )}
                                    {log.price_per_gallon_cents && (
                                        <div className="text-xs text-gray-500">
                                            ${(log.price_per_gallon_cents / 100).toFixed(2)}/gal
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-white">
                                {editingLog ? 'Edit Fuel Entry' : 'Add Fuel Entry'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
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

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4 border-t border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : editingLog ? 'Update' : 'Add Entry'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={deleteConfirmation.show}
                onClose={() => setDeleteConfirmation({ show: false, id: null, name: '' })}
                onConfirm={handleDelete}
                itemName={deleteConfirmation.name}
                title="Delete Fuel Entry"
            />
        </div>
    );
}
