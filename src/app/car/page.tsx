// src/app/car/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Car, Plus, Wrench, DollarSign, Calendar, Gauge } from 'lucide-react';
import type { Vehicle, MaintenanceRecord, OdometerLog } from '@/types/database.types';

export default function CarTrackerPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
    const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
    const [odometerLogs, setOdometerLogs] = useState<OdometerLog[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch vehicles on mount
    useEffect(() => {
        async function fetchVehicles() {
            try {
                const res = await fetch('/api/car/vehicles');
                const data = await res.json();
                setVehicles(data);
                if (data.length > 0) {
                    setSelectedVehicle(data[0].id);
                }
            } catch (error) {
                console.error('Error fetching vehicles:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchVehicles();
    }, []);

    // Fetch maintenance records and odometer logs when vehicle changes
    useEffect(() => {
        if (!selectedVehicle) return;

        async function fetchVehicleData() {
            try {
                const [maintenanceRes, odometerRes] = await Promise.all([
                    fetch(`/api/car/maintenance/records?vehicleId=${selectedVehicle}`),
                    fetch(`/api/car/odometer?vehicleId=${selectedVehicle}`)
                ]);

                const maintenanceData = await maintenanceRes.json();
                const odometerData = await odometerRes.json();

                setMaintenanceRecords(maintenanceData);
                setOdometerLogs(odometerData);
            } catch (error) {
                console.error('Error fetching vehicle data:', error);
            }
        }

        fetchVehicleData();
    }, [selectedVehicle]);

    const currentVehicle = vehicles.find(v => v.id === selectedVehicle);
    const currentMileage = odometerLogs[0]?.mileage || 0;

    // Calculate stats
    const totalCost = maintenanceRecords.reduce((sum, r) => sum + (r.cost_cents || 0), 0);
    const avgCost = maintenanceRecords.length > 0 ? totalCost / maintenanceRecords.length : 0;
    const recordsThisYear = maintenanceRecords.filter(r => {
        const recordYear = new Date(r.service_date).getFullYear();
        return recordYear === new Date().getFullYear();
    }).length;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading vehicles...</p>
                </div>
            </div>
        );
    }

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

                {vehicles.length === 0 ? (
                    // Empty State
                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-12 text-center">
                        <Car className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No Vehicles Yet</h3>
                        <p className="text-gray-400 mb-6">Add your first vehicle to start tracking maintenance</p>
                        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                            Add Your First Vehicle
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm font-medium">Total Vehicles</p>
                                        <p className="text-3xl font-bold text-white mt-1">{vehicles.length}</p>
                                    </div>
                                    <div className="p-3 bg-blue-500/10 rounded-lg">
                                        <Car className="w-8 h-8 text-blue-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm font-medium">Current Mileage</p>
                                        <p className="text-3xl font-bold text-white mt-1">
                                            {currentMileage.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-green-500/10 rounded-lg">
                                        <Gauge className="w-8 h-8 text-green-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm font-medium">Records This Year</p>
                                        <p className="text-3xl font-bold text-white mt-1">{recordsThisYear}</p>
                                    </div>
                                    <div className="p-3 bg-purple-500/10 rounded-lg">
                                        <Wrench className="w-8 h-8 text-purple-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm font-medium">Total Spent</p>
                                        <p className="text-3xl font-bold text-white mt-1">
                                            ${(totalCost / 100).toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-red-500/10 rounded-lg">
                                        <DollarSign className="w-8 h-8 text-red-400" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            {/* Vehicle Sidebar */}
                            <div className="lg:col-span-1">
                                <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                                    <h2 className="text-lg font-semibold text-white mb-4">Vehicles</h2>
                                    <div className="space-y-2">
                                        {vehicles.map(vehicle => (
                                            <button
                                                key={vehicle.id}
                                                onClick={() => setSelectedVehicle(vehicle.id)}
                                                className={`w-full text-left p-4 rounded-lg transition-all ${selectedVehicle === vehicle.id
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Car className="w-5 h-5 flex-shrink-0" />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-medium truncate">
                                                            {vehicle.year} {vehicle.make} {vehicle.model}
                                                        </p>
                                                        {vehicle.nickname && (
                                                            <p className="text-sm opacity-75 truncate">
                                                                {vehicle.nickname}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Vehicle Details & Records */}
                            <div className="lg:col-span-3">
                                {currentVehicle ? (
                                    <div className="space-y-6">
                                        {/* Vehicle Info Card */}
                                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                                            <div className="flex items-start justify-between mb-6">
                                                <div>
                                                    <h2 className="text-2xl font-bold text-white mb-2">
                                                        {currentVehicle.year} {currentVehicle.make} {currentVehicle.model}
                                                    </h2>
                                                    {currentVehicle.nickname && (
                                                        <p className="text-lg text-gray-400">{currentVehicle.nickname}</p>
                                                    )}
                                                </div>
                                                <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors">
                                                    Edit Vehicle
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {currentVehicle.color && (
                                                    <div>
                                                        <p className="text-gray-400 text-sm mb-1">Color</p>
                                                        <p className="text-white font-medium">{currentVehicle.color}</p>
                                                    </div>
                                                )}
                                                {currentVehicle.vin && (
                                                    <div>
                                                        <p className="text-gray-400 text-sm mb-1">VIN</p>
                                                        <p className="text-white font-medium text-xs">{currentVehicle.vin}</p>
                                                    </div>
                                                )}
                                                {currentVehicle.license_plate && (
                                                    <div>
                                                        <p className="text-gray-400 text-sm mb-1">License Plate</p>
                                                        <p className="text-white font-medium">{currentVehicle.license_plate}</p>
                                                    </div>
                                                )}
                                                {currentVehicle.purchase_date && (
                                                    <div>
                                                        <p className="text-gray-400 text-sm mb-1">Purchase Date</p>
                                                        <p className="text-white font-medium">
                                                            {new Date(currentVehicle.purchase_date).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Maintenance Records */}
                                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                                            <div className="flex items-center justify-between mb-6">
                                                <div>
                                                    <h3 className="text-xl font-semibold text-white">Maintenance Records</h3>
                                                    <p className="text-gray-400 text-sm mt-1">
                                                        {maintenanceRecords.length} record{maintenanceRecords.length !== 1 ? 's' : ''}
                                                    </p>
                                                </div>
                                                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                                                    <Plus className="w-4 h-4" />
                                                    Add Record
                                                </button>
                                            </div>

                                            {/* Quick Stats */}
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

                                            {/* Records Timeline */}
                                            {maintenanceRecords.length > 0 ? (
                                                <div className="space-y-4">
                                                    {maintenanceRecords.map(record => (
                                                        <div
                                                            key={record.id}
                                                            className="bg-gray-800 rounded-lg p-5 border border-gray-700 hover:border-gray-600 transition-colors"
                                                        >
                                                            <div className="flex items-start justify-between mb-3">
                                                                <div className="flex-1">
                                                                    <h4 className="text-lg font-semibold text-white mb-1">
                                                                        {record.item}
                                                                    </h4>
                                                                    <div className="flex items-center gap-4 text-sm text-gray-400">
                                                                        <div className="flex items-center gap-1">
                                                                            <Calendar className="w-4 h-4" />
                                                                            {new Date(record.service_date).toLocaleDateString()}
                                                                        </div>
                                                                        {record.mileage && (
                                                                            <div className="flex items-center gap-1">
                                                                                <Gauge className="w-4 h-4" />
                                                                                {record.mileage.toLocaleString()} mi
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                {record.cost_cents && (
                                                                    <div className="text-right">
                                                                        <p className="text-xl font-bold text-white">
                                                                            ${(record.cost_cents / 100).toFixed(2)}
                                                                        </p>
                                                                        {record.is_diy && (
                                                                            <span className="inline-block mt-1 px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded">
                                                                                DIY
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {record.vendor && (
                                                                <p className="text-sm text-gray-400 mb-2">
                                                                    Vendor: {record.vendor}
                                                                </p>
                                                            )}
                                                            {record.notes && (
                                                                <p className="text-sm text-gray-300 bg-gray-900 rounded p-3 border border-gray-700">
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
                    </>
                )}
            </div>
        </div>
    );
}