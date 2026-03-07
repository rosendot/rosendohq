'use client';

import { useState } from 'react';
import { Plus, X, Trash2, Edit2, Phone, Mail, Star } from 'lucide-react';
import type { HomeContractor, HomeContractorInsert } from '@/types/database.types';

interface ContractorsTabProps {
    contractors: HomeContractor[];
    onRefresh: () => void;
}

export default function ContractorsTab({ contractors, onRefresh }: ContractorsTabProps) {
    const [showModal, setShowModal] = useState(false);
    const [editingContractor, setEditingContractor] = useState<HomeContractor | null>(null);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<HomeContractorInsert>({
        name: '',
        company: null,
        specialty: null,
        phone: null,
        email: null,
        website: null,
        address: null,
        rating: null,
        is_preferred: false,
        notes: null,
    });

    const resetForm = () => {
        setFormData({
            name: '',
            company: null,
            specialty: null,
            phone: null,
            email: null,
            website: null,
            address: null,
            rating: null,
            is_preferred: false,
            notes: null,
        });
        setEditingContractor(null);
    };

    const openModal = (contractor?: HomeContractor) => {
        if (contractor) {
            setEditingContractor(contractor);
            setFormData({
                name: contractor.name,
                company: contractor.company,
                specialty: contractor.specialty,
                phone: contractor.phone,
                email: contractor.email,
                website: contractor.website,
                address: contractor.address,
                rating: contractor.rating,
                is_preferred: contractor.is_preferred,
                notes: contractor.notes,
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
            const url = editingContractor
                ? `/api/house/contractors/${editingContractor.id}`
                : '/api/house/contractors';
            const method = editingContractor ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Failed to save contractor');

            setShowModal(false);
            resetForm();
            onRefresh();
        } catch (error) {
            console.error('Error saving contractor:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this contractor?')) return;

        try {
            const response = await fetch(`/api/house/contractors/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete');
            onRefresh();
        } catch (error) {
            console.error('Error deleting contractor:', error);
        }
    };

    const renderRating = (rating: number | null) => {
        if (!rating) return null;
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-4 h-4 ${
                            star <= rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-600'
                        }`}
                    />
                ))}
            </div>
        );
    };

    const specialties = [
        'General',
        'Plumbing',
        'Electrical',
        'HVAC',
        'Roofing',
        'Painting',
        'Landscaping',
        'Cleaning',
        'Pest Control',
        'Appliance Repair',
        'Flooring',
        'Carpentry',
        'Masonry',
        'Pool',
        'Security',
        'Other',
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Contractors</h2>
                <button
                    onClick={() => openModal()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Contractor
                </button>
            </div>

            {contractors.length === 0 ? (
                <div className="bg-gray-900 rounded-lg border border-gray-800 p-12 text-center">
                    <p className="text-gray-500">No contractors added yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {contractors.map((contractor) => (
                        <div
                            key={contractor.id}
                            className="p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-white">{contractor.name}</h3>
                                    {contractor.company && (
                                        <p className="text-sm text-gray-400">{contractor.company}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => openModal(contractor)}
                                        className="p-1 text-gray-400 hover:text-white transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(contractor.id)}
                                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {contractor.specialty && (
                                <span className="inline-block px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded border border-blue-500/20 mb-3">
                                    {contractor.specialty}
                                </span>
                            )}

                            <div className="space-y-2 text-sm">
                                {contractor.phone && (
                                    <a
                                        href={`tel:${contractor.phone}`}
                                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        <Phone className="w-4 h-4" />
                                        {contractor.phone}
                                    </a>
                                )}
                                {contractor.email && (
                                    <a
                                        href={`mailto:${contractor.email}`}
                                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        <Mail className="w-4 h-4" />
                                        {contractor.email}
                                    </a>
                                )}
                                {contractor.rating && (
                                    <div className="pt-1">{renderRating(contractor.rating)}</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-white">
                                {editingContractor ? 'Edit Contractor' : 'Add Contractor'}
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
                                    placeholder="Contact name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Company
                                </label>
                                <input
                                    type="text"
                                    value={formData.company || ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            company: e.target.value || null,
                                        })
                                    }
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Specialty
                                </label>
                                <select
                                    value={formData.specialty || ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            specialty: e.target.value || null,
                                        })
                                    }
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                >
                                    <option value="">Select specialty...</option>
                                    {specialties.map((s) => (
                                        <option key={s} value={s}>
                                            {s}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone || ''}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                phone: e.target.value || null,
                                            })
                                        }
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email || ''}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                email: e.target.value || null,
                                            })
                                        }
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Website
                                </label>
                                <input
                                    type="url"
                                    value={formData.website || ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            website: e.target.value || null,
                                        })
                                    }
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    placeholder="https://"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Address
                                </label>
                                <input
                                    type="text"
                                    value={formData.address || ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            address: e.target.value || null,
                                        })
                                    }
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Rating
                                </label>
                                <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() =>
                                                setFormData({
                                                    ...formData,
                                                    rating: formData.rating === star ? null : star,
                                                })
                                            }
                                            className="p-1"
                                        >
                                            <Star
                                                className={`w-6 h-6 ${
                                                    formData.rating && star <= formData.rating
                                                        ? 'text-yellow-400 fill-yellow-400'
                                                        : 'text-gray-600'
                                                }`}
                                            />
                                        </button>
                                    ))}
                                </div>
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
                                    {loading ? 'Saving...' : editingContractor ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
