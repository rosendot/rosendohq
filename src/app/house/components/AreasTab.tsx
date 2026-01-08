'use client';

import { useState } from 'react';
import { Plus, X, Trash2, Edit2, Home } from 'lucide-react';
import type { HomeArea, HomeAreaInsert } from '@/types/database.types';

interface AreasTabProps {
    areas: HomeArea[];
    propertyId: string | null;
    onRefresh: () => void;
}

export default function AreasTab({ areas, propertyId, onRefresh }: AreasTabProps) {
    const [showModal, setShowModal] = useState(false);
    const [editingArea, setEditingArea] = useState<HomeArea | null>(null);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<HomeAreaInsert>({
        property_id: propertyId || '',
        name: '',
        type: null,
        notes: null,
    });

    const resetForm = () => {
        setFormData({
            property_id: propertyId || '',
            name: '',
            type: null,
            notes: null,
        });
        setEditingArea(null);
    };

    const openModal = (area?: HomeArea) => {
        if (area) {
            setEditingArea(area);
            setFormData({
                property_id: area.property_id,
                name: area.name,
                type: area.type,
                notes: area.notes,
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
            const url = editingArea ? `/api/house/areas/${editingArea.id}` : '/api/house/areas';
            const method = editingArea ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Failed to save area');

            setShowModal(false);
            resetForm();
            onRefresh();
        } catch (error) {
            console.error('Error saving area:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this area?')) return;

        try {
            const response = await fetch(`/api/house/areas/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete');
            onRefresh();
        } catch (error) {
            console.error('Error deleting area:', error);
        }
    };

    const areaTypes = [
        'bedroom',
        'bathroom',
        'kitchen',
        'living_room',
        'dining_room',
        'office',
        'garage',
        'basement',
        'attic',
        'laundry',
        'closet',
        'hallway',
        'patio',
        'deck',
        'yard',
        'other',
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Areas & Rooms</h2>
                <button
                    onClick={() => openModal()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Area
                </button>
            </div>

            {areas.length === 0 ? (
                <div className="bg-gray-900 rounded-lg border border-gray-800 p-12 text-center">
                    <p className="text-gray-500">No areas added yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {areas.map((area) => (
                        <div
                            key={area.id}
                            className="p-6 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/10 rounded-lg">
                                        <Home className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">{area.name}</h3>
                                        {area.type && (
                                            <p className="text-sm text-gray-400 capitalize">
                                                {area.type.replace('_', ' ')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => openModal(area)}
                                        className="p-1 text-gray-400 hover:text-white transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(area.id)}
                                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {area.notes && (
                                <div className="text-sm text-gray-500">{area.notes}</div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-white">
                                {editingArea ? 'Edit Area' : 'Add Area'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
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
                                    placeholder="e.g., Master Bedroom"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Type
                                </label>
                                <select
                                    value={formData.type || ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            type: e.target.value || null,
                                        })
                                    }
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                >
                                    <option value="">Select type...</option>
                                    {areaTypes.map((type) => (
                                        <option key={type} value={type}>
                                            {type.replace('_', ' ')}
                                        </option>
                                    ))}
                                </select>
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

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !formData.name.trim()}
                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : editingArea ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
