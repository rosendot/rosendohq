'use client';

import { useState } from 'react';
import { Plus, X, Trash2, Edit2, FileText, ExternalLink, AlertCircle } from 'lucide-react';
import type { HomeDocument, HomeDocumentInsert, HomeDocumentType } from '@/types/house.types';

interface DocumentsTabProps {
    documents: HomeDocument[];
    propertyId: string | null;
    onRefresh: () => void;
}

export default function DocumentsTab({ documents, propertyId, onRefresh }: DocumentsTabProps) {
    const [showModal, setShowModal] = useState(false);
    const [editingDocument, setEditingDocument] = useState<HomeDocument | null>(null);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<HomeDocumentType | 'all'>('all');

    const [formData, setFormData] = useState<HomeDocumentInsert>({
        property_id: propertyId,
        appliance_id: null,
        project_id: null,
        document_type: 'other',
        name: '',
        description: null,
        file_url: null,
        file_id: null,
        expiration_date: null,
        issue_date: null,
        notes: null,
    });

    const resetForm = () => {
        setFormData({
            property_id: propertyId,
            appliance_id: null,
            project_id: null,
            document_type: 'other',
            name: '',
            description: null,
            file_url: null,
            file_id: null,
            expiration_date: null,
            issue_date: null,
            notes: null,
        });
        setEditingDocument(null);
    };

    const openModal = (doc?: HomeDocument) => {
        if (doc) {
            setEditingDocument(doc);
            setFormData({
                property_id: doc.property_id,
                appliance_id: doc.appliance_id,
                project_id: doc.project_id,
                document_type: doc.document_type,
                name: doc.name,
                description: doc.description,
                file_url: doc.file_url,
                file_id: doc.file_id,
                expiration_date: doc.expiration_date,
                issue_date: doc.issue_date,
                notes: doc.notes,
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
            const url = editingDocument
                ? `/api/house/documents/${editingDocument.id}`
                : '/api/house/documents';
            const method = editingDocument ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Failed to save document');

            setShowModal(false);
            resetForm();
            onRefresh();
        } catch (error) {
            console.error('Error saving document:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this document?')) return;

        try {
            const response = await fetch(`/api/house/documents/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete');
            onRefresh();
        } catch (error) {
            console.error('Error deleting document:', error);
        }
    };

    const isExpiringSoon = (date: string | null) => {
        if (!date) return false;
        const expiry = new Date(date);
        const threeMonths = new Date();
        threeMonths.setMonth(threeMonths.getMonth() + 3);
        return expiry <= threeMonths && expiry > new Date();
    };

    const isExpired = (date: string | null) => {
        if (!date) return false;
        return new Date(date) < new Date();
    };

    const documentTypes: HomeDocumentType[] = [
        'warranty',
        'manual',
        'receipt',
        'contract',
        'insurance',
        'inspection',
        'permit',
        'hoa',
        'deed',
        'mortgage',
        'tax',
        'photo',
        'other',
    ];

    const getTypeColor = (type: HomeDocumentType) => {
        const colors: Record<HomeDocumentType, string> = {
            warranty: 'bg-green-500/10 text-green-400 border-green-500/20',
            manual: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            receipt: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
            contract: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            insurance: 'bg-red-500/10 text-red-400 border-red-500/20',
            inspection: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
            permit: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
            hoa: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
            deed: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
            mortgage: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
            tax: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            photo: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
            other: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
        };
        return colors[type] || colors.other;
    };

    const filteredDocuments =
        filter === 'all'
            ? documents
            : documents.filter((doc) => doc.document_type === filter);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Documents</h2>
                <div className="flex gap-2">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as HomeDocumentType | 'all')}
                        className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                    >
                        <option value="all">All Types</option>
                        {documentTypes.map((type) => (
                            <option key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={() => openModal()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Document
                    </button>
                </div>
            </div>

            {filteredDocuments.length === 0 ? (
                <div className="bg-gray-900 rounded-lg border border-gray-800 p-12 text-center">
                    <p className="text-gray-500">
                        {filter === 'all' ? 'No documents added yet' : `No ${filter} documents`}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredDocuments.map((doc) => {
                        const expiringSoon = isExpiringSoon(doc.expiration_date);
                        const expired = isExpired(doc.expiration_date);

                        return (
                            <div
                                key={doc.id}
                                className={`p-4 bg-gray-900 rounded-lg border transition-colors ${
                                    expired
                                        ? 'border-red-500/30'
                                        : expiringSoon
                                        ? 'border-orange-500/30'
                                        : 'border-gray-800'
                                }`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-gray-800 rounded-lg">
                                            <FileText className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-white mb-1">
                                                {doc.name}
                                            </h3>
                                            <span
                                                className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${getTypeColor(
                                                    doc.document_type
                                                )}`}
                                            >
                                                {doc.document_type}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {doc.file_url && (
                                            <a
                                                href={doc.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        )}
                                        <button
                                            onClick={() => openModal(doc)}
                                            className="p-1 text-gray-400 hover:text-white transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(doc.id)}
                                            className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {doc.description && (
                                    <p className="text-sm text-gray-400 mb-3">{doc.description}</p>
                                )}

                                <div className="space-y-1 text-sm text-gray-400">
                                    {doc.issue_date && (
                                        <div>
                                            Issued: {new Date(doc.issue_date).toLocaleDateString()}
                                        </div>
                                    )}
                                    {doc.expiration_date && (
                                        <div
                                            className={`flex items-center gap-1 ${
                                                expired
                                                    ? 'text-red-400'
                                                    : expiringSoon
                                                    ? 'text-orange-400'
                                                    : ''
                                            }`}
                                        >
                                            {(expired || expiringSoon) && (
                                                <AlertCircle className="w-3 h-3" />
                                            )}
                                            Expires:{' '}
                                            {new Date(doc.expiration_date).toLocaleDateString()}
                                            {expired && ' (Expired)'}
                                            {expiringSoon && !expired && ' (Expiring Soon)'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-white">
                                {editingDocument ? 'Edit Document' : 'Add Document'}
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
                                    placeholder="Document name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Type *
                                </label>
                                <select
                                    value={formData.document_type}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            document_type: e.target.value as HomeDocumentType,
                                        })
                                    }
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                >
                                    {documentTypes.map((type) => (
                                        <option key={type} value={type}>
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description || ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            description: e.target.value || null,
                                        })
                                    }
                                    rows={2}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    File URL
                                </label>
                                <input
                                    type="url"
                                    value={formData.file_url || ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            file_url: e.target.value || null,
                                        })
                                    }
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Issue Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.issue_date || ''}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                issue_date: e.target.value || null,
                                            })
                                        }
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Expiration Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.expiration_date || ''}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                expiration_date: e.target.value || null,
                                            })
                                        }
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    />
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
                                    {loading ? 'Saving...' : editingDocument ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
