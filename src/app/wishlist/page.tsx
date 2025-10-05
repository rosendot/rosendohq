// app/wishlist/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Heart, Star, ExternalLink, Tag, DollarSign, Calendar, Store, Shirt, Palette, Edit } from 'lucide-react';
import AddItemModal from '@/app/wishlist/AddItemModal';
import EditItemModal from '@/app/wishlist/EditItemModal';

// Database-aligned types
type WishlistStatus = 'wanted' | 'considering' | 'on_hold' | 'purchased' | 'declined';

interface WishlistItem {
    id: string;
    title: string;
    category?: string;
    status: WishlistStatus;
    url?: string;
    notes?: string;
    priority?: number; // 1-5
    price_cents?: number;
    currency?: string;
    image_url?: string;
    purchased_at?: string;
    vendor?: string;
    brand?: string;
    color?: string;
    size?: string;
    created_at: string;
}

// Status configuration matching database enums
const STATUSES: { value: WishlistStatus; label: string; color: string }[] = [
    { value: 'wanted', label: 'Want', color: 'bg-blue-500' },
    { value: 'considering', label: 'Considering', color: 'bg-yellow-500' },
    { value: 'on_hold', label: 'On Hold', color: 'bg-gray-500' },
    { value: 'purchased', label: 'Purchased', color: 'bg-green-500' },
    { value: 'declined', label: 'Declined', color: 'bg-red-500' }
];

