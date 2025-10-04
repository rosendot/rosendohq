// src/app/inventory/page.tsx
'use client';

import { useState } from 'react';

interface InventoryItem {
    id: string;
    name: string;
    quantity: number;
    unit?: string;
    location?: string;
    acquired_at?: string;
    notes?: string;
    updated_at: string;
    created_at: string;
}

// Mock data for development
const mockInventoryItems: InventoryItem[] = [
    {
        id: '1',
        name: 'AA Batteries',
        quantity: 12,
        unit: 'count',
        location: 'Kitchen Drawer',
        acquired_at: '2024-12-01',
        notes: 'Bulk pack from Costco',
        updated_at: '2025-01-01T10:00:00Z',
        created_at: '2024-12-01T10:00:00Z'
    },
    {
        id: '2',
        name: 'Paper Towels',
        quantity: 6,
        unit: 'rolls',
        location: 'Pantry',
        acquired_at: '2024-12-15',
        updated_at: '2025-01-01T10:00:00Z',
        created_at: '2024-12-15T10:00:00Z'
    },
    {
        id: '3',
        name: 'Motor Oil',
        quantity: 2,
        unit: 'quarts',
        location: 'Garage Shelf',
        acquired_at: '2024-11-20',
        notes: '5W-30 synthetic',
        updated_at: '2025-01-01T10:00:00Z',
        created_at: '2024-11-20T10:00:00Z'
    },
    {
        id: '4',
        name: 'Canned Tomatoes',
        quantity: 8,
        unit: 'cans',
        location: 'Pantry - Top Shelf',
        acquired_at: '2025-01-02',
        updated_at: '2025-01-02T15:30:00Z',
        created_at: '2025-01-02T15:30:00Z'
    },
    {
        id: '5',
        name: 'Light Bulbs (LED)',
        quantity: 4,
        unit: 'bulbs',
        location: 'Utility Closet',
        acquired_at: '2024-10-15',
        notes: '60W equivalent, soft white',
        updated_at: '2025-01-01T10:00:00Z',
        created_at: '2024-10-15T10:00:00Z'
    }
];

