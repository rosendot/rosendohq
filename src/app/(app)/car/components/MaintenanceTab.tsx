'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit2, Calendar, Gauge, Wrench } from 'lucide-react';
import type {
    MaintenanceRecord,
    MaintenanceRecordInsert,
    MaintenanceTemplate,
} from '@/types/car.types';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import MaintenanceRecordModal from '../modals/MaintenanceRecordModal';

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
    const [initialData, setInitialData] = useState<Partial<MaintenanceRecordInsert> | undefined>();
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        show: boolean;
        id: string | null;
        name: string;
    }>({ show: false, id: null, name: '' });

    // Filter to only maintenance records
    const maintenanceRecords = records.filter(r => r.record_type === 'maintenance');

    const openModal = (record?: MaintenanceRecord) => {
        setEditingRecord(record || null);
        setInitialData(undefined);
        setShowModal(true);
    };

    const createFromTemplate = (template: MaintenanceTemplate) => {
        setEditingRecord(null);
        setInitialData({
            item: template.name,
            cost_cents: template.estimated_cost_cents,
            notes: template.notes,
            template_id: template.id,
        });
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
            <MaintenanceRecordModal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setEditingRecord(null);
                    setInitialData(undefined);
                }}
                editingRecord={editingRecord}
                initialData={initialData}
                vehicleId={vehicleId}
                onSuccess={() => {
                    setShowModal(false);
                    setEditingRecord(null);
                    setInitialData(undefined);
                    onRefresh();
                }}
            />

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
