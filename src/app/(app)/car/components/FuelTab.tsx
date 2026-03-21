'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit2, Fuel, TrendingUp, Calendar, MapPin, DollarSign } from 'lucide-react';
import type { FuelLog } from '@/types/car.types';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import FuelLogModal from '../modals/FuelLogModal';

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
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        show: boolean;
        id: string | null;
        name: string;
    }>({ show: false, id: null, name: '' });

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

    const openModal = (log?: FuelLog) => {
        setEditingLog(log || null);
        setShowModal(true);
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
            <FuelLogModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                editingLog={editingLog}
                vehicleId={vehicleId}
                onSuccess={onRefresh}
            />

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
