'use client';

import { useState, useEffect } from 'react';
import BaseFormModal from '@/components/BaseFormModal';
import type { Vehicle, VehicleInsert } from '@/types/car.types';

interface VehicleModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingVehicle: Vehicle | null;
    onSuccess: (vehicle: Vehicle, isNew: boolean) => void;
}

const EMPTY_FORM: VehicleInsert = {
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
};

export default function VehicleModal({ isOpen, onClose, editingVehicle, onSuccess }: VehicleModalProps) {
    const [vehicleFormData, setVehicleFormData] = useState<VehicleInsert>(EMPTY_FORM);

    // Reset form when modal opens for adding
    useEffect(() => {
        if (isOpen && !editingVehicle) {
            setVehicleFormData(EMPTY_FORM);
        }
    }, [isOpen, editingVehicle]);

    // Populate form when editing
    useEffect(() => {
        if (editingVehicle) {
            setVehicleFormData({
                make: editingVehicle.make,
                model: editingVehicle.model,
                year: editingVehicle.year,
                vin: editingVehicle.vin,
                nickname: editingVehicle.nickname,
                license_plate: editingVehicle.license_plate,
                color: editingVehicle.color,
                purchase_date: editingVehicle.purchase_date,
                purchase_price_cents: editingVehicle.purchase_price_cents,
                purchase_mileage: editingVehicle.purchase_mileage,
                status: editingVehicle.status,
                insurance_provider: editingVehicle.insurance_provider,
                insurance_policy_number: editingVehicle.insurance_policy_number,
                insurance_renewal_date: editingVehicle.insurance_renewal_date,
                insurance_premium_cents: editingVehicle.insurance_premium_cents,
                registration_expiration_date: editingVehicle.registration_expiration_date,
                registration_state: editingVehicle.registration_state,
                registration_cost_cents: editingVehicle.registration_cost_cents,
                inspection_expiration_date: editingVehicle.inspection_expiration_date,
                emissions_expiration_date: editingVehicle.emissions_expiration_date,
            });
        }
    }, [editingVehicle]);

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
            onSuccess(savedVehicle, !editingVehicle);
        } catch (error) {
            console.error('Error saving vehicle:', error);
            alert('Failed to save vehicle');
        }
    };

    return (
        <BaseFormModal
            isOpen={isOpen}
            onClose={onClose}
            title={editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
            onSubmit={handleVehicleSubmit}
            submitLabel={editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
            maxWidth="2xl"
        >
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
        </BaseFormModal>
    );
}
