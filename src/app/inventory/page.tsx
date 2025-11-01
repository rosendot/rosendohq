// app/inventory/page.tsx
'use client';

import { useState } from 'react';
import { Plus, Package, MapPin, DollarSign, Search, Filter, Trash2, Edit2 } from 'lucide-react';

type InventoryItem = {
    id: string;
    name: string;
    category: string;
    location: string;
    quantity: number;
    purchaseDate: string;
    purchasePrice: number;
    notes?: string;
    imageUrl?: string;
};

const CATEGORIES = [
    'Electronics',
    'Furniture',
    'Appliances',
    'Tools',
    'Clothing',
    'Books',
    'Kitchen',
    'Sports',
    'Other'
];

const LOCATIONS = [
    'Living Room',
    'Bedroom',
    'Kitchen',
    'Garage',
    'Storage',
    'Office',
    'Basement',
    'Attic'
];

export default function InventoryPage() {
    const [items, setItems] = useState<InventoryItem[]>([
        {
            id: '1',
            name: 'Laptop - MacBook Pro',
            category: 'Electronics',
            location: 'Office',
            quantity: 1,
            purchaseDate: '2024-01-15',
            purchasePrice: 2499.99,
            notes: 'Work computer'
        },
        {
            id: '2',
            name: 'Office Chair',
            category: 'Furniture',
            location: 'Office',
            quantity: 1,
            purchaseDate: '2023-11-20',
            purchasePrice: 399.00,
            notes: 'Ergonomic chair'
        }
    ]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedLocation, setSelectedLocation] = useState<string>('all');

    const [formData, setFormData] = useState({
        name: '',
        category: CATEGORIES[0],
        location: LOCATIONS[0],
        quantity: 1,
        purchaseDate: new Date().toISOString().split('T')[0],
        purchasePrice: 0,
        notes: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingItem) {
            setItems(items.map(item =>
                item.id === editingItem.id
                    ? { ...item, ...formData }
                    : item
            ));
            setEditingItem(null);
        } else {
            const newItem: InventoryItem = {
                id: Date.now().toString(),
                ...formData
            };
            setItems([...items, newItem]);
        }
        setShowAddModal(false);
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            name: '',
            category: CATEGORIES[0],
            location: LOCATIONS[0],
            quantity: 1,
            purchaseDate: new Date().toISOString().split('T')[0],
            purchasePrice: 0,
            notes: ''
        });
    };

    const handleEdit = (item: InventoryItem) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            category: item.category,
            location: item.location,
            quantity: item.quantity,
            purchaseDate: item.purchaseDate,
            purchasePrice: item.purchasePrice,
            notes: item.notes || ''
        });
        setShowAddModal(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this item?')) {
            setItems(items.filter(item => item.id !== id));
        }
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.notes?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        const matchesLocation = selectedLocation === 'all' || item.location === selectedLocation;
        return matchesSearch && matchesCategory && matchesLocation;
    });

    const totalValue = filteredItems.reduce((sum, item) => sum + (item.purchasePrice * item.quantity), 0);
    const totalItems = filteredItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="min-h-screen bg-gray-950 text-white p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Inventory</h1>
                        <p className="text-gray-400">Track your possessions and their locations</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingItem(null);
                            resetForm();
                            setShowAddModal(true);
                        }}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Add Item
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Package className="w-6 h-6 text-blue-400" />
                            <h3 className="text-gray-400 text-sm font-medium">Total Items</h3>
                        </div>
                        <p className="text-3xl font-bold">{totalItems}</p>
                    </div>

                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <DollarSign className="w-6 h-6 text-green-400" />
                            <h3 className="text-gray-400 text-sm font-medium">Total Value</h3>
                        </div>
                        <p className="text-3xl font-bold">${totalValue.toFixed(2)}</p>
                    </div>

                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <MapPin className="w-6 h-6 text-purple-400" />
                            <h3 className="text-gray-400 text-sm font-medium">Locations</h3>
                        </div>
                        <p className="text-3xl font-bold">{new Set(items.map(i => i.location)).size}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                                <Search className="w-4 h-4" />
                                Search
                            </label>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search items..."
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                                <Filter className="w-4 h-4" />
                                Category
                            </label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Categories</option>
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                                <MapPin className="w-4 h-4" />
                                Location
                            </label>
                            <select
                                value={selectedLocation}
                                onChange={(e) => setSelectedLocation(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Locations</option>
                                {LOCATIONS.map(loc => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Items Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map(item => (
                        <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <Package className="w-4 h-4" />
                                            {item.category}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <MapPin className="w-4 h-4" />
                                            {item.location}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-800 rounded transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 pt-4 border-t border-gray-800">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Quantity:</span>
                                    <span className="font-medium">{item.quantity}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Value:</span>
                                    <span className="font-medium text-green-400">
                                        ${(item.purchasePrice * item.quantity).toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Purchased:</span>
                                    <span className="font-medium">
                                        {new Date(item.purchaseDate).toLocaleDateString()}
                                    </span>
                                </div>
                                {item.notes && (
                                    <p className="text-sm text-gray-400 pt-2 border-t border-gray-800">
                                        {item.notes}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {filteredItems.length === 0 && (
                    <div className="text-center py-12">
                        <Package className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg">No items found</p>
                        <p className="text-gray-500 text-sm">Add your first item to get started</p>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-6">
                            {editingItem ? 'Edit Item' : 'Add New Item'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Item Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Category *</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Location *</label>
                                    <select
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {LOCATIONS.map(loc => (
                                            <option key={loc} value={loc}>{loc}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Quantity</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Price</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.purchasePrice}
                                        onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Purchase Date</label>
                                <input
                                    type="date"
                                    value={formData.purchaseDate}
                                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Notes</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                                    placeholder="Optional notes..."
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setEditingItem(null);
                                        resetForm();
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                >
                                    {editingItem ? 'Update' : 'Add'} Item
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}