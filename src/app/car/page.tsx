// src/app/car/page.tsx
'use client';

import { useState, useEffect } from 'react';

interface Vehicle {
    id: string;
    make?: string;
    model?: string;
    year?: number;
    vin?: string;
    nickname?: string;
    created_at: string;
}

interface MaintenanceNextDue {
    owner_id: string;
    vehicle_id: string;
    item: string;
    last_service_date?: string;
    last_service_mileage?: number;
    interval_miles?: number;
    interval_months?: number;
    next_due_mileage?: number;
    next_due_date?: string;
}

interface VehicleLastOdo {
    vehicle_id: string;
    last_mileage: number;
    last_date: string;
}

interface OdometerLog {
    id: string;
    vehicle_id: string;
    log_date: string;
    mileage: number;
    created_at: string;
}

interface MaintenanceRecord {
    id: string;
    vehicle_id: string;
    template_id?: string;
    item: string;
    service_date: string;
    mileage?: number;
    cost_cents?: number;
    vendor?: string;
    notes?: string;
    created_at: string;
}

interface FuelLog {
    id: string;
    vehicle_id: string;
    fill_date: string;
    odometer?: number;
    gallons?: number;
    total_cents?: number;
    created_at: string;
}

// Mock data for development
const mockVehicles: Vehicle[] = [
    {
        id: '1',
        make: 'Honda',
        model: 'Civic',
        year: 2020,
        nickname: 'Daily Driver',
        created_at: '2024-01-01T00:00:00Z'
    },
    {
        id: '2',
        make: 'Ford',
        model: 'F-150',
        year: 2018,
        nickname: 'The Truck',
        created_at: '2024-01-01T00:00:00Z'
    }
];

const mockMaintenanceNextDue: MaintenanceNextDue[] = [
    {
        owner_id: 'user1',
        vehicle_id: '1',
        item: 'Oil Change',
        last_service_date: '2024-10-15',
        last_service_mileage: 45000,
        interval_miles: 5000,
        interval_months: 6,
        next_due_mileage: 50000,
        next_due_date: '2025-04-15T00:00:00'
    },
    {
        owner_id: 'user1',
        vehicle_id: '1',
        item: 'Tire Rotation',
        last_service_date: '2024-08-20',
        last_service_mileage: 42000,
        interval_miles: 7500,
        interval_months: null,
        next_due_mileage: 49500,
        next_due_date: null
    }
];

const mockVehicleLastOdo: VehicleLastOdo[] = [
    {
        vehicle_id: '1',
        last_mileage: 47850,
        last_date: '2025-01-05'
    },
    {
        vehicle_id: '2',
        last_mileage: 82340,
        last_date: '2025-01-04'
    }
];

const mockRecentMaintenance: MaintenanceRecord[] = [
    {
        id: '1',
        vehicle_id: '1',
        item: 'Oil Change',
        service_date: '2024-10-15',
        mileage: 45000,
        cost_cents: 4500,
        vendor: 'Jiffy Lube',
        notes: 'Full synthetic oil',
        created_at: '2024-10-15T10:00:00Z'
    }
];

const mockRecentFuel: FuelLog[] = [
    {
        id: '1',
        vehicle_id: '1',
        fill_date: '2025-01-05',
        odometer: 47850,
        gallons: 12.5,
        total_cents: 3875,
        created_at: '2025-01-05T15:30:00Z'
    }
];