export default function WishlistPage() {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<WishlistStatus | 'all'>('wanted');
    const [searchQuery, setSearchQuery] = useState('');
    const [items, setItems] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Add modal state
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingItem, setEditingItem] = useState<WishlistItem | null>(null);

    // Fetch function
    async function fetchItems() {
        try {
            setLoading(true);
            const response = await fetch('/api/wishlist');
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            setItems(data);
            setError(null);
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err instanceof Error ? err.message : 'Failed to load items');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchItems();
    }, []);

    // Add success handler
    const handleAddSuccess = () => {
        fetchItems(); // Refresh the list
    };

    // Add edit handler
    const handleEdit = (item: WishlistItem) => {
        setEditingItem(item);
        setShowEditModal(true);
    };

    // Add edit success handler
    const handleEditSuccess = () => {
        fetchItems(); // Refresh the list
    };

    const handleDelete = async (itemId: string, itemTitle: string) => {
        if (!confirm(`Are you sure you want to delete "${itemTitle}"?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/wishlist/${itemId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete item');
            }

            // Refresh the list
            fetchItems();
        } catch (err) {
            console.error('Error deleting item:', err);
            alert(err instanceof Error ? err.message : 'Failed to delete item');
        }
    };

    const categories = ['all', ...Array.from(new Set(items.map(item => item.category).filter(Boolean)))];

    const filteredItems = items.filter(item => {
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.brand?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesStatus && matchesSearch;
    });

    const stats = {
        total: items.length,
        wanted: items.filter(i => i.status === 'wanted').length,
        purchased: items.filter(i => i.status === 'purchased').length,
        highPriority: items.filter(i => i.priority === 1).length,
        totalValue: items
            .filter(i => i.status === 'wanted' && i.price_cents)
            .reduce((sum, i) => sum + (i.price_cents || 0), 0) / 100,
    };

    const getPriorityColor = (priority?: number) => {
        if (!priority) return 'bg-gray-500/20 text-gray-400 border-gray-500/20';
        switch (priority) {
            case 1: return 'bg-red-500/20 text-red-400 border-red-500/20';
            case 2: return 'bg-orange-500/20 text-orange-400 border-orange-500/20';
            case 3: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20';
            case 4: return 'bg-blue-500/20 text-blue-400 border-blue-500/20';
            case 5: return 'bg-green-500/20 text-green-400 border-green-500/20';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/20';
        }
    };

    const getStatusConfig = (status: WishlistStatus) => {
        return STATUSES.find(s => s.value === status) || STATUSES[0];
    };

    const formatPrice = (cents?: number, currency: string = 'USD') => {
        if (!cents) return null;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(cents / 100);
    };

    // Add loading state before the return
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading wishlist...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 mb-4">Error: {error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Wishlist</h1>
                            <p className="text-gray-400">Track items you want to purchase</p>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Add Item
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm font-medium">Total Items</p>
                                <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
                            </div>
                            <div className="p-3 bg-purple-500/10 rounded-lg">
                                <Heart className="w-8 h-8 text-purple-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm font-medium">Wanted</p>
                                <p className="text-3xl font-bold text-white mt-1">{stats.wanted}</p>
                            </div>
                            <div className="p-3 bg-blue-500/10 rounded-lg">
                                <Star className="w-8 h-8 text-blue-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm font-medium">Purchased</p>
                                <p className="text-3xl font-bold text-white mt-1">{stats.purchased}</p>
                            </div>
                            <div className="p-3 bg-green-500/10 rounded-lg">
                                <Tag className="w-8 h-8 text-green-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm font-medium">High Priority</p>
                                <p className="text-3xl font-bold text-white mt-1">{stats.highPriority}</p>
                            </div>
                            <div className="p-3 bg-red-500/10 rounded-lg">
                                <ExternalLink className="w-8 h-8 text-red-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm font-medium">Total Value</p>
                                <p className="text-3xl font-bold text-white mt-1">
                                    ${stats.totalValue.toFixed(0)}
                                </p>
                            </div>
                            <div className="p-3 bg-emerald-500/10 rounded-lg">
                                <DollarSign className="w-8 h-8 text-emerald-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search items..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Category Filter */}
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat === 'all' ? 'All Categories' : cat}
                                </option>
                            ))}
                        </select>

                        {/* Status Filter */}
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value as WishlistStatus | 'all')}
                            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            {STATUSES.map(({ value, label }) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Items Grid */}
                {filteredItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.map((item) => {
                            const statusConfig = getStatusConfig(item.status);
                            return (
                                <div
                                    key={item.id}
                                    className="bg-gray-900 rounded-lg border border-gray-800 p-6 hover:border-gray-700 transition-all"
                                >
                                    {/* Image */}
                                    {item.image_url && (
                                        <div className="mb-4 rounded-lg overflow-hidden bg-gray-800">
                                            <img
                                                src={item.image_url}
                                                alt={item.title}
                                                className="w-full h-48 object-cover"
                                            />
                                        </div>
                                    )}

                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {item.category && (
                                                    <span className="inline-block px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium border border-blue-500/20">
                                                        {item.category}
                                                    </span>
                                                )}
                                                <span className={`inline-block px-2 py-1 ${statusConfig.color}/20 text-${statusConfig.color.split('-')[1]}-400 rounded text-xs font-medium border border-${statusConfig.color.split('-')[1]}-500/20`}>
                                                    {statusConfig.label}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 ml-2">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                title="Edit item"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id, item.title)}
                                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Delete item"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Brand/Color/Size - NEW */}
                                    {(item.brand || item.color || item.size) && (
                                        <div className="mb-3 space-y-1">
                                            {item.brand && (
                                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                                    <Tag className="w-4 h-4" />
                                                    <span className="font-medium text-gray-300">Brand:</span>
                                                    {item.brand}
                                                </div>
                                            )}
                                            {item.color && (
                                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                                    <Palette className="w-4 h-4" />
                                                    <span className="font-medium text-gray-300">Color:</span>
                                                    {item.color}
                                                </div>
                                            )}
                                            {item.size && (
                                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                                    <Shirt className="w-4 h-4" />
                                                    <span className="font-medium text-gray-300">Size:</span>
                                                    {item.size}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Price */}
                                    {item.price_cents && (
                                        <div className="mb-3 flex items-center gap-2 text-emerald-400 font-semibold text-xl">
                                            <DollarSign className="w-5 h-5" />
                                            {formatPrice(item.price_cents, item.currency)}
                                        </div>
                                    )}

                                    {/* Vendor */}
                                    {item.vendor && (
                                        <div className="mb-3 flex items-center gap-2 text-sm text-gray-400">
                                            <Store className="w-4 h-4" />
                                            {item.vendor}
                                        </div>
                                    )}

                                    {/* Notes */}
                                    {item.notes && (
                                        <p className="text-gray-400 text-sm mb-4">{item.notes}</p>
                                    )}

                                    {/* Priority & Actions */}
                                    <div className="flex items-center gap-2 mb-4">
                                        {item.priority && (
                                            <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(item.priority)}`}>
                                                Priority {item.priority}
                                            </span>
                                        )}
                                        {item.url && (
                                            <a
                                                href={item.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs"
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                                Link
                                            </a>
                                        )}
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Calendar className="w-3 h-3" />
                                            {item.purchased_at ? (
                                                <span>Purchased {new Date(item.purchased_at).toLocaleDateString()}</span>
                                            ) : (
                                                <span>Added {new Date(item.created_at).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button className="p-2 text-gray-400 hover:text-blue-400 transition-colors">
                                                <Star className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                                                <Heart className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-12 text-center">
                        <Heart className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No Items Found</h3>
                        <p className="text-gray-400 mb-6">
                            {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'
                                ? 'Try adjusting your filters'
                                : 'Start adding items to your wishlist'}
                        </p>
                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                            Add Your First Item
                        </button>
                    </div>
                )}

                <AddItemModal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={handleAddSuccess}
                />

                <EditItemModal
                    isOpen={showEditModal}
                    item={editingItem}
                    onClose={() => {
                        setShowEditModal(false);
                        setEditingItem(null);
                    }}
                    onSuccess={handleEditSuccess}
                />
            </div>
        </div >
    );
}