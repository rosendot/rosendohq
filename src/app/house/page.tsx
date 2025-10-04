// src/app/house/page.tsx
'use client';

import { useState } from 'react';

// Types
interface HomeProperty {
    id: string;
    name: string;
    address1?: string;
    city?: string;
    state?: string;
}

interface HomeArea {
    id: string;
    property_id: string;
    name: string;
    type?: 'bedroom' | 'bathroom' | 'kitchen' | 'living_room' | 'garage' | 'outdoor' | 'other';
}

interface HomeAppliance {
    id: string;
    property_id: string;
    area_id?: string;
    name: string;
    manufacturer?: string;
    model?: string;
    purchase_date?: string;
}

interface MaintenanceTemplate {
    id: string;
    property_id: string;
    name: string;
    interval_months?: number;
    notes?: string;
}

interface MaintenanceRecord {
    id: string;
    property_id: string;
    item: string;
    service_date: string;
    cost?: number;
    next_due?: string;
}

interface SupplyStock {
    id: string;
    property_id: string;
    supply_name: string;
    quantity: number;
    min_quantity: number;
    unit?: string;
}

// Minimal mock data
const mockProperty: HomeProperty = {
    id: '1',
    name: 'Main Residence',
    address1: '123 Main St',
    city: 'Charlotte',
    state: 'NC'
};

const mockAreas: HomeArea[] = [
    { id: '1', property_id: '1', name: 'Kitchen', type: 'kitchen' },
    { id: '2', property_id: '1', name: 'Garage', type: 'garage' },
    { id: '3', property_id: '1', name: 'Front Yard', type: 'outdoor' }
];

const mockAppliances: HomeAppliance[] = [
    { id: '1', property_id: '1', area_id: '1', name: 'Refrigerator', manufacturer: 'Samsung', purchase_date: '2022-03-15' },
    { id: '2', property_id: '1', area_id: '2', name: 'Water Heater', manufacturer: 'Rheem', purchase_date: '2020-06-10' }
];

const mockMaintenanceRecords: MaintenanceRecord[] = [
    { id: '1', property_id: '1', item: 'HVAC Filter Change', service_date: '2025-01-01', cost: 25, next_due: '2025-04-01' },
    { id: '2', property_id: '1', item: 'Gutter Cleaning', service_date: '2024-10-20', cost: 120, next_due: '2025-04-20' },
    { id: '3', property_id: '1', item: 'Lawn Fertilization', service_date: '2024-12-15', next_due: '2025-03-15' }
];

const mockSupplyStock: SupplyStock[] = [
    { id: '1', property_id: '1', supply_name: 'Trash Bags', quantity: 2, min_quantity: 5, unit: 'box' },
    { id: '2', property_id: '1', supply_name: 'Dish Soap', quantity: 1, min_quantity: 2, unit: 'bottle' },
    { id: '3', property_id: '1', supply_name: 'HVAC Filters', quantity: 1, min_quantity: 3, unit: 'filter' }
];

