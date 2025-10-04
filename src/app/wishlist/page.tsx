// app/wishlist/page.tsx
'use client';

import { useState } from 'react';
import { Plus, Search, Filter, Heart, Star, ExternalLink, Tag } from 'lucide-react';

interface WishlistItem {
    id: string;
    title: string;
    category?: string;
    status: 'wishlist' | 'purchased' | 'archived';
    url?: string;
    notes?: string;
    priority?: number;
    created_at: string;
}

export default function WishlistPage() {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('wishlist');
    const [searchQuery, setSearchQuery] = useState('');

    // Minimal mock data - just 6 items
    const mockItems: WishlistItem[] = [
        {
            id: '1',
            title: 'Mechanical Keyboard',
            category: 'Electronics',
            status: 'wishlist',
            url: 'https://example.com/keyboard',
            notes: 'Cherry MX Blue switches preferred',
            priority: 1,
            created_at: new Date().toISOString(),
        },
        {
            id: '2',
            title: 'Running Shoes',
            category: 'Sports',
            status: 'wishlist',
            priority: 2,
            created_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
            id: '3',
            title: 'Kindle Paperwhite',
            category: 'Electronics',
            status: 'wishlist',
            url: 'https://example.com/kindle',
            priority: 1,
            created_at: new Date(Date.now() - 172800000).toISOString(),
        },
        {
            id: '4',
            title: 'Coffee Maker',
            category: 'Home',
            status: 'purchased',
            notes: 'Got it on sale!',
            created_at: new Date(Date.now() - 259200000).toISOString(),
        },
        {
            id: '5',
            title: 'Desk Lamp',
            category: 'Home',
            status: 'wishlist',
            priority: 3,
            created_at: new Date(Date.now() - 345600000).toISOString(),
        },
        {
            id: '6',
            title: 'Wireless Headphones',
            category: 'Electronics',
            status: 'purchased',
            url: 'https://example.com/headphones',
            created_at: new Date(Date.now() - 432000000).toISOString(),
        },
    ];

    const categories = ['all', ...Array.from(new Set(mockItems.map(item => item.category).filter(Boolean)))];

    const filteredItems = mockItems.filter(item => {
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.notes?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesStatus && matchesSearch;
    });

    const stats = {
        total: mockItems.length,
        wishlist: mockItems.filter(i => i.status === 'wishlist').length,
        purchased: mockItems.filter(i => i.status === 'purchased').length,
        highPriority: mockItems.filter(i => i.priority === 1).length,
    };

    const getPriorityColor = (priority?: number) => {
        if (!priority) return 'bg-gray-500/20 text-gray-400';
        switch (priority) {
            case 1: return 'bg-red-500/20 text-red-400';
            case 2: return 'bg-yellow-500/20 text-yellow-400';
            case 3: return 'bg-green-500/20 text-green-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
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

                    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm font-medium">Wishlist</p>
                                <p className="text-3xl font-bold text-white mt-1">{stats.wishlist}</p>
                            </div>
                            <div className="p-3 bg-blue-500/10 rounded-lg">
                                <Star className="w-8 h-8 text-blue-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
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

                    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
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
                </div>

                {/* Filters */}
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search items..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Category Filter */}
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="wishlist">Wishlist</option>
                            <option value="purchased">Purchased</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>
                </div>

                {/* Items Grid */}
                {filteredItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.map((item) => (
                            <div
                                key={item.id}
                                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                                        {item.category && (
                                            <span className="inline-block px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium">
                                                {item.category}
                                            </span>
                                        )}
                                    </div>
                                    {item.status === 'purchased' && (
                                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium">
                                            Purchased
                                        </span>
                                    )}
                                </div>

                                {item.notes && (
                                    <p className="text-gray-400 text-sm mb-4">{item.notes}</p>
                                )}

                                <div className="flex items-center gap-2 mb-4">
                                    {item.priority && (
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(item.priority)}`}>
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

                                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                                    <span className="text-xs text-gray-500">
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </span>
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
                        ))}
                    </div>
                ) : (
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-12 text-center">
                        <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
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