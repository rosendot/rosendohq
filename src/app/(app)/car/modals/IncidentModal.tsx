'use client';

import { useState, useEffect } from 'react';
import type { MaintenanceRecord, MaintenanceRecordInsert, MaintenanceRecordType } from '@/types/car.types';
import BaseFormModal from '@/components/BaseFormModal';

interface IncidentModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingRecord: MaintenanceRecord | null;
    vehicleId: string;
    onSuccess: () => void;
}

export default function IncidentModal({
    isOpen,
    onClose,
    editingRecord,
    vehicleId,
    onSuccess,
}: IncidentModalProps) {
    const [loading, setLoading] = useState(false);
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
        record_type: 'incident',
        incident_date: new Date().toISOString().split('T')[0],
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
            record_type: 'incident',
            incident_date: new Date().toISOString().split('T')[0],
            insurance_claim_number: null,
            at_fault: null,
        });
    };

    useEffect(() => {
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
        } else {
            resetForm();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editingRecord]);

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

            onClose();
            resetForm();
            onSuccess();
        } catch (error) {
            console.error('Error saving record:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <BaseFormModal
            isOpen={isOpen}
            onClose={onClose}
            title={editingRecord ? 'Edit Record' : 'Add Record'}
            onSubmit={handleSubmit}
            loading={loading}
            submitLabel={editingRecord ? 'Update' : 'Add Record'}
            loadingLabel="Saving..."
            submitColor="blue"
            submitDisabled={!formData.item.trim()}
        >
            {/* Record Type */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Record Type *
                </label>
                <select
                    value={formData.record_type}
                    onChange={(e) => setFormData({ ...formData, record_type: e.target.value as MaintenanceRecordType })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="incident">Incident / Accident</option>
                    <option value="ticket">Traffic Ticket</option>
                    <option value="toll">Toll</option>
                    <option value="parking">Parking</option>
                    <option value="other">Other</option>
                </select>
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description *
                </label>
                <input
                    type="text"
                    required
                    value={formData.item}
                    onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Rear-ended at red light, Speeding ticket"
                />
            </div>

            {/* Date */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Date *
                    </label>
                    <input
                        type="date"
                        required
                        value={formData.incident_date || formData.service_date}
                        onChange={(e) => setFormData({
                            ...formData,
                            incident_date: e.target.value,
                            service_date: e.target.value
                        })}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Cost
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
            </div>

            {/* Location / Vendor */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Location
                </label>
                <input
                    type="text"
                    value={formData.vendor || ''}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value || null })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., I-40 W, Downtown Parking Garage"
                />
            </div>

            {/* Incident-specific fields */}
            {formData.record_type === 'incident' && (
                <>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Insurance Claim Number
                        </label>
                        <input
                            type="text"
                            value={formData.insurance_claim_number || ''}
                            onChange={(e) => setFormData({ ...formData, insurance_claim_number: e.target.value || null })}
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Claim number if applicable"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            At Fault?
                        </label>
                        <select
                            value={formData.at_fault === null ? '' : formData.at_fault ? 'yes' : 'no'}
                            onChange={(e) => setFormData({
                                ...formData,
                                at_fault: e.target.value === '' ? null : e.target.value === 'yes'
                            })}
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Not Determined</option>
                            <option value="yes">Yes - At Fault</option>
                            <option value="no">No - Not At Fault</option>
                        </select>
                    </div>
                </>
            )}

            {/* Notes */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notes
                </label>
                <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value || null })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                    placeholder="Additional details..."
                />
            </div>
        </BaseFormModal>
    );
}