export default function CarPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
    const [selectedVehicleId, setSelectedVehicleId] = useState<string>('1');
    const [maintenanceNextDue, setMaintenanceNextDue] = useState<MaintenanceNextDue[]>(mockMaintenanceNextDue);
    const [vehicleOdometer, setVehicleOdometer] = useState<VehicleLastOdo[]>(mockVehicleLastOdo);
    const [recentMaintenance, setRecentMaintenance] = useState<MaintenanceRecord[]>(mockRecentMaintenance);
    const [recentFuel, setRecentFuel] = useState<FuelLog[]>(mockRecentFuel);

    // Quick entry states
    const [quickOdometer, setQuickOdometer] = useState('');
    const [quickFuelGallons, setQuickFuelGallons] = useState('');
    const [quickFuelCost, setQuickFuelCost] = useState('');
    const [quickMaintenanceItem, setQuickMaintenanceItem] = useState('');
    const [quickMaintenanceCost, setQuickMaintenanceCost] = useState('');

    const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);
    const currentOdometer = vehicleOdometer.find(v => v.vehicle_id === selectedVehicleId);
    const upcomingMaintenance = maintenanceNextDue.filter(m => m.vehicle_id === selectedVehicleId);
    const vehicleMaintenance = recentMaintenance.filter(m => m.vehicle_id === selectedVehicleId);
    const vehicleFuel = recentFuel.filter(f => f.vehicle_id === selectedVehicleId);

    const getMaintenanceStatus = (item: MaintenanceNextDue) => {
        if (!currentOdometer) return 'unknown';

        const currentMiles = currentOdometer.last_mileage;
        if (item.next_due_mileage) {
            const milesUntilDue = item.next_due_mileage - currentMiles;
            if (milesUntilDue <= 0) return 'overdue';
            if (milesUntilDue <= 500) return 'due_soon';
            return 'ok';
        }

        if (item.next_due_date) {
            const dueDate = new Date(item.next_due_date);
            const today = new Date();
            const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            if (daysUntilDue <= 0) return 'overdue';
            if (daysUntilDue <= 30) return 'due_soon';
            return 'ok';
        }

        return 'unknown';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'overdue': return 'bg-red-50 border-red-200 text-red-900';
            case 'due_soon': return 'bg-yellow-50 border-yellow-200 text-yellow-900';
            case 'ok': return 'bg-green-50 border-green-200 text-green-900';
            default: return 'bg-gray-50 border-gray-200 text-gray-900';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'overdue': return '🚨';
            case 'due_soon': return '⚠️';
            case 'ok': return '✅';
            default: return '❓';
        }
    };

    const formatCurrency = (cents: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(cents / 100);
    };

    const logOdometer = () => {
        if (!quickOdometer || !selectedVehicleId) return;

        // Mock implementation - would call API
        console.log('Logging odometer:', quickOdometer, 'for vehicle:', selectedVehicleId);
        setQuickOdometer('');

        // Update local state
        const updatedOdo = vehicleOdometer.map(v =>
            v.vehicle_id === selectedVehicleId
                ? { ...v, last_mileage: parseInt(quickOdometer), last_date: new Date().toISOString().split('T')[0] }
                : v
        );
        setVehicleOdometer(updatedOdo);
    };

    const logFuelUp = () => {
        if (!quickFuelGallons || !quickFuelCost || !selectedVehicleId) return;

        console.log('Logging fuel:', { gallons: quickFuelGallons, cost: quickFuelCost });
        setQuickFuelGallons('');
        setQuickFuelCost('');
    };

    const logMaintenance = () => {
        if (!quickMaintenanceItem || !selectedVehicleId) return;

        console.log('Logging maintenance:', { item: quickMaintenanceItem, cost: quickMaintenanceCost });
        setQuickMaintenanceItem('');
        setQuickMaintenanceCost('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-violet-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-violet-600 bg-clip-text text-transparent mb-2">
                        Car Tracker
                    </h1>
                    <p className="text-gray-600">Manage your vehicle maintenance, fuel logs, and costs</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Vehicle Selection Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg border border-emerald-100 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Vehicles</h2>
                            <div className="space-y-3">
                                {vehicles.map(vehicle => (
                                    <button
                                        key={vehicle.id}
                                        onClick={() => setSelectedVehicleId(vehicle.id)}
                                        className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${selectedVehicleId === vehicle.id
                                            ? 'bg-gradient-to-r from-emerald-50 to-violet-50 border-emerald-200 shadow-md'
                                            : 'bg-gray-50 border-gray-200 hover:bg-gradient-to-r hover:from-emerald-25 hover:to-violet-25'
                                            }`}
                                    >
                                        <div className="font-medium text-gray-900">
                                            {vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {vehicle.year} {vehicle.make} {vehicle.model}
                                        </div>
                                        {currentOdometer && currentOdometer.vehicle_id === vehicle.id && (
                                            <div className="text-xs text-emerald-600 mt-1">
                                                {currentOdometer.last_mileage.toLocaleString()} miles
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            <button className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-md text-sm">
                                Add Vehicle
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {selectedVehicle ? (
                            <div className="space-y-6">
                                {/* Vehicle Header Card */}
                                <div className="bg-white rounded-xl shadow-lg border border-violet-100 p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900">
                                                {selectedVehicle.nickname || `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`}
                                            </h2>
                                            <p className="text-gray-600">
                                                {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                                            </p>
                                        </div>
                                        {currentOdometer && (
                                            <div className="text-right">
                                                <div className="text-3xl font-bold text-emerald-600">
                                                    {currentOdometer.last_mileage.toLocaleString()}
                                                </div>
                                                <div className="text-sm text-gray-600">miles</div>
                                                <div className="text-xs text-gray-500">
                                                    as of {new Date(currentOdometer.last_date).toLocaleDateString()}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Quick Entry Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Quick Odometer */}
                                    <div className="bg-white rounded-xl shadow-lg border border-emerald-100 p-4">
                                        <h3 className="font-semibold text-gray-900 mb-3">Log Odometer</h3>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                placeholder="Miles"
                                                value={quickOdometer}
                                                onChange={(e) => setQuickOdometer(e.target.value)}
                                                className="flex-1 px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                            />
                                            <button
                                                onClick={logOdometer}
                                                disabled={!quickOdometer}
                                                className="px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 text-sm transition-colors"
                                            >
                                                Log
                                            </button>
                                        </div>
                                    </div>

                                    {/* Quick Fuel */}
                                    <div className="bg-white rounded-xl shadow-lg border border-violet-100 p-4">
                                        <h3 className="font-semibold text-gray-900 mb-3">Log Fuel</h3>
                                        <div className="space-y-2">
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    placeholder="Gallons"
                                                    value={quickFuelGallons}
                                                    onChange={(e) => setQuickFuelGallons(e.target.value)}
                                                    className="flex-1 px-3 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                                                />
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="$"
                                                    value={quickFuelCost}
                                                    onChange={(e) => setQuickFuelCost(e.target.value)}
                                                    className="w-20 px-3 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                                                />
                                            </div>
                                            <button
                                                onClick={logFuelUp}
                                                disabled={!quickFuelGallons || !quickFuelCost}
                                                className="w-full px-3 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 disabled:opacity-50 text-sm transition-colors"
                                            >
                                                Log Fuel
                                            </button>
                                        </div>
                                    </div>

                                    {/* Quick Maintenance */}
                                    <div className="bg-white rounded-xl shadow-lg border border-teal-100 p-4">
                                        <h3 className="font-semibold text-gray-900 mb-3">Log Maintenance</h3>
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                placeholder="Service item"
                                                value={quickMaintenanceItem}
                                                onChange={(e) => setQuickMaintenanceItem(e.target.value)}
                                                className="w-full px-3 py-2 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                            />
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="Cost $"
                                                    value={quickMaintenanceCost}
                                                    onChange={(e) => setQuickMaintenanceCost(e.target.value)}
                                                    className="flex-1 px-3 py-2 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                                />
                                                <button
                                                    onClick={logMaintenance}
                                                    disabled={!quickMaintenanceItem}
                                                    className="px-3 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 text-sm transition-colors"
                                                >
                                                    Log
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Maintenance Due */}
                                <div className="bg-white rounded-xl shadow-lg border border-emerald-100">
                                    <div className="p-6 border-b border-emerald-100">
                                        <h3 className="text-xl font-semibold text-gray-900">Maintenance Due</h3>
                                    </div>
                                    <div className="p-6">
                                        {upcomingMaintenance.length > 0 ? (
                                            <div className="space-y-3">
                                                {upcomingMaintenance.map((item, index) => {
                                                    const status = getMaintenanceStatus(item);
                                                    const statusColor = getStatusColor(status);
                                                    const statusIcon = getStatusIcon(status);

                                                    return (
                                                        <div key={index} className={`p-4 rounded-lg border ${statusColor}`}>
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-lg">{statusIcon}</span>
                                                                    <div>
                                                                        <div className="font-medium">{item.item}</div>
                                                                        {item.last_service_date && (
                                                                            <div className="text-sm opacity-75">
                                                                                Last: {new Date(item.last_service_date).toLocaleDateString()}
                                                                                {item.last_service_mileage && ` at ${item.last_service_mileage.toLocaleString()} miles`}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="text-right text-sm">
                                                                    {item.next_due_mileage && currentOdometer && (
                                                                        <div>
                                                                            Due at {item.next_due_mileage.toLocaleString()} miles
                                                                            <div className="opacity-75">
                                                                                ({(item.next_due_mileage - currentOdometer.last_mileage).toLocaleString()} miles to go)
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {item.next_due_date && (
                                                                        <div>
                                                                            Due {new Date(item.next_due_date).toLocaleDateString()}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="text-center text-gray-500 py-8">
                                                <p>All maintenance is up to date! 🎉</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Recent Activity */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Recent Maintenance */}
                                    <div className="bg-white rounded-xl shadow-lg border border-violet-100">
                                        <div className="p-6 border-b border-violet-100">
                                            <h3 className="text-lg font-semibold text-gray-900">Recent Maintenance</h3>
                                        </div>
                                        <div className="p-6">
                                            {vehicleMaintenance.length > 0 ? (
                                                <div className="space-y-3">
                                                    {vehicleMaintenance.slice(0, 5).map(record => (
                                                        <div key={record.id} className="p-3 bg-violet-50 rounded-lg border border-violet-200">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <div className="font-medium text-violet-900">{record.item}</div>
                                                                    <div className="text-sm text-violet-700">
                                                                        {new Date(record.service_date).toLocaleDateString()}
                                                                        {record.mileage && ` • ${record.mileage.toLocaleString()} miles`}
                                                                    </div>
                                                                    {record.vendor && (
                                                                        <div className="text-sm text-violet-600">at {record.vendor}</div>
                                                                    )}
                                                                </div>
                                                                {record.cost_cents && (
                                                                    <div className="font-medium text-violet-900">
                                                                        {formatCurrency(record.cost_cents)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center text-gray-500 py-4">
                                                    <p>No maintenance records yet</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Recent Fuel */}
                                    <div className="bg-white rounded-xl shadow-lg border border-teal-100">
                                        <div className="p-6 border-b border-teal-100">
                                            <h3 className="text-lg font-semibold text-gray-900">Recent Fuel</h3>
                                        </div>
                                        <div className="p-6">
                                            {vehicleFuel.length > 0 ? (
                                                <div className="space-y-3">
                                                    {vehicleFuel.slice(0, 5).map(fuel => (
                                                        <div key={fuel.id} className="p-3 bg-teal-50 rounded-lg border border-teal-200">
                                                            <div className="flex justify-between items-center">
                                                                <div>
                                                                    <div className="font-medium text-teal-900">
                                                                        {fuel.gallons} gallons
                                                                    </div>
                                                                    <div className="text-sm text-teal-700">
                                                                        {new Date(fuel.fill_date).toLocaleDateString()}
                                                                        {fuel.odometer && ` • ${fuel.odometer.toLocaleString()} miles`}
                                                                    </div>
                                                                </div>
                                                                {fuel.total_cents && (
                                                                    <div className="text-right">
                                                                        <div className="font-medium text-teal-900">
                                                                            {formatCurrency(fuel.total_cents)}
                                                                        </div>
                                                                        {fuel.gallons && fuel.total_cents && (
                                                                            <div className="text-sm text-teal-700">
                                                                                ${(fuel.total_cents / 100 / fuel.gallons).toFixed(2)}/gal
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center text-gray-500 py-4">
                                                    <p>No fuel records yet</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-lg border border-violet-100 p-8 text-center text-gray-500">
                                <p>Select a vehicle to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}