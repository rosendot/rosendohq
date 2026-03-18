'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit2, AlertCircle } from 'lucide-react';
import BaseFormModal from '@/components/BaseFormModal';
import type { HomeAppliance, HomeApplianceInsert, HomeArea } from '@/types/house.types';

interface AppliancesTabProps {
    appliances: HomeAppliance[];
    areas: HomeArea[];
    propertyId: string | null;
    onRefresh: () => void;
}

export default function AppliancesTab({
    appliances,
    areas,
    propertyId,
    onRefresh,
}: AppliancesTabProps) {
    const [showModal, setShowModal] = useState(false);
    const [editingAppliance, setEditingAppliance] = useState<HomeAppliance | null>(null);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<HomeApplianceInsert>({
        property_id: propertyId || '',
        area_id: null,
        name: '',
        manufacturer: null,
        model: null,
        serial_number: null,
        purchase_date: null,
        purchase_price_cents: null,
        warranty_months: null,
        notes: null,
    });

    const resetForm = () => {
        setFormData({
            property_id: propertyId || '',
            area_id: null,
            name: '',
            manufacturer: null,
            model: null,
            serial_number: null,
            purchase_date: null,
            purchase_price_cents: null,
            warranty_months: null,
            notes: null,
        });
        setEditingAppliance(null);
    };

    const openModal = (appliance?: HomeAppliance) => {
        if (appliance) {
            setEditingAppliance(appliance);
            setFormData({
                property_id: appliance.property_id,
                area_id: appliance.area_id,
                name: appliance.name,
                manufacturer: appliance.manufacturer,
                model: appliance.model,
                serial_number: appliance.serial_number,
                purchase_date: appliance.purchase_date,
                purchase_price_cents: appliance.purchase_price_cents,
                warranty_months: appliance.warranty_months,
                notes: appliance.notes,
            });
        } else {
            resetForm();
        }
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) return;
        setLoading(true);

        try {
            const url = editingAppliance
                ? `/api/house/appliances/${editingAppliance.id}`
                : '/api/house/appliances';
            const method = editingAppliance ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Failed to save appliance');

            setShowModal(false);
            resetForm();
            onRefresh();
        } catch (error) {
            console.error('Error saving appliance:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this appliance?')) return;

        try {
            const response = await fetch(`/api/house/appliances/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete');
            onRefresh();
        } catch (error) {
            console.error('Error deleting appliance:', error);
        }
    };

    const getWarrantyEndDate = (purchaseDate: string | null, warrantyMonths: number | null) => {
        if (!purchaseDate || !warrantyMonths) return null;
        const end = new Date(purchaseDate);
        end.setMonth(end.getMonth() + warrantyMonths);
        return end;
    };

    const isWarrantyExpiring = (purchaseDate: string | null, warrantyMonths: number | null) => {
        const endDate = getWarrantyEndDate(purchaseDate, warrantyMonths);
        if (!endDate) return false;
        const threeMonths = new Date();
        threeMonths.setMonth(threeMonths.getMonth() + 3);
        return endDate <= threeMonths && endDate > new Date();
    };

    const isWarrantyExpired = (purchaseDate: string | null, warrantyMonths: number | null) => {
        const endDate = getWarrantyEndDate(purchaseDate, warrantyMonths);
        if (!endDate) return false;
        return endDate < new Date();
    };

    const formatCurrency = (cents: number | null) => {
        if (!cents) return null;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(cents / 100);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Appliances</h2>
                <button
                    onClick={() => openModal()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Appliance
                </button>
            </div>

            {appliances.length === 0 ? (
                <div className="bg-gray-900 rounded-lg border border-gray-800 p-12 text-center">
                    <p className="text-gray-500">No appliances added yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {appliances.map((appliance) => {
                        const area = areas.find((a) => a.id === appliance.area_id);
                        const warrantyExpiring = isWarrantyExpiring(appliance.purchase_date, appliance.warranty_months);
                        const warrantyExpired = isWarrantyExpired(appliance.purchase_date, appliance.warranty_months);
                        const warrantyEndDate = getWarrantyEndDate(appliance.purchase_date, appliance.warranty_months);

                        return (
                            <div
                                key={appliance.id}
                                className={`p-4 bg-gray-900 rounded-lg border transition-colors ${
                                    warrantyExpired
                                        ? 'border-red-500/30'
                                        : warrantyExpiring
                                        ? 'border-orange-500/30'
                                        : 'border-gray-800'
                                }`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-white">
                                                {appliance.name}
                                            </h3>
                                            {warrantyExpired && (
                                                <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-xs rounded border border-red-500/20">
                                                    Warranty Expired
                                                </span>
                                            )}
                                            {warrantyExpiring && !warrantyExpired && (
                                                <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 text-xs rounded border border-orange-500/20 flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" />
                                                    Expiring Soon
                                                </span>
                                            )}
                                        </div>
                                        {appliance.manufacturer && (
                                            <p className="text-sm text-gray-400">{appliance.manufacturer}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => openModal(appliance)}
                                            className="p-1 text-gray-400 hover:text-white transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(appliance.id)}
                                            className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1 text-sm text-gray-400">
                                    {area && <div>Location: {area.name}</div>}
                                    {appliance.model && (
                                        <div>Model: {appliance.model}</div>
                                    )}
                                    {appliance.serial_number && (
                                        <div>Serial: {appliance.serial_number}</div>
                                    )}
                                    {appliance.purchase_date && (
                                        <div>
                                            Purchased:{' '}
                                            {new Date(appliance.purchase_date).toLocaleDateString()}
                                        </div>
                                    )}
                                    {appliance.purchase_price_cents && (
                                        <div>
                                            Price: {formatCurrency(appliance.purchase_price_cents)}
                                        </div>
                                    )}
                                    {warrantyEndDate && (
                                        <div
                                            className={
                                                warrantyExpired
                                                    ? 'text-red-400'
                                                    : warrantyExpiring
                                                    ? 'text-orange-400'
                                                    : ''
                                            }
                                        >
                                            Warranty until: {warrantyEndDate.toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            <BaseFormModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingAppliance ? 'Edit Appliance' : 'Add Appliance'}
                onSubmit={handleSubmit}
                loading={loading}
                submitLabel={editingAppliance ? 'Update' : 'Create'}
                submitDisabled={!formData.name.trim()}
            >
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                        Name *
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                        }
                        required
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        placeholder="e.g., Refrigerator"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                        Area
                    </label>
                    <select
                        value={formData.area_id || ''}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                area_id: e.target.value || null,
                            })
                        }
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                        <option value="">Select area...</option>
                        {areas.map((area) => (
                            <option key={area.id} value={area.id}>
                                {area.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Manufacturer
                        </label>
                        <input
                            type="text"
                            value={formData.manufacturer || ''}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    manufacturer: e.target.value || null,
                                })
                            }
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Model
                        </label>
                        <input
                            type="text"
                            value={formData.model || ''}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    model: e.target.value || null,
                                })
                            }
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                        Serial Number
                    </label>
                    <input
                        type="text"
                        value={formData.serial_number || ''}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                serial_number: e.target.value || null,
                            })
                        }
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Purchase Date
                        </label>
                        <input
                            type="date"
                            value={formData.purchase_date || ''}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    purchase_date: e.target.value || null,
                                })
                            }
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Price ($)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={
                                formData.purchase_price_cents
                                    ? formData.purchase_price_cents / 100
                                    : ''
                            }
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    purchase_price_cents: e.target.value
                                        ? Math.round(parseFloat(e.target.value) * 100)
                                        : null,
                                })
                            }
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                            placeholder="0.00"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                        Warranty (months)
                    </label>
                    <input
                        type="number"
                        value={formData.warranty_months || ''}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                warranty_months: e.target.value ? parseInt(e.target.value) : null,
                            })
                        }
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        placeholder="e.g., 12"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                        Notes
                    </label>
                    <textarea
                        value={formData.notes || ''}
                        onChange={(e) =>
                            setFormData({ ...formData, notes: e.target.value || null })
                        }
                        rows={2}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                </div>
            </BaseFormModal>
        </div>
    );
}