export default function InventoryPage() {
    const [items, setItems] = useState<InventoryItem[]>(mockInventoryItems);
    const [selectedLocation, setSelectedLocation] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddingItem, setIsAddingItem] = useState(false);
    const [newItem, setNewItem] = useState({
        name: '',
        quantity: 1,
        unit: '',
        location: '',
        acquired_at: new Date().toISOString().split('T')[0],
        notes: ''
    });

    // Get unique locations
    const locations = Array.from(new Set(items.map(item => item.location).filter(Boolean)));

    // Filter items
    const filteredItems = items.filter(item => {
        const locationMatch = selectedLocation === 'all' || item.location === selectedLocation;
        const searchMatch = searchQuery === '' ||
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.notes?.toLowerCase().includes(searchQuery.toLowerCase());
        return locationMatch && searchMatch;
    });

    // Group items by location
    const itemsByLocation = filteredItems.reduce((acc, item) => {
        const loc = item.location || 'Unspecified Location';
        if (!acc[loc]) {
            acc[loc] = [];
        }
        acc[loc].push(item);
        return acc;
    }, {} as Record<string, InventoryItem[]>);

    const addNewItem = () => {
        if (!newItem.name.trim()) return;

        const item: InventoryItem = {
            id: Date.now().toString(),
            name: newItem.name.trim(),
            quantity: newItem.quantity,
            unit: newItem.unit.trim() || undefined,
            location: newItem.location.trim() || undefined,
            acquired_at: newItem.acquired_at || undefined,
            notes: newItem.notes.trim() || undefined,
            updated_at: new Date().toISOString(),
            created_at: new Date().toISOString()
        };

        setItems([item, ...items]);
        setNewItem({ name: '', quantity: 1, unit: '', location: '', acquired_at: new Date().toISOString().split('T')[0], notes: '' });
        setIsAddingItem(false);
    };

    const updateQuantity = (itemId: string, delta: number) => {
        setItems(items.map(item => {
            if (item.id === itemId) {
                const newQuantity = Math.max(0, item.quantity + delta);
                return { ...item, quantity: newQuantity, updated_at: new Date().toISOString() };
            }
            return item;
        }));
    };

    const deleteItem = (itemId: string) => {
        if (confirm('Are you sure you want to delete this item?')) {
            setItems(items.filter(item => item.id !== itemId));
        }
    };

    const getTotalItems = () => {
        return filteredItems.reduce((sum, item) => sum + item.quantity, 0);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-violet-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-violet-600 bg-clip-text text-transparent mb-2">
                        Inventory
                    </h1>
                    <p className="text-gray-600">Track what you have and where it's stored</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow-lg border border-emerald-100 p-6">
                        <div className="text-sm text-gray-600 mb-1">Total Items</div>
                        <div className="text-3xl font-bold text-emerald-600">{filteredItems.length}</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg border border-violet-100 p-6">
                        <div className="text-sm text-gray-600 mb-1">Total Quantity</div>
                        <div className="text-3xl font-bold text-violet-600">{getTotalItems()}</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg border border-teal-100 p-6">
                        <div className="text-sm text-gray-600 mb-1">Locations</div>
                        <div className="text-3xl font-bold text-teal-600">{locations.length}</div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-xl shadow-lg border border-emerald-100 p-6 mb-6">
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex flex-wrap gap-4 items-center flex-1">
                            {/* Search */}
                            <div className="flex-1 min-w-[200px]">
                                <input
                                    type="text"
                                    placeholder="Search items..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>

                            {/* Location Filter */}
                            <div>
                                <select
                                    value={selectedLocation}
                                    onChange={(e) => setSelectedLocation(e.target.value)}
                                    className="px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                >
                                    <option value="all">All Locations ({items.length})</option>
                                    {locations.map(location => (
                                        <option key={location} value={location}>
                                            {location} ({items.filter(i => i.location === location).length})
                                        </option>
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
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Item</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name*</label>
                                <input
                                    type="text"
                                    value={newItem.name}
                                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="e.g., AA Batteries"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                <input
                                    type="text"
                                    value={newItem.location}
                                    onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                                    className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="e.g., Kitchen Drawer"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity*</label>
                                <input
                                    type="number"
                                    value={newItem.quantity}
                                    onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                                <input
                                    type="text"
                                    value={newItem.unit}
                                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                                    className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="e.g., count, boxes, bottles"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Acquired Date</label>
                                <input
                                    type="date"
                                    value={newItem.acquired_at}
                                    onChange={(e) => setNewItem({ ...newItem, acquired_at: e.target.value })}
                                    className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                <textarea
                                    value={newItem.notes}
                                    onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                                    className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    rows={2}
                                    placeholder="Any additional details..."
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={addNewItem}
                                disabled={!newItem.name.trim()}
                                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
                            >
                                Add Item
                            </button>
                            <button
                                onClick={() => {
                                    setIsAddingItem(false);
                                    setNewItem({ name: '', quantity: 1, unit: '', location: '', acquired_at: new Date().toISOString().split('T')[0], notes: '' });
                                }}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Items Grid - Grouped by Location */}
                <div className="space-y-6">
                    {Object.entries(itemsByLocation).map(([location, locationItems]) => (
                        <div key={location}>
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    📍 {location}
                                </h2>
                                <span className="text-sm text-gray-600">
                                    {locationItems.length} {locationItems.length === 1 ? 'item' : 'items'}
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {locationItems.map(item => (
                                    <div
                                        key={item.id}
                                        className="bg-white rounded-lg border border-emerald-200 p-4 hover:shadow-md transition-all duration-200"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="font-semibold text-lg text-gray-900">{item.name}</h3>
                                            <button
                                                onClick={() => deleteItem(item.id)}
                                                className="text-red-500 hover:text-red-700 text-sm transition-colors"
                                                title="Delete item"
                                            >
                                                ✕
                                            </button>
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center gap-3 mb-3">
                                            <button
                                                onClick={() => updateQuantity(item.id, -1)}
                                                className="w-8 h-8 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center font-bold"
                                            >
                                                −
                                            </button>
                                            <div className="flex-1 text-center">
                                                <div className="text-2xl font-bold text-emerald-600">
                                                    {item.quantity}
                                                </div>
                                                {item.unit && (
                                                    <div className="text-sm text-gray-600">{item.unit}</div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => updateQuantity(item.id, 1)}
                                                className="w-8 h-8 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center font-bold"
                                            >
                                                +
                                            </button>
                                        </div>

                                        {/* Item Details */}
                                        <div className="space-y-1 text-sm">
                                            {item.acquired_at && (
                                                <div className="text-gray-600">
                                                    <span className="font-medium">Acquired:</span>{' '}
                                                    {new Date(item.acquired_at).toLocaleDateString()}
                                                </div>
                                            )}
                                            {item.notes && (
                                                <div className="text-gray-700 italic">
                                                    "{item.notes}"
                                                </div>
                                            )}
                                            <div className="text-gray-500 text-xs pt-1">
                                                Updated: {new Date(item.updated_at).toLocaleDateString()}
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
                        <p className="text-lg">No items found.</p>
                        <p className="text-sm">
                            {searchQuery || selectedLocation !== 'all'
                                ? 'Try adjusting your filters.'
                                : 'Add your first item to get started!'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}