// app/shopping/page.tsx
'use client';

import { useState } from 'react';
import { Plus, Search, Filter, ShoppingCart, Calendar, AlertCircle } from 'lucide-react';

interface ShoppingList {
    id: string;
    name: string;
    notes?: string;
    itemCount: number;
    created_at: string;
}

interface ShoppingItem {
    id: string;
    item_name: string;
    quantity: number;
    unit?: string;
    needed_by?: string;
    priority?: number;
    notes?: string;
    is_done: boolean;
    list_id: string;
}

export default function ShoppingPage() {
    const [selectedList, setSelectedList] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Minimal mock data - just 2 lists
    const mockLists: ShoppingList[] = [
        {
            id: '1',
            name: 'Weekly Groceries',
            notes: 'Regular weekly shopping',
            itemCount: 5,
            created_at: new Date().toISOString(),
        },
        {
            id: '2',
            name: 'Party Supplies',
            notes: 'For Saturday gathering',
            itemCount: 3,
            created_at: new Date(Date.now() - 86400000).toISOString(),
        },
    ];

    // Minimal mock items - just 8 total items
    const mockItems: ShoppingItem[] = [
        // Weekly Groceries
        { id: '1', item_name: 'Milk', quantity: 2, unit: 'gallons', is_done: false, list_id: '1', priority: 1 },
        { id: '2', item_name: 'Bread', quantity: 1, unit: 'loaf', is_done: true, list_id: '1', priority: 2 },
        { id: '3', item_name: 'Eggs', quantity: 12, unit: 'count', is_done: false, list_id: '1', priority: 1 },
        { id: '4', item_name: 'Chicken', quantity: 2, unit: 'lbs', is_done: false, list_id: '1', priority: 1 },
        { id: '5', item_name: 'Apples', quantity: 6, unit: 'count', is_done: false, list_id: '1', priority: 3 },

        // Party Supplies
        { id: '6', item_name: 'Paper Plates', quantity: 50, unit: 'count', is_done: false, list_id: '2', priority: 1 },
        { id: '7', item_name: 'Napkins', quantity: 100, unit: 'count', is_done: false, list_id: '2', priority: 2 },
        { id: '8', item_name: 'Cups', quantity: 30, unit: 'count', is_done: true, list_id: '2', priority: 1 },
    ];

    const currentList = mockLists.find(list => list.id === selectedList);
    const currentItems = selectedList
        ? mockItems.filter(item => item.list_id === selectedList)
        : [];

    const activeItems = currentItems.filter(item => !item.is_done);
    const completedItems = currentItems.filter(item => item.is_done);

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Shopping Lists</h1>
                            <p className="text-gray-400">Manage your shopping lists and items</p>
                        </div>
                        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            New List
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm font-medium">Total Lists</p>
                                <p className="text-3xl font-bold text-white mt-1">{mockLists.length}</p>
                            </div>
                            <div className="p-3 bg-blue-500/10 rounded-lg">
                                <ShoppingCart className="w-8 h-8 text-blue-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm font-medium">Active Items</p>
                                <p className="text-3xl font-bold text-white mt-1">
                                    {mockItems.filter(i => !i.is_done).length}
                                </p>
                            </div>
                            <div className="p-3 bg-green-500/10 rounded-lg">
                                <AlertCircle className="w-8 h-8 text-green-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm font-medium">Completed</p>
                                <p className="text-3xl font-bold text-white mt-1">
                                    {mockItems.filter(i => i.is_done).length}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-500/10 rounded-lg">
                                <Calendar className="w-8 h-8 text-purple-400" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Shopping Lists Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                            <h2 className="text-lg font-semibold text-white mb-4">Your Lists</h2>

                            <div className="space-y-3">
                                {mockLists.map((list) => (
                                    <button
                                        key={list.id}
                                        onClick={() => setSelectedList(list.id)}
                                        className={`w-full text-left p-4 rounded-lg transition-all ${selectedList === list.id
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-medium">{list.name}</h3>
                                                {list.notes && (
                                                    <p className={`text-sm mt-1 ${selectedList === list.id ? 'text-blue-100' : 'text-gray-400'
                                                        }`}>
                                                        {list.notes}
                                                    </p>
                                                )}
                                            </div>
                                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${selectedList === list.id
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-700 text-gray-300'
                                                }`}>
                                                {list.itemCount}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Items List */}
                    <div className="lg:col-span-2">
                        {selectedList ? (
                            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold text-white">{currentList?.name}</h2>
                                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                                        <Plus className="w-4 h-4" />
                                        Add Item
                                    </button>
                                </div>

                                {/* Search and Filter */}
                                <div className="flex gap-3 mb-6">
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
                                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2 border border-gray-700">
                                        <Filter className="w-4 h-4" />
                                        Filter
                                    </button>
                                </div>

                                {/* Active Items */}
                                {activeItems.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">
                                            Active Items ({activeItems.length})
                                        </h3>
                                        <div className="space-y-2">
                                            {activeItems.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="p-4 bg-gray-800 hover:bg-gray-750 rounded-lg transition-colors border border-gray-700"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={item.is_done}
                                                            className="mt-1 w-5 h-5 rounded border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900"
                                                            readOnly
                                                        />
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between">
                                                                <h4 className="font-medium text-white">{item.item_name}</h4>
                                                                <span className="text-gray-400">
                                                                    {item.quantity} {item.unit}
                                                                </span>
                                                            </div>
                                                            {item.notes && (
                                                                <p className="text-sm text-gray-400 mt-1">{item.notes}</p>
                                                            )}
                                                            {item.priority && (
                                                                <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${item.priority === 1
                                                                    ? 'bg-red-500/20 text-red-400'
                                                                    : item.priority === 2
                                                                        ? 'bg-yellow-500/20 text-yellow-400'
                                                                        : 'bg-green-500/20 text-green-400'
                                                                    }`}>
                                                                    Priority {item.priority}
                                                                </span>
                                                            )}
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
                                        <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">
                                            Completed ({completedItems.length})
                                        </h3>
                                        <div className="space-y-2">
                                            {completedItems.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={item.is_done}
                                                            className="mt-1 w-5 h-5 rounded border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900"
                                                            readOnly
                                                        />
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between">
                                                                <h4 className="font-medium text-gray-500 line-through">{item.item_name}</h4>
                                                                <span className="text-gray-500">
                                                                    {item.quantity} {item.unit}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {currentItems.length === 0 && (
                                    <div className="text-center py-12">
                                        <ShoppingCart className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                                        <p className="text-gray-400">No items in this list yet</p>
                                        <button className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                                            Add First Item
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-gray-900 rounded-lg border border-gray-800 p-12 text-center">
                                <ShoppingCart className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-white mb-2">Select a Shopping List</h3>
                                <p className="text-gray-400">Choose a list from the sidebar to view and manage items</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}