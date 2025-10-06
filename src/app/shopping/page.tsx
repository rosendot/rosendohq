// src/app/shopping/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, ShoppingCart, CheckCircle2, Circle, Tag, Calendar, AlertCircle } from 'lucide-react';
import type { ShoppingList, ShoppingListItem } from '@/types/database.types';

export default function ShoppingPage() {
    const [lists, setLists] = useState<ShoppingList[]>([]);
    const [items, setItems] = useState<ShoppingListItem[]>([]);
    const [selectedListId, setSelectedListId] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch shopping lists
    async function fetchLists() {
        try {
            const response = await fetch('/api/shopping/lists');
            if (!response.ok) throw new Error('Failed to fetch lists');
            const data = await response.json();
            setLists(data);
            if (data.length > 0 && !selectedListId) {
                setSelectedListId(data[0].id);
            }
        } catch (err) {
            console.error('Fetch lists error:', err);
            setError(err instanceof Error ? err.message : 'Failed to load lists');
        }
    }

    // Fetch items for selected list
    async function fetchItems() {
        if (!selectedListId) return;

        try {
            setLoading(true);
            const response = await fetch(`/api/shopping/lists/${selectedListId}/items`);
            if (!response.ok) throw new Error('Failed to fetch items');
            const data = await response.json();
            setItems(data);
            setError(null);
        } catch (err) {
            console.error('Fetch items error:', err);
            setError(err instanceof Error ? err.message : 'Failed to load items');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchLists();
    }, []);

    useEffect(() => {
        if (selectedListId) {
            fetchItems();
        }
    }, [selectedListId]);

    // Toggle item done status
    const toggleItemDone = async (itemId: string, currentStatus: boolean) => {
        try {
            const response = await fetch(`/api/shopping/items/${itemId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    is_done: !currentStatus,
                    last_purchased_at: !currentStatus ? new Date().toISOString() : null
                }),
            });

            if (!response.ok) throw new Error('Failed to update item');

            fetchItems();
        } catch (err) {
            console.error('Error toggling item:', err);
            alert(err instanceof Error ? err.message : 'Failed to update item');
        }
    };

    const categories = ['all', ...Array.from(new Set(items.map(item => item.category).filter(Boolean)))];

    const filteredItems = items.filter(item => {
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        const matchesSearch = item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.notes?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const activeItems = filteredItems.filter(i => !i.is_done);
    const completedItems = filteredItems.filter(i => i.is_done);

    const stats = {
        total: items.length,
        active: items.filter(i => !i.is_done).length,
        completed: items.filter(i => i.is_done).length,
        highPriority: items.filter(i => i.priority === 1 && !i.is_done).length,
    };

    if (loading && items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading shopping lists...</p>
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
                            <h1 className="text-3xl font-bold text-white mb-2">Shopping Lists</h1>
                            <p className="text-gray-400">Manage your grocery shopping</p>
                        </div>
                        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            Add Item
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm font-medium">Total Items</p>
                                <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
                            </div>
                            <div className="p-3 bg-purple-500/10 rounded-lg">
                                <ShoppingCart className="w-8 h-8 text-purple-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm font-medium">To Buy</p>
                                <p className="text-3xl font-bold text-white mt-1">{stats.active}</p>
                            </div>
                            <div className="p-3 bg-blue-500/10 rounded-lg">
                                <Circle className="w-8 h-8 text-blue-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm font-medium">Completed</p>
                                <p className="text-3xl font-bold text-white mt-1">{stats.completed}</p>
                            </div>
                            <div className="p-3 bg-green-500/10 rounded-lg">
                                <CheckCircle2 className="w-8 h-8 text-green-400" />
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
                                <AlertCircle className="w-8 h-8 text-red-400" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar - Lists */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                            <h2 className="text-lg font-semibold text-white mb-4">Lists</h2>
                            <div className="space-y-2">
                                {lists.map((list) => (
                                    <button
                                        key={list.id}
                                        onClick={() => setSelectedListId(list.id)}
                                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${selectedListId === list.id
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-800 text-gray-300 hover:bg-gray-750'
                                            }`}
                                    >
                                        <div className="font-medium">{list.name}</div>
                                        {list.notes && (
                                            <div className="text-sm text-gray-400 mt-1">{list.notes}</div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {/* Filters */}
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-6">
                            <div className="flex flex-col md:flex-row gap-4">
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
                            </div>
                        </div>

                        {/* Active Items */}
                        {activeItems.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-white mb-4">To Buy ({activeItems.length})</h3>
                                <div className="space-y-3">
                                    {activeItems.map((item) => (
                                        <div
                                            key={item.id}
                                            className="bg-gray-900 rounded-lg border border-gray-800 p-4 hover:border-gray-700 transition-all"
                                        >
                                            <div className="flex items-start gap-4">
                                                <button
                                                    onClick={() => toggleItemDone(item.id, item.is_done)}
                                                    className="mt-1 flex-shrink-0"
                                                >
                                                    <Circle className="w-6 h-6 text-gray-400 hover:text-blue-400 transition-colors" />
                                                </button>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1">
                                                            <h4 className="text-white font-medium">{item.item_name}</h4>
                                                            <div className="flex flex-wrap gap-2 mt-2">
                                                                {item.category && (
                                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium border border-blue-500/20">
                                                                        <Tag className="w-3 h-3" />
                                                                        {item.category}
                                                                    </span>
                                                                )}
                                                                {item.quantity && (
                                                                    <span className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs">
                                                                        {item.quantity} {item.unit || ''}
                                                                    </span>
                                                                )}
                                                                {item.priority && (
                                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${item.priority === 1 ? 'bg-red-500/20 text-red-400 border border-red-500/20' :
                                                                        item.priority === 2 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/20' :
                                                                            'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20'
                                                                        }`}>
                                                                        Priority {item.priority}
                                                                    </span>
                                                                )}
                                                                {item.aisle && (
                                                                    <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs border border-purple-500/20">
                                                                        {item.aisle}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {item.notes && (
                                                                <p className="text-gray-400 text-sm mt-2">{item.notes}</p>
                                                            )}
                                                        </div>
                                                        {item.needed_by && (
                                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                                <Calendar className="w-3 h-3" />
                                                                {new Date(item.needed_by).toLocaleDateString()}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Completed Items */}
                        {completedItems.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4">Completed ({completedItems.length})</h3>
                                <div className="space-y-3">
                                    {completedItems.map((item) => (
                                        <div
                                            key={item.id}
                                            className="bg-gray-900 rounded-lg border border-gray-800 p-4 opacity-60 hover:opacity-100 transition-all"
                                        >
                                            <div className="flex items-start gap-4">
                                                <button
                                                    onClick={() => toggleItemDone(item.id, item.is_done)}
                                                    className="mt-1 flex-shrink-0"
                                                >
                                                    <CheckCircle2 className="w-6 h-6 text-green-400 hover:text-gray-400 transition-colors" />
                                                </button>
                                                <div className="flex-1">
                                                    <h4 className="text-gray-400 font-medium line-through">{item.item_name}</h4>
                                                    {item.last_purchased_at && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Purchased {new Date(item.last_purchased_at).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Empty State */}
                        {filteredItems.length === 0 && (
                            <div className="bg-gray-900 rounded-lg border border-gray-800 p-12 text-center">
                                <ShoppingCart className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-white mb-2">No Items Found</h3>
                                <p className="text-gray-400">
                                    {searchQuery || selectedCategory !== 'all'
                                        ? 'Try adjusting your filters'
                                        : 'Start adding items to your shopping list'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}