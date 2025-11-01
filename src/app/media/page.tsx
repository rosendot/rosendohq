// src/app/media/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, Film, Tv, Star, Search, Trash2, Edit2 } from 'lucide-react';
import type { MediaItem, MediaType, MediaStatus } from '@/types/database.types';

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

export default function MediaTrackerPage() {
    const [items, setItems] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<MediaType | 'all'>('all');
    const [selectedStatus, setSelectedStatus] = useState<MediaStatus | 'all'>('all');

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

    // Fetch media items
    useEffect(() => {
        fetchItems();
    }, [selectedType, selectedStatus]);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (selectedType !== 'all') params.append('type', selectedType);
            if (selectedStatus !== 'all') params.append('status', selectedStatus);

            const response = await fetch(`/api/media?${params}`);
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
                // Update existing
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

            } else {
                // Create new
                const response = await fetch('/api/media', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        owner_id: 'd5682543-5b15-4bf2-90a3-6a3ddf9dc509', // Your owner_id
                        ...formData,
                        rating: formData.rating || null,
                        platform: formData.platform || null,
                        notes: formData.notes || null,
                        total_episodes: formData.total_episodes || null,
                        current_episode: formData.current_episode || 0,
                    }),
                });

                if (!response.ok) throw new Error('Failed to create');
            }

            setShowAddModal(false);
            setEditingItem(null);
            resetForm();
            fetchItems(); // Refresh list
        } catch (error) {
            console.error('Error saving media:', error);
            alert('Failed to save media item');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            const response = await fetch(`/api/media/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete');

            fetchItems(); // Refresh list
        } catch (error) {
            console.error('Error deleting media:', error);
            alert('Failed to delete media item');
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

    // Filter items client-side by search
    const filteredItems = items.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.notes?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    const getTypeStats = (type: MediaType) => {
        return items.filter(item => item.type === type).length;
    };

    const getStatusStats = (status: MediaStatus) => {
        return items.filter(item => item.status === status).length;
    };

    const getIcon = (type: MediaType) => {
        const mediaType = MEDIA_TYPES.find(t => t.value === type);
        return mediaType ? mediaType.icon : Film;
    };

    const getStatusColor = (status: MediaStatus) => {
        const statusObj = STATUSES.find(s => s.value === status);
        return statusObj ? statusObj.color : 'bg-gray-600';
    };

    const getStatusLabel = (status: MediaStatus) => {
        const statusObj = STATUSES.find(s => s.value === status);
        return statusObj ? statusObj.label : status;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 text-white p-8 flex items-center justify-center">
                <p className="text-gray-400">Loading media...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Media Tracker</h1>
                        <p className="text-gray-400">Track anime, shows, and movies</p>
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
                        Add Media
                    </button>
                </div>

                {/* Type Stats */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                    {MEDIA_TYPES.map(({ value, label, icon: Icon }) => (
                        <div key={value} className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <Icon className="w-6 h-6 text-blue-400" />
                                <h3 className="text-gray-400 text-sm font-medium">{label}</h3>
                            </div>
                            <p className="text-3xl font-bold">{getTypeStats(value)}</p>
                        </div>
                    ))}
                </div>

                {/* Status Overview */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    {STATUSES.map(({ value, label, color }) => (
                        <div key={value} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-3 h-3 rounded-full ${color}`}></div>
                                <h3 className="text-gray-400 text-xs font-medium">{label}</h3>
                            </div>
                            <p className="text-2xl font-bold">{getStatusStats(value)}</p>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search media..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value as MediaType | 'all')}
                        className="px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                        <option value="all">All Types</option>
                        {MEDIA_TYPES.map(({ value, label }) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value as MediaStatus | 'all')}
                        className="px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                        <option value="all">All Statuses</option>
                        {STATUSES.map(({ value, label }) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </div>

                {/* Media Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map((item) => {
                        const Icon = getIcon(item.type);
                        return (
                            <div
                                key={item.id}
                                className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <Icon className="w-5 h-5 text-blue-400" />
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                            {getStatusLabel(item.status)}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4 text-gray-400" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-400" />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold mb-2">{item.title}</h3>

                                {item.platform && (
                                    <p className="text-sm text-gray-400 mb-3">
                                        📺 {item.platform}
                                    </p>
                                )}

                                {item.rating && (
                                    <div className="flex items-center gap-1 mb-3">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-4 h-4 ${i < item.rating! ? 'fill-yellow-500 text-yellow-500' : 'text-gray-600'}`}
                                            />
                                        ))}
                                    </div>
                                )}

                                {item.total_episodes && (
                                    <div className="mb-3">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-400">Progress</span>
                                            <span className="font-medium">
                                                {item.current_episode || 0} / {item.total_episodes}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-800 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all"
                                                style={{
                                                    width: `${((item.current_episode || 0) / item.total_episodes) * 100}%`
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                )}

                                {item.started_at && (
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-400">Started:</span>
                                        <span className="font-medium">
                                            {new Date(item.started_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}

                                {item.completed_at && (
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-400">Completed:</span>
                                        <span className="font-medium">
                                            {new Date(item.completed_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}

                                {item.notes && (
                                    <p className="text-sm text-gray-400 pt-3 border-t border-gray-800 mt-3">
                                        {item.notes}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>

                {filteredItems.length === 0 && (
                    <div className="text-center py-12">
                        <Film className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg">No media found</p>
                        <p className="text-gray-500 text-sm">Add your first item to get started</p>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-md w-full my-8">
                        <h2 className="text-2xl font-bold mb-6">
                            {editingItem ? 'Edit Media' : 'Add New Media'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Type *</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as MediaType })}
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
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
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
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
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
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
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Total Episodes</label>
                                    <input
                                        type="number"
                                        value={formData.total_episodes}
                                        onChange={(e) => setFormData({ ...formData, total_episodes: parseInt(e.target.value) || 0 })}
                                        min="0"
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((rating) => (
                                        <button
                                            key={rating}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, rating })}
                                            className="p-2 hover:bg-gray-800 rounded transition-colors"
                                        >
                                            <Star
                                                className={`w-6 h-6 ${rating <= formData.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-600'}`}
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
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
                                    placeholder="Your thoughts, reminders, etc."
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition-colors"
                                >
                                    {editingItem ? 'Update' : 'Add Media'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setEditingItem(null);
                                        resetForm();
                                    }}
                                    className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}