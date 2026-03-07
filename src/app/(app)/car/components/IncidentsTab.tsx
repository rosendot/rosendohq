'use client';

import { useState } from 'react';
import { Plus, X, Trash2, Edit2, AlertTriangle, FileText, Car, ParkingCircle, Receipt, Calendar } from 'lucide-react';
import type { MaintenanceRecord, MaintenanceRecordInsert, MaintenanceRecordType } from '@/types/database.types';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

interface IncidentsTabProps {
    records: MaintenanceRecord[];
    vehicleId: string;
    onRefresh: () => void;
}

type IncidentType = Exclude<MaintenanceRecordType, 'maintenance'>;

export default function IncidentsTab({
    records,
    vehicleId,
    onRefresh,
}: IncidentsTabProps) {
    const [showModal, setShowModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null);
    const [loading, setLoading] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        show: boolean;
        id: string | null;
        name: string;
    }>({ show: false, id: null, name: '' });
    const [filter, setFilter] = useState<IncidentType | 'all'>('all');

    // Filter to only non-maintenance records
    const incidentRecords = records.filter(r => r.record_type !== 'maintenance');

    const filteredRecords = filter === 'all'
        ? incidentRecords
        : incidentRecords.filter(r => r.record_type === filter);

    // Group by type
    const countByType = {
        incident: incidentRecords.filter(r => r.record_type === 'incident').length,
        ticket: incidentRecords.filter(r => r.record_type === 'ticket').length,
        toll: incidentRecords.filter(r => r.record_type === 'toll').length,
        parking: incidentRecords.filter(r => r.record_type === 'parking').length,
        other: incidentRecords.filter(r => r.record_type === 'other').length,
    };

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
            console.error('Error saving record:', error);
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

    const getTypeIcon = (type: MaintenanceRecordType) => {
        switch (type) {
            case 'incident':
                return <Car className="w-4 h-4" />;
            case 'ticket':
                return <Receipt className="w-4 h-4" />;
            case 'toll':
                return <FileText className="w-4 h-4" />;
            case 'parking':
                return <ParkingCircle className="w-4 h-4" />;
            default:
                return <AlertTriangle className="w-4 h-4" />;
        }
    };

    const getTypeColor = (type: MaintenanceRecordType) => {
        switch (type) {
            case 'incident':
                return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'ticket':
                return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'toll':
                return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'parking':
                return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            default:
                return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        }
    };

    const totalSpent = incidentRecords.reduce((sum, r) => sum + (r.cost_cents || 0), 0);

    return (
        <div>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                    <div className="text-gray-400 text-sm mb-1">Total Records</div>
                    <div className="text-2xl font-bold text-white">{incidentRecords.length}</div>
                </div>
                <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                    <div className="text-gray-400 text-sm mb-1">Incidents</div>
                    <div className="text-2xl font-bold text-red-400">{countByType.incident}</div>
                </div>
                <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                    <div className="text-gray-400 text-sm mb-1">Tickets</div>
                    <div className="text-2xl font-bold text-yellow-400">{countByType.ticket}</div>
                </div>
                <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                    <div className="text-gray-400 text-sm mb-1">Tolls</div>
                    <div className="text-2xl font-bold text-blue-400">{countByType.toll}</div>
                </div>
                <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                    <div className="text-gray-400 text-sm mb-1">Parking</div>
                    <div className="text-2xl font-bold text-purple-400">{countByType.parking}</div>
                </div>
                <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                    <div className="text-gray-400 text-sm mb-1">Total Cost</div>
                    <div className="text-2xl font-bold text-white">{formatCurrency(totalSpent) || '$0'}</div>
                </div>
            </div>

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold text-white">Incidents & Records</h2>
                    <div className="flex bg-gray-800 rounded-lg p-1 flex-wrap">
                        {(['all', 'incident', 'ticket', 'toll', 'parking', 'other'] as const).map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilter(type)}
                                className={`px-3 py-1 text-sm rounded-md transition-colors capitalize ${
                                    filter === type
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
                <button
                    onClick={() => openModal()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Record
                </button>
            </div>

            {/* Records List */}
            {filteredRecords.length === 0 ? (
                <div className="bg-gray-900 rounded-lg border border-gray-800 p-12 text-center">
                    <AlertTriangle className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-400">
                        {filter === 'all' ? 'No incidents or records yet' : `No ${filter} records`}
                    </p>
                    {filter === 'all' && (
                        <button
                            onClick={() => openModal()}
                            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            Add First Record
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredRecords.map((record) => (
                        <div
                            key={record.id}
                            className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors group"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${getTypeColor(record.record_type)}`}>
                                            {getTypeIcon(record.record_type)}
                                            {record.record_type}
                                        </span>
                                        <h4 className="text-lg font-semibold text-white">
                                            {record.item}
                                        </h4>
                                        <button
                                            onClick={() => openModal(record)}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-gray-700 text-gray-400 rounded transition-all"
                                            title="Edit"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => showDeleteConfirmation(record)}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-600/20 text-red-400 rounded transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(record.incident_date || record.service_date).toLocaleDateString()}
                                        </div>
                                        {record.record_type === 'incident' && record.at_fault !== null && (
                                            <span className={`px-2 py-0.5 rounded text-xs ${
                                                record.at_fault
                                                    ? 'bg-red-500/10 text-red-400'
                                                    : 'bg-green-500/10 text-green-400'
                                            }`}>
                                                {record.at_fault ? 'At Fault' : 'Not At Fault'}
                                            </span>
                                        )}
                                        {record.insurance_claim_number && (
                                            <span className="text-gray-500">
                                                Claim: {record.insurance_claim_number}
                                            </span>
                                        )}
                                        {record.vendor && (
                                            <span className="text-gray-500">
                                                Location: {record.vendor}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {record.cost_cents && (
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-white">
                                            {formatCurrency(record.cost_cents)}
                                        </p>
                                    </div>
                                )}
                            </div>
                            {record.notes && (
                                <p className="text-sm text-gray-300 bg-gray-900 rounded p-3 border border-gray-700 mt-3">
                                    {record.notes}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-white">
                                {editingRecord ? 'Edit Record' : 'Add Record'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
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
                                    {loading ? 'Saving...' : editingRecord ? 'Update' : 'Add Record'}
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
                title="Delete Record"
            />
        </div>
    );
}
