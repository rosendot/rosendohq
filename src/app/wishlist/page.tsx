// src/app/wishlist/page.tsx
'use client';

import { useState } from 'react';

interface WishlistItem {
    id: string;
    title: string;
    category?: string;
    status: 'wanted' | 'considering' | 'on_hold' | 'purchased' | 'declined';
    url?: string;
    notes?: string;
    priority?: number;
    created_at: string;
}

// Mock data for development
const mockWishlistItems: WishlistItem[] = [
    {
        id: '1',
        title: 'Steam Deck',
        category: 'Gaming',
        status: 'wanted',
        url: 'https://store.steampowered.com/steamdeck',
        notes: 'Wait for next generation or price drop',
        priority: 4,
        created_at: '2025-01-01T10:00:00Z'
    },
    {
        id: '2',
        title: 'Mechanical Keyboard',
        category: 'Tech',
        status: 'considering',
        url: 'https://www.keychron.com/products/keychron-k2-wireless-mechanical-keyboard',
        notes: 'Keychron K2 or similar 75% layout',
        priority: 3,
        created_at: '2025-01-02T15:30:00Z'
    },
    {
        id: '3',
        title: 'Standing Desk',
        category: 'Furniture',
        status: 'wanted',
        url: 'https://www.upliftdesk.com/',
        notes: 'Need to measure office space first',
        priority: 5,
        created_at: '2025-01-03T09:15:00Z'
    },
    {
        id: '4',
        title: 'AirPods Pro',
        category: 'Audio',
        status: 'purchased',
        url: 'https://www.apple.com/airpods-pro/',
        notes: 'Bought during Black Friday sale',
        priority: 4,
        created_at: '2024-12-15T12:00:00Z'
    },
    {
        id: '5',
        title: 'Robot Vacuum',
        category: 'Home',
        status: 'on_hold',
        url: 'https://www.irobot.com/roomba',
        notes: 'Wait until we move to bigger place',
        priority: 2,
        created_at: '2024-12-20T16:45:00Z'
    },
    {
        id: '6',
        title: 'Expensive Coffee Machine',
        category: 'Kitchen',
        status: 'declined',
        url: 'https://www.breville.com/us/en/products/espresso/bes870.html',
        notes: 'Too expensive, current machine works fine',
        priority: 2,
        created_at: '2024-11-10T08:30:00Z'
    }
];

const statusColors = {
    wanted: 'bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-900',
    considering: 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-900',
    on_hold: 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 text-orange-900',
    purchased: 'bg-gradient-to-r from-violet-50 to-violet-100 border-violet-200 text-violet-900',
    declined: 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 text-gray-600'
};

const statusLabels = {
    wanted: 'Wanted',
    considering: 'Considering',
    on_hold: 'On Hold',
    purchased: 'Purchased',
    declined: 'Declined'
};

const priorityLabels = {
    1: 'Low',
    2: 'Medium-Low',
    3: 'Medium',
    4: 'High',
    5: 'Critical'
};

const priorityColors = {
    1: 'text-gray-500',
    2: 'text-blue-500',
    3: 'text-yellow-500',
    4: 'text-orange-500',
    5: 'text-red-500'
};

