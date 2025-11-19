// src/app/media/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Film, Tv, Star, Search, Trash2, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { MediaItem, MediaType, MediaStatus } from '@/types/database.types';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

const MEDIA_TYPES: { value: MediaType; label: string; icon: typeof Film }[] = [
    { value: 'movie', label: 'Movies', icon: Film },
    { value: 'show', label: 'Shows', icon: Tv },
    { value: 'anime', label: 'Anime', icon: Film },
];

const STATUSES: { value: MediaStatus; label: string; color: string }[] = [
    { value: 'planned', label: 'Plan to Watch', color: 'bg-gray-600' },
    { value: 'watching', label: 'Watching', color: 'bg-blue-600' },
    { value: 'completed', label: 'Completed', color: 'bg-green-600' },
    { value: 'on_hold', label: 'On Hold', color: 'bg-yellow-600' },
    { value: 'dropped', label: 'Dropped', color: 'bg-red-600' }
];

// Horizontal Carousel Component
function MediaCarousel({
    title,
    items,
    onEdit,
    onDelete,
    emptyMessage
}: {
    title: string;
    items: MediaItem[];
    onEdit: (item: MediaItem) => void;
    onDelete: (id: string, title: string) => void;
    emptyMessage: string;
}) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    const minSwipeDistance = 50;

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, [items]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = scrollRef.current.clientWidth * 0.8;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
            setTimeout(checkScroll, 300);
        }
    };

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe && canScrollRight) {
            scroll('right');
        }
        if (isRightSwipe && canScrollLeft) {
            scroll('left');
        }

        setTouchStart(null);
        setTouchEnd(null);
    };

    if (items.length === 0) {
        return (
            <div className="mb-12">
                <h2 className="text-2xl font-bold mb-4">{title}</h2>
                <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-8 text-center">
                    <p className="text-gray-500">{emptyMessage}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-8 sm:mb-12">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-xl sm:text-2xl font-bold">{title}</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => scroll('left')}
                        disabled={!canScrollLeft}
                        className={`p-2 sm:p-2 rounded-lg transition-colors ${canScrollLeft
                            ? 'bg-gray-800 hover:bg-gray-700 active:bg-gray-600'
                            : 'bg-gray-900 text-gray-600 cursor-not-allowed'
                            }`}
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="w-5 h-5 sm:w-5 sm:h-5" />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        disabled={!canScrollRight}
                        className={`p-2 sm:p-2 rounded-lg transition-colors ${canScrollRight
                            ? 'bg-gray-800 hover:bg-gray-700 active:bg-gray-600'
                            : 'bg-gray-900 text-gray-600 cursor-not-allowed'
                            }`}
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="w-5 h-5 sm:w-5 sm:h-5" />
                    </button>
                </div>
            </div>

            <div
                ref={scrollRef}
                onScroll={checkScroll}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {items.map((item) => (
                    <MediaCard
                        key={item.id}
                        item={item}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
            </div>
        </div>
    );
}

// Media Card Component
function MediaCard({
    item,
    onEdit,
    onDelete
}: {
    item: MediaItem;
    onEdit: (item: MediaItem) => void;
    onDelete: (id: string, title: string) => void;
}) {
    const Icon = item.type === 'movie' ? Film : Tv;
    const statusObj = STATUSES.find(s => s.value === item.status);

    return (
        <div className="min-w-[280px] max-w-[280px] bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-all group">
            {/* Card Header with Status */}
            <div className="p-4 pb-3">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Icon className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusObj?.color} flex-shrink-0`}>
                            {statusObj?.label}
                        </span>
                    </div>
                    {/* Mobile-friendly buttons - always visible on mobile, hover on desktop */}
                    <div className="flex gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => onEdit(item)}
                            className="p-2 hover:bg-gray-800 rounded-lg transition-colors active:bg-gray-700"
                            aria-label="Edit item"
                        >
                            <Edit2 className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                            onClick={() => onDelete(item.id, item.title)}
                            className="p-2 hover:bg-gray-800 rounded-lg transition-colors active:bg-gray-700"
                            aria-label="Delete item"
                        >
                            <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold mb-2 line-clamp-2 min-h-[3.5rem]">
                    {item.title}
                </h3>

                {/* Platform */}
                {item.platform && (
                    <p className="text-xs text-gray-400 mb-3 flex items-center gap-1">
                        <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                        {item.platform}
                    </p>
                )}

                {/* Rating */}
                {item.rating && (
                    <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${i < item.rating!
                                    ? 'fill-yellow-500 text-yellow-500'
                                    : 'text-gray-700'
                                    }`}
                            />
                        ))}
                    </div>
                )}

                {/* Progress Bar (for shows/anime with episodes) */}
                {item.total_episodes && item.total_episodes > 0 && (
                    <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-gray-400">Progress</span>
                            <span className="font-medium text-gray-300">
                                {item.current_episode || 0} / {item.total_episodes}
                            </span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-1.5">
                            <div
                                className="bg-blue-500 h-1.5 rounded-full transition-all"
                                style={{
                                    width: `${Math.min(((item.current_episode || 0) / item.total_episodes) * 100, 100)}%`
                                }}
                            ></div>
                        </div>
                    </div>
                )}

                {/* Dates */}
                <div className="space-y-1.5 text-xs">
                    {item.started_at && (
                        <div className="flex justify-between text-gray-400">
                            <span>Started</span>
                            <span className="text-gray-300">
                                {new Date(item.started_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </span>
                        </div>
                    )}
                    {item.completed_at && (
                        <div className="flex justify-between text-gray-400">
                            <span>Completed</span>
                            <span className="text-gray-300">
                                {new Date(item.completed_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </span>
                        </div>
                    )}
                </div>

                {/* Notes (truncated) */}
                {item.notes && (
                    <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-800 line-clamp-2">
                        {item.notes}
                    </p>
                )}
            </div>
        </div>
    );
}

export default function MediaTrackerPage() {
    const [items, setItems] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        show: boolean;
        itemId: string | null;
        itemTitle: string;
    }>({ show: false, itemId: null, itemTitle: '' });

    const [formData, setFormData] = useState({
        title: '',
        type: 'movie' as MediaType,
        status: 'planned' as MediaStatus,
        platform: '',
        current_episode: 0,
        total_episodes: 0,
        rating: 0,
        notes: ''
    });

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/media');
            if (!response.ok) throw new Error('Failed to fetch');

            const data = await response.json();
            setItems(data);
        } catch (error) {
            console.error('Error fetching media:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingItem) {
                const response = await fetch(`/api/media/${editingItem.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...formData,
                        rating: formData.rating || null,
                        platform: formData.platform || null,
                        notes: formData.notes || null,
                        total_episodes: formData.total_episodes || null,
                        current_episode: formData.current_episode || 0,
                    }),
                });

                if (!response.ok) throw new Error('Failed to update');

                const updatedItem = await response.json();

                // Update locally instead of refetching
                setItems(prevItems =>
                    prevItems.map(item => item.id === updatedItem.id ? updatedItem : item)
                );
            } else {
                const response = await fetch('/api/media', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        owner_id: 'd5682543-5b15-4bf2-90a3-6a3ddf9dc509',
                        ...formData,
                        rating: formData.rating || null,
                        platform: formData.platform || null,
                        notes: formData.notes || null,
                        total_episodes: formData.total_episodes || null,
                        current_episode: formData.current_episode || 0,
                    }),
                });

                if (!response.ok) throw new Error('Failed to create');

                const newItem = await response.json();

                // Add locally instead of refetching
                setItems(prevItems => [newItem, ...prevItems]);
            }

            setShowAddModal(false);
            setEditingItem(null);
            resetForm();
        } catch (error) {
            console.error('Error saving media:', error);
            alert('Failed to save media item');
        }
    };

    // Show delete confirmation
    const showDeleteConfirmation = (itemId: string, itemTitle: string) => {
        setDeleteConfirmation({
            show: true,
            itemId,
            itemTitle
        });
    };

    // Confirm and execute delete
    const confirmDelete = async () => {
        if (!deleteConfirmation.itemId) return;

        const itemIdToDelete = deleteConfirmation.itemId;

        try {
            const response = await fetch(`/api/media/${itemIdToDelete}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete');

            // Remove item locally without refetching
            setItems(prevItems => prevItems.filter(item => item.id !== itemIdToDelete));

            // Close modal
            setDeleteConfirmation({ show: false, itemId: null, itemTitle: '' });
        } catch (error) {
            console.error('Error deleting media:', error);
            alert('Failed to delete media item');
        }
    };

    // Cancel delete
    const cancelDelete = () => {
        setDeleteConfirmation({ show: false, itemId: null, itemTitle: '' });
    };

    const handleEdit = (item: MediaItem) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            type: item.type,
            status: item.status,
            platform: item.platform || '',
            current_episode: item.current_episode || 0,
            total_episodes: item.total_episodes || 0,
            rating: item.rating || 0,
            notes: item.notes || ''
        });
        setShowAddModal(true);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            type: 'movie',
            status: 'planned',
            platform: '',
            current_episode: 0,
            total_episodes: 0,
            rating: 0,
            notes: ''
        });
    };

    // Filter and group items
    const filteredItems = items.filter(item => {
        if (!searchQuery) return true;
        return item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.platform?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const watchingItems = filteredItems.filter(item => item.status === 'watching');
    const plannedItems = filteredItems.filter(item => item.status === 'planned');
    const completedItems = filteredItems.filter(item => item.status === 'completed');
    const onHoldItems = filteredItems.filter(item => item.status === 'on_hold');
    const droppedItems = filteredItems.filter(item => item.status === 'dropped');

    // Stats
    const totalByType = {
        movie: items.filter(i => i.type === 'movie').length,
        show: items.filter(i => i.type === 'show').length,
        anime: items.filter(i => i.type === 'anime').length,
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 text-white p-8 flex items-center justify-center">
                <p className="text-gray-400">Loading media...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            {/* Header */}
            <div className="border-b border-gray-800 bg-gray-950 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
                        <div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">Media Tracker</h1>
                            <p className="text-sm sm:text-base text-gray-400">Track anime, shows, and movies</p>
                        </div>
                        <button
                            onClick={() => {
                                setEditingItem(null);
                                resetForm();
                                setShowAddModal(true);
                            }}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 px-6 py-3 rounded-lg transition-colors font-medium"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Add Media</span>
                        </button>
                    </div>

                    {/* Type Stats */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
                        {MEDIA_TYPES.map(({ value, label, icon: Icon }) => (
                            <div key={value} className="bg-gray-900/50 border border-gray-800 rounded-lg p-3 sm:p-4">
                                <div className="flex items-center gap-1 sm:gap-2 mb-1">
                                    <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                                    <h3 className="text-gray-400 text-[10px] sm:text-xs font-medium">{label}</h3>
                                </div>
                                <p className="text-xl sm:text-2xl font-bold">{totalByType[value]}</p>
                            </div>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search your library..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 sm:pl-10 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white text-base placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Carousels */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <MediaCarousel
                    title={`Continue Watching (${watchingItems.length})`}
                    items={watchingItems}
                    onEdit={handleEdit}
                    onDelete={showDeleteConfirmation}
                    emptyMessage="No media currently watching. Start something from your plan to watch list!"
                />

                <MediaCarousel
                    title={`Plan to Watch (${plannedItems.length})`}
                    items={plannedItems}
                    onEdit={handleEdit}
                    onDelete={showDeleteConfirmation}
                    emptyMessage="Your plan to watch list is empty. Add some media to get started!"
                />

                <MediaCarousel
                    title={`Completed (${completedItems.length})`}
                    items={completedItems}
                    onEdit={handleEdit}
                    onDelete={showDeleteConfirmation}
                    emptyMessage="No completed media yet. Finish watching something!"
                />

                {onHoldItems.length > 0 && (
                    <MediaCarousel
                        title={`On Hold (${onHoldItems.length})`}
                        items={onHoldItems}
                        onEdit={handleEdit}
                        onDelete={showDeleteConfirmation}
                        emptyMessage=""
                    />
                )}

                {droppedItems.length > 0 && (
                    <MediaCarousel
                        title={`Dropped (${droppedItems.length})`}
                        items={droppedItems}
                        onEdit={handleEdit}
                        onDelete={showDeleteConfirmation}
                        emptyMessage=""
                    />
                )}
            </div>

            {/* Add/Edit Modal - Mobile Optimized */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-0 sm:p-4 z-50 overflow-y-auto">
                    <div className="bg-gray-900 border-0 sm:border border-gray-800 rounded-none sm:rounded-lg p-6 max-w-md w-full min-h-screen sm:min-h-0 my-0 sm:my-8">
                        <h2 className="text-2xl font-bold mb-6">
                            {editingItem ? 'Edit Media' : 'Add New Media'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium mb-2">Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Type *</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as MediaType })}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                    >
                                        {MEDIA_TYPES.map(({ value, label }) => (
                                            <option key={value} value={value}>{label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Status *</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as MediaStatus })}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                    >
                                        {STATUSES.map(({ value, label }) => (
                                            <option key={value} value={value}>{label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Platform</label>
                                <input
                                    type="text"
                                    value={formData.platform}
                                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                                    placeholder="Netflix, Crunchyroll, etc."
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Current Episode</label>
                                    <input
                                        type="number"
                                        value={formData.current_episode}
                                        onChange={(e) => setFormData({ ...formData, current_episode: parseInt(e.target.value) || 0 })}
                                        min="0"
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Total Episodes</label>
                                    <input
                                        type="number"
                                        value={formData.total_episodes}
                                        onChange={(e) => setFormData({ ...formData, total_episodes: parseInt(e.target.value) || 0 })}
                                        min="0"
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Rating</label>
                                <div className="flex gap-3 justify-center sm:justify-start">
                                    {[1, 2, 3, 4, 5].map((rating) => (
                                        <button
                                            key={rating}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, rating })}
                                            className="p-3 hover:bg-gray-800 rounded-lg transition-colors active:bg-gray-700"
                                        >
                                            <Star
                                                className={`w-7 h-7 ${rating <= formData.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-600'}`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Notes</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 resize-none"
                                    placeholder="Your thoughts, reminders, etc."
                                />
                            </div>

                            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setEditingItem(null);
                                        resetForm();
                                    }}
                                    className="w-full sm:w-auto px-6 py-4 sm:py-3 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 rounded-lg font-medium transition-colors text-base"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 px-6 py-4 sm:py-3 rounded-lg font-medium transition-colors text-base"
                                >
                                    {editingItem ? 'Update' : 'Add Media'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={deleteConfirmation.show}
                onClose={cancelDelete}
                onConfirm={confirmDelete}
                itemName={deleteConfirmation.itemTitle}
            />
        </div>
    );
}