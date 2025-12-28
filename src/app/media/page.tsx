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

// Platform colors matching brand colors
const getPlatformColor = (platform: string | null): string => {
    if (!platform) return 'bg-gray-600';

    const platformLower = platform.toLowerCase();

    // Streaming platforms with brand colors
    if (platformLower.includes('netflix')) return 'bg-red-600';
    if (platformLower.includes('hulu')) return 'bg-green-500';
    if (platformLower.includes('disney') || platformLower.includes('disney+')) return 'bg-blue-500';
    if (platformLower.includes('prime') || platformLower.includes('amazon')) return 'bg-sky-400';
    if (platformLower.includes('max') || platformLower.includes('hbo')) return 'bg-purple-600';
    if (platformLower.includes('apple') || platformLower.includes('apple tv')) return 'bg-gray-800';
    if (platformLower.includes('peacock')) return 'bg-yellow-500';
    if (platformLower.includes('paramount')) return 'bg-blue-600';
    if (platformLower.includes('crunchyroll')) return 'bg-orange-500';
    if (platformLower.includes('funimation')) return 'bg-purple-500';
    if (platformLower.includes('hidive')) return 'bg-blue-400';
    if (platformLower.includes('youtube')) return 'bg-red-500';
    if (platformLower.includes('tubi')) return 'bg-orange-400';
    if (platformLower.includes('pluto')) return 'bg-yellow-400';
    if (platformLower.includes('showtime')) return 'bg-red-700';
    if (platformLower.includes('starz')) return 'bg-gray-900';
    if (platformLower.includes('amc')) return 'bg-gray-700';

    // Default color for unknown platforms
    return 'bg-gray-600';
};

