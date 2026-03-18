'use client';

import { useState } from 'react';
import { Plus, X, Trash2, Edit2, Circle, CheckCircle2, Archive } from 'lucide-react';
import type { TireSet, TireSetInsert, TireStatus } from '@/types/car.types';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

interface TiresTabProps {
    tireSets: TireSet[];
    vehicleId: string;
    onRefresh: () => void;
}

export default function TiresTab({
    tireSets,
    vehicleId,
    onRefresh,
}: TiresTabProps) {
    const [showModal, setShowModal] = useState(false);
    const [editingTire, setEditingTire] = useState<TireSet | null>(null);
    const [loading, setLoading] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        show: boolean;
        id: string | null;
        name: string;
    }>({ show: false, id: null, name: '' });
    const [filter, setFilter] = useState<TireStatus | 'all'>('all');

    const [formData, setFormData] = useState<TireSetInsert>({
        vehicle_id: vehicleId,
        brand: null,
        model: null,
        size: null,
        purchase_date: null,
        purchase_price_cents: null,
        mileage_installed: null,
        mileage_removed: null,
        tread_depth_initial: null,
        tread_depth_current: null,
        position: 'all',
        status: 'active',
        notes: null,
    });

    // Filter tires
    const filteredTires = filter === 'all'
        ? tireSets
        : tireSets.filter(t => t.status === filter);

    // Stats
    const activeTires = tireSets.filter(t => t.status === 'active');
    const totalSpent = tireSets.reduce((sum, t) => sum + (t.purchase_price_cents || 0), 0);

    const resetForm = () => {
        setFormData({
            vehicle_id: vehicleId,
            brand: null,
            model: null,
            size: null,
            purchase_date: null,
            purchase_price_cents: null,
            mileage_installed: null,
            mileage_removed: null,
            tread_depth_initial: null,
            tread_depth_current: null,
            position: 'all',
            status: 'active',
            notes: null,
        });
        setEditingTire(null);
    };

    const openModal = (tire?: TireSet) => {
        if (tire) {
            setEditingTire(tire);
            setFormData({
                vehicle_id: tire.vehicle_id,
                brand: tire.brand,
                model: tire.model,
                size: tire.size,
                purchase_date: tire.purchase_date,
                purchase_price_cents: tire.purchase_price_cents,
                mileage_installed: tire.mileage_installed,
                mileage_removed: tire.mileage_removed,
                tread_depth_initial: tire.tread_depth_initial,
                tread_depth_current: tire.tread_depth_current,
                position: tire.position,
                status: tire.status,
                notes: tire.notes,
            });
        } else {
            resetForm();
        }
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = editingTire
                ? `/api/car/tires/${editingTire.id}`
                : '/api/car/tires';
            const method = editingTire ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Failed to save tire set');

            setShowModal(false);
            resetForm();
            onRefresh();
        } catch (error) {
            console.error('Error saving tire set:', error);
        } finally {
            setLoading(false);
        }
    };

    const showDeleteConfirmation = (tire: TireSet) => {
        const name = `${tire.brand || ''} ${tire.model || ''}`.trim() || 'Tire set';
        setDeleteConfirmation({
            show: true,
            id: tire.id,
            name,
        });
    };

    const handleDelete = async () => {
        if (!deleteConfirmation.id) return;

        try {
            const response = await fetch(`/api/car/tires/${deleteConfirmation.id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete');
            setDeleteConfirmation({ show: false, id: null, name: '' });
            onRefresh();
        } catch (error) {
            console.error('Error deleting tire set:', error);
        }
    };

    const handleStatusChange = async (tire: TireSet, newStatus: TireStatus) => {
        try {
            const response = await fetch(`/api/car/tires/${tire.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!response.ok) throw new Error('Failed to update status');
            onRefresh();
        } catch (error) {
            console.error('Error updating tire status:', error);
        }
    };

    const formatCurrency = (cents: number | null) => {
        if (!cents) return '--';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(cents / 100);
    };

    const getStatusColor = (status: TireStatus) => {
        switch (status) {
            case 'active':
                return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'removed':
                return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
            case 'sold':
                return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'disposed':
                return 'bg-red-500/10 text-red-400 border-red-500/20';
            default:
                return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        }
    };

    const getStatusIcon = (status: TireStatus) => {
        switch (status) {
            case 'active':
                return <CheckCircle2 className="w-4 h-4" />;
            case 'removed':
                return <Archive className="w-4 h-4" />;
            default:
                return <Circle className="w-4 h-4" />;
        }
    };

    return (
        <div>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                    <div className="text-gray-400 text-sm mb-1">Active Sets</div>
                    <div className="text-2xl font-bold text-white">{activeTires.length}</div>
                </div>
                <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                    <div className="text-gray-400 text-sm mb-1">Total Sets</div>
                    <div className="text-2xl font-bold text-white">{tireSets.length}</div>
                </div>
                <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                    <div className="text-gray-400 text-sm mb-1">Total Spent</div>
                    <div className="text-2xl font-bold text-white">{formatCurrency(totalSpent)}</div>
                </div>
            </div>

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold text-white">Tire Sets</h2>
                    <div className="flex bg-gray-800 rounded-lg p-1">
                        {(['all', 'active', 'removed', 'sold', 'disposed'] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-3 py-1 text-sm rounded-md transition-colors capitalize ${
                                    filter === status
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
                <button
                    onClick={() => openModal()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Tire Set
                </button>
            </div>

            {/* Tire Sets List */}
            {filteredTires.length === 0 ? (
                <div className="bg-gray-900 rounded-lg border border-gray-800 p-12 text-center">
                    <Circle className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-400">
                        {filter === 'all' ? 'No tire sets yet' : `No ${filter} tire sets`}
                    </p>
                    {filter === 'all' && (
                        <button
                            onClick={() => openModal()}
                            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            Add First Tire Set
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredTires.map((tire) => {
                        const tireName = `${tire.brand || ''} ${tire.model || ''}`.trim() || 'Unnamed Tire Set';
                        const milesUsed = tire.mileage_removed && tire.mileage_installed
                            ? tire.mileage_removed - tire.mileage_installed
                            : null;

                        return (
                            <div
                                key={tire.id}
                                className="bg-gray-800 rounded-lg p-5 border border-gray-700 hover:border-gray-600 transition-colors group"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="text-lg font-semibold text-white">
                                                {tireName}
                                            </h4>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(tire.status)}`}>
                                                {getStatusIcon(tire.status)}
                                                {tire.status}
                                            </span>
                                        </div>
                                        {tire.size && (
                                            <p className="text-gray-400 text-sm">Size: {tire.size}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => openModal(tire)}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-gray-700 text-gray-400 rounded transition-all"
                                            title="Edit"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => showDeleteConfirmation(tire)}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-600/20 text-red-400 rounded transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                                    {tire.purchase_date && (
                                        <div>
                                            <span className="text-gray-500">Purchased:</span>
                                            <span className="text-gray-300 ml-1">
                                                {new Date(tire.purchase_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                    {tire.purchase_price_cents && (
                                        <div>
                                            <span className="text-gray-500">Cost:</span>
                                            <span className="text-gray-300 ml-1">
                                                {formatCurrency(tire.purchase_price_cents)}
                                            </span>
                                        </div>
                                    )}
                                    {tire.mileage_installed && (
                                        <div>
                                            <span className="text-gray-500">Installed at:</span>
                                            <span className="text-gray-300 ml-1">
                                                {tire.mileage_installed.toLocaleString()} mi
                                            </span>
                                        </div>
                                    )}
                                    {milesUsed && (
                                        <div>
                                            <span className="text-gray-500">Miles used:</span>
                                            <span className="text-gray-300 ml-1">
                                                {milesUsed.toLocaleString()} mi
                                            </span>
                                        </div>
                                    )}
                                    {tire.tread_depth_current && (
                                        <div>
                                            <span className="text-gray-500">Tread:</span>
                                            <span className="text-gray-300 ml-1">
                                                {tire.tread_depth_current}/32"
                                            </span>
                                        </div>
                                    )}
                                    {tire.position && (
                                        <div>
                                            <span className="text-gray-500">Position:</span>
                                            <span className="text-gray-300 ml-1 capitalize">
                                                {tire.position}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {tire.notes && (
                                    <p className="text-sm text-gray-400 bg-gray-900 rounded p-2 border border-gray-700 mb-3">
                                        {tire.notes}
                                    </p>
                                )}

                                {/* Quick status change buttons */}
                                {tire.status === 'active' && (
                                    <div className="flex gap-2 pt-3 border-t border-gray-700">
                                        <button
                                            onClick={() => handleStatusChange(tire, 'removed')}
                                            className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                                        >
                                            Mark Removed
                                        </button>
                                        <button
                                            onClick={() => handleStatusChange(tire, 'sold')}
                                            className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                                        >
                                            Mark Sold
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-white">
                                {editingTire ? 'Edit Tire Set' : 'Add Tire Set'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Brand and Model */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Brand
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.brand || ''}
                                        onChange={(e) => setFormData({ ...formData, brand: e.target.value || null })}
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., Michelin"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Model
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.model || ''}
                                        onChange={(e) => setFormData({ ...formData, model: e.target.value || null })}
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., Pilot Sport 4S"
                                    />
                                </div>
                            </div>

                            {/* Size and Position */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Size
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.size || ''}
                                        onChange={(e) => setFormData({ ...formData, size: e.target.value || null })}
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., 225/45R17"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Position
                                    </label>
                                    <select
                                        value={formData.position || 'all'}
                                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="all">All (Full Set)</option>
                                        <option value="front">Front Only</option>
                                        <option value="rear">Rear Only</option>
                                    </select>
                                </div>
                            </div>

                            {/* Purchase Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Purchase Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.purchase_date || ''}
                                        onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value || null })}
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
                                            value={formData.purchase_price_cents ? (formData.purchase_price_cents / 100).toFixed(2) : ''}
                                            onChange={(e) => setFormData({ ...formData, purchase_price_cents: e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null })}
                                            className="w-full pl-8 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Mileage */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Mileage Installed
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.mileage_installed || ''}
                                        onChange={(e) => setFormData({ ...formData, mileage_installed: e.target.value ? parseInt(e.target.value) : null })}
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="When installed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Mileage Removed
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.mileage_removed || ''}
                                        onChange={(e) => setFormData({ ...formData, mileage_removed: e.target.value ? parseInt(e.target.value) : null })}
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="When removed"
                                    />
                                </div>
                            </div>

                            {/* Tread Depth */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Initial Tread Depth (32nds)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.tread_depth_initial || ''}
                                        onChange={(e) => setFormData({ ...formData, tread_depth_initial: e.target.value ? parseFloat(e.target.value) : null })}
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., 10"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Current Tread Depth (32nds)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.tread_depth_current || ''}
                                        onChange={(e) => setFormData({ ...formData, tread_depth_current: e.target.value ? parseFloat(e.target.value) : null })}
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., 6"
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Status
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as TireStatus })}
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="active">Active</option>
                                    <option value="removed">Removed (In Storage)</option>
                                    <option value="sold">Sold</option>
                                    <option value="disposed">Disposed</option>
                                </select>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Notes
                                </label>
                                <textarea
                                    value={formData.notes || ''}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value || null })}
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
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
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : editingTire ? 'Update' : 'Add Tire Set'}
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
                title="Delete Tire Set"
            />
        </div>
    );
}
