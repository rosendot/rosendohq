'use client';

import { useState, useEffect } from 'react';
import BaseFormModal from '@/components/BaseFormModal';
import type { MaintenanceRecord, MaintenanceRecordInsert } from '@/types/car.types';

interface MaintenanceRecordModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingRecord: MaintenanceRecord | null;
    initialData?: Partial<MaintenanceRecordInsert>;
    vehicleId: string;
    onSuccess: () => void;
}

const DEFAULT_FORM_DATA = (vehicleId: string): MaintenanceRecordInsert => ({
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

export default function MaintenanceRecordModal({
    isOpen,
    onClose,
    editingRecord,
    initialData,
    vehicleId,
    onSuccess,
}: MaintenanceRecordModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<MaintenanceRecordInsert>(DEFAULT_FORM_DATA(vehicleId));

    useEffect(() => {
        if (!isOpen) return;

        if (editingRecord) {
            setFormData({
                vehicle_id: editingRecord.vehicle_id,
                item: editingRecord.item,
                service_date: editingRecord.service_date,
                mileage: editingRecord.mileage,
                cost_cents: editingRecord.cost_cents,
                vendor: editingRecord.vendor,
                notes: editingRecord.notes,
                warranty_work: editingRecord.warranty_work,
                is_diy: editingRecord.is_diy,
                template_id: editingRecord.template_id,
                receipt_file_id: editingRecord.receipt_file_id,
                next_due_date: editingRecord.next_due_date,
                next_due_mileage: editingRecord.next_due_mileage,
                parts_cost_cents: editingRecord.parts_cost_cents,
                labor_cost_cents: editingRecord.labor_cost_cents,
                record_type: editingRecord.record_type,
                incident_date: editingRecord.incident_date,
                insurance_claim_number: editingRecord.insurance_claim_number,
                at_fault: editingRecord.at_fault,
            });
        } else if (initialData) {
            setFormData({ ...DEFAULT_FORM_DATA(vehicleId), ...initialData });
        } else {
            setFormData(DEFAULT_FORM_DATA(vehicleId));
        }
    }, [isOpen, editingRecord, initialData, vehicleId]);

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

            onSuccess();
        } catch (error) {
            console.error('Error saving maintenance record:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <BaseFormModal
            isOpen={isOpen}
            onClose={onClose}
            title={editingRecord ? 'Edit Maintenance Record' : 'Add Maintenance Record'}
            onSubmit={handleSubmit}
            loading={loading}
            submitLabel={editingRecord ? 'Update Record' : 'Add Record'}
            submitDisabled={!formData.item.trim()}
            maxWidth="2xl"
        >
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
        </BaseFormModal>
    );
}
