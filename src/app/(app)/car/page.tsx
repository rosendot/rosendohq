// src/app/car/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Car, Plus, Trash2, Edit, LayoutDashboard, Wrench, Fuel, Circle, AlertTriangle } from 'lucide-react';
import type { Vehicle, MaintenanceRecord, OdometerLog, FuelLog, TireSet, MaintenanceTemplate } from '@/types/car.types';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import VehicleModal from './modals/VehicleModal';

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
                            onClick={() => { setEditingVehicle(null); setShowVehicleModal(true); }}
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
                            onClick={() => { setEditingVehicle(null); setShowVehicleModal(true); }}
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
                                                onClick={() => { setEditingVehicle(currentVehicle); setShowVehicleModal(true); }}
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
            <VehicleModal
                isOpen={showVehicleModal}
                onClose={() => {
                    setShowVehicleModal(false);
                    setEditingVehicle(null);
                }}
                editingVehicle={editingVehicle}
                onSuccess={(savedVehicle, isNew) => {
                    if (isNew) {
                        setVehicles(prev => [savedVehicle, ...prev]);
                        setSelectedVehicle(savedVehicle.id);
                        setMaintenanceRecordsByVehicle(prev => ({ ...prev, [savedVehicle.id]: [] }));
                        setOdometerLogsByVehicle(prev => ({ ...prev, [savedVehicle.id]: [] }));
                        setFuelLogsByVehicle(prev => ({ ...prev, [savedVehicle.id]: [] }));
                        setTireSetsByVehicle(prev => ({ ...prev, [savedVehicle.id]: [] }));
                    } else {
                        setVehicles(prev => prev.map(v => v.id === savedVehicle.id ? savedVehicle : v));
                    }
                    setShowVehicleModal(false);
                    setEditingVehicle(null);
                }}
            />

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
