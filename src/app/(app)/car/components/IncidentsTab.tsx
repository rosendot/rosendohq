'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit2, AlertTriangle, FileText, Car, ParkingCircle, Receipt, Calendar } from 'lucide-react';
import type { MaintenanceRecord, MaintenanceRecordType } from '@/types/car.types';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import IncidentModal from '../modals/IncidentModal';

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

    const openModal = (record?: MaintenanceRecord) => {
        setEditingRecord(record || null);
        setShowModal(true);
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
            <IncidentModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                editingRecord={editingRecord}
                vehicleId={vehicleId}
                onSuccess={onRefresh}
            />

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
