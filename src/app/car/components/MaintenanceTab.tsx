'use client';

import { useState } from 'react';
import { Plus, X, Trash2, Edit2, Calendar, Gauge, Wrench } from 'lucide-react';
import type {
    MaintenanceRecord,
    MaintenanceRecordInsert,
    MaintenanceTemplate,
} from '@/types/database.types';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

interface MaintenanceTabProps {
    records: MaintenanceRecord[];
    templates: MaintenanceTemplate[];
    vehicleId: string;
    onRefresh: () => void;
}

export default function MaintenanceTab({
    records,
    templates,
    vehicleId,
    onRefresh,
}: MaintenanceTabProps) {
    const [showModal, setShowModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null);
    const [loading, setLoading] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        show: boolean;
        id: string | null;
        name: string;
    }>({ show: false, id: null, name: '' });

    // Filter to only maintenance records
    const maintenanceRecords = records.filter(r => r.record_type === 'maintenance');

    const [formData, setFormData] = useState<MaintenanceRecordInsert>({
        vehicle_id: vehicleId,
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
        record_type: 'maintenance',
        incident_date: null,
        insurance_claim_number: null,
        at_fault: null,
    });

    const resetForm = () => {
        setFormData({
            vehicle_id: vehicleId,
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
            record_type: 'maintenance',
            incident_date: null,
            insurance_claim_number: null,
            at_fault: null,
        });
        setEditingRecord(null);
    };

    const openModal = (record?: MaintenanceRecord) => {
        if (record) {
            setEditingRecord(record);
            setFormData({
                vehicle_id: record.vehicle_id,
                item: record.item,
                service_date: record.service_date,
                mileage: record.mileage,
                cost_cents: record.cost_cents,
                vendor: record.vendor,
                notes: record.notes,
                warranty_work: record.warranty_work,
                is_diy: record.is_diy,
                template_id: record.template_id,
                receipt_file_id: record.receipt_file_id,
                next_due_date: record.next_due_date,
                next_due_mileage: record.next_due_mileage,
                parts_cost_cents: record.parts_cost_cents,
                labor_cost_cents: record.labor_cost_cents,
                record_type: record.record_type,
                incident_date: record.incident_date,
                insurance_claim_number: record.insurance_claim_number,
                at_fault: record.at_fault,
            });
        } else {
            resetForm();
        }
        setShowModal(true);
    };

    const createFromTemplate = (template: MaintenanceTemplate) => {
        setFormData({
            vehicle_id: vehicleId,
            item: template.name,
            service_date: new Date().toISOString().split('T')[0],
            mileage: null,
            cost_cents: template.estimated_cost_cents,
            vendor: null,
            notes: template.notes,
            warranty_work: false,
            is_diy: false,
            template_id: template.id,
            receipt_file_id: null,
            next_due_date: null,
            next_due_mileage: null,
            parts_cost_cents: null,
            labor_cost_cents: null,
            record_type: 'maintenance',
            incident_date: null,
            insurance_claim_number: null,
            at_fault: null,
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.item.trim()) return;
        setLoading(true);

        try {
            const url = editingRecord
                ? `/api/car/maintenance/records/${editingRecord.id}`
                : '/api/car/maintenance/records';
            const method = editingRecord ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Failed to save record');

            setShowModal(false);
            resetForm();
            onRefresh();
        } catch (error) {
            console.error('Error saving maintenance record:', error);
        } finally {
            setLoading(false);
        }
    };

    const showDeleteConfirmation = (record: MaintenanceRecord) => {
        setDeleteConfirmation({
            show: true,
            id: record.id,
            name: record.item,
        });
    };

    const handleDelete = async () => {
        if (!deleteConfirmation.id) return;

        try {
            const response = await fetch(`/api/car/maintenance/records/${deleteConfirmation.id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete');
            setDeleteConfirmation({ show: false, id: null, name: '' });
            onRefresh();
        } catch (error) {
            console.error('Error deleting record:', error);
        }
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
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-white">Maintenance Records</h2>
                    <p className="text-gray-400 text-sm mt-1">
                        {maintenanceRecords.length} record{maintenanceRecords.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Record
                </button>
            </div>

            {/* Quick add from templates */}
            {templates.length > 0 && (
                <div className="mb-6">
                    <p className="text-sm text-gray-400 mb-2">Quick add from templates:</p>
                    <div className="flex flex-wrap gap-2">
                        {templates.slice(0, 6).map((template) => (
                            <button
                                key={template.id}
                                onClick={() => createFromTemplate(template)}
                                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors flex items-center gap-2 border border-gray-700"
                            >
                                <Wrench className="w-3 h-3" />
                                {template.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Records List */}
            {maintenanceRecords.length === 0 ? (
                <div className="bg-gray-900 rounded-lg border border-gray-800 p-12 text-center">
                    <Wrench className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-400">No maintenance records yet</p>
                    <button
                        onClick={() => openModal()}
                        className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        Add First Record
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {maintenanceRecords.map((record) => (
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
                                            onClick={() => openModal(record)}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-gray-700 text-gray-400 rounded transition-all"
                                            title="Edit record"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => showDeleteConfirmation(record)}
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
                                <div className="text-right">
                                    {record.cost_cents && (
                                        <p className="text-xl font-bold text-white">
                                            {formatCurrency(record.cost_cents)}
                                        </p>
                                    )}
                                    <div className="flex gap-2 mt-1 justify-end">
                                        {record.is_diy && (
                                            <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded">
                                                DIY
                                            </span>
                                        )}
                                        {record.warranty_work && (
                                            <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded">
                                                Warranty
                                            </span>
                                        )}
                                    </div>
                                </div>
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
                            {(record.next_due_date || record.next_due_mileage) && (
                                <div className="mt-3 pt-3 border-t border-gray-700 text-sm text-gray-400">
                                    <span className="text-gray-500">Next due: </span>
                                    {record.next_due_date && new Date(record.next_due_date).toLocaleDateString()}
                                    {record.next_due_date && record.next_due_mileage && ' or '}
                                    {record.next_due_mileage && `${record.next_due_mileage.toLocaleString()} mi`}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-white">
                                {editingRecord ? 'Edit Maintenance Record' : 'Add Maintenance Record'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
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

                            {/* Parts and Labor breakdown */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Parts Cost
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.parts_cost_cents ? (formData.parts_cost_cents / 100).toFixed(2) : ''}
                                            onChange={(e) => setFormData({ ...formData, parts_cost_cents: e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null })}
                                            className="w-full pl-8 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Labor Cost
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.labor_cost_cents ? (formData.labor_cost_cents / 100).toFixed(2) : ''}
                                            onChange={(e) => setFormData({ ...formData, labor_cost_cents: e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null })}
                                            className="w-full pl-8 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="0.00"
                                        />
                                    </div>
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

                            {/* Next Due */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Next Due Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.next_due_date || ''}
                                        onChange={(e) => setFormData({ ...formData, next_due_date: e.target.value || null })}
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Next Due Mileage
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.next_due_mileage || ''}
                                        onChange={(e) => setFormData({ ...formData, next_due_mileage: e.target.value ? parseInt(e.target.value) : null })}
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., 85000"
                                    />
                                </div>
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
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !formData.item.trim()}
                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : editingRecord ? 'Update Record' : 'Add Record'}
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
                onConfirm={handleDelete}
                itemName={deleteConfirmation.name}
                title="Delete Maintenance Record"
            />
        </div>
    );
}
