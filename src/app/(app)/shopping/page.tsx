// src/app/shopping/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, ShoppingCart, CheckCircle2, Circle, Calendar, Trash2, Check, X, Edit2, Loader2, CheckSquare } from 'lucide-react';
import type { ShoppingList, ShoppingListItem } from '@/types/database.types';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import AddShoppingItemModal from './AddShoppingItemModal';
import EditShoppingItemModal from './EditShoppingItemModal';

type SortOption = 'priority_asc' | 'priority_desc' | 'name_asc' | 'name_desc' | 'date_asc' | 'date_desc' | 'category';

export default function ShoppingPage() {
    const [lists, setLists] = useState<ShoppingList[]>([]);
    const [allItems, setAllItems] = useState<Record<string, ShoppingListItem[]>>({});
    const [selectedListId, setSelectedListId] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [sortBy, setSortBy] = useState<SortOption>('category');
    const [viewMode, setViewMode] = useState<'to_buy' | 'bought'>('to_buy');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingItem, setEditingItem] = useState<ShoppingListItem | null>(null);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        show: boolean;
        itemId: string | null;
        itemName: string;
        isBulk: boolean;
        isListDelete: boolean;
    }>({ show: false, itemId: null, itemName: '', isBulk: false, isListDelete: false });

    // List management state
    const [showListModal, setShowListModal] = useState(false);
    const [editingList, setEditingList] = useState<ShoppingList | null>(null);
    const [listFormData, setListFormData] = useState({ name: '', notes: '' });
    const [listSaving, setListSaving] = useState(false);

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

    // Quick priority rating handler
    const handleQuickPriority = async (itemId: string, newPriority: number, currentPriority: number | null) => {
        try {
            // If clicking the same priority, clear it (set to default 3)
            const priorityToSet = newPriority === currentPriority ? 3 : newPriority;

            const response = await fetch(`/api/shopping/items/${itemId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    priority: priorityToSet,
                }),
            });

            if (!response.ok) throw new Error('Failed to update priority');

            // Optimistically update local state
            if (selectedListId) {
                setAllItems(prev => ({
                    ...prev,
                    [selectedListId]: prev[selectedListId].map(item =>
                        item.id === itemId ? { ...item, priority: priorityToSet } : item
                    )
                }));
            }
        } catch (err) {
            console.error('Error updating priority:', err);
            alert(err instanceof Error ? err.message : 'Failed to update priority');
            // Refresh on error to ensure consistency
            if (selectedListId) {
                await refreshListItems(selectedListId);
            }
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
            isBulk: false,
            isListDelete: false
        });
    };

    // Show bulk delete confirmation
    const showBulkDeleteConfirmation = () => {
        setDeleteConfirmation({
            show: true,
            itemId: null,
            itemName: '',
            isBulk: true,
            isListDelete: false
        });
    };

    // Show list delete confirmation
    const showListDeleteConfirmation = (listId: string, listName: string) => {
        setDeleteConfirmation({
            show: true,
            itemId: listId,
            itemName: listName,
            isBulk: false,
            isListDelete: true
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

            setDeleteConfirmation({ show: false, itemId: null, itemName: '', isBulk: false, isListDelete: false });
        } catch (err) {
            console.error('Error deleting item:', err);
            alert(err instanceof Error ? err.message : 'Failed to delete item');
        }
    };

    // Delete list
    const handleDeleteList = async (listId: string) => {
        try {
            const response = await fetch(`/api/shopping/lists/${listId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete list');

            // Remove list from state
            setLists(prev => prev.filter(l => l.id !== listId));

            // Remove items for this list
            setAllItems(prev => {
                const newItems = { ...prev };
                delete newItems[listId];
                return newItems;
            });

            // Select another list if the deleted one was selected
            if (selectedListId === listId) {
                const remainingLists = lists.filter(l => l.id !== listId);
                setSelectedListId(remainingLists[0]?.id || '');
            }

            setDeleteConfirmation({ show: false, itemId: null, itemName: '', isBulk: false, isListDelete: false });
        } catch (err) {
            console.error('Error deleting list:', err);
            alert(err instanceof Error ? err.message : 'Failed to delete list');
        }
    };

    // Open list modal for create/edit
    const openListModal = (list?: ShoppingList) => {
        if (list) {
            setEditingList(list);
            setListFormData({ name: list.name, notes: list.notes || '' });
        } else {
            setEditingList(null);
            setListFormData({ name: '', notes: '' });
        }
        setShowListModal(true);
    };

    // Save list (create or update)
    const handleSaveList = async () => {
        if (!listFormData.name.trim()) return;

        setListSaving(true);
        try {
            if (editingList) {
                // Update existing list
                const response = await fetch(`/api/shopping/lists/${editingList.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: listFormData.name.trim(),
                        notes: listFormData.notes.trim() || null,
                    }),
                });

                if (!response.ok) throw new Error('Failed to update list');
                const updatedList = await response.json();

                setLists(prev => prev.map(l => l.id === editingList.id ? updatedList : l));
            } else {
                // Create new list
                const response = await fetch('/api/shopping/lists', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: listFormData.name.trim(),
                        notes: listFormData.notes.trim() || null,
                    }),
                });

                if (!response.ok) throw new Error('Failed to create list');
                const newList = await response.json();

                setLists(prev => [...prev, newList]);
                setAllItems(prev => ({ ...prev, [newList.id]: [] }));
                setSelectedListId(newList.id);
            }

            setShowListModal(false);
            setEditingList(null);
            setListFormData({ name: '', notes: '' });
        } catch (err) {
            console.error('Error saving list:', err);
            alert(err instanceof Error ? err.message : 'Failed to save list');
        } finally {
            setListSaving(false);
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

    // Handle item tap in selection mode
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

            setDeleteConfirmation({ show: false, itemId: null, itemName: '', isBulk: false, isListDelete: false });
        } catch (err) {
            console.error('Error deleting items:', err);
            alert(err instanceof Error ? err.message : 'Failed to delete items');
        }
    };

    // Confirm delete action
    const confirmDelete = () => {
        if (deleteConfirmation.isListDelete && deleteConfirmation.itemId) {
            handleDeleteList(deleteConfirmation.itemId);
        } else if (deleteConfirmation.isBulk) {
            bulkDeleteItems();
        } else if (deleteConfirmation.itemId) {
            handleDeleteItem(deleteConfirmation.itemId);
        }
    };

    // Cancel delete action
    const cancelDelete = () => {
        setDeleteConfirmation({ show: false, itemId: null, itemName: '', isBulk: false, isListDelete: false });
    };

    const categories = ['all', ...Array.from(new Set(items.map(item => item.category).filter((cat): cat is string => cat !== null)))];

    const filteredItems = items.filter(item => {
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        const matchesSearch = item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.notes?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Sort function based on sortBy state
    const sortItems = (itemsToSort: ShoppingListItem[]) => {
        return [...itemsToSort].sort((a, b) => {
            switch (sortBy) {
                case 'priority_asc':
                    return (a.priority || 3) - (b.priority || 3);
                case 'priority_desc':
                    return (b.priority || 3) - (a.priority || 3);
                case 'name_asc':
                    return a.item_name.localeCompare(b.item_name);
                case 'name_desc':
                    return b.item_name.localeCompare(a.item_name);
                case 'date_desc':
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                case 'date_asc':
                    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                case 'category':
                default:
                    // For category sort, first sort by priority then by name within same priority
                    const priorityA = a.priority || 3;
                    const priorityB = b.priority || 3;
                    if (priorityA !== priorityB) {
                        return priorityA - priorityB;
                    }
                    return a.item_name.localeCompare(b.item_name);
            }
        });
    };

    const activeItems = filteredItems.filter(i => !i.is_done);
    const completedItems = filteredItems.filter(i => i.is_done);

    // For non-category sorting, we'll use a flat sorted list
    const sortedActiveItems = sortBy !== 'category' ? sortItems(activeItems) : activeItems;
    const sortedCompletedItems = sortBy !== 'category' ? sortItems(completedItems) : completedItems;

    // Group items by category and sort categories by weighted score
    const groupByCategory = (itemList: ShoppingListItem[]) => {
        const grouped = itemList.reduce((acc, item) => {
            const category = item.category || 'Uncategorized';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(item);
            return acc;
        }, {} as Record<string, ShoppingListItem[]>);

        const sorted = Object.entries(grouped).sort(([catA], [catB]) => {
            if (catA === 'Uncategorized') return 1;
            if (catB === 'Uncategorized') return -1;
            return catA.localeCompare(catB);
        });

        sorted.forEach(([, catItems]) => {
            catItems.sort((a, b) => {
                const priorityA = a.priority || 3;
                const priorityB = b.priority || 3;
                if (priorityA !== priorityB) return priorityA - priorityB;
                return a.item_name.localeCompare(b.item_name);
            });
        });

        return sorted;
    };

    const sortedCategories = groupByCategory(activeItems);
    const sortedCompletedCategories = groupByCategory(completedItems);

    // Determine if selected items are from active or completed section
    const selectedActiveCount = Array.from(selectedItems).filter(id =>
        activeItems.some(item => item.id === id)
    ).length;
    const selectedCompletedCount = Array.from(selectedItems).filter(id =>
        completedItems.some(item => item.id === id)
    ).length;

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
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
                {/* Header */}
                <div className="mb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-1">Shopping Lists</h1>
                            <p className="text-gray-400 text-sm">Manage your grocery shopping</p>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-1.5 text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Add Item
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* Sidebar - Lists */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-3">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-base font-semibold text-white">Lists</h2>
                                <button
                                    onClick={() => openListModal()}
                                    className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                    title="Create new list"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="space-y-1.5">
                                {lists.map((list) => {
                                    const listItems = allItems[list.id] || [];
                                    const itemCount = listItems.length;
                                    const isSelected = selectedListId === list.id;

                                    return (
                                        <div
                                            key={list.id}
                                            className={`group relative rounded-lg transition-colors ${isSelected
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-800 text-gray-300 hover:bg-gray-750'
                                                }`}
                                        >
                                            <button
                                                onClick={() => setSelectedListId(list.id)}
                                                className="w-full text-left px-3 py-2"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="font-medium text-sm">{list.name}</div>
                                                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${isSelected
                                                        ? 'bg-white/20 text-white'
                                                        : 'bg-gray-700 text-gray-400'
                                                        }`}>
                                                        {itemCount}
                                                    </span>
                                                </div>
                                                {list.notes && (
                                                    <div className={`text-xs mt-1 ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                                                        {list.notes}
                                                    </div>
                                                )}
                                            </button>
                                            {/* List actions - show on hover */}
                                            <div className={`absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ${isSelected ? '' : ''}`}>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openListModal(list);
                                                    }}
                                                    className={`p-1 rounded transition-colors ${isSelected
                                                        ? 'text-blue-100 hover:text-white hover:bg-white/10'
                                                        : 'text-gray-400 hover:text-blue-400 hover:bg-blue-500/10'
                                                        }`}
                                                    title="Edit list"
                                                >
                                                    <Edit2 className="w-3 h-3" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        showListDeleteConfirmation(list.id, list.name);
                                                    }}
                                                    className={`p-1 rounded transition-colors ${isSelected
                                                        ? 'text-blue-100 hover:text-red-300 hover:bg-red-500/20'
                                                        : 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'
                                                        }`}
                                                    title="Delete list"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                                {lists.length === 0 && (
                                    <p className="text-gray-500 text-sm text-center py-4">
                                        No lists yet. Create one!
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {/* Filters */}
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-3 mb-3">
                            <div className="flex flex-col md:flex-row gap-2">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search items..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>

                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>
                                            {cat === 'all' ? 'All Categories' : cat}
                                        </option>
                                    ))}
                                </select>

                                {/* Sort */}
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                                    className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="category">By Category</option>
                                    <option value="priority_asc">Priority (High-Low)</option>
                                    <option value="priority_desc">Priority (Low-High)</option>
                                    <option value="name_asc">Name (A-Z)</option>
                                    <option value="name_desc">Name (Z-A)</option>
                                    <option value="date_desc">Newest First</option>
                                    <option value="date_asc">Oldest First</option>
                                </select>
                            </div>

                            {/* View Mode Toggle */}
                            <div className="flex rounded-lg border border-gray-700 bg-gray-800 p-0.5">
                                <button
                                    onClick={() => { setViewMode('to_buy'); clearSelection(); }}
                                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${viewMode === 'to_buy' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                                >
                                    <Circle className="h-3.5 w-3.5" />
                                    To Buy
                                    <span className={`rounded-full px-1.5 py-0.5 text-xs ${viewMode === 'to_buy' ? 'bg-white/20 text-white' : 'bg-gray-700 text-gray-400'}`}>
                                        {activeItems.length}
                                    </span>
                                </button>
                                <button
                                    onClick={() => { setViewMode('bought'); clearSelection(); }}
                                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${viewMode === 'bought' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                                >
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Bought
                                    <span className={`rounded-full px-1.5 py-0.5 text-xs ${viewMode === 'bought' ? 'bg-white/20 text-white' : 'bg-gray-700 text-gray-400'}`}>
                                        {completedItems.length}
                                    </span>
                                </button>
                            </div>

                            {/* Select Mode Toggle */}
                            <button
                                onClick={() => {
                                    if (isSelectionMode) {
                                        clearSelection();
                                    } else {
                                        setIsSelectionMode(true);
                                    }
                                }}
                                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${isSelectionMode ? 'border-blue-500 bg-blue-600 text-white' : 'border-gray-700 bg-gray-800 text-gray-400 hover:text-gray-200'}`}
                            >
                                <CheckSquare className="h-3.5 w-3.5" />
                                Select
                            </button>
                        </div>

                        {/* Bulk Actions Toolbar */}
                        {selectedItems.size > 0 && (
                            <div className="bg-blue-600 rounded-lg p-3 mb-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-white font-medium text-sm">
                                        {selectedItems.size} item{selectedItems.size > 1 ? 's' : ''} selected
                                    </span>
                                    <button
                                        onClick={clearSelection}
                                        className="text-blue-200 hover:text-white transition-colors text-xs"
                                    >
                                        Clear
                                    </button>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    {selectedActiveCount > 0 && (
                                        <button
                                            onClick={bulkCompleteItems}
                                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-1.5 text-sm"
                                        >
                                            <Check className="w-3.5 h-3.5" />
                                            Complete
                                        </button>
                                    )}
                                    {selectedCompletedCount > 0 && (
                                        <button
                                            onClick={bulkUncompleteItems}
                                            className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors flex items-center gap-1.5 text-sm"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                            Incomplete
                                        </button>
                                    )}
                                    <button
                                        onClick={showBulkDeleteConfirmation}
                                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-1.5 text-sm"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Items Container with Scroll */}
                        <div className="max-h-[calc(100vh-340px)] overflow-y-auto pr-2 space-y-4">
                            {/* Active Items (To Buy view) */}
                            {viewMode === 'to_buy' && activeItems.length > 0 && (
                                <div>
                                    {isSelectionMode && activeItems.length > 0 && (
                                        <div className="flex justify-end mb-3">
                                            <button
                                                onClick={toggleSelectAllActive}
                                                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                            >
                                                {activeItems.every(item => selectedItems.has(item.id)) ? 'Unselect All' : 'Select All'}
                                            </button>
                                        </div>
                                    )}

                                    {/* Category-grouped view */}
                                    {sortBy === 'category' ? (
                                    <div className="space-y-4">
                                        {sortedCategories.map(([category, categoryItems]) => (
                                            <div key={category}>
                                                {/* Category Header */}
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                                        {category}
                                                    </h4>
                                                    <div className="h-px flex-1 bg-gray-800"></div>
                                                    <span className="text-xs text-gray-500">
                                                        {categoryItems.length} item{categoryItems.length !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                                {/* Category Items */}
                                                <div className="space-y-2">
                                                    {categoryItems.map((item) => {
                                                        const priority = item.priority || 3;
                                                        const priorityBorder = priority === 1 ? 'border-red-500/50' :
                                                            priority === 2 ? 'border-orange-500/40' :
                                                                priority === 3 ? 'border-yellow-500/30' :
                                                                    priority === 4 ? 'border-lime-500/40' :
                                                                        'border-green-500/50';

                                                        return (
                                                            <div
                                                                key={item.id}
                                                                className={`bg-gray-900 rounded-lg border p-3 transition-all ${selectedItems.has(item.id) ? 'border-blue-500 bg-blue-500/10' : priorityBorder
                                                                    }`}
                                                                onClick={() => handleItemTap(item.id)}
                                                            >
                                                                <div className="flex items-start gap-3">
                                                                    {isSelectionMode && (
                                                                        <div className="mt-0.5 flex-shrink-0 w-5 h-5 flex items-center justify-center">
                                                                            {selectedItems.has(item.id) ? (
                                                                                <CheckCircle2 className="w-5 h-5 text-blue-400" />
                                                                            ) : (
                                                                                <Circle className="w-5 h-5 text-gray-600" />
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                    {!isSelectionMode && (
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                toggleItemDone(item.id, item.is_done);
                                                                            }}
                                                                            className="mt-0.5 flex-shrink-0"
                                                                        >
                                                                            <Circle className="w-5 h-5 text-gray-400 hover:text-blue-400 transition-colors" />
                                                                        </button>
                                                                    )}
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-start justify-between gap-3">
                                                                            <div className="flex-1">
                                                                                <div className="flex items-baseline gap-2">
                                                                                    <h4 className="text-white font-medium text-sm">{item.item_name}</h4>
                                                                                    {item.quantity && (
                                                                                        <span className="text-base font-semibold text-blue-400">
                                                                                            ×{item.quantity}{item.unit ? ` ${item.unit}` : ''}
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                                {/* Quick Priority Rating */}
                                                                                {!isSelectionMode && (
                                                                                    <div className="flex items-center gap-1.5 mt-1.5">
                                                                                        <span className="text-xs text-gray-500 font-medium">Priority:</span>
                                                                                        <div className="flex items-center gap-0.5">
                                                                                            {[1, 2, 3, 4, 5].map((priorityLevel) => {
                                                                                                const isActive = priorityLevel === (item.priority || 3);
                                                                                                const buttonColor = priorityLevel === 1 ? 'hover:bg-red-500/20 hover:text-red-400' :
                                                                                                    priorityLevel === 2 ? 'hover:bg-orange-500/20 hover:text-orange-400' :
                                                                                                        priorityLevel === 3 ? 'hover:bg-yellow-500/20 hover:text-yellow-400' :
                                                                                                            priorityLevel === 4 ? 'hover:bg-lime-500/20 hover:text-lime-400' :
                                                                                                                'hover:bg-green-500/20 hover:text-green-400';
                                                                                                const activeColor = priorityLevel === 1 ? 'bg-red-500/30 text-red-300' :
                                                                                                    priorityLevel === 2 ? 'bg-orange-500/30 text-orange-300' :
                                                                                                        priorityLevel === 3 ? 'bg-yellow-500/30 text-yellow-300' :
                                                                                                            priorityLevel === 4 ? 'bg-lime-500/30 text-lime-300' :
                                                                                                                'bg-green-500/30 text-green-300';

                                                                                                return (
                                                                                                    <button
                                                                                                        key={priorityLevel}
                                                                                                        type="button"
                                                                                                        onClick={(e) => {
                                                                                                            e.stopPropagation();
                                                                                                            handleQuickPriority(item.id, priorityLevel, item.priority);
                                                                                                        }}
                                                                                                        className={`w-6 h-6 rounded-md text-xs font-bold transition-all ${isActive
                                                                                                                ? activeColor
                                                                                                                : `text-gray-600 ${buttonColor}`
                                                                                                            }`}
                                                                                                        title={`Priority ${priorityLevel}${isActive ? ' (current)' : ''}`}
                                                                                                    >
                                                                                                        {priorityLevel}
                                                                                                    </button>
                                                                                                );
                                                                                            })}
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs">
                                                                                    {item.aisle && (
                                                                                        <div className="flex items-center gap-1 text-purple-400">
                                                                                            <span className="opacity-60">📍</span>
                                                                                            <span>{item.aisle}</span>
                                                                                        </div>
                                                                                    )}
                                                                                    {item.store_preference && (
                                                                                        <div className="flex items-center gap-1 text-green-400">
                                                                                            <span className="opacity-60">🏪</span>
                                                                                            <span>{item.store_preference}</span>
                                                                                        </div>
                                                                                    )}
                                                                                    {item.needed_by && (
                                                                                        <div className="flex items-center gap-1 text-orange-400">
                                                                                            <Calendar className="w-3 h-3 opacity-60" />
                                                                                            <span>Need by {new Date(item.needed_by).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                {item.notes && (
                                                                                    <p className="text-gray-400 text-xs mt-1.5 italic">{item.notes}</p>
                                                                                )}
                                                                            </div>
                                                                            <div className="flex items-start gap-1">
                                                                                {!isSelectionMode && (
                                                                                    <>
                                                                                        <button
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                handleEditItem(item);
                                                                                            }}
                                                                                            className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                                                            title="Edit item"
                                                                                        >
                                                                                            <Edit2 className="w-3.5 h-3.5" />
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                showDeleteConfirmation(item.id, item.item_name);
                                                                                            }}
                                                                                            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                                                            title="Delete item"
                                                                                        >
                                                                                            <Trash2 className="w-3.5 h-3.5" />
                                                                                        </button>
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    ) : (
                                    /* Flat sorted view */
                                    <div className="space-y-2">
                                        {sortedActiveItems.map((item) => {
                                            const priority = item.priority || 3;
                                            const priorityBorder = priority === 1 ? 'border-red-500/50' :
                                                priority === 2 ? 'border-orange-500/40' :
                                                    priority === 3 ? 'border-yellow-500/30' :
                                                        priority === 4 ? 'border-lime-500/40' :
                                                            'border-green-500/50';

                                            return (
                                                <div
                                                    key={item.id}
                                                    className={`bg-gray-900 rounded-lg border p-3 transition-all ${selectedItems.has(item.id) ? 'border-blue-500 bg-blue-500/10' : priorityBorder}`}
                                                    onClick={() => handleItemTap(item.id)}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        {isSelectionMode ? (
                                                            <div className="mt-0.5 flex-shrink-0 w-5 h-5 flex items-center justify-center">
                                                                {selectedItems.has(item.id) ? (
                                                                    <CheckCircle2 className="w-5 h-5 text-blue-400" />
                                                                ) : (
                                                                    <Circle className="w-5 h-5 text-gray-600" />
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleItemDone(item.id, item.is_done);
                                                                }}
                                                                className="mt-0.5 flex-shrink-0"
                                                            >
                                                                <Circle className="w-5 h-5 text-gray-400 hover:text-blue-400 transition-colors" />
                                                            </button>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div className="flex-1">
                                                                    <div className="flex items-baseline gap-2">
                                                                        <h4 className="text-white font-medium text-sm">{item.item_name}</h4>
                                                                        {item.quantity && (
                                                                            <span className="text-base font-semibold text-blue-400">
                                                                                ×{item.quantity}{item.unit ? ` ${item.unit}` : ''}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {item.category && (
                                                                        <span className="text-xs text-gray-500">{item.category}</span>
                                                                    )}
                                                                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs">
                                                                        {item.aisle && (
                                                                            <span className="text-purple-400">📍 {item.aisle}</span>
                                                                        )}
                                                                        {item.store_preference && (
                                                                            <span className="text-green-400">🏪 {item.store_preference}</span>
                                                                        )}
                                                                        {item.needed_by && (
                                                                            <span className="text-orange-400 flex items-center gap-1">
                                                                                <Calendar className="w-3 h-3" />
                                                                                {new Date(item.needed_by).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {item.notes && (
                                                                        <p className="text-gray-400 text-xs mt-1 italic">{item.notes}</p>
                                                                    )}
                                                                </div>
                                                                {!isSelectionMode && (
                                                                    <div className="flex items-start gap-1">
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleEditItem(item);
                                                                            }}
                                                                            className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                                            title="Edit item"
                                                                        >
                                                                            <Edit2 className="w-3.5 h-3.5" />
                                                                        </button>
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                showDeleteConfirmation(item.id, item.item_name);
                                                                            }}
                                                                            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                                            title="Delete item"
                                                                        >
                                                                            <Trash2 className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    )}
                                </div>
                            )}

                            {/* Completed Items (Bought view) */}
                            {viewMode === 'bought' && completedItems.length > 0 && (
                                <div>
                                    {isSelectionMode && completedItems.length > 0 && (
                                        <div className="flex justify-end mb-3">
                                            <button
                                                onClick={toggleSelectAllCompleted}
                                                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                            >
                                                {completedItems.every(item => selectedItems.has(item.id)) ? 'Unselect All' : 'Select All'}
                                            </button>
                                        </div>
                                    )}
                                    {/* Category-grouped view */}
                                    {sortBy === 'category' ? (
                                    <div className="space-y-4">
                                        {sortedCompletedCategories.map(([category, categoryItems]) => (
                                            <div key={category}>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                                        {category}
                                                    </h4>
                                                    <div className="h-px flex-1 bg-gray-800"></div>
                                                    <span className="text-xs text-gray-500">
                                                        {categoryItems.length} item{categoryItems.length !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                                <div className="space-y-2">
                                                    {categoryItems.map((item) => {
                                                        const priority = item.priority || 3;
                                                        const priorityBorder = priority === 1 ? 'border-red-500/50' :
                                                            priority === 2 ? 'border-orange-500/40' :
                                                                priority === 3 ? 'border-yellow-500/30' :
                                                                    priority === 4 ? 'border-lime-500/40' :
                                                                        'border-green-500/50';

                                                        return (
                                                            <div
                                                                key={item.id}
                                                                className={`bg-gray-900 rounded-lg border p-3 transition-all ${selectedItems.has(item.id) ? 'border-blue-500 bg-blue-500/10' : priorityBorder}`}
                                                                onClick={() => handleItemTap(item.id)}
                                                            >
                                                                <div className="flex items-start gap-3">
                                                                    {isSelectionMode && (
                                                                        <div className="mt-0.5 flex-shrink-0 w-5 h-5 flex items-center justify-center">
                                                                            {selectedItems.has(item.id) ? (
                                                                                <CheckCircle2 className="w-5 h-5 text-blue-400" />
                                                                            ) : (
                                                                                <Circle className="w-5 h-5 text-gray-600" />
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                    {!isSelectionMode && (
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                toggleItemDone(item.id, item.is_done);
                                                                            }}
                                                                            className="mt-0.5 flex-shrink-0"
                                                                        >
                                                                            <CheckCircle2 className="w-5 h-5 text-green-400 hover:text-gray-400 transition-colors" />
                                                                        </button>
                                                                    )}
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-start justify-between gap-3">
                                                                            <div className="flex-1">
                                                                                <div className="flex items-baseline gap-2">
                                                                                    <h4 className="text-white font-medium text-sm">{item.item_name}</h4>
                                                                                    {item.quantity && (
                                                                                        <span className="text-base font-semibold text-blue-400">
                                                                                            ×{item.quantity}{item.unit ? ` ${item.unit}` : ''}
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                                {!isSelectionMode && (
                                                                                    <div className="flex items-center gap-1.5 mt-1.5">
                                                                                        <span className="text-xs text-gray-500 font-medium">Priority:</span>
                                                                                        <div className="flex items-center gap-0.5">
                                                                                            {[1, 2, 3, 4, 5].map((priorityLevel) => {
                                                                                                const isActive = priorityLevel === (item.priority || 3);
                                                                                                const buttonColor = priorityLevel === 1 ? 'hover:bg-red-500/20 hover:text-red-400' :
                                                                                                    priorityLevel === 2 ? 'hover:bg-orange-500/20 hover:text-orange-400' :
                                                                                                        priorityLevel === 3 ? 'hover:bg-yellow-500/20 hover:text-yellow-400' :
                                                                                                            priorityLevel === 4 ? 'hover:bg-lime-500/20 hover:text-lime-400' :
                                                                                                                'hover:bg-green-500/20 hover:text-green-400';
                                                                                                const activeColor = priorityLevel === 1 ? 'bg-red-500/30 text-red-300' :
                                                                                                    priorityLevel === 2 ? 'bg-orange-500/30 text-orange-300' :
                                                                                                        priorityLevel === 3 ? 'bg-yellow-500/30 text-yellow-300' :
                                                                                                            priorityLevel === 4 ? 'bg-lime-500/30 text-lime-300' :
                                                                                                                'bg-green-500/30 text-green-300';

                                                                                                return (
                                                                                                    <button
                                                                                                        key={priorityLevel}
                                                                                                        type="button"
                                                                                                        onClick={(e) => {
                                                                                                            e.stopPropagation();
                                                                                                            handleQuickPriority(item.id, priorityLevel, item.priority);
                                                                                                        }}
                                                                                                        className={`w-6 h-6 rounded-md text-xs font-bold transition-all ${isActive
                                                                                                                ? activeColor
                                                                                                                : `text-gray-600 ${buttonColor}`
                                                                                                            }`}
                                                                                                        title={`Priority ${priorityLevel}${isActive ? ' (current)' : ''}`}
                                                                                                    >
                                                                                                        {priorityLevel}
                                                                                                    </button>
                                                                                                );
                                                                                            })}
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs">
                                                                                    {item.aisle && (
                                                                                        <div className="flex items-center gap-1 text-purple-400">
                                                                                            <span className="opacity-60">📍</span>
                                                                                            <span>{item.aisle}</span>
                                                                                        </div>
                                                                                    )}
                                                                                    {item.store_preference && (
                                                                                        <div className="flex items-center gap-1 text-green-400">
                                                                                            <span className="opacity-60">🏪</span>
                                                                                            <span>{item.store_preference}</span>
                                                                                        </div>
                                                                                    )}
                                                                                    {item.last_purchased_at && (
                                                                                        <div className="flex items-center gap-1 text-gray-400">
                                                                                            <Calendar className="w-3 h-3 opacity-60" />
                                                                                            <span>Purchased {new Date(item.last_purchased_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                {item.notes && (
                                                                                    <p className="text-gray-400 text-xs mt-1.5 italic">{item.notes}</p>
                                                                                )}
                                                                            </div>
                                                                            <div className="flex items-start gap-1">
                                                                                {!isSelectionMode && (
                                                                                    <>
                                                                                        <button
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                handleEditItem(item);
                                                                                            }}
                                                                                            className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                                                            title="Edit item"
                                                                                        >
                                                                                            <Edit2 className="w-3.5 h-3.5" />
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                showDeleteConfirmation(item.id, item.item_name);
                                                                                            }}
                                                                                            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                                                            title="Delete item"
                                                                                        >
                                                                                            <Trash2 className="w-3.5 h-3.5" />
                                                                                        </button>
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    ) : (
                                    /* Flat sorted view */
                                    <div className="space-y-2">
                                        {sortedCompletedItems.map((item) => {
                                            const priority = item.priority || 3;
                                            const priorityBorder = priority === 1 ? 'border-red-500/50' :
                                                priority === 2 ? 'border-orange-500/40' :
                                                    priority === 3 ? 'border-yellow-500/30' :
                                                        priority === 4 ? 'border-lime-500/40' :
                                                            'border-green-500/50';

                                            return (
                                                <div
                                                    key={item.id}
                                                    className={`bg-gray-900 rounded-lg border p-3 transition-all ${selectedItems.has(item.id) ? 'border-blue-500 bg-blue-500/10' : priorityBorder}`}
                                                    onClick={() => handleItemTap(item.id)}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        {isSelectionMode ? (
                                                            <div className="mt-0.5 flex-shrink-0 w-5 h-5 flex items-center justify-center">
                                                                {selectedItems.has(item.id) ? (
                                                                    <CheckCircle2 className="w-5 h-5 text-blue-400" />
                                                                ) : (
                                                                    <Circle className="w-5 h-5 text-gray-600" />
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleItemDone(item.id, item.is_done);
                                                                }}
                                                                className="mt-0.5 flex-shrink-0"
                                                            >
                                                                <CheckCircle2 className="w-5 h-5 text-green-400 hover:text-gray-400 transition-colors" />
                                                            </button>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div className="flex-1">
                                                                    <div className="flex items-baseline gap-2">
                                                                        <h4 className="text-white font-medium text-sm">{item.item_name}</h4>
                                                                        {item.quantity && (
                                                                            <span className="text-base font-semibold text-blue-400">
                                                                                ×{item.quantity}{item.unit ? ` ${item.unit}` : ''}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {item.category && (
                                                                        <span className="text-xs text-gray-500">{item.category}</span>
                                                                    )}
                                                                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs">
                                                                        {item.aisle && (
                                                                            <span className="text-purple-400">📍 {item.aisle}</span>
                                                                        )}
                                                                        {item.store_preference && (
                                                                            <span className="text-green-400">🏪 {item.store_preference}</span>
                                                                        )}
                                                                        {item.last_purchased_at && (
                                                                            <span className="text-gray-400 flex items-center gap-1">
                                                                                <Calendar className="w-3 h-3" />
                                                                                Purchased {new Date(item.last_purchased_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {item.notes && (
                                                                        <p className="text-gray-400 text-xs mt-1 italic">{item.notes}</p>
                                                                    )}
                                                                </div>
                                                                {!isSelectionMode && (
                                                                    <div className="flex items-start gap-1">
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleEditItem(item);
                                                                            }}
                                                                            className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                                            title="Edit item"
                                                                        >
                                                                            <Edit2 className="w-3.5 h-3.5" />
                                                                        </button>
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                showDeleteConfirmation(item.id, item.item_name);
                                                                            }}
                                                                            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                                            title="Delete item"
                                                                        >
                                                                            <Trash2 className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Empty State */}
                        {((viewMode === 'to_buy' && activeItems.length === 0) || (viewMode === 'bought' && completedItems.length === 0)) && (
                            <div className="bg-gray-900 rounded-lg border border-gray-800 p-8 text-center">
                                <ShoppingCart className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                                <h3 className="text-lg font-semibold text-white mb-1">
                                    {searchQuery || selectedCategory !== 'all'
                                        ? 'No Items Found'
                                        : viewMode === 'to_buy' ? 'Nothing to Buy' : 'No Purchased Items'}
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    {searchQuery || selectedCategory !== 'all'
                                        ? 'Try adjusting your filters'
                                        : viewMode === 'to_buy'
                                            ? 'Start adding items to your shopping list'
                                            : 'Items you mark as done will appear here'}
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

                {/* List Modal (Create/Edit) */}
                {showListModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-900 rounded-lg border border-gray-800 w-full max-w-md">
                            <div className="flex items-center justify-between p-4 border-b border-gray-800">
                                <h2 className="text-lg font-bold text-white">
                                    {editingList ? 'Edit List' : 'Create New List'}
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowListModal(false);
                                        setEditingList(null);
                                        setListFormData({ name: '', notes: '' });
                                    }}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        List Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={listFormData.name}
                                        onChange={(e) => setListFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        placeholder="e.g., Weekly Groceries"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Notes (optional)
                                    </label>
                                    <textarea
                                        value={listFormData.notes}
                                        onChange={(e) => setListFormData(prev => ({ ...prev, notes: e.target.value }))}
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                                        placeholder="Optional notes about this list..."
                                        rows={2}
                                    />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={() => {
                                            setShowListModal(false);
                                            setEditingList(null);
                                            setListFormData({ name: '', notes: '' });
                                        }}
                                        className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors border border-gray-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveList}
                                        disabled={!listFormData.name.trim() || listSaving}
                                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {listSaving ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            editingList ? 'Save Changes' : 'Create List'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}