// src/app/shopping/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, ShoppingCart, CheckCircle2, Circle, Tag, Calendar, AlertCircle, Trash2, Check, X, Edit2 } from 'lucide-react';
import type { ShoppingList, ShoppingListItem } from '@/types/database.types';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import AddShoppingItemModal from '@/app/shopping/AddShoppingItemModal';
import EditShoppingItemModal from '@/app/shopping/EditShoppingItemModal';

export default function ShoppingPage() {
    const [lists, setLists] = useState<ShoppingList[]>([]);
    const [allItems, setAllItems] = useState<Record<string, ShoppingListItem[]>>({});
    const [selectedListId, setSelectedListId] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingItem, setEditingItem] = useState<ShoppingListItem | null>(null);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        show: boolean;
        itemId: string | null;
        itemName: string;
        isBulk: boolean;
    }>({ show: false, itemId: null, itemName: '', isBulk: false });

    // Fetch all shopping lists and their items in parallel on mount
    async function fetchAllData() {
        try {
            setLoading(true);

            // First, fetch all lists
            const listsResponse = await fetch('/api/shopping/lists');
            if (!listsResponse.ok) throw new Error('Failed to fetch lists');
            const listsData = await listsResponse.json();
            setLists(listsData);

            // Then, fetch items for all lists in parallel
            const itemsPromises = listsData.map(async (list: ShoppingList) => {
                const response = await fetch(`/api/shopping/lists/${list.id}/items`);
                if (!response.ok) throw new Error(`Failed to fetch items for list ${list.id}`);
                const items = await response.json();
                return { listId: list.id, items };
            });

            const itemsResults = await Promise.all(itemsPromises);

            // Build the items map
            const itemsMap: Record<string, ShoppingListItem[]> = {};
            itemsResults.forEach(({ listId, items }) => {
                itemsMap[listId] = items;
            });

            setAllItems(itemsMap);

            // Set the first list as selected if none is selected
            if (listsData.length > 0 && !selectedListId) {
                setSelectedListId(listsData[0].id);
            }

            setError(null);
        } catch (err) {
            console.error('Fetch data error:', err);
            setError(err instanceof Error ? err.message : 'Failed to load data');
        } finally {
            setLoading(false);
        }
    }

    // Refresh items for a specific list
    async function refreshListItems(listId: string) {
        try {
            const response = await fetch(`/api/shopping/lists/${listId}/items`);
            if (!response.ok) throw new Error('Failed to fetch items');
            const items = await response.json();
            setAllItems(prev => ({ ...prev, [listId]: items }));
        } catch (err) {
            console.error('Refresh items error:', err);
            setError(err instanceof Error ? err.message : 'Failed to refresh items');
        }
    }

    useEffect(() => {
        fetchAllData();
    }, []);

    // Clear selection when switching lists
    useEffect(() => {
        setSelectedItems(new Set());
        setIsSelectionMode(false);
    }, [selectedListId]);

    // Exit selection mode when no items are selected
    useEffect(() => {
        if (selectedItems.size === 0 && isSelectionMode) {
            setIsSelectionMode(false);
        }
    }, [selectedItems, isSelectionMode]);

    // Get items for the currently selected list
    const items = selectedListId ? (allItems[selectedListId] || []) : [];

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

            if (selectedListId) {
                await refreshListItems(selectedListId);
            }
        } catch (err) {
            console.error('Error toggling item:', err);
            alert(err instanceof Error ? err.message : 'Failed to update item');
        }
    };

    // Handle add item success
    const handleAddSuccess = () => {
        if (selectedListId) {
            refreshListItems(selectedListId);
        }
    };

    // Handle edit item
    const handleEditItem = (item: ShoppingListItem) => {
        setEditingItem(item);
        setShowEditModal(true);
    };

    // Handle edit success
    const handleEditSuccess = () => {
        if (selectedListId) {
            refreshListItems(selectedListId);
        }
    };

    // Show delete confirmation
    const showDeleteConfirmation = (itemId: string, itemName: string) => {
        setDeleteConfirmation({
            show: true,
            itemId,
            itemName,
            isBulk: false
        });
    };

    // Show bulk delete confirmation
    const showBulkDeleteConfirmation = () => {
        setDeleteConfirmation({
            show: true,
            itemId: null,
            itemName: '',
            isBulk: true
        });
    };

    // Delete item
    const handleDeleteItem = async (itemId: string) => {
        try {
            const response = await fetch(`/api/shopping/items/${itemId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete item');

            if (selectedListId) {
                await refreshListItems(selectedListId);
            }

            setDeleteConfirmation({ show: false, itemId: null, itemName: '', isBulk: false });
        } catch (err) {
            console.error('Error deleting item:', err);
            alert(err instanceof Error ? err.message : 'Failed to delete item');
        }
    };

    // Toggle item selection
    const toggleItemSelection = (itemId: string) => {
        setSelectedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
    };

    // Toggle select all active items
    const toggleSelectAllActive = () => {
        const allActiveIds = new Set(activeItems.map(item => item.id));
        const allActiveSelected = activeItems.every(item => selectedItems.has(item.id));

        if (allActiveSelected && activeItems.length > 0) {
            // Unselect all active items
            const newSelection = new Set(selectedItems);
            allActiveIds.forEach(id => newSelection.delete(id));
            setSelectedItems(newSelection);
        } else {
            // Select all active items (merge with existing selection)
            setSelectedItems(new Set([...selectedItems, ...allActiveIds]));
        }
    };

    // Toggle select all completed items
    const toggleSelectAllCompleted = () => {
        const allCompletedIds = new Set(completedItems.map(item => item.id));
        const allCompletedSelected = completedItems.every(item => selectedItems.has(item.id));

        if (allCompletedSelected && completedItems.length > 0) {
            // Unselect all completed items
            const newSelection = new Set(selectedItems);
            allCompletedIds.forEach(id => newSelection.delete(id));
            setSelectedItems(newSelection);
        } else {
            // Select all completed items (merge with existing selection)
            setSelectedItems(new Set([...selectedItems, ...allCompletedIds]));
        }
    };

    // Clear selection
    const clearSelection = () => {
        setSelectedItems(new Set());
        setIsSelectionMode(false);
    };

    // Long press handlers to enter selection mode
    const handleLongPressStart = (itemId: string) => {
        const timer = setTimeout(() => {
            setIsSelectionMode(true);
            setSelectedItems(new Set([itemId]));
        }, 500); // 500ms long press
        setLongPressTimer(timer);
    };

    const handleLongPressEnd = () => {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            setLongPressTimer(null);
        }
    };

    // Handle item tap based on mode
    const handleItemTap = (itemId: string) => {
        if (isSelectionMode) {
            toggleItemSelection(itemId);
        }
    };

    // Bulk complete selected items
    const bulkCompleteItems = async () => {
        if (selectedItems.size === 0) return;

        try {
            const response = await fetch('/api/shopping/items/bulk', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    itemIds: Array.from(selectedItems),
                    updates: {
                        is_done: true,
                        last_purchased_at: new Date().toISOString()
                    }
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to complete items');
            }

            clearSelection();
            if (selectedListId) {
                await refreshListItems(selectedListId);
            }
        } catch (err) {
            console.error('Error completing items:', err);
            alert(err instanceof Error ? err.message : 'Failed to complete items');
        }
    };

    // Bulk uncomplete selected items
    const bulkUncompleteItems = async () => {
        if (selectedItems.size === 0) return;

        try {
            const response = await fetch('/api/shopping/items/bulk', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    itemIds: Array.from(selectedItems),
                    updates: {
                        is_done: false
                    }
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to uncomplete items');
            }

            clearSelection();
            if (selectedListId) {
                await refreshListItems(selectedListId);
            }
        } catch (err) {
            console.error('Error uncompleting items:', err);
            alert(err instanceof Error ? err.message : 'Failed to uncomplete items');
        }
    };

    // Bulk delete selected items
    const bulkDeleteItems = async () => {
        if (selectedItems.size === 0) return;

        try {
            const response = await fetch('/api/shopping/items/bulk', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    itemIds: Array.from(selectedItems)
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete items');
            }

            clearSelection();
            if (selectedListId) {
                await refreshListItems(selectedListId);
            }

            setDeleteConfirmation({ show: false, itemId: null, itemName: '', isBulk: false });
        } catch (err) {
            console.error('Error deleting items:', err);
            alert(err instanceof Error ? err.message : 'Failed to delete items');
        }
    };

    // Confirm delete action
    const confirmDelete = () => {
        if (deleteConfirmation.isBulk) {
            bulkDeleteItems();
        } else if (deleteConfirmation.itemId) {
            handleDeleteItem(deleteConfirmation.itemId);
        }
    };

    // Cancel delete action
    const cancelDelete = () => {
        setDeleteConfirmation({ show: false, itemId: null, itemName: '', isBulk: false });
    };

    const categories = ['all', ...Array.from(new Set(items.map(item => item.category).filter((cat): cat is string => cat !== null)))];

    const filteredItems = items.filter(item => {
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        const matchesSearch = item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.notes?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const activeItems = filteredItems.filter(i => !i.is_done);
    const completedItems = filteredItems.filter(i => i.is_done);

    // Determine if selected items are from active or completed section
    const selectedActiveCount = Array.from(selectedItems).filter(id =>
        activeItems.some(item => item.id === id)
    ).length;
    const selectedCompletedCount = Array.from(selectedItems).filter(id =>
        completedItems.some(item => item.id === id)
    ).length;

    const stats = {
        total: items.length,
        active: items.filter(i => !i.is_done).length,
        completed: items.filter(i => i.is_done).length,
        highPriority: items.filter(i => i.priority === 1 && !i.is_done).length,
    };

    if (loading) {
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

                        {/* Bulk Actions Toolbar */}
                        {selectedItems.size > 0 && (
                            <div className="bg-blue-600 rounded-lg p-4 mb-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-white font-medium">
                                        {selectedItems.size} item{selectedItems.size > 1 ? 's' : ''} selected
                                    </span>
                                    <button
                                        onClick={clearSelection}
                                        className="text-blue-200 hover:text-white transition-colors text-sm"
                                    >
                                        Clear
                                    </button>
                                </div>
                                <div className="flex items-center gap-2">
                                    {selectedActiveCount > 0 && (
                                        <button
                                            onClick={bulkCompleteItems}
                                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                                        >
                                            <Check className="w-4 h-4" />
                                            Mark Complete
                                        </button>
                                    )}
                                    {selectedCompletedCount > 0 && (
                                        <button
                                            onClick={bulkUncompleteItems}
                                            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                                        >
                                            <X className="w-4 h-4" />
                                            Mark Incomplete
                                        </button>
                                    )}
                                    <button
                                        onClick={showBulkDeleteConfirmation}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Active Items */}
                        {activeItems.length > 0 && (
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-white">To Buy ({activeItems.length})</h3>
                                    {isSelectionMode && activeItems.length > 0 && (
                                        <button
                                            onClick={toggleSelectAllActive}
                                            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                        >
                                            {activeItems.every(item => selectedItems.has(item.id)) ? 'Unselect All' : 'Select All'}
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    {activeItems.map((item) => (
                                        <div
                                            key={item.id}
                                            className={`bg-gray-900 rounded-lg border p-4 transition-all ${
                                                selectedItems.has(item.id) ? 'border-blue-500 bg-blue-500/10' : 'border-gray-800'
                                            }`}
                                            onTouchStart={() => handleLongPressStart(item.id)}
                                            onTouchEnd={handleLongPressEnd}
                                            onMouseDown={() => handleLongPressStart(item.id)}
                                            onMouseUp={handleLongPressEnd}
                                            onMouseLeave={handleLongPressEnd}
                                            onClick={() => handleItemTap(item.id)}
                                        >
                                            <div className="flex items-start gap-4">
                                                {isSelectionMode && (
                                                    <div className="mt-1 flex-shrink-0 w-6 h-6 flex items-center justify-center">
                                                        {selectedItems.has(item.id) ? (
                                                            <CheckCircle2 className="w-6 h-6 text-blue-400" />
                                                        ) : (
                                                            <Circle className="w-6 h-6 text-gray-600" />
                                                        )}
                                                    </div>
                                                )}
                                                {!isSelectionMode && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleItemDone(item.id, item.is_done);
                                                        }}
                                                        className="mt-1 flex-shrink-0"
                                                    >
                                                        <Circle className="w-6 h-6 text-gray-400 hover:text-blue-400 transition-colors" />
                                                    </button>
                                                )}
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
                                                        <div className="flex items-center gap-2">
                                                            {item.needed_by && (
                                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                                    <Calendar className="w-3 h-3" />
                                                                    {new Date(item.needed_by).toLocaleDateString()}
                                                                </div>
                                                            )}
                                                            {!isSelectionMode && (
                                                                <>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleEditItem(item);
                                                                        }}
                                                                        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                                        title="Edit item"
                                                                    >
                                                                        <Edit2 className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            showDeleteConfirmation(item.id, item.item_name);
                                                                        }}
                                                                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                                        title="Delete item"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
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
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-white">Completed ({completedItems.length})</h3>
                                    {isSelectionMode && completedItems.length > 0 && (
                                        <button
                                            onClick={toggleSelectAllCompleted}
                                            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                        >
                                            {completedItems.every(item => selectedItems.has(item.id)) ? 'Unselect All' : 'Select All'}
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    {completedItems.map((item) => (
                                        <div
                                            key={item.id}
                                            className={`bg-gray-900 rounded-lg border p-4 transition-all ${
                                                selectedItems.has(item.id)
                                                    ? 'border-blue-500 bg-blue-500/10 opacity-100'
                                                    : 'border-gray-800 opacity-60 hover:opacity-100'
                                            }`}
                                            onTouchStart={() => handleLongPressStart(item.id)}
                                            onTouchEnd={handleLongPressEnd}
                                            onMouseDown={() => handleLongPressStart(item.id)}
                                            onMouseUp={handleLongPressEnd}
                                            onMouseLeave={handleLongPressEnd}
                                            onClick={() => handleItemTap(item.id)}
                                        >
                                            <div className="flex items-start gap-4">
                                                {isSelectionMode && (
                                                    <div className="mt-1 flex-shrink-0 w-6 h-6 flex items-center justify-center">
                                                        {selectedItems.has(item.id) ? (
                                                            <CheckCircle2 className="w-6 h-6 text-blue-400" />
                                                        ) : (
                                                            <Circle className="w-6 h-6 text-gray-600" />
                                                        )}
                                                    </div>
                                                )}
                                                {!isSelectionMode && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleItemDone(item.id, item.is_done);
                                                        }}
                                                        className="mt-1 flex-shrink-0"
                                                    >
                                                        <CheckCircle2 className="w-6 h-6 text-green-400 hover:text-gray-400 transition-colors" />
                                                    </button>
                                                )}
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1">
                                                            <h4 className="text-gray-400 font-medium line-through">{item.item_name}</h4>
                                                            {item.last_purchased_at && (
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    Purchased {new Date(item.last_purchased_at).toLocaleDateString()}
                                                                </p>
                                                            )}
                                                        </div>
                                                        {!isSelectionMode && (
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleEditItem(item);
                                                                    }}
                                                                    className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                                    title="Edit item"
                                                                >
                                                                    <Edit2 className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        showDeleteConfirmation(item.id, item.item_name);
                                                                    }}
                                                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                                    title="Delete item"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
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

                {/* Delete Confirmation Modal */}
                <DeleteConfirmationModal
                    isOpen={deleteConfirmation.show}
                    onClose={cancelDelete}
                    onConfirm={confirmDelete}
                    itemName={deleteConfirmation.itemName}
                    itemCount={deleteConfirmation.isBulk ? selectedItems.size : undefined}
                />

                {/* Add Item Modal */}
                <AddShoppingItemModal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={handleAddSuccess}
                    listId={selectedListId}
                />

                {/* Edit Item Modal */}
                <EditShoppingItemModal
                    isOpen={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        setEditingItem(null);
                    }}
                    onSuccess={handleEditSuccess}
                    item={editingItem}
                />
            </div>
        </div>
    );
}