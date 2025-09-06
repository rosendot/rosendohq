'use client';

import { useState } from 'react';

interface ShoppingList {
    id: string;
    name: string;
    notes?: string;
    created_at: string;
}

interface ShoppingItem {
    id: string;
    list_id: string;
    item_name: string;
    quantity: number;
    unit?: string;
    priority?: number;
    notes?: string;
    is_done: boolean;
    created_at: string;
}

// Mock data for development
const mockLists: ShoppingList[] = [
    {
        id: '1',
        name: 'Grocery List',
        notes: 'Weekly grocery shopping',
        created_at: '2025-01-06T10:00:00Z'
    },
    {
        id: '2',
        name: 'Hardware Store',
        notes: 'Home improvement items',
        created_at: '2025-01-05T15:30:00Z'
    }
];

const mockItems: ShoppingItem[] = [
    {
        id: '1',
        list_id: '1',
        item_name: 'Milk',
        quantity: 2,
        unit: 'gallons',
        priority: 3,
        notes: 'Whole milk preferred',
        is_done: false,
        created_at: '2025-01-06T10:05:00Z'
    },
    {
        id: '2',
        list_id: '1',
        item_name: 'Bread',
        quantity: 1,
        unit: 'loaf',
        priority: 2,
        notes: 'Whole wheat',
        is_done: false,
        created_at: '2025-01-06T10:06:00Z'
    },
    {
        id: '3',
        list_id: '1',
        item_name: 'Coffee',
        quantity: 1,
        unit: 'bag',
        priority: 4,
        notes: 'Dark roast',
        is_done: true,
        created_at: '2025-01-06T10:07:00Z'
    },
    {
        id: '4',
        list_id: '2',
        item_name: 'Screws',
        quantity: 1,
        unit: 'box',
        priority: 3,
        notes: '2 inch wood screws',
        is_done: false,
        created_at: '2025-01-05T15:35:00Z'
    }
];

export default function ShoppingPage() {
    const [lists, setLists] = useState<ShoppingList[]>(mockLists);
    const [items, setItems] = useState<ShoppingItem[]>(mockItems);
    const [selectedListId, setSelectedListId] = useState<string>('1');
    const [newItemName, setNewItemName] = useState('');
    const [newItemQuantity, setNewItemQuantity] = useState(1);
    const [newItemUnit, setNewItemUnit] = useState('');

    const selectedList = lists.find(list => list.id === selectedListId);
    const currentItems = items.filter(item => item.list_id === selectedListId);
    const openItems = currentItems.filter(item => !item.is_done);
    const doneItems = currentItems.filter(item => item.is_done);

    const addNewItem = () => {
        if (!newItemName.trim() || !selectedListId) return;

        const newItem: ShoppingItem = {
            id: Date.now().toString(),
            list_id: selectedListId,
            item_name: newItemName.trim(),
            quantity: newItemQuantity,
            unit: newItemUnit.trim() || undefined,
            priority: 3,
            notes: undefined,
            is_done: false,
            created_at: new Date().toISOString()
        };

        setItems([...items, newItem]);
        setNewItemName('');
        setNewItemQuantity(1);
        setNewItemUnit('');
    };

    const toggleItemDone = (itemId: string) => {
        setItems(items.map(item =>
            item.id === itemId
                ? { ...item, is_done: !item.is_done }
                : item
        ));
    };

    const deleteItem = (itemId: string) => {
        setItems(items.filter(item => item.id !== itemId));
    };

    const createNewList = () => {
        const listName = prompt('Enter a name for your new shopping list:');
        if (!listName?.trim()) return;

        const newList: ShoppingList = {
            id: Date.now().toString(),
            name: listName.trim(),
            notes: undefined,
            created_at: new Date().toISOString()
        };

        setLists([newList, ...lists]);
        setSelectedListId(newList.id);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Lists</h1>
                    <p className="text-gray-600">Manage your shopping lists and track items</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Lists Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold">Your Lists</h2>
                                <button
                                    onClick={createNewList}
                                    className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                >
                                    New List
                                </button>
                            </div>

                            <div className="space-y-2">
                                {lists.map(list => (
                                    <button
                                        key={list.id}
                                        onClick={() => setSelectedListId(list.id)}
                                        className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedListId === list.id
                                            ? 'bg-blue-50 border-blue-200 text-blue-900'
                                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                            }`}
                                    >
                                        <div className="font-medium">{list.name}</div>
                                        {list.notes && (
                                            <div className="text-sm text-gray-600 mt-1">{list.notes}</div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {selectedList ? (
                            <div className="bg-white rounded-lg shadow-sm border">
                                {/* List Header */}
                                <div className="p-6 border-b">
                                    <h2 className="text-xl font-semibold text-gray-900">{selectedList.name}</h2>
                                    {selectedList.notes && (
                                        <p className="text-gray-600 mt-1">{selectedList.notes}</p>
                                    )}
                                </div>

                                {/* Add New Item */}
                                <div className="p-6 border-b bg-gray-50">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Add new item..."
                                            value={newItemName}
                                            onChange={(e) => setNewItemName(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && addNewItem()}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Qty"
                                            value={newItemQuantity}
                                            onChange={(e) => setNewItemQuantity(Number(e.target.value))}
                                            className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            min="1"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Unit"
                                            value={newItemUnit}
                                            onChange={(e) => setNewItemUnit(e.target.value)}
                                            className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                            onClick={addNewItem}
                                            disabled={!newItemName.trim()}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>

                                {/* Items List */}
                                <div className="p-6">
                                    {/* Open Items */}
                                    {openItems.length > 0 && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-medium text-gray-900 mb-3">
                                                To Buy ({openItems.length})
                                            </h3>
                                            <div className="space-y-2">
                                                {openItems.map(item => (
                                                    <div key={item.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                                                        <input
                                                            type="checkbox"
                                                            checked={false}
                                                            onChange={() => toggleItemDone(item.id)}
                                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                        />
                                                        <div className="flex-1">
                                                            <div className="font-medium">{item.item_name}</div>
                                                            {(item.quantity || item.unit) && (
                                                                <div className="text-sm text-gray-600">
                                                                    {item.quantity} {item.unit}
                                                                </div>
                                                            )}
                                                            {item.notes && (
                                                                <div className="text-sm text-gray-600 italic">{item.notes}</div>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => deleteItem(item.id)}
                                                            className="text-red-600 hover:text-red-700 text-sm"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Done Items */}
                                    {doneItems.length > 0 && (
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-3">
                                                Completed ({doneItems.length})
                                            </h3>
                                            <div className="space-y-2">
                                                {doneItems.map(item => (
                                                    <div key={item.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                                                        <input
                                                            type="checkbox"
                                                            checked={true}
                                                            onChange={() => toggleItemDone(item.id)}
                                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                        />
                                                        <div className="flex-1">
                                                            <div className="font-medium line-through text-gray-500">{item.item_name}</div>
                                                            {(item.quantity || item.unit) && (
                                                                <div className="text-sm text-gray-400">
                                                                    {item.quantity} {item.unit}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => deleteItem(item.id)}
                                                            className="text-red-600 hover:text-red-700 text-sm"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {currentItems.length === 0 && (
                                        <div className="text-center text-gray-500 py-8">
                                            <p>No items in this list yet.</p>
                                            <p className="text-sm">Add your first item above!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm border p-8 text-center text-gray-500">
                                <p>Select a shopping list to view items</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}