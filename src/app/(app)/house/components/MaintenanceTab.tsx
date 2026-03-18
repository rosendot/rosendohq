'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit2, RotateCcw } from 'lucide-react';
import BaseFormModal from '@/components/BaseFormModal';
import type {
    HomeMaintenanceRecord,
    HomeMaintenanceRecordInsert,
    HomeMaintenanceRecordUpdate,
    HomeMaintenanceTemplate,
    HomeMaintenanceTemplateInsert,
    HomeArea,
    HomeMaintenanceStatus,
} from '@/types/house.types';

interface MaintenanceTabProps {
    records: HomeMaintenanceRecord[];
    templates: HomeMaintenanceTemplate[];
    areas: HomeArea[];
    propertyId: string | null;
    onRefresh: () => void;
}

export default function MaintenanceTab({
    records,
    templates,
    areas,
    propertyId,
    onRefresh,
}: MaintenanceTabProps) {
    const [showModal, setShowModal] = useState(false);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState<HomeMaintenanceRecord | null>(null);
    const [editingTemplate, setEditingTemplate] = useState<HomeMaintenanceTemplate | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'tasks' | 'templates'>('tasks');

    const [formData, setFormData] = useState<HomeMaintenanceRecordInsert>({
        property_id: propertyId || '',
        template_id: null,
        area_id: null,
        appliance_id: null,
        contractor_id: null,
        project_id: null,
        item: '',
        service_date: new Date().toISOString().split('T')[0],
        cost_cents: null,
        vendor: null,
        status: 'pending',
        is_diy: true,
        notes: null,
    });

    const [templateFormData, setTemplateFormData] = useState<HomeMaintenanceTemplateInsert>({
        property_id: propertyId,
        name: '',
        interval_months: null,
        interval_days: null,
        priority: null,
        estimated_cost_cents: null,
        category: null,
        notes: null,
    });

    const resetForm = () => {
        setFormData({
            property_id: propertyId || '',
            template_id: null,
            area_id: null,
            appliance_id: null,
            contractor_id: null,
            project_id: null,
            item: '',
            service_date: new Date().toISOString().split('T')[0],
            cost_cents: null,
            vendor: null,
            status: 'pending',
            is_diy: true,
            notes: null,
        });
        setEditingRecord(null);
    };

    const resetTemplateForm = () => {
        setTemplateFormData({
            property_id: propertyId,
            name: '',
            interval_months: null,
            interval_days: null,
            priority: null,
            estimated_cost_cents: null,
            category: null,
            notes: null,
        });
        setEditingTemplate(null);
    };

    const openModal = (record?: HomeMaintenanceRecord) => {
        if (record) {
            setEditingRecord(record);
            setFormData({
                property_id: record.property_id,
                template_id: record.template_id,
                area_id: record.area_id,
                appliance_id: record.appliance_id,
                contractor_id: record.contractor_id,
                project_id: record.project_id,
                item: record.item,
                service_date: record.service_date,
                cost_cents: record.cost_cents,
                vendor: record.vendor,
                status: record.status,
                is_diy: record.is_diy,
                notes: record.notes,
            });
        } else {
            resetForm();
        }
        setShowModal(true);
    };

    const openTemplateModal = (template?: HomeMaintenanceTemplate) => {
        if (template) {
            setEditingTemplate(template);
            setTemplateFormData({
                property_id: template.property_id,
                name: template.name,
                interval_months: template.interval_months,
                interval_days: template.interval_days,
                priority: template.priority,
                estimated_cost_cents: template.estimated_cost_cents,
                category: template.category,
                notes: template.notes,
            });
        } else {
            resetTemplateForm();
        }
        setShowTemplateModal(true);
    };

    const createTaskFromTemplate = (template: HomeMaintenanceTemplate) => {
        setFormData({
            property_id: propertyId || '',
            template_id: template.id,
            area_id: null,
            appliance_id: null,
            contractor_id: null,
            project_id: null,
            item: template.name,
            service_date: new Date().toISOString().split('T')[0],
            cost_cents: template.estimated_cost_cents,
            vendor: null,
            status: 'pending',
            is_diy: true,
            notes: template.notes,
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.item.trim()) return;
        setLoading(true);

        try {
            const url = editingRecord
                ? `/api/house/maintenance/records/${editingRecord.id}`
                : '/api/house/maintenance/records';
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

    const handleTemplateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!templateFormData.name.trim()) return;
        setLoading(true);

        try {
            const url = editingTemplate
                ? `/api/house/maintenance/templates/${editingTemplate.id}`
                : '/api/house/maintenance/templates';
            const method = editingTemplate ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(templateFormData),
            });

            if (!response.ok) throw new Error('Failed to save template');

            setShowTemplateModal(false);
            resetTemplateForm();
            onRefresh();
        } catch (error) {
            console.error('Error saving template:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this task?')) return;

        try {
            const response = await fetch(`/api/house/maintenance/records/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete');
            onRefresh();
        } catch (error) {
            console.error('Error deleting record:', error);
        }
    };

    const handleDeleteTemplate = async (id: string) => {
        if (!confirm('Are you sure you want to delete this template?')) return;

        try {
            const response = await fetch(`/api/house/maintenance/templates/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete');
            onRefresh();
        } catch (error) {
            console.error('Error deleting template:', error);
        }
    };

    const handleStatusChange = async (id: string, status: HomeMaintenanceStatus) => {
        try {
            const updateData: HomeMaintenanceRecordUpdate = { status };

            const response = await fetch(`/api/house/maintenance/records/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData),
            });
            if (!response.ok) throw new Error('Failed to update status');
            onRefresh();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const getStatusColor = (status: HomeMaintenanceStatus) => {
        switch (status) {
            case 'completed':
                return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'in_progress':
                return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'cancelled':
            case 'skipped':
                return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
            default:
                return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
        }
    };

    const isOverdue = (record: HomeMaintenanceRecord) => {
        return (
            record.service_date &&
            new Date(record.service_date) < new Date() &&
            record.status !== 'completed' &&
            record.status !== 'cancelled' &&
            record.status !== 'skipped'
        );
    };

    const formatCurrency = (cents: number | null) => {
        if (!cents) return null;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(cents / 100);
    };

    const formatInterval = (template: HomeMaintenanceTemplate) => {
        if (template.interval_days) {
            if (template.interval_days === 1) return 'Daily';
            if (template.interval_days === 7) return 'Weekly';
            if (template.interval_days === 14) return 'Every 2 weeks';
            return `Every ${template.interval_days} days`;
        }
        if (template.interval_months) {
            if (template.interval_months === 1) return 'Monthly';
            if (template.interval_months === 3) return 'Quarterly';
            if (template.interval_months === 6) return 'Every 6 months';
            if (template.interval_months === 12) return 'Yearly';
            return `Every ${template.interval_months} months`;
        }
        return 'One-time';
    };

    const choreCategories = [
        'Cleaning',
        'Laundry',
        'Kitchen',
        'Bathroom',
        'Bedroom',
        'Living Room',
        'Outdoor',
        'Maintenance',
        'Organization',
        'Other',
    ];

    return (
        <div>
            {/* Header with tabs */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold text-white">Chores & Tasks</h2>
                    <div className="flex bg-gray-800 rounded-lg p-1">
                        <button
                            onClick={() => setActiveTab('tasks')}
                            className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                activeTab === 'tasks'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            Tasks
                        </button>
                        <button
                            onClick={() => setActiveTab('templates')}
                            className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                activeTab === 'templates'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            Recurring
                        </button>
                    </div>
                </div>
                <button
                    onClick={() => activeTab === 'tasks' ? openModal() : openTemplateModal()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    {activeTab === 'tasks' ? 'Add Task' : 'Add Recurring'}
                </button>
            </div>

            {/* Tasks Tab */}
            {activeTab === 'tasks' && (
                <>
                    {/* Quick add from templates */}
                    {templates.length > 0 && (
                        <div className="mb-6">
                            <p className="text-sm text-gray-400 mb-2">Quick add from recurring chores:</p>
                            <div className="flex flex-wrap gap-2">
                                {templates.slice(0, 6).map((template) => (
                                    <button
                                        key={template.id}
                                        onClick={() => createTaskFromTemplate(template)}
                                        className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors flex items-center gap-2 border border-gray-700"
                                    >
                                        <RotateCcw className="w-3 h-3" />
                                        {template.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {records.length === 0 ? (
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-12 text-center">
                            <p className="text-gray-500">No tasks yet. Add a chore or create from a recurring template.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {records.map((record) => {
                                const template = templates.find((t) => t.id === record.template_id);
                                const area = areas.find((a) => a.id === record.area_id);
                                const overdue = isOverdue(record);

                                return (
                                    <div
                                        key={record.id}
                                        className={`p-4 bg-gray-900 rounded-lg border transition-colors ${
                                            overdue ? 'border-red-500/30' : 'border-gray-800'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-white">{record.item}</h3>
                                                    {overdue && (
                                                        <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-xs rounded border border-red-500/20">
                                                            Overdue
                                                        </span>
                                                    )}
                                                    {template && (
                                                        <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-xs rounded border border-purple-500/20 flex items-center gap-1">
                                                            <RotateCcw className="w-3 h-3" />
                                                            {formatInterval(template)}
                                                        </span>
                                                    )}
                                                </div>
                                                {record.notes && (
                                                    <p className="text-sm text-gray-400">{record.notes}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <select
                                                    value={record.status}
                                                    onChange={(e) =>
                                                        handleStatusChange(record.id, e.target.value as HomeMaintenanceStatus)
                                                    }
                                                    className={`px-2 py-1 rounded text-xs font-medium border bg-transparent cursor-pointer ${getStatusColor(
                                                        record.status
                                                    )}`}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="scheduled">Scheduled</option>
                                                    <option value="in_progress">In Progress</option>
                                                    <option value="completed">Completed</option>
                                                    <option value="skipped">Skipped</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                                <button
                                                    onClick={() => openModal(record)}
                                                    className="p-1 text-gray-400 hover:text-white transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(record.id)}
                                                    className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                                            {area && (
                                                <span>
                                                    <span className="text-gray-500">Room:</span> {area.name}
                                                </span>
                                            )}
                                            {template?.category && (
                                                <span>
                                                    <span className="text-gray-500">Category:</span> {template.category}
                                                </span>
                                            )}
                                            {record.service_date && (
                                                <span>
                                                    <span className="text-gray-500">Due:</span>{' '}
                                                    {new Date(record.service_date).toLocaleDateString()}
                                                </span>
                                            )}
                                            {record.cost_cents && (
                                                <span>
                                                    <span className="text-gray-500">Cost:</span>{' '}
                                                    {formatCurrency(record.cost_cents)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {/* Templates Tab */}
            {activeTab === 'templates' && (
                <>
                    {templates.length === 0 ? (
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-12 text-center">
                            <p className="text-gray-500">No recurring chores set up yet.</p>
                            <p className="text-gray-600 text-sm mt-1">Create templates for chores you do regularly (e.g., weekly toilet cleaning).</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {templates.map((template) => (
                                <div
                                    key={template.id}
                                    className="p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-white">{template.name}</h3>
                                            <p className="text-sm text-blue-400">{formatInterval(template)}</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => createTaskFromTemplate(template)}
                                                className="p-1 text-gray-400 hover:text-green-400 transition-colors"
                                                title="Create task"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => openTemplateModal(template)}
                                                className="p-1 text-gray-400 hover:text-white transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTemplate(template.id)}
                                                className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {template.category && (
                                        <span className="inline-block px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded border border-blue-500/20 mb-2">
                                            {template.category}
                                        </span>
                                    )}

                                    {template.notes && (
                                        <p className="text-sm text-gray-500">{template.notes}</p>
                                    )}

                                    {template.estimated_cost_cents && (
                                        <p className="text-sm text-gray-400 mt-2">
                                            Est. cost: {formatCurrency(template.estimated_cost_cents)}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Task Modal */}
            <BaseFormModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingRecord ? 'Edit Task' : 'Add Task'}
                onSubmit={handleSubmit}
                loading={loading}
                submitLabel={editingRecord ? 'Update' : 'Create'}
                submitDisabled={!formData.item.trim()}
            >
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                        Task Name *
                    </label>
                    <input
                        type="text"
                        value={formData.item}
                        onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                        required
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        placeholder="e.g., Clean bathroom, Take out trash"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Room
                        </label>
                        <select
                            value={formData.area_id || ''}
                            onChange={(e) =>
                                setFormData({ ...formData, area_id: e.target.value || null })
                            }
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        >
                            <option value="">Select room...</option>
                            {areas.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Due Date
                        </label>
                        <input
                            type="date"
                            value={formData.service_date || ''}
                            onChange={(e) =>
                                setFormData({ ...formData, service_date: e.target.value || '' })
                            }
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                        Status
                    </label>
                    <select
                        value={formData.status || 'pending'}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                status: e.target.value as HomeMaintenanceStatus,
                            })
                        }
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                        <option value="pending">Pending</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="skipped">Skipped</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                        Notes
                    </label>
                    <textarea
                        value={formData.notes || ''}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value || null })}
                        rows={2}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        placeholder="Any additional details..."
                    />
                </div>
            </BaseFormModal>

            {/* Template Modal */}
            <BaseFormModal
                isOpen={showTemplateModal}
                onClose={() => setShowTemplateModal(false)}
                title={editingTemplate ? 'Edit Recurring Chore' : 'Add Recurring Chore'}
                onSubmit={handleTemplateSubmit}
                loading={loading}
                submitLabel={editingTemplate ? 'Update' : 'Create'}
                submitDisabled={!templateFormData.name.trim()}
            >
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                        Chore Name *
                    </label>
                    <input
                        type="text"
                        value={templateFormData.name}
                        onChange={(e) => setTemplateFormData({ ...templateFormData, name: e.target.value })}
                        required
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        placeholder="e.g., Clean toilet, Vacuum living room"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                        Category
                    </label>
                    <select
                        value={templateFormData.category || ''}
                        onChange={(e) =>
                            setTemplateFormData({ ...templateFormData, category: e.target.value || null })
                        }
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                        <option value="">Select category...</option>
                        {choreCategories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Frequency
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Days</label>
                            <select
                                value={templateFormData.interval_days || ''}
                                onChange={(e) =>
                                    setTemplateFormData({
                                        ...templateFormData,
                                        interval_days: e.target.value ? parseInt(e.target.value) : null,
                                        interval_months: e.target.value ? null : templateFormData.interval_months,
                                    })
                                }
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                            >
                                <option value="">Select...</option>
                                <option value="1">Daily</option>
                                <option value="2">Every 2 days</option>
                                <option value="3">Every 3 days</option>
                                <option value="7">Weekly</option>
                                <option value="14">Every 2 weeks</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Months</label>
                            <select
                                value={templateFormData.interval_months || ''}
                                onChange={(e) =>
                                    setTemplateFormData({
                                        ...templateFormData,
                                        interval_months: e.target.value ? parseInt(e.target.value) : null,
                                        interval_days: e.target.value ? null : templateFormData.interval_days,
                                    })
                                }
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                            >
                                <option value="">Select...</option>
                                <option value="1">Monthly</option>
                                <option value="2">Every 2 months</option>
                                <option value="3">Quarterly</option>
                                <option value="6">Every 6 months</option>
                                <option value="12">Yearly</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                        Notes
                    </label>
                    <textarea
                        value={templateFormData.notes || ''}
                        onChange={(e) => setTemplateFormData({ ...templateFormData, notes: e.target.value || null })}
                        rows={2}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        placeholder="Any additional details..."
                    />
                </div>
            </BaseFormModal>
        </div>
    );
}