// Horizontal Carousel Component
function MediaCarousel({
    title,
    items,
    onEdit,
    onDelete,
    onQuickRate,
    onQuickIncrement,
    emptyMessage
}: {
    title: string;
    items: MediaItem[];
    onEdit: (item: MediaItem) => void;
    onDelete: (id: string, title: string) => void;
    onQuickRate: (itemId: string, rating: number) => void;
    onQuickIncrement?: (itemId: string) => void;
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
            <div className="mb-6">
                <h2 className="text-xl font-bold mb-2">{title}</h2>
                <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 text-center">
                    <p className="text-gray-500 text-sm">{emptyMessage}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold">{title}</h2>
                <div className="flex gap-1">
                    <button
                        onClick={() => scroll('left')}
                        disabled={!canScrollLeft}
                        className={`p-1.5 rounded-lg transition-colors ${canScrollLeft
                            ? 'bg-gray-800 hover:bg-gray-700 active:bg-gray-600'
                            : 'bg-gray-900 text-gray-600 cursor-not-allowed'
                            }`}
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        disabled={!canScrollRight}
                        className={`p-1.5 rounded-lg transition-colors ${canScrollRight
                            ? 'bg-gray-800 hover:bg-gray-700 active:bg-gray-600'
                            : 'bg-gray-900 text-gray-600 cursor-not-allowed'
                            }`}
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div
                ref={scrollRef}
                onScroll={checkScroll}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {items.map((item) => (
                    <MediaCard
                        key={item.id}
                        item={item}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onQuickRate={onQuickRate}
                        onQuickIncrement={onQuickIncrement}
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
    onDelete,
    onQuickRate,
    onQuickIncrement
}: {
    item: MediaItem;
    onEdit: (item: MediaItem) => void;
    onDelete: (id: string, title: string) => void;
    onQuickRate: (itemId: string, rating: number) => void;
    onQuickIncrement?: (itemId: string) => void;
}) {
    const Icon = item.type === 'movie' ? Film : Tv;

    return (
        <div className="min-w-[240px] max-w-[240px] bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-all group">
            {/* Card Header */}
            <div className="p-3 pb-2">
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0 flex-wrap">
                        <Icon className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                        {/* Platform Badge */}
                        {item.platform && (
                            <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getPlatformColor(item.platform)} flex-shrink-0`}>
                                {item.platform}
                            </span>
                        )}
                    </div>
                    {/* Mobile-friendly buttons - always visible on mobile, hover on desktop */}
                    <div className="flex gap-0.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => onEdit(item)}
                            className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors active:bg-gray-700"
                            aria-label="Edit item"
                        >
                            <Edit2 className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                        <button
                            onClick={() => onDelete(item.id, item.title)}
                            className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors active:bg-gray-700"
                            aria-label="Delete item"
                        >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold mb-1.5 line-clamp-2 min-h-[2.5rem]">
                    {item.title}
                </h3>

                {/* Rating - Quick rate on hover/mobile */}
                <div className="mb-2">
                    <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                                key={rating}
                                type="button"
                                onClick={() => onQuickRate(item.id, rating === item.rating ? 0 : rating)}
                                className="p-0.5 hover:bg-gray-800 rounded transition-colors"
                                aria-label={`Rate ${rating} stars`}
                            >
                                <Star
                                    className={`w-3.5 h-3.5 ${rating <= (item.rating || 0)
                                        ? 'fill-yellow-500 text-yellow-500'
                                        : 'text-gray-700 hover:text-yellow-500/50'
                                        }`}
                                />
                            </button>
                        ))}
                        {/* Quick increment button - only show if handler is provided (Continue Watching) */}
                        {onQuickIncrement && (item.type === 'show' || item.type === 'anime') && (
                            <button
                                type="button"
                                onClick={() => onQuickIncrement(item.id)}
                                className="ml-1 px-2 py-0.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded text-xs font-medium transition-colors"
                                aria-label="Next episode"
                            >
                                +1
                            </button>
                        )}
                    </div>
                </div>

                {/* Progress Display - Different for each status */}
                {(item.type === 'show' || item.type === 'anime') && (
                    <>
                        {/* Plan to Watch - Show overview */}
                        {item.status === 'planned' && (item.total_seasons || item.total_episodes) && (
                            <div className="mb-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">Length</span>
                                    <span className="font-medium text-gray-300">
                                        {item.total_seasons && (
                                            <>
                                                {item.total_seasons} Season{item.total_seasons !== 1 ? 's' : ''}
                                                {item.total_episodes && <> • {item.total_episodes} Episodes</>}
                                            </>
                                        )}
                                        {!item.total_seasons && item.total_episodes && (
                                            <>{item.total_episodes} Episodes</>
                                        )}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Watching/On Hold - Show current progress */}
                        {(item.status === 'watching' || item.status === 'on_hold') && (item.current_season || item.current_episode) && (
                            <div className="mb-2">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-400">Progress</span>
                                    <span className="font-medium text-gray-300">
                                        {item.current_season && item.total_seasons ? (
                                            <>
                                                S{item.current_season}/{item.total_seasons} • Ep {item.current_episode || 0}
                                                {item.episodes_in_season && <> / {item.episodes_in_season}</>}
                                            </>
                                        ) : item.current_season ? (
                                            <>
                                                S{item.current_season} • Ep {item.current_episode || 0}
                                                {item.episodes_in_season && <> / {item.episodes_in_season}</>}
                                            </>
                                        ) : (
                                            <>
                                                Ep {item.current_episode || 0}
                                                {item.episodes_in_season && <> / {item.episodes_in_season}</>}
                                            </>
                                        )}
                                    </span>
                                </div>

                                {/* Progress Bar - Shows per-season progress if available */}
                                {item.episodes_in_season && item.episodes_in_season > 0 && (
                                    <div className="w-full bg-gray-800 rounded-full h-1">
                                        <div
                                            className="bg-blue-500 h-1 rounded-full transition-all"
                                            style={{
                                                width: `${Math.min(
                                                    ((item.current_episode || 0) / item.episodes_in_season) * 100,
                                                    100
                                                )}%`
                                            }}
                                        ></div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Completed - No progress display needed */}
                    </>
                )}

                {/* Dates */}
                <div className="space-y-1 text-xs">
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
                    <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-800 line-clamp-2">
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
    const [selectedType, setSelectedType] = useState<MediaType | 'all'>('all');
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
        current_season: 0,
        total_seasons: 0,
        episodes_in_season: 0,
        rating: 0,
        notes: '',
        started_at: '',
        completed_at: ''
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
                        current_season: formData.current_season || null,
                        total_seasons: formData.total_seasons || null,
                        episodes_in_season: formData.episodes_in_season || null,
                        started_at: formData.started_at || null,
                        completed_at: formData.completed_at || null,
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
                        current_season: formData.current_season || null,
                        total_seasons: formData.total_seasons || null,
                        episodes_in_season: formData.episodes_in_season || null,
                        started_at: formData.started_at || null,
                        completed_at: formData.completed_at || null,
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

    // Quick rate handler
    const handleQuickRate = async (itemId: string, rating: number) => {
        try {
            const response = await fetch(`/api/media/${itemId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rating: rating || null,
                }),
            });

            if (!response.ok) throw new Error('Failed to update rating');

            const updatedItem = await response.json();

            // Update locally
            setItems(prevItems =>
                prevItems.map(item => item.id === updatedItem.id ? updatedItem : item)
            );
        } catch (error) {
            console.error('Error updating rating:', error);
            alert('Failed to update rating');
        }
    };

    // Quick increment episode handler
    const handleQuickIncrement = async (itemId: string) => {
        const item = items.find(i => i.id === itemId);
        if (!item) return;

        try {
            const response = await fetch(`/api/media/${itemId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    current_episode: (item.current_episode || 0) + 1,
                }),
            });

            if (!response.ok) throw new Error('Failed to increment episode');

            const updatedItem = await response.json();

            // Update locally
            setItems(prevItems =>
                prevItems.map(item => item.id === updatedItem.id ? updatedItem : item)
            );
        } catch (error) {
            console.error('Error incrementing episode:', error);
            alert('Failed to update episode');
        }
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
            current_season: item.current_season || 0,
            total_seasons: item.total_seasons || 0,
            episodes_in_season: item.episodes_in_season || 0,
            rating: item.rating || 0,
            notes: item.notes || '',
            started_at: item.started_at || '',
            completed_at: item.completed_at || ''
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
            current_season: 0,
            total_seasons: 0,
            episodes_in_season: 0,
            rating: 0,
            notes: '',
            started_at: '',
            completed_at: ''
        });
    };

    // Filter and group items
    const filteredItems = items.filter(item => {
        const matchesSearch = !searchQuery ||
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.platform?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = selectedType === 'all' || item.type === selectedType;
        return matchesSearch && matchesType;
    });

    const watchingItems = filteredItems.filter(item => item.status === 'watching');
    const plannedItems = filteredItems.filter(item => item.status === 'planned');
    const completedItems = filteredItems.filter(item => item.status === 'completed');
    const onHoldItems = filteredItems.filter(item => item.status === 'on_hold');
    const droppedItems = filteredItems.filter(item => item.status === 'dropped');

    // Stats for tab counts
    const totalByType = {
        all: items.length,
        movie: items.filter(i => i.type === 'movie').length,
        show: items.filter(i => i.type === 'show').length,
        anime: items.filter(i => i.type === 'anime').length,
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 text-white p-4 flex items-center justify-center">
                <p className="text-gray-400">Loading media...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
                {/* Header */}
                <div className="mb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-1">Media Tracker</h1>
                            <p className="text-gray-400 text-sm">Track anime, shows, and movies</p>
                        </div>
                        <button
                            onClick={() => {
                                setEditingItem(null);
                                resetForm();
                                setShowAddModal(true);
                            }}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-1.5 text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Add Media
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative mb-3">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search your library..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                </div>

                {/* Type Filter Tabs */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <button
                        onClick={() => setSelectedType('all')}
                        className={`px-3 py-1.5 rounded-lg font-medium transition-colors text-sm ${selectedType === 'all'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-900 text-gray-300 border border-gray-800 hover:bg-gray-800'
                            }`}
                    >
                        All ({totalByType.all})
                    </button>
                    {MEDIA_TYPES.map(({ value, label, icon: Icon }) => (
                        <button
                            key={value}
                            onClick={() => setSelectedType(value)}
                            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 text-sm ${selectedType === value
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-900 text-gray-300 border border-gray-800 hover:bg-gray-800'
                                }`}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            {label} ({totalByType[value]})
                        </button>
                    ))}
                </div>
            </div>

            {/* Carousels */}
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
                <MediaCarousel
                    title={`Continue Watching (${watchingItems.length})`}
                    items={watchingItems}
                    onEdit={handleEdit}
                    onDelete={showDeleteConfirmation}
                    onQuickRate={handleQuickRate}
                    onQuickIncrement={handleQuickIncrement}
                    emptyMessage="No media currently watching. Start something from your plan to watch list!"
                />

                <MediaCarousel
                    title={`Plan to Watch (${plannedItems.length})`}
                    items={plannedItems}
                    onEdit={handleEdit}
                    onDelete={showDeleteConfirmation}
                    onQuickRate={handleQuickRate}
                    emptyMessage="Your plan to watch list is empty. Add some media to get started!"
                />

                <MediaCarousel
                    title={`Completed (${completedItems.length})`}
                    items={completedItems}
                    onEdit={handleEdit}
                    onDelete={showDeleteConfirmation}
                    onQuickRate={handleQuickRate}
                    emptyMessage="No completed media yet. Finish watching something!"
                />

                {onHoldItems.length > 0 && (
                    <MediaCarousel
                        title={`On Hold (${onHoldItems.length})`}
                        items={onHoldItems}
                        onEdit={handleEdit}
                        onDelete={showDeleteConfirmation}
                        onQuickRate={handleQuickRate}
                        emptyMessage=""
                    />
                )}

                {droppedItems.length > 0 && (
                    <MediaCarousel
                        title={`Dropped (${droppedItems.length})`}
                        items={droppedItems}
                        onEdit={handleEdit}
                        onDelete={showDeleteConfirmation}
                        onQuickRate={handleQuickRate}
                        emptyMessage=""
                    />
                )}
            </div>

            {/* Add/Edit Modal - Mobile Optimized */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-0 sm:p-4 z-50 overflow-y-auto">
                    <div className="bg-gray-900 border-0 sm:border border-gray-800 rounded-none sm:rounded-lg p-4 max-w-md w-full min-h-screen sm:min-h-0 my-0 sm:my-8">
                        <h2 className="text-xl font-bold mb-4">
                            {editingItem ? 'Edit Media' : 'Add New Media'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium mb-1">Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Type *</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as MediaType })}
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    >
                                        {MEDIA_TYPES.map(({ value, label }) => (
                                            <option key={value} value={value}>{label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Status *</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as MediaStatus })}
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    >
                                        {STATUSES.map(({ value, label }) => (
                                            <option key={value} value={value}>{label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Platform</label>
                                <input
                                    type="text"
                                    value={formData.platform}
                                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                                    placeholder="Netflix, Crunchyroll, etc."
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            {/* Season tracking (for shows/anime) */}
                            {(formData.type === 'show' || formData.type === 'anime') && (
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Current Season</label>
                                        <input
                                            type="number"
                                            value={formData.current_season}
                                            onChange={(e) => setFormData({ ...formData, current_season: parseInt(e.target.value) || 0 })}
                                            min="0"
                                            placeholder="e.g., 2"
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Total Seasons</label>
                                        <input
                                            type="number"
                                            value={formData.total_seasons}
                                            onChange={(e) => setFormData({ ...formData, total_seasons: parseInt(e.target.value) || 0 })}
                                            min="0"
                                            placeholder="e.g., 4"
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        {(formData.type === 'show' || formData.type === 'anime') ? 'Current Episode (in Season)' : 'Current Episode'}
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.current_episode}
                                        onChange={(e) => setFormData({ ...formData, current_episode: parseInt(e.target.value) || 0 })}
                                        min="0"
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        {(formData.type === 'show' || formData.type === 'anime') ? 'Episodes in Season' : 'Total Episodes'}
                                    </label>
                                    <input
                                        type="number"
                                        value={(formData.type === 'show' || formData.type === 'anime') ? formData.episodes_in_season : formData.total_episodes}
                                        onChange={(e) => {
                                            const value = parseInt(e.target.value) || 0;
                                            if (formData.type === 'show' || formData.type === 'anime') {
                                                setFormData({ ...formData, episodes_in_season: value });
                                            } else {
                                                setFormData({ ...formData, total_episodes: value });
                                            }
                                        }}
                                        min="0"
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Overall total episodes for shows/anime */}
                            {(formData.type === 'show' || formData.type === 'anime') && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Total Episodes (Overall)</label>
                                    <input
                                        type="number"
                                        value={formData.total_episodes}
                                        onChange={(e) => setFormData({ ...formData, total_episodes: parseInt(e.target.value) || 0 })}
                                        min="0"
                                        placeholder="Total across all seasons (optional)"
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium mb-1">Rating</label>
                                <div className="flex gap-2 justify-center sm:justify-start">
                                    {[1, 2, 3, 4, 5].map((rating) => (
                                        <button
                                            key={rating}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, rating })}
                                            className="p-2 hover:bg-gray-800 rounded-lg transition-colors active:bg-gray-700"
                                        >
                                            <Star
                                                className={`w-6 h-6 ${rating <= formData.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-600'}`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Notes</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                                    placeholder="Your thoughts, reminders, etc."
                                />
                            </div>

                            {/* Date fields */}
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Started Date</label>
                                    <input
                                        type="date"
                                        value={formData.started_at}
                                        onChange={(e) => setFormData({ ...formData, started_at: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Completed Date</label>
                                    <input
                                        type="date"
                                        value={formData.completed_at}
                                        onChange={(e) => setFormData({ ...formData, completed_at: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setEditingItem(null);
                                        resetForm();
                                    }}
                                    className="w-full sm:w-auto px-4 py-2.5 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 rounded-lg font-medium transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 px-4 py-2.5 rounded-lg font-medium transition-colors text-sm"
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