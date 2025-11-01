// app/car/page.tsx
'use client';

import { useState } from 'react';
import { Plus, Car, Wrench, Calendar, DollarSign, TrendingUp } from 'lucide-react';

interface Vehicle {
    id: string;
    make?: string;
    model?: string;
    year?: number;
    vin?: string;
    nickname?: string;
}

interface MaintenanceRecord {
    id: string;
    vehicle_id: string;
    item: string;
    service_date: string;
    mileage?: number;
    cost_cents?: number;
    vendor?: string;
    notes?: string;
}

export default function CarTrackerPage() {
    const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);

    // Minimal mock data - just 2 vehicles
    const mockVehicles: Vehicle[] = [
        {
            id: '1',
            make: 'Honda',
            model: 'Civic',
            year: 2020,
            nickname: 'Daily Driver',
            vin: '1HGBH41JXMN109186',
        },
        {
            id: '2',
            make: 'Toyota',
            model: 'Camry',
            year: 2018,
            nickname: 'Family Car',
        },
    ];

    // Minimal mock records - just 5 total records
    const mockRecords: MaintenanceRecord[] = [
        {
            id: '1',
            vehicle_id: '1',
            item: 'Oil Change',
            service_date: new Date().toISOString().split('T')[0],
            mileage: 45000,
            cost_cents: 4500,
            vendor: 'QuickLube',
        },
        {
            id: '2',
            vehicle_id: '1',
            item: 'Tire Rotation',
            service_date: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
            mileage: 44500,
            cost_cents: 2500,
            vendor: 'Tire Shop',
        },
        {
            id: '3',
            vehicle_id: '1',
            item: 'Brake Inspection',
            service_date: new Date(Date.now() - 60 * 86400000).toISOString().split('T')[0],
            mileage: 44000,
            cost_cents: 0,
            vendor: 'Honda Dealer',
            notes: 'Free inspection - all good',
        },
        {
            id: '4',
            vehicle_id: '2',
            item: 'Oil Change',
            service_date: new Date(Date.now() - 45 * 86400000).toISOString().split('T')[0],
            mileage: 62000,
            cost_cents: 5000,
            vendor: 'Toyota Service',
        },
        {
            id: '5',
            vehicle_id: '2',
            item: 'Battery Replacement',
            service_date: new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0],
            mileage: 61500,
            cost_cents: 15000,
            vendor: 'Auto Parts Store',
            notes: 'Old battery was 5 years old',
        },
    ];

    const currentVehicle = mockVehicles.find(v => v.id === selectedVehicle);
    const currentRecords = selectedVehicle
        ? mockRecords.filter(r => r.vehicle_id === selectedVehicle).sort((a, b) =>
            new Date(b.service_date).getTime() - new Date(a.service_date).getTime()
        )
        : [];

    const totalCost = currentRecords.reduce((sum, r) => sum + (r.cost_cents || 0), 0);
    const avgCost = currentRecords.length > 0 ? totalCost / currentRecords.length : 0;

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Car Tracker</h1>
                            <p className="text-gray-400">Track vehicle maintenance and expenses</p>
                        </div>
                        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            Add Vehicle
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm font-medium">Total Vehicles</p>
                                <p className="text-3xl font-bold text-white mt-1">{mockVehicles.length}</p>
                            </div>
                            <div className="p-3 bg-blue-500/10 rounded-lg">
                                <Car className="w-8 h-8 text-blue-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm font-medium">Total Records</p>
                                <p className="text-3xl font-bold text-white mt-1">{mockRecords.length}</p>
                            </div>
                            <div className="p-3 bg-green-500/10 rounded-lg">
                                <Wrench className="w-8 h-8 text-green-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm font-medium">Total Spent</p>
                                <p className="text-3xl font-bold text-white mt-1">
                                    ${(mockRecords.reduce((sum, r) => sum + (r.cost_cents || 0), 0) / 100).toFixed(0)}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-500/10 rounded-lg">
                                <DollarSign className="w-8 h-8 text-purple-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm font-medium">Avg Cost</p>
                                <p className="text-3xl font-bold text-white mt-1">
                                    ${(mockRecords.reduce((sum, r) => sum + (r.cost_cents || 0), 0) / mockRecords.length / 100).toFixed(0)}
                                </p>
                            </div>
                            <div className="p-3 bg-yellow-500/10 rounded-lg">
                                <TrendingUp className="w-8 h-8 text-yellow-400" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Vehicles Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                            <h2 className="text-lg font-semibold text-white mb-4">Your Vehicles</h2>

                            <div className="space-y-3">
                                {mockVehicles.map((vehicle) => (
                                    <button
                                        key={vehicle.id}
                                        onClick={() => setSelectedVehicle(vehicle.id)}
                                        className={`w-full text-left p-4 rounded-lg transition-all ${selectedVehicle === vehicle.id
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${selectedVehicle === vehicle.id ? 'bg-blue-500' : 'bg-gray-700'
                                                }`}>
                                                <Car className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                {vehicle.nickname && (
                                                    <p className="font-medium">{vehicle.nickname}</p>
                                                )}
                                                <p className={`text-sm ${selectedVehicle === vehicle.id ? 'text-blue-100' : 'text-gray-400'
                                                    }`}>
                                                    {vehicle.year} {vehicle.make} {vehicle.model}
                                                </p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedVehicle === vehicle.id
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-700 text-gray-300'
                                                }`}>
                                                {mockRecords.filter(r => r.vehicle_id === vehicle.id).length}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Maintenance Records */}
                    <div className="lg:col-span-2">
                        {selectedVehicle ? (
                            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-xl font-semibold text-white">
                                            {currentVehicle?.nickname || `${currentVehicle?.year} ${currentVehicle?.make} ${currentVehicle?.model}`}
                                        </h2>
                                        <p className="text-gray-400 text-sm mt-1">
                                            {currentRecords.length} maintenance record{currentRecords.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                                        <Plus className="w-4 h-4" />
                                        Add Record
                                    </button>
                                </div>

                                {/* Vehicle Stats */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                                        <p className="text-gray-400 text-sm mb-1">Total Spent</p>
                                        <p className="text-2xl font-bold text-white">
                                            ${(totalCost / 100).toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                                        <p className="text-gray-400 text-sm mb-1">Average Cost</p>
                                        <p className="text-2xl font-bold text-white">
                                            ${(avgCost / 100).toFixed(2)}
                                        </p>
                                    </div>
                                </div>

                                {/* Records List */}
                                {currentRecords.length > 0 ? (
                                    <div className="space-y-3">
                                        {currentRecords.map((record) => (
                                            <div
                                                key={record.id}
                                                className="p-4 bg-gray-800 hover:bg-gray-750 rounded-lg transition-colors border border-gray-700"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex-1">
                                                        <h3 className="font-medium text-white">{record.item}</h3>
                                                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="w-4 h-4" />
                                                                {new Date(record.service_date).toLocaleDateString()}
                                                            </span>
                                                            {record.mileage && (
                                                                <span>{record.mileage.toLocaleString()} mi</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {record.cost_cents !== undefined && record.cost_cents > 0 && (
                                                        <span className="text-lg font-semibold text-white">
                                                            ${(record.cost_cents / 100).toFixed(2)}
                                                        </span>
                                                    )}
                                                </div>

                                                {record.vendor && (
                                                    <p className="text-sm text-gray-400 mb-2">
                                                        <span className="font-medium">Vendor:</span> {record.vendor}
                                                    </p>
                                                )}

                                                {record.notes && (
                                                    <p className="text-sm text-gray-400 bg-gray-900 rounded p-2 mt-2">
                                                        {record.notes}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Wrench className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                                        <p className="text-gray-400">No maintenance records yet</p>
                                        <button className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                                            Add First Record
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-gray-900 rounded-lg border border-gray-800 p-12 text-center">
                                <Car className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-white mb-2">Select a Vehicle</h3>
                                <p className="text-gray-400">Choose a vehicle from the sidebar to view maintenance records</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}