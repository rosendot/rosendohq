'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit2, Phone, Mail, Star } from 'lucide-react';
import ContractorModal from '../modals/ContractorModal';
import type { HomeContractor } from '@/types/house.types';

interface ContractorsTabProps {
    contractors: HomeContractor[];
    onRefresh: () => void;
}

export default function ContractorsTab({ contractors, onRefresh }: ContractorsTabProps) {
    const [showModal, setShowModal] = useState(false);
    const [editingContractor, setEditingContractor] = useState<HomeContractor | null>(null);

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

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Contractors</h2>
                <button
                    onClick={() => { setEditingContractor(null); setShowModal(true); }}
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
                                        onClick={() => { setEditingContractor(contractor); setShowModal(true); }}
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
            <ContractorModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                editingContractor={editingContractor}
                onSuccess={onRefresh}
            />
        </div>
    );
}
