// app/wishlist/page.tsx
'use client';

import { useState } from 'react';
import { Plus, Search, Filter, Heart, Star, ExternalLink, Tag, DollarSign, Calendar, Store, Shirt, Palette } from 'lucide-react';

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

    // Updated mock data with real database structure including brand, color, size
    const mockItems: WishlistItem[] = [
        {
            id: '1',
            title: 'Check-In Large Luggage',
            category: 'Travel',
            status: 'wanted',
            url: 'https://monos.com/collections/check-in-luggage/products/check-in-large',
            notes: 'Polycarbonate hardshell, lightweight, 360° spinner wheels',
            priority: 1,
            price_cents: 37500,
            currency: 'USD',
            vendor: 'Monos',
            brand: 'Monos',
            color: 'Sage',
            size: 'Large',
            created_at: new Date().toISOString(),
        },
        {
            id: '2',
            title: 'Running Shoes',
            category: 'Sports',
            status: 'considering',
            priority: 2,
            price_cents: 12000,
            currency: 'USD',
            brand: 'Nike',
            color: 'Black/White',
            size: '10.5',
            created_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
            id: '3',
            title: 'Kindle Paperwhite',
            category: 'Electronics',
            status: 'wanted',
            url: 'https://example.com/kindle',
            priority: 1,
            price_cents: 13999,
            currency: 'USD',
            vendor: 'Amazon',
            brand: 'Amazon',
            created_at: new Date(Date.now() - 172800000).toISOString(),
        },
        {
            id: '4',
            title: 'Coffee Maker',
            category: 'Home',
            status: 'purchased',
            notes: 'Got it on sale!',
            price_cents: 7999,
            currency: 'USD',
            brand: 'Breville',
            purchased_at: new Date(Date.now() - 259200000).toISOString(),
            created_at: new Date(Date.now() - 259200000).toISOString(),
        },
        {
            id: '5',
            title: 'Winter Jacket',
            category: 'Clothing',
            status: 'wanted',
            priority: 1,
            price_cents: 24999,
            currency: 'USD',
            brand: 'Patagonia',
            color: 'Navy Blue',
            size: 'M',
            vendor: 'REI',
            created_at: new Date(Date.now() - 345600000).toISOString(),
        },
    ];

    const categories = ['all', ...Array.from(new Set(mockItems.map(item => item.category).filter(Boolean)))];

    const filteredItems = mockItems.filter(item => {
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.brand?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesStatus && matchesSearch;
    });

    const stats = {
        total: mockItems.length,
        wanted: mockItems.filter(i => i.status === 'wanted').length,
        purchased: mockItems.filter(i => i.status === 'purchased').length,
        highPriority: mockItems.filter(i => i.priority === 1).length,
        totalValue: mockItems
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
                        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
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
            </div>
        </div >
    );
}