export default function HousePage() {
    const [property] = useState<HomeProperty>(mockProperty);
    const [areas] = useState<HomeArea[]>(mockAreas);
    const [appliances] = useState<HomeAppliance[]>(mockAppliances);
    const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>(mockMaintenanceRecords);
    const [supplyStock, setSupplyStock] = useState<SupplyStock[]>(mockSupplyStock);
    const [selectedView, setSelectedView] = useState<'overview' | 'maintenance' | 'supplies' | 'appliances'>('overview');

    // Quick actions
    const [quickMaintenanceItem, setQuickMaintenanceItem] = useState('');
    const [quickMaintenanceCost, setQuickMaintenanceCost] = useState('');
    const [quickSupplyUpdate, setQuickSupplyUpdate] = useState<{ id: string; quantity: number } | null>(null);

    const logMaintenance = () => {
        if (!quickMaintenanceItem.trim()) return;

        const newRecord: MaintenanceRecord = {
            id: Date.now().toString(),
            property_id: property.id,
            item: quickMaintenanceItem.trim(),
            service_date: new Date().toISOString().split('T')[0],
            cost: quickMaintenanceCost ? parseFloat(quickMaintenanceCost) : undefined
        };

        setMaintenanceRecords([newRecord, ...maintenanceRecords]);
        setQuickMaintenanceItem('');
        setQuickMaintenanceCost('');
    };

    const updateSupplyStock = (stockId: string, newQuantity: number) => {
        setSupplyStock(supplyStock.map(s =>
            s.id === stockId ? { ...s, quantity: Math.max(0, newQuantity) } : s
        ));
    };

    const lowStockSupplies = supplyStock.filter(s => s.quantity < s.min_quantity);
    const upcomingMaintenance = maintenanceRecords
        .filter(r => r.next_due)
        .sort((a, b) => (a.next_due || '').localeCompare(b.next_due || ''))
        .slice(0, 5);

    const totalMaintenanceCost = maintenanceRecords.reduce((sum, r) => sum + (r.cost || 0), 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
                        House Tracker
                    </h1>
                    <p className="text-gray-600">Manage home maintenance, appliances, and household supplies</p>
                    <div className="mt-4 flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span className="font-semibold text-gray-900">{property.name}</span>
                        </div>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-600">{property.address1}, {property.city}, {property.state}</span>
                    </div>
                </div>

                {/* View Tabs */}
                <div className="mb-6 border-b border-gray-200">
                    <div className="flex gap-4">
                        {(['overview', 'maintenance', 'supplies', 'appliances'] as const).map(view => (
                            <button
                                key={view}
                                onClick={() => setSelectedView(view)}
                                className={`pb-3 px-1 font-medium text-sm capitalize transition-colors ${selectedView === view
                                    ? 'border-b-2 border-amber-600 text-amber-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {view}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Overview View */}
                {selectedView === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Summary Cards */}
                        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-xl shadow-md border border-amber-100 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Areas</p>
                                        <p className="text-2xl font-bold text-gray-900">{areas.length}</p>
                                    </div>
                                    <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-md border border-orange-100 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Appliances</p>
                                        <p className="text-2xl font-bold text-gray-900">{appliances.length}</p>
                                    </div>
                                    <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-md border border-red-100 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Low Stock Items</p>
                                        <p className="text-2xl font-bold text-red-600">{lowStockSupplies.length}</p>
                                    </div>
                                    <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-md border border-green-100 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">YTD Maintenance</p>
                                        <p className="text-2xl font-bold text-gray-900">${totalMaintenanceCost.toFixed(0)}</p>
                                    </div>
                                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Low Stock Alerts */}
                        {lowStockSupplies.length > 0 && (
                            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-red-200 overflow-hidden">
                                <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-4">
                                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        Low Stock Alerts
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-3">
                                        {lowStockSupplies.map(supply => (
                                            <div key={supply.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">{supply.supply_name}</p>
                                                    <p className="text-sm text-red-600">
                                                        {supply.quantity} {supply.unit} (min: {supply.min_quantity})
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => updateSupplyStock(supply.id, supply.quantity - 1)}
                                                        className="p-2 bg-white rounded-lg border border-gray-300 hover:bg-gray-50"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                                        </svg>
                                                    </button>
                                                    <span className="w-12 text-center font-semibold">{supply.quantity}</span>
                                                    <button
                                                        onClick={() => updateSupplyStock(supply.id, supply.quantity + 1)}
                                                        className="p-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Upcoming Maintenance */}
                        <div className="bg-white rounded-xl shadow-lg border border-amber-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
                                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Upcoming Maintenance
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="space-y-3">
                                    {upcomingMaintenance.map(record => (
                                        <div key={record.id} className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                                            <p className="font-medium text-gray-900">{record.item}</p>
                                            <p className="text-sm text-amber-700 mt-1">
                                                Due: {new Date(record.next_due!).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Maintenance View */}
                {selectedView === 'maintenance' && (
                    <div className="space-y-6">
                        {/* Quick Log */}
                        <div className="bg-white rounded-xl shadow-lg border border-amber-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Log Maintenance</h3>
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    value={quickMaintenanceItem}
                                    onChange={(e) => setQuickMaintenanceItem(e.target.value)}
                                    placeholder="What was done? (e.g., Changed air filter)"
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                                <input
                                    type="number"
                                    value={quickMaintenanceCost}
                                    onChange={(e) => setQuickMaintenanceCost(e.target.value)}
                                    placeholder="Cost ($)"
                                    className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                                <button
                                    onClick={logMaintenance}
                                    className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium"
                                >
                                    Log
                                </button>
                            </div>
                        </div>

                        {/* Maintenance History */}
                        <div className="bg-white rounded-xl shadow-lg border border-amber-100 overflow-hidden">
                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Maintenance History</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Due</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {maintenanceRecords.map(record => (
                                            <tr key={record.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm text-gray-900">{record.item}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {new Date(record.service_date).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {record.cost ? `$${record.cost.toFixed(2)}` : '-'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {record.next_due ? new Date(record.next_due).toLocaleDateString() : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Supplies View */}
                {selectedView === 'supplies' && (
                    <div className="bg-white rounded-xl shadow-lg border border-amber-100 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Household Supplies</h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {supplyStock.map(supply => (
                                    <div
                                        key={supply.id}
                                        className={`p-4 rounded-lg border-2 ${supply.quantity < supply.min_quantity
                                            ? 'bg-red-50 border-red-300'
                                            : 'bg-gray-50 border-gray-200'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-semibold text-gray-900">{supply.supply_name}</h4>
                                            {supply.quantity < supply.min_quantity && (
                                                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                                                    Low
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm text-gray-600">
                                                Min: {supply.min_quantity} {supply.unit}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => updateSupplyStock(supply.id, supply.quantity - 1)}
                                                    className="p-1 bg-white rounded border border-gray-300 hover:bg-gray-50"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                                    </svg>
                                                </button>
                                                <span className="w-12 text-center font-bold text-gray-900">
                                                    {supply.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateSupplyStock(supply.id, supply.quantity + 1)}
                                                    className="p-1 bg-amber-600 text-white rounded hover:bg-amber-700"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Appliances View */}
                {selectedView === 'appliances' && (
                    <div className="bg-white rounded-xl shadow-lg border border-amber-100 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Appliances & Equipment</h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {appliances.map(appliance => {
                                    const area = areas.find(a => a.id === appliance.area_id);
                                    const age = appliance.purchase_date
                                        ? Math.floor((new Date().getTime() - new Date(appliance.purchase_date).getTime()) / (1000 * 60 * 60 * 24 * 365))
                                        : null;

                                    return (
                                        <div key={appliance.id} className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 text-lg">{appliance.name}</h4>
                                                    {area && (
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            <span className="inline-flex items-center gap-1">
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                </svg>
                                                                {area.name}
                                                            </span>
                                                        </p>
                                                    )}
                                                </div>
                                                {age !== null && (
                                                    <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded">
                                                        {age} yr{age !== 1 ? 's' : ''}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="space-y-2 text-sm">
                                                {appliance.manufacturer && (
                                                    <p className="text-gray-700">
                                                        <span className="font-medium">Make:</span> {appliance.manufacturer}
                                                    </p>
                                                )}
                                                {appliance.model && (
                                                    <p className="text-gray-700">
                                                        <span className="font-medium">Model:</span> {appliance.model}
                                                    </p>
                                                )}
                                                {appliance.purchase_date && (
                                                    <p className="text-gray-700">
                                                        <span className="font-medium">Purchased:</span>{' '}
                                                        {new Date(appliance.purchase_date).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}