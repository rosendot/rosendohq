// src/app/car/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Car, Plus, Wrench, DollarSign, Calendar, Gauge, X, Trash2, Edit } from 'lucide-react';
import type { Vehicle, MaintenanceRecord, OdometerLog, MaintenanceRecordInsert, VehicleInsert } from '@/types/database.types';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

export default function CarTrackerPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
    const [maintenanceRecordsByVehicle, setMaintenanceRecordsByVehicle] = useState<Record<string, MaintenanceRecord[]>>({});
    const [odometerLogsByVehicle, setOdometerLogsByVehicle] = useState<Record<string, OdometerLog[]>>({});
    const [loading, setLoading] = useState(true);
    const [showAddRecordModal, setShowAddRecordModal] = useState(false);
    const [showVehicleModal, setShowVehicleModal] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        show: boolean;
        type: 'vehicle' | 'record' | null;
        id: string | null;
        name: string;
    }>({ show: false, type: null, id: null, name: '' });

    // Fetch all data on mount
    useEffect(() => {
        async function fetchAllData() {
            try {
                const [vehiclesRes, maintenanceRes, odometerRes] = await Promise.all([
                    fetch('/api/car/vehicles'),
                    fetch('/api/car/maintenance/records'),
                    fetch('/api/car/odometer')
                ]);

                const vehiclesData: Vehicle[] = await vehiclesRes.json();
                const maintenanceData: MaintenanceRecord[] = await maintenanceRes.json();
                const odometerData: OdometerLog[] = await odometerRes.json();

                // Group records and logs by vehicle_id
                const recordsByVehicle: Record<string, MaintenanceRecord[]> = {};
                const logsByVehicle: Record<string, OdometerLog[]> = {};

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

                setVehicles(vehiclesData);
                setMaintenanceRecordsByVehicle(recordsByVehicle);
                setOdometerLogsByVehicle(logsByVehicle);

                if (vehiclesData.length > 0) {
                    setSelectedVehicle(vehiclesData[0].id);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchAllData();
    }, []);

    const currentVehicle = vehicles.find(v => v.id === selectedVehicle);
    const maintenanceRecords = selectedVehicle ? (maintenanceRecordsByVehicle[selectedVehicle] || []) : [];
    const odometerLogs = selectedVehicle ? (odometerLogsByVehicle[selectedVehicle] || []) : [];

    // Form state
    const [formData, setFormData] = useState<MaintenanceRecordInsert>({
        vehicle_id: selectedVehicle || '',
        item: '',
        service_date: new Date().toISOString().split('T')[0],
        mileage: null,
        cost_cents: null,
        vendor: null,
        notes: null,
        warranty_work: false,
        is_diy: false,
        template_id: null,
        receipt_file_id: null,
        next_due_date: null,
        next_due_mileage: null,
        parts_cost_cents: null,
        labor_cost_cents: null,
    });

    // Update vehicle_id in form when selectedVehicle changes
    useEffect(() => {
        if (selectedVehicle) {
            setFormData(prev => ({ ...prev, vehicle_id: selectedVehicle }));
        }
    }, [selectedVehicle]);

    const handleAddRecord = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedVehicle) {
            alert('Please select a vehicle');
            return;
        }

        try {
            const res = await fetch('/api/car/maintenance/records', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error('Failed to add record');

            const newRecord = await res.json();

            // Update local state
            if (selectedVehicle) {
                setMaintenanceRecordsByVehicle(prev => ({
                    ...prev,
                    [selectedVehicle]: [newRecord, ...(prev[selectedVehicle] || [])]
                }));
            }

            setShowAddRecordModal(false);

            // Reset form
            setFormData({
                vehicle_id: selectedVehicle,
                item: '',
                service_date: new Date().toISOString().split('T')[0],
                mileage: null,
                cost_cents: null,
                vendor: null,
                notes: null,
                warranty_work: false,
                is_diy: false,
                template_id: null,
                receipt_file_id: null,
                next_due_date: null,
                next_due_mileage: null,
                parts_cost_cents: null,
                labor_cost_cents: null,
            });
        } catch (error) {
            console.error('Error adding record:', error);
            alert('Failed to add maintenance record');
        }
    };

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
        });
        setShowVehicleModal(true);
    };

    const handleVehicleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            let res;
            if (editingVehicle) {
                // Update existing vehicle
                res = await fetch(`/api/car/vehicles/${editingVehicle.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(vehicleFormData),
                });
            } else {
                // Create new vehicle
                res = await fetch('/api/car/vehicles', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(vehicleFormData),
                });
            }

            if (!res.ok) throw new Error('Failed to save vehicle');

            const savedVehicle = await res.json();

            if (editingVehicle) {
                // Update in list
                setVehicles(prev => prev.map(v => v.id === savedVehicle.id ? savedVehicle : v));
            } else {
                // Add to list
                setVehicles(prev => [savedVehicle, ...prev]);
                setSelectedVehicle(savedVehicle.id);

                // Initialize empty arrays for new vehicle
                setMaintenanceRecordsByVehicle(prev => ({
                    ...prev,
                    [savedVehicle.id]: []
                }));
                setOdometerLogsByVehicle(prev => ({
                    ...prev,
                    [savedVehicle.id]: []
                }));
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
            type: 'vehicle',
            id: vehicle.id,
            name: vehicleName
        });
    };

    const handleDeleteVehicle = async (vehicleId: string) => {
        try {
            const res = await fetch(`/api/car/vehicles/${vehicleId}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to delete vehicle');

            // Remove from list
            setVehicles(prev => prev.filter(v => v.id !== vehicleId));

            // Remove associated records and logs
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

            // Clear selection if deleted vehicle was selected
            if (selectedVehicle === vehicleId) {
                const remainingVehicles = vehicles.filter(v => v.id !== vehicleId);
                setSelectedVehicle(remainingVehicles[0]?.id || null);
            }

            setDeleteConfirmation({ show: false, type: null, id: null, name: '' });
        } catch (error) {
            console.error('Error deleting vehicle:', error);
            alert('Failed to delete vehicle');
        }
    };

    const showDeleteRecordConfirmation = (record: MaintenanceRecord) => {
        setDeleteConfirmation({
            show: true,
            type: 'record',
            id: record.id,
            name: record.item
        });
    };

    const handleDeleteRecord = async (recordId: string) => {
        try {
            const res = await fetch(`/api/car/maintenance/records/${recordId}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to delete record');

            // Remove from local state
            if (selectedVehicle) {
                setMaintenanceRecordsByVehicle(prev => ({
                    ...prev,
                    [selectedVehicle]: (prev[selectedVehicle] || []).filter(r => r.id !== recordId)
                }));
            }

            setDeleteConfirmation({ show: false, type: null, id: null, name: '' });
        } catch (error) {
            console.error('Error deleting record:', error);
            alert('Failed to delete maintenance record');
        }
    };

    const confirmDelete = () => {
        if (deleteConfirmation.type === 'vehicle' && deleteConfirmation.id) {
            handleDeleteVehicle(deleteConfirmation.id);
        } else if (deleteConfirmation.type === 'record' && deleteConfirmation.id) {
            handleDeleteRecord(deleteConfirmation.id);
        }
    };

    const cancelDelete = () => {
        setDeleteConfirmation({ show: false, type: null, id: null, name: '' });
    };

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
                        {/* Main Content Area */}
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
                                                <button
                                                    onClick={() => openEditVehicleModal(currentVehicle)}
                                                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                    Edit Vehicle
                                                </button>
                                            </div>

                                            {/* Vehicle Stats */}
                                            <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Gauge className="w-4 h-4 text-green-400" />
                                                        <p className="text-gray-400 text-sm">Current Mileage</p>
                                                    </div>
                                                    <p className="text-2xl font-bold text-white">
                                                        {odometerLogs[0]?.mileage?.toLocaleString() || '0'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Wrench className="w-4 h-4 text-purple-400" />
                                                        <p className="text-gray-400 text-sm">Records This Year</p>
                                                    </div>
                                                    <p className="text-2xl font-bold text-white">
                                                        {maintenanceRecords.filter(r => {
                                                            const recordYear = new Date(r.service_date).getFullYear();
                                                            return recordYear === new Date().getFullYear();
                                                        }).length}
                                                    </p>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <DollarSign className="w-4 h-4 text-red-400" />
                                                        <p className="text-gray-400 text-sm">Total Spent</p>
                                                    </div>
                                                    <p className="text-2xl font-bold text-white">
                                                        ${(maintenanceRecords.reduce((sum, r) => sum + (r.cost_cents || 0), 0) / 100).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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

                                            {/* Additional Vehicle Information */}
                                            {(currentVehicle.purchase_price_cents || currentVehicle.purchase_mileage || currentVehicle.insurance_provider) && (
                                                <div className="pt-6 border-t border-gray-800">
                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                        {currentVehicle.purchase_price_cents && (
                                                            <div>
                                                                <p className="text-gray-400 text-sm mb-1">Purchase Price</p>
                                                                <p className="text-white font-medium">
                                                                    ${(currentVehicle.purchase_price_cents / 100).toLocaleString()}
                                                                </p>
                                                            </div>
                                                        )}
                                                        {currentVehicle.purchase_mileage && (
                                                            <div>
                                                                <p className="text-gray-400 text-sm mb-1">Purchase Mileage</p>
                                                                <p className="text-white font-medium">
                                                                    {currentVehicle.purchase_mileage.toLocaleString()} mi
                                                                </p>
                                                            </div>
                                                        )}
                                                        {currentVehicle.insurance_provider && (
                                                            <div>
                                                                <p className="text-gray-400 text-sm mb-1">Insurance</p>
                                                                <p className="text-white font-medium">{currentVehicle.insurance_provider}</p>
                                                                {currentVehicle.insurance_policy_number && (
                                                                    <p className="text-gray-400 text-xs mt-1">
                                                                        Policy: {currentVehicle.insurance_policy_number}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}
                                                        {currentVehicle.insurance_renewal_date && (
                                                            <div>
                                                                <p className="text-gray-400 text-sm mb-1">Insurance Renewal</p>
                                                                <p className="text-white font-medium">
                                                                    {new Date(currentVehicle.insurance_renewal_date).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        )}
                                                        {currentVehicle.insurance_premium_cents && (
                                                            <div>
                                                                <p className="text-gray-400 text-sm mb-1">Insurance Premium</p>
                                                                <p className="text-white font-medium">
                                                                    ${(currentVehicle.insurance_premium_cents / 100).toFixed(2)}/period
                                                                </p>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="text-gray-400 text-sm mb-1">Status</p>
                                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                                                                currentVehicle.status === 'active' ? 'bg-green-500/10 text-green-400' :
                                                                currentVehicle.status === 'sold' ? 'bg-blue-500/10 text-blue-400' :
                                                                currentVehicle.status === 'traded' ? 'bg-purple-500/10 text-purple-400' :
                                                                'bg-red-500/10 text-red-400'
                                                            }`}>
                                                                {currentVehicle.status.charAt(0).toUpperCase() + currentVehicle.status.slice(1)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
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
                                                <button
                                                    onClick={() => setShowAddRecordModal(true)}
                                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Add Record
                                                </button>
                                            </div>

                                            {/* Records Timeline */}
                                            {maintenanceRecords.length > 0 ? (
                                                <div className="space-y-4">
                                                    {maintenanceRecords.map(record => (
                                                        <div
                                                            key={record.id}
                                                            className="bg-gray-800 rounded-lg p-5 border border-gray-700 hover:border-gray-600 transition-colors group"
                                                        >
                                                            <div className="flex items-start justify-between mb-3">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-3 mb-1">
                                                                        <h4 className="text-lg font-semibold text-white">
                                                                            {record.item}
                                                                        </h4>
                                                                        <button
                                                                            onClick={() => showDeleteRecordConfirmation(record)}
                                                                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-600/20 text-red-400 rounded transition-all"
                                                                            title="Delete record"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
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

            {/* Add Record Modal */}
            {showAddRecordModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-900 rounded-lg border border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-white">Add Maintenance Record</h2>
                            <button
                                onClick={() => setShowAddRecordModal(false)}
                                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleAddRecord} className="p-6 space-y-4">
                            {/* Item Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Service Item *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.item}
                                    onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Oil Change, Tire Rotation"
                                />
                            </div>

                            {/* Service Date and Mileage */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Service Date *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.service_date}
                                        onChange={(e) => setFormData({ ...formData, service_date: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Mileage
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.mileage || ''}
                                        onChange={(e) => setFormData({ ...formData, mileage: e.target.value ? parseInt(e.target.value) : null })}
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Current mileage"
                                    />
                                </div>
                            </div>

                            {/* Cost */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Total Cost
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.cost_cents ? (formData.cost_cents / 100).toFixed(2) : ''}
                                        onChange={(e) => setFormData({ ...formData, cost_cents: e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null })}
                                        className="w-full pl-8 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            {/* Vendor */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Vendor/Shop
                                </label>
                                <input
                                    type="text"
                                    value={formData.vendor || ''}
                                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value || null })}
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Shop or mechanic name"
                                />
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Notes
                                </label>
                                <textarea
                                    value={formData.notes || ''}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value || null })}
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                                    placeholder="Additional details, parts used, issues found..."
                                />
                            </div>

                            {/* Checkboxes */}
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_diy}
                                        onChange={(e) => setFormData({ ...formData, is_diy: e.target.checked })}
                                        className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-300">DIY (Did it myself)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.warranty_work}
                                        onChange={(e) => setFormData({ ...formData, warranty_work: e.target.checked })}
                                        className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-300">Warranty Work</span>
                                </label>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4 border-t border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setShowAddRecordModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    Add Record
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Make
                                        </label>
                                        <input
                                            type="text"
                                            value={vehicleFormData.make || ''}
                                            onChange={(e) => setVehicleFormData({ ...vehicleFormData, make: e.target.value || null })}
                                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="e.g., Toyota, Honda"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Model
                                        </label>
                                        <input
                                            type="text"
                                            value={vehicleFormData.model || ''}
                                            onChange={(e) => setVehicleFormData({ ...vehicleFormData, model: e.target.value || null })}
                                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="e.g., Camry, Accord"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Year
                                        </label>
                                        <input
                                            type="number"
                                            value={vehicleFormData.year || ''}
                                            onChange={(e) => setVehicleFormData({ ...vehicleFormData, year: e.target.value ? parseInt(e.target.value) : null })}
                                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="e.g., 2020"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Color
                                        </label>
                                        <input
                                            type="text"
                                            value={vehicleFormData.color || ''}
                                            onChange={(e) => setVehicleFormData({ ...vehicleFormData, color: e.target.value || null })}
                                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="e.g., Blue, Red"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Nickname
                                        </label>
                                        <input
                                            type="text"
                                            value={vehicleFormData.nickname || ''}
                                            onChange={(e) => setVehicleFormData({ ...vehicleFormData, nickname: e.target.value || null })}
                                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Optional friendly name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            License Plate
                                        </label>
                                        <input
                                            type="text"
                                            value={vehicleFormData.license_plate || ''}
                                            onChange={(e) => setVehicleFormData({ ...vehicleFormData, license_plate: e.target.value || null })}
                                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="e.g., ABC-1234"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* VIN */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    VIN (Vehicle Identification Number)
                                </label>
                                <input
                                    type="text"
                                    value={vehicleFormData.vin || ''}
                                    onChange={(e) => setVehicleFormData({ ...vehicleFormData, vin: e.target.value || null })}
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="17-character VIN"
                                    maxLength={17}
                                />
                            </div>

                            {/* Purchase Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4">Purchase Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Purchase Date
                                        </label>
                                        <input
                                            type="date"
                                            value={vehicleFormData.purchase_date || ''}
                                            onChange={(e) => setVehicleFormData({ ...vehicleFormData, purchase_date: e.target.value || null })}
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
                                                value={vehicleFormData.purchase_price_cents ? (vehicleFormData.purchase_price_cents / 100).toFixed(2) : ''}
                                                onChange={(e) => setVehicleFormData({ ...vehicleFormData, purchase_price_cents: e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null })}
                                                className="w-full pl-8 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Purchase Mileage
                                        </label>
                                        <input
                                            type="number"
                                            value={vehicleFormData.purchase_mileage || ''}
                                            onChange={(e) => setVehicleFormData({ ...vehicleFormData, purchase_mileage: e.target.value ? parseInt(e.target.value) : null })}
                                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Mileage at purchase"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Status
                                        </label>
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

                            {/* Insurance Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4">Insurance Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Insurance Provider
                                        </label>
                                        <input
                                            type="text"
                                            value={vehicleFormData.insurance_provider || ''}
                                            onChange={(e) => setVehicleFormData({ ...vehicleFormData, insurance_provider: e.target.value || null })}
                                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="e.g., State Farm, Geico"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Policy Number
                                        </label>
                                        <input
                                            type="text"
                                            value={vehicleFormData.insurance_policy_number || ''}
                                            onChange={(e) => setVehicleFormData({ ...vehicleFormData, insurance_policy_number: e.target.value || null })}
                                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Policy number"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Renewal Date
                                        </label>
                                        <input
                                            type="date"
                                            value={vehicleFormData.insurance_renewal_date || ''}
                                            onChange={(e) => setVehicleFormData({ ...vehicleFormData, insurance_renewal_date: e.target.value || null })}
                                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Premium (per billing period)
                                        </label>
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
                onClose={cancelDelete}
                onConfirm={confirmDelete}
                itemName={deleteConfirmation.name}
                title={deleteConfirmation.type === 'vehicle' ? 'Delete Vehicle' : 'Delete Maintenance Record'}
                message={deleteConfirmation.type === 'vehicle'
                    ? `Are you sure you want to delete "${deleteConfirmation.name}"? This will also delete all associated maintenance records and odometer logs. This action cannot be undone.`
                    : undefined
                }
            />
        </div>
    );
}