export default function WishlistPage() {
    const [items, setItems] = useState<WishlistItem[]>(mockWishlistItems);
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [newItem, setNewItem] = useState({
        title: '',
        category: '',
        url: '',
        notes: '',
        priority: 3
    });
    const [isAddingItem, setIsAddingItem] = useState(false);

    // Get unique categories
    const categories = Array.from(new Set(items.map(item => item.category).filter(Boolean)));

    // Filter items based on selected status and category
    const filteredItems = items.filter(item => {
        const statusMatch = selectedStatus === 'all' || item.status === selectedStatus;
        const categoryMatch = selectedCategory === 'all' || item.category === selectedCategory;
        return statusMatch && categoryMatch;
    });

    // Group items by status
    const groupedItems = filteredItems.reduce((acc, item) => {
        if (!acc[item.status]) {
            acc[item.status] = [];
        }
        acc[item.status].push(item);
        return acc;
    }, {} as Record<string, WishlistItem[]>);

    const addNewItem = () => {
        if (!newItem.title.trim()) return;

        const item: WishlistItem = {
            id: Date.now().toString(),
            title: newItem.title.trim(),
            category: newItem.category.trim() || undefined,
            status: 'wanted',
            url: newItem.url.trim() || undefined,
            notes: newItem.notes.trim() || undefined,
            priority: newItem.priority,
            created_at: new Date().toISOString()
        };

        setItems([item, ...items]);
        setNewItem({ title: '', category: '', url: '', notes: '', priority: 3 });
        setIsAddingItem(false);
    };

    const updateItemStatus = (itemId: string, newStatus: WishlistItem['status']) => {
        setItems(items.map(item =>
            item.id === itemId ? { ...item, status: newStatus } : item
        ));
    };

    const deleteItem = (itemId: string) => {
        setItems(items.filter(item => item.id !== itemId));
    };

    const getStatusCount = (status: string) => {
        if (status === 'all') return items.length;
        return items.filter(item => item.status === status).length;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-violet-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-violet-600 bg-clip-text text-transparent mb-2">
                        Wishlist
                    </h1>
                    <p className="text-gray-600">Track items you want, are considering, or have purchased</p>
                </div>

                {/* Filters and Add Button */}
                <div className="bg-white rounded-xl shadow-lg border border-emerald-100 p-6 mb-6">
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex flex-wrap gap-4 items-center">
                            {/* Status Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                >
                                    <option value="all">All ({getStatusCount('all')})</option>
                                    <option value="wanted">Wanted ({getStatusCount('wanted')})</option>
                                    <option value="considering">Considering ({getStatusCount('considering')})</option>
                                    <option value="on_hold">On Hold ({getStatusCount('on_hold')})</option>
                                    <option value="purchased">Purchased ({getStatusCount('purchased')})</option>
                                    <option value="declined">Declined ({getStatusCount('declined')})</option>
                                </select>
                            </div>

                            {/* Category Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                >
                                    <option value="all">All Categories</option>
                                    {categories.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsAddingItem(true)}
                            className="px-4 py-2 bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-lg hover:from-violet-600 hover:to-violet-700 transition-all duration-200 shadow-md"
                        >
                            Add Item
                        </button>
                    </div>
                </div>

                {/* Add New Item Form */}
                {isAddingItem && (
                    <div className="bg-white rounded-xl shadow-lg border border-violet-100 p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Wishlist Item</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title*</label>
                                <input
                                    type="text"
                                    value={newItem.title}
                                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="What do you want?"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <input
                                    type="text"
                                    value={newItem.category}
                                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                                    className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="Gaming, Tech, Home, etc."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                                <input
                                    type="url"
                                    value={newItem.url}
                                    onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                                    className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="https://..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                <select
                                    value={newItem.priority}
                                    onChange={(e) => setNewItem({ ...newItem, priority: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                >
                                    <option value={1}>Low</option>
                                    <option value={2}>Medium-Low</option>
                                    <option value={3}>Medium</option>
                                    <option value={4}>High</option>
                                    <option value={5}>Critical</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                <textarea
                                    value={newItem.notes}
                                    onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                                    className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    rows={3}
                                    placeholder="Any additional notes..."
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={addNewItem}
                                disabled={!newItem.title.trim()}
                                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
                            >
                                Add Item
                            </button>
                            <button
                                onClick={() => {
                                    setIsAddingItem(false);
                                    setNewItem({ title: '', category: '', url: '', notes: '', priority: 3 });
                                }}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Items Grid */}
                <div className="space-y-6">
                    {Object.entries(groupedItems).map(([status, statusItems]) => (
                        <div key={status}>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                {statusLabels[status as keyof typeof statusLabels]}
                                <span className="text-sm text-gray-500">({statusItems.length})</span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {statusItems.map(item => (
                                    <div
                                        key={item.id}
                                        className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${statusColors[item.status]}`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="font-semibold text-lg">{item.title}</h3>
                                            {item.priority && (
                                                <span className={`text-sm font-medium ${priorityColors[item.priority as keyof typeof priorityColors]}`}>
                                                    {priorityLabels[item.priority as keyof typeof priorityLabels]}
                                                </span>
                                            )}
                                        </div>

                                        {item.category && (
                                            <div className="text-sm text-gray-600 mb-2">
                                                <span className="bg-white/60 px-2 py-1 rounded">
                                                    {item.category}
                                                </span>
                                            </div>
                                        )}

                                        {item.notes && (
                                            <p className="text-sm text-gray-700 mb-3">{item.notes}</p>
                                        )}

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {item.url && (
                                                    <a
                                                        href={item.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                    >
                                                        View Link
                                                    </a>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {/* Status Change Buttons */}
                                                {item.status !== 'purchased' && (
                                                    <button
                                                        onClick={() => updateItemStatus(item.id, 'purchased')}
                                                        className="text-xs px-2 py-1 bg-violet-500 text-white rounded hover:bg-violet-600 transition-colors"
                                                        title="Mark as purchased"
                                                    >
                                                        ✓
                                                    </button>
                                                )}
                                                {item.status !== 'wanted' && item.status !== 'purchased' && (
                                                    <button
                                                        onClick={() => updateItemStatus(item.id, 'wanted')}
                                                        className="text-xs px-2 py-1 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors"
                                                        title="Mark as wanted"
                                                    >
                                                        ♡
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteItem(item.id)}
                                                    className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                                    title="Delete item"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {filteredItems.length === 0 && (
                    <div className="text-center text-gray-500 py-12">
                        <p className="text-lg">No items found matching your filters.</p>
                        <p className="text-sm">Try adjusting your filters or add a new item!</p>
                    </div>
                )}
            </div>
        </div >
    );
}