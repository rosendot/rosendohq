// src/app/car/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Car, Plus, X, Trash2, Edit, LayoutDashboard, Wrench, Fuel, Circle, AlertTriangle } from 'lucide-react';
import type { Vehicle, MaintenanceRecord, OdometerLog, FuelLog, TireSet, MaintenanceTemplate, VehicleInsert } from '@/types/database.types';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

// Import tab components
import DashboardTab from './components/DashboardTab';
import MaintenanceTab from './components/MaintenanceTab';
import FuelTab from './components/FuelTab';
import TiresTab from './components/TiresTab';
import IncidentsTab from './components/IncidentsTab';

type TabType = 'dashboard' | 'maintenance' | 'fuel' | 'tires' | 'incidents';

export default function CarTrackerPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
    const [maintenanceRecordsByVehicle, setMaintenanceRecordsByVehicle] = useState<Record<string, MaintenanceRecord[]>>({});
    const [odometerLogsByVehicle, setOdometerLogsByVehicle] = useState<Record<string, OdometerLog[]>>({});
    const [fuelLogsByVehicle, setFuelLogsByVehicle] = useState<Record<string, FuelLog[]>>({});
    const [tireSetsByVehicle, setTireSetsByVehicle] = useState<Record<string, TireSet[]>>({});
    const [maintenanceTemplates, setMaintenanceTemplates] = useState<MaintenanceTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [showVehicleModal, setShowVehicleModal] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('dashboard');
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        show: boolean;
        id: string | null;
        name: string;
    }>({ show: false, id: null, name: '' });

    // Fetch all data
    const fetchAllData = useCallback(async () => {
        try {
            const [vehiclesRes, maintenanceRes, odometerRes, fuelRes, tiresRes, templatesRes] = await Promise.all([
                fetch('/api/car/vehicles'),
                fetch('/api/car/maintenance/records'),
                fetch('/api/car/odometer'),
                fetch('/api/car/fuel'),
                fetch('/api/car/tires'),
                fetch('/api/car/maintenance/templates'),
            ]);

            const vehiclesData: Vehicle[] = await vehiclesRes.json();
            const maintenanceData: MaintenanceRecord[] = await maintenanceRes.json();
            const odometerData: OdometerLog[] = await odometerRes.json();
            const fuelData: FuelLog[] = await fuelRes.json();
            const tiresData: TireSet[] = await tiresRes.json();
            const templatesData: MaintenanceTemplate[] = await templatesRes.json();

            // Group by vehicle_id
            const recordsByVehicle: Record<string, MaintenanceRecord[]> = {};
            const logsByVehicle: Record<string, OdometerLog[]> = {};
            const fuelByVehicle: Record<string, FuelLog[]> = {};
            const tiresByVehicle: Record<string, TireSet[]> = {};

            maintenanceData.forEach(record => {
                if (!recordsByVehicle[record.vehicle_id]) {
                    recordsByVehicle[record.vehicle_id] = [];
                }
                recordsByVehicle[record.vehicle_id].push(record);
            });

            odometerData.forEach(log => {
                if (!logsByVehicle[log.vehicle_id]) {
                    logsByVehicle[log.vehicle_id] = [];
                }
                logsByVehicle[log.vehicle_id].push(log);
            });

            fuelData.forEach(log => {
                if (!fuelByVehicle[log.vehicle_id]) {
                    fuelByVehicle[log.vehicle_id] = [];
                }
                fuelByVehicle[log.vehicle_id].push(log);
            });

            tiresData.forEach(tire => {
                if (!tiresByVehicle[tire.vehicle_id]) {
                    tiresByVehicle[tire.vehicle_id] = [];
                }
                tiresByVehicle[tire.vehicle_id].push(tire);
            });

            setVehicles(vehiclesData);
            setMaintenanceRecordsByVehicle(recordsByVehicle);
            setOdometerLogsByVehicle(logsByVehicle);
            setFuelLogsByVehicle(fuelByVehicle);
            setTireSetsByVehicle(tiresByVehicle);
            setMaintenanceTemplates(templatesData);

            if (vehiclesData.length > 0 && !selectedVehicle) {
                setSelectedVehicle(vehiclesData[0].id);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedVehicle]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const currentVehicle = vehicles.find(v => v.id === selectedVehicle);
    const maintenanceRecords = selectedVehicle ? (maintenanceRecordsByVehicle[selectedVehicle] || []) : [];
    const odometerLogs = selectedVehicle ? (odometerLogsByVehicle[selectedVehicle] || []) : [];
    const fuelLogs = selectedVehicle ? (fuelLogsByVehicle[selectedVehicle] || []) : [];
    const tireSets = selectedVehicle ? (tireSetsByVehicle[selectedVehicle] || []) : [];

    // Vehicle form state
    const [vehicleFormData, setVehicleFormData] = useState<VehicleInsert>({
        make: null,
        model: null,
        year: null,
        vin: null,
        nickname: null,
        license_plate: null,
        color: null,
        purchase_date: null,
        purchase_price_cents: null,
        purchase_mileage: null,
        status: 'active',
        insurance_provider: null,
        insurance_policy_number: null,
        insurance_renewal_date: null,
        insurance_premium_cents: null,
        registration_expiration_date: null,
        registration_state: null,
        registration_cost_cents: null,
        inspection_expiration_date: null,
        emissions_expiration_date: null,
    });

    const openAddVehicleModal = () => {
        setEditingVehicle(null);
        setVehicleFormData({
            make: null,
            model: null,
            year: null,
            vin: null,
            nickname: null,
            license_plate: null,
            color: null,
            purchase_date: null,
            purchase_price_cents: null,
            purchase_mileage: null,
            status: 'active',
            insurance_provider: null,
            insurance_policy_number: null,
            insurance_renewal_date: null,
            insurance_premium_cents: null,
            registration_expiration_date: null,
            registration_state: null,
            registration_cost_cents: null,
            inspection_expiration_date: null,
            emissions_expiration_date: null,
        });
        setShowVehicleModal(true);
    };

    const openEditVehicleModal = (vehicle: Vehicle) => {
        setEditingVehicle(vehicle);
        setVehicleFormData({
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            vin: vehicle.vin,
            nickname: vehicle.nickname,
            license_plate: vehicle.license_plate,
            color: vehicle.color,
            purchase_date: vehicle.purchase_date,
            purchase_price_cents: vehicle.purchase_price_cents,
            purchase_mileage: vehicle.purchase_mileage,
            status: vehicle.status,
            insurance_provider: vehicle.insurance_provider,
            insurance_policy_number: vehicle.insurance_policy_number,
            insurance_renewal_date: vehicle.insurance_renewal_date,
            insurance_premium_cents: vehicle.insurance_premium_cents,
            registration_expiration_date: vehicle.registration_expiration_date,
            registration_state: vehicle.registration_state,
            registration_cost_cents: vehicle.registration_cost_cents,
            inspection_expiration_date: vehicle.inspection_expiration_date,
            emissions_expiration_date: vehicle.emissions_expiration_date,
        });
        setShowVehicleModal(true);
    };

    const handleVehicleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            let res;
            if (editingVehicle) {
                res = await fetch(`/api/car/vehicles/${editingVehicle.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(vehicleFormData),
                });
            } else {
                res = await fetch('/api/car/vehicles', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(vehicleFormData),
                });
            }

            if (!res.ok) throw new Error('Failed to save vehicle');

            const savedVehicle = await res.json();

            if (editingVehicle) {
                setVehicles(prev => prev.map(v => v.id === savedVehicle.id ? savedVehicle : v));
            } else {
                setVehicles(prev => [savedVehicle, ...prev]);
                setSelectedVehicle(savedVehicle.id);
                // Initialize empty arrays for new vehicle
                setMaintenanceRecordsByVehicle(prev => ({ ...prev, [savedVehicle.id]: [] }));
                setOdometerLogsByVehicle(prev => ({ ...prev, [savedVehicle.id]: [] }));
                setFuelLogsByVehicle(prev => ({ ...prev, [savedVehicle.id]: [] }));
                setTireSetsByVehicle(prev => ({ ...prev, [savedVehicle.id]: [] }));
            }

            setShowVehicleModal(false);
            setEditingVehicle(null);
        } catch (error) {
            console.error('Error saving vehicle:', error);
            alert('Failed to save vehicle');
        }
    };

    const showDeleteVehicleConfirmation = (vehicle: Vehicle) => {
        const vehicleName = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
        setDeleteConfirmation({
            show: true,
            id: vehicle.id,
            name: vehicleName
        });
    };

    const handleDeleteVehicle = async () => {
        if (!deleteConfirmation.id) return;

        try {
            const res = await fetch(`/api/car/vehicles/${deleteConfirmation.id}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to delete vehicle');

            const vehicleId = deleteConfirmation.id;
            setVehicles(prev => prev.filter(v => v.id !== vehicleId));
            setMaintenanceRecordsByVehicle(prev => {
                const newState = { ...prev };
                delete newState[vehicleId];
                return newState;
            });
            setOdometerLogsByVehicle(prev => {
                const newState = { ...prev };
                delete newState[vehicleId];
                return newState;
            });
            setFuelLogsByVehicle(prev => {
                const newState = { ...prev };
                delete newState[vehicleId];
                return newState;
            });
            setTireSetsByVehicle(prev => {
                const newState = { ...prev };
                delete newState[vehicleId];
                return newState;
            });

            if (selectedVehicle === vehicleId) {
                const remainingVehicles = vehicles.filter(v => v.id !== vehicleId);
                setSelectedVehicle(remainingVehicles[0]?.id || null);
            }

            setDeleteConfirmation({ show: false, id: null, name: '' });
        } catch (error) {
            console.error('Error deleting vehicle:', error);
            alert('Failed to delete vehicle');
        }
    };

    const tabs = [
        { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'maintenance' as TabType, label: 'Maintenance', icon: Wrench },
        { id: 'fuel' as TabType, label: 'Fuel', icon: Fuel },
        { id: 'tires' as TabType, label: 'Tires', icon: Circle },
        { id: 'incidents' as TabType, label: 'Incidents', icon: AlertTriangle },
    ];

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
                            <p className="text-gray-400">Track vehicle maintenance, fuel, and expenses</p>
                        </div>
                        <button
                            onClick={openAddVehicleModal}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Add Vehicle
                        </button>
                    </div>
                </div>

                {vehicles.length === 0 ? (
                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-12 text-center">
                        <Car className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No Vehicles Yet</h3>
                        <p className="text-gray-400 mb-6">Add your first vehicle to start tracking</p>
                        <button
                            onClick={openAddVehicleModal}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                        >
                            Add Your First Vehicle
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Vehicle Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                                <h2 className="text-lg font-semibold text-white mb-4">
                                    Vehicles ({vehicles.length})
                                </h2>
                                <div className="space-y-2">
                                    {vehicles.map(vehicle => (
                                        <div
                                            key={vehicle.id}
                                            className={`relative rounded-lg transition-all group ${selectedVehicle === vehicle.id
                                                ? 'bg-blue-600'
                                                : 'bg-gray-800 hover:bg-gray-700'
                                                }`}
                                        >
                                            <button
                                                onClick={() => setSelectedVehicle(vehicle.id)}
                                                className="w-full text-left p-4 pr-12"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Car className={`w-5 h-5 flex-shrink-0 ${selectedVehicle === vehicle.id ? 'text-white' : 'text-gray-300'}`} />
                                                    <div className="min-w-0 flex-1">
                                                        <p className={`font-medium truncate ${selectedVehicle === vehicle.id ? 'text-white' : 'text-gray-300'}`}>
                                                            {vehicle.year} {vehicle.make} {vehicle.model}
                                                        </p>
                                                        {vehicle.nickname && (
                                                            <p className={`text-sm opacity-75 truncate ${selectedVehicle === vehicle.id ? 'text-white' : 'text-gray-300'}`}>
                                                                {vehicle.nickname}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    showDeleteVehicleConfirmation(vehicle);
                                                }}
                                                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded transition-all
                                                    ${selectedVehicle === vehicle.id
                                                        ? 'opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-white'
                                                        : 'opacity-0 group-hover:opacity-100 hover:bg-red-600/20 text-red-400'
                                                    }`}
                                                title="Delete vehicle"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-3">
                            {currentVehicle ? (
                                <div className="space-y-6">
                                    {/* Vehicle Header Card */}
                                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h2 className="text-2xl font-bold text-white mb-1">
                                                    {currentVehicle.year} {currentVehicle.make} {currentVehicle.model}
                                                </h2>
                                                {currentVehicle.nickname && (
                                                    <p className="text-gray-400">{currentVehicle.nickname}</p>
                                                )}
                                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                                                    {currentVehicle.license_plate && (
                                                        <span>Plate: {currentVehicle.license_plate}</span>
                                                    )}
                                                    {currentVehicle.color && (
                                                        <span>Color: {currentVehicle.color}</span>
                                                    )}
                                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                                        currentVehicle.status === 'active' ? 'bg-green-500/10 text-green-400' :
                                                        currentVehicle.status === 'sold' ? 'bg-blue-500/10 text-blue-400' :
                                                        currentVehicle.status === 'traded' ? 'bg-purple-500/10 text-purple-400' :
                                                        'bg-red-500/10 text-red-400'
                                                    }`}>
                                                        {currentVehicle.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => openEditVehicleModal(currentVehicle)}
                                                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                            >
                                                <Edit className="w-4 h-4" />
                                                Edit
                                            </button>
                                        </div>
                                    </div>

                                    {/* Tab Navigation */}
                                    <div className="border-b border-gray-800">
                                        <nav className="flex gap-1" aria-label="Tabs">
                                            {tabs.map((tab) => {
                                                const Icon = tab.icon;
                                                return (
                                                    <button
                                                        key={tab.id}
                                                        onClick={() => setActiveTab(tab.id)}
                                                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                                                            activeTab === tab.id
                                                                ? 'bg-gray-800 text-white border-b-2 border-blue-500'
                                                                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                                                        }`}
                                                    >
                                                        <Icon className="w-4 h-4" />
                                                        {tab.label}
                                                    </button>
                                                );
                                            })}
                                        </nav>
                                    </div>

                                    {/* Tab Content */}
                                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                                        {activeTab === 'dashboard' && (
                                            <DashboardTab
                                                vehicle={currentVehicle}
                                                maintenanceRecords={maintenanceRecords}
                                                fuelLogs={fuelLogs}
                                                tireSets={tireSets}
                                                odometerLogs={odometerLogs}
                                            />
                                        )}
                                        {activeTab === 'maintenance' && (
                                            <MaintenanceTab
                                                records={maintenanceRecords}
                                                templates={maintenanceTemplates}
                                                vehicleId={currentVehicle.id}
                                                onRefresh={fetchAllData}
                                            />
                                        )}
                                        {activeTab === 'fuel' && (
                                            <FuelTab
                                                fuelLogs={fuelLogs}
                                                vehicleId={currentVehicle.id}
                                                onRefresh={fetchAllData}
                                            />
                                        )}
                                        {activeTab === 'tires' && (
                                            <TiresTab
                                                tireSets={tireSets}
                                                vehicleId={currentVehicle.id}
                                                onRefresh={fetchAllData}
                                            />
                                        )}
                                        {activeTab === 'incidents' && (
                                            <IncidentsTab
                                                records={maintenanceRecords}
                                                vehicleId={currentVehicle.id}
                                                onRefresh={fetchAllData}
                                            />
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-gray-900 rounded-lg border border-gray-800 p-12 text-center">
                                    <Car className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-white mb-2">Select a Vehicle</h3>
                                    <p className="text-gray-400">Choose a vehicle from the sidebar to view details</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Add/Edit Vehicle Modal */}
            {showVehicleModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-900 rounded-lg border border-gray-800 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-white">
                                {editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowVehicleModal(false);
                                    setEditingVehicle(null);
                                }}
                                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleVehicleSubmit} className="p-6 space-y-6">
                            {/* Basic Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Make</label>
                                        <input
                                            type="text"
                                            value={vehicleFormData.make || ''}
                                            onChange={(e) => setVehicleFormData({ ...vehicleFormData, make: e.target.value || null })}
                                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="e.g., Toyota"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Model</label>
                                        <input
                                            type="text"
                                            value={vehicleFormData.model || ''}
                                            onChange={(e) => setVehicleFormData({ ...vehicleFormData, model: e.target.value || null })}
                                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="e.g., Camry"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Year</label>
                                        <input
                                            type="number"
                                            value={vehicleFormData.year || ''}
                                            onChange={(e) => setVehicleFormData({ ...vehicleFormData, year: e.target.value ? parseInt(e.target.value) : null })}
                                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="e.g., 2020"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
                                        <input
                                            type="text"
                                            value={vehicleFormData.color || ''}
                                            onChange={(e) => setVehicleFormData({ ...vehicleFormData, color: e.target.value || null })}
                                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="e.g., Blue"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Nickname</label>
                                        <input
                                            type="text"
                                            value={vehicleFormData.nickname || ''}
                                            onChange={(e) => setVehicleFormData({ ...vehicleFormData, nickname: e.target.value || null })}
                                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Optional"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">License Plate</label>
                                        <input
                                            type="text"
                                            value={vehicleFormData.license_plate || ''}
                                            onChange={(e) => setVehicleFormData({ ...vehicleFormData, license_plate: e.target.value || null })}
                                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="e.g., ABC-1234"
                                        />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">VIN</label>
                                    <input
                                        type="text"
                                        value={vehicleFormData.vin || ''}
                                        onChange={(e) => setVehicleFormData({ ...vehicleFormData, vin: e.target.value || null })}
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="17-character VIN"
                                        maxLength={17}
                                    />
                                </div>
                            </div>

                            {/* Purchase Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4">Purchase Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Purchase Date</label>
                                        <input
                                            type="date"
                                            value={vehicleFormData.purchase_date || ''}
                                            onChange={(e) => setVehicleFormData({ ...vehicleFormData, purchase_date: e.target.value || null })}
                                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Purchase Price</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={vehicleFormData.purchase_price_cents ? (vehicleFormData.purchase_price_cents / 100).toFixed(2) : ''}
                                                onChange={(e) => setVehicleFormData({ ...vehicleFormData, purchase_price_cents: e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null })}
                                                className="w-full pl-8 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Purchase Mileage</label>
                                        <input
                                            type="number"
                                            value={vehicleFormData.purchase_mileage || ''}
                                            onChange={(e) => setVehicleFormData({ ...vehicleFormData, purchase_mileage: e.target.value ? parseInt(e.target.value) : null })}
                                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Mileage at purchase"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                                        <select
                                            value={vehicleFormData.status}
                                            onChange={(e) => setVehicleFormData({ ...vehicleFormData, status: e.target.value as 'active' | 'sold' | 'traded' | 'totaled' })}
                                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="active">Active</option>
                                            <option value="sold">Sold</option>
                                            <option value="traded">Traded</option>
                                            <option value="totaled">Totaled</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Registration & Inspection */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4">Registration & Inspection</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Registration State</label>
                                        <input
                                            type="text"
                                            value={vehicleFormData.registration_state || ''}
                                            onChange={(e) => setVehicleFormData({ ...vehicleFormData, registration_state: e.target.value || null })}
                                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="e.g., NC"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Registration Expires</label>
                                        <input
                                            type="date"
                                            value={vehicleFormData.registration_expiration_date || ''}
                                            onChange={(e) => setVehicleFormData({ ...vehicleFormData, registration_expiration_date: e.target.value || null })}
                                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Registration Cost</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={vehicleFormData.registration_cost_cents ? (vehicleFormData.registration_cost_cents / 100).toFixed(2) : ''}
                                                onChange={(e) => setVehicleFormData({ ...vehicleFormData, registration_cost_cents: e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null })}
                                                className="w-full pl-8 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Inspection Expires</label>
                                        <input
                                            type="date"
                                            value={vehicleFormData.inspection_expiration_date || ''}
                                            onChange={(e) => setVehicleFormData({ ...vehicleFormData, inspection_expiration_date: e.target.value || null })}
                                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Emissions Test Expires</label>
                                        <input
                                            type="date"
                                            value={vehicleFormData.emissions_expiration_date || ''}
                                            onChange={(e) => setVehicleFormData({ ...vehicleFormData, emissions_expiration_date: e.target.value || null })}
                                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Insurance Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4">Insurance Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Insurance Provider</label>
                                        <input
                                            type="text"
                                            value={vehicleFormData.insurance_provider || ''}
                                            onChange={(e) => setVehicleFormData({ ...vehicleFormData, insurance_provider: e.target.value || null })}
                                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="e.g., State Farm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Policy Number</label>
                                        <input
                                            type="text"
                                            value={vehicleFormData.insurance_policy_number || ''}
                                            onChange={(e) => setVehicleFormData({ ...vehicleFormData, insurance_policy_number: e.target.value || null })}
                                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Policy number"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Renewal Date</label>
                                        <input
                                            type="date"
                                            value={vehicleFormData.insurance_renewal_date || ''}
                                            onChange={(e) => setVehicleFormData({ ...vehicleFormData, insurance_renewal_date: e.target.value || null })}
                                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Premium</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={vehicleFormData.insurance_premium_cents ? (vehicleFormData.insurance_premium_cents / 100).toFixed(2) : ''}
                                                onChange={(e) => setVehicleFormData({ ...vehicleFormData, insurance_premium_cents: e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null })}
                                                className="w-full pl-8 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4 border-t border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowVehicleModal(false);
                                        setEditingVehicle(null);
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    {editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
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
                onConfirm={handleDeleteVehicle}
                itemName={deleteConfirmation.name}
                title="Delete Vehicle"
                message={`Are you sure you want to delete "${deleteConfirmation.name}"? This will also delete all associated maintenance records, fuel logs, and tire sets. This action cannot be undone.`}
            />
        </div>
    );
}
