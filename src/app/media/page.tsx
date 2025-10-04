// app/media/page.tsx
'use client';

import { useState } from 'react';
import { Plus, Film, Tv, Gamepad2, Music, Star, Clock, CheckCircle, Search, Filter, Trash2, Edit2, Calendar } from 'lucide-react';

type MediaType = 'movie' | 'tv' | 'game' | 'music';
type MediaStatus = 'planning' | 'in-progress' | 'completed' | 'on-hold' | 'dropped';

type MediaItem = {
    id: string;
    title: string;
    type: MediaType;
    status: MediaStatus;
    rating?: number;
    progress?: string;
    totalEpisodes?: number;
    currentEpisode?: number;
    genre?: string;
    releaseYear?: number;
    startDate?: string;
    completedDate?: string;
    notes?: string;
    imageUrl?: string;
};

const MEDIA_TYPES: { value: MediaType; label: string; icon: any }[] = [
    { value: 'movie', label: 'Movies', icon: Film },
    { value: 'tv', label: 'TV Shows', icon: Tv },
    { value: 'game', label: 'Games', icon: Gamepad2 },
    { value: 'music', label: 'Music', icon: Music }
];

const STATUSES: { value: MediaStatus; label: string; color: string }[] = [
    { value: 'planning', label: 'Plan to Watch', color: 'bg-gray-600' },
    { value: 'in-progress', label: 'In Progress', color: 'bg-blue-600' },
    { value: 'completed', label: 'Completed', color: 'bg-green-600' },
    { value: 'on-hold', label: 'On Hold', color: 'bg-yellow-600' },
    { value: 'dropped', label: 'Dropped', color: 'bg-red-600' }
];

const GENRES = [
    'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror',
    'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'Documentary', 'Other'
];

export default function MediaTrackerPage() {
    const [items, setItems] = useState<MediaItem[]>([
        {
            id: '1',
            title: 'Inception',
            type: 'movie',
            status: 'completed',
            rating: 5,
            genre: 'Sci-Fi',
            releaseYear: 2010,
            completedDate: '2024-09-15',
            notes: 'Mind-bending masterpiece'
        },
        {
            id: '2',
            title: 'Breaking Bad',
            type: 'tv',
            status: 'in-progress',
            rating: 5,
            genre: 'Drama',
            releaseYear: 2008,
            totalEpisodes: 62,
            currentEpisode: 45,
            startDate: '2024-08-01',
            notes: 'Season 5 is incredible'
        },
        {
            id: '3',
            title: 'The Last of Us Part II',
            type: 'game',
            status: 'completed',
            rating: 4,
            genre: 'Action',
            releaseYear: 2020,
            completedDate: '2024-09-01',
            notes: 'Emotional journey'
        }
    ]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<MediaType | 'all'>('all');
    const [selectedStatus, setSelectedStatus] = useState<MediaStatus | 'all'>('all');

    const [formData, setFormData] = useState({
        title: '',
        type: 'movie' as MediaType,
        status: 'planning' as MediaStatus,
        rating: 0,
        genre: GENRES[0],
        releaseYear: new Date().getFullYear(),
        totalEpisodes: 0,
        currentEpisode: 0,
        startDate: '',
        completedDate: '',
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
            const newItem: MediaItem = {
                id: Date.now().toString(),
                ...formData,
                rating: formData.rating || undefined,
                totalEpisodes: formData.totalEpisodes || undefined,
                currentEpisode: formData.currentEpisode || undefined,
                startDate: formData.startDate || undefined,
                completedDate: formData.completedDate || undefined,
                notes: formData.notes || undefined
            };
            setItems([...items, newItem]);
        }
        setShowAddModal(false);
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            title: '',
            type: 'movie',
            status: 'planning',
            rating: 0,
            genre: GENRES[0],
            releaseYear: new Date().getFullYear(),
            totalEpisodes: 0,
            currentEpisode: 0,
            startDate: '',
            completedDate: '',
            notes: ''
        });
    };

    const handleEdit = (item: MediaItem) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            type: item.type,
            status: item.status,
            rating: item.rating || 0,
            genre: item.genre || GENRES[0],
            releaseYear: item.releaseYear || new Date().getFullYear(),
            totalEpisodes: item.totalEpisodes || 0,
            currentEpisode: item.currentEpisode || 0,
            startDate: item.startDate || '',
            completedDate: item.completedDate || '',
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
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.notes?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = selectedType === 'all' || item.type === selectedType;
        const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
        return matchesSearch && matchesType && matchesStatus;
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

    return (
        <div className="min-h-screen bg-gray-950 text-white p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Media Tracker</h1>
                        <p className="text-gray-400">Track movies, TV shows, games, and music</p>
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
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
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4">Status Overview</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {STATUSES.map(({ value, label, color }) => (
                            <div key={value} className="text-center">
                                <div className={`${color} rounded-lg p-4 mb-2`}>
                                    <p className="text-2xl font-bold">{getStatusStats(value)}</p>
                                </div>
                                <p className="text-sm text-gray-400">{label}</p>
                            </div>
                        ))}
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
                                placeholder="Search media..."
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                                <Filter className="w-4 h-4" />
                                Type
                            </label>
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value as MediaType | 'all')}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Types</option>
                                {MEDIA_TYPES.map(({ value, label }) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                                <CheckCircle className="w-4 h-4" />
                                Status
                            </label>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value as MediaStatus | 'all')}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Statuses</option>
                                {STATUSES.map(({ value, label }) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Items Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map(item => {
                        const Icon = getIcon(item.type);
                        return (
                            <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Icon className="w-5 h-5 text-blue-400" />
                                            <span className={`${getStatusColor(item.status)} text-xs px-2 py-1 rounded`}>
                                                {getStatusLabel(item.status)}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-semibold mb-1">{item.title}</h3>
                                        {item.releaseYear && (
                                            <p className="text-sm text-gray-400">{item.releaseYear}</p>
                                        )}
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
                                    {item.genre && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Genre:</span>
                                            <span className="font-medium">{item.genre}</span>
                                        </div>
                                    )}

                                    {item.rating && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Rating:</span>
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-4 h-4 ${i < item.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {item.type === 'tv' && item.totalEpisodes && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Progress:</span>
                                            <span className="font-medium">
                                                {item.currentEpisode || 0}/{item.totalEpisodes} episodes
                                            </span>
                                        </div>
                                    )}

                                    {item.startDate && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Started:</span>
                                            <span className="font-medium">
                                                {new Date(item.startDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}

                                    {item.completedDate && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Completed:</span>
                                            <span className="font-medium">
                                                {new Date(item.completedDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}

                                    {item.notes && (
                                        <p className="text-sm text-gray-400 pt-2 border-t border-gray-800">
                                            {item.notes}
                                        </p>
                                    )}
                                </div>
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
                                <label className="block text-sm text-gray-400 mb-2">Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Type *</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as MediaType })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {MEDIA_TYPES.map(({ value, label }) => (
                                            <option key={value} value={value}>{label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Status *</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as MediaStatus })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {STATUSES.map(({ value, label }) => (
                                            <option key={value} value={value}>{label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Genre</label>
                                    <select
                                        value={formData.genre}
                                        onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {GENRES.map(genre => (
                                            <option key={genre} value={genre}>{genre}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Release Year</label>
                                    <input
                                        type="number"
                                        min="1900"
                                        max={new Date().getFullYear() + 5}
                                        value={formData.releaseYear}
                                        onChange={(e) => setFormData({ ...formData, releaseYear: parseInt(e.target.value) })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Rating (1-5 stars)</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, rating: star })}
                                            className="p-2 hover:bg-gray-800 rounded transition-colors"
                                        >
                                            <Star
                                                className={`w-6 h-6 ${star <= formData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`}
                                            />
                                        </button>
                                    ))}
                                    {formData.rating > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, rating: 0 })}
                                            className="px-3 py-1 text-sm text-gray-400 hover:text-white"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                            </div>

                            {formData.type === 'tv' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Total Episodes</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.totalEpisodes}
                                            onChange={(e) => setFormData({ ...formData, totalEpisodes: parseInt(e.target.value) })}
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Current Episode</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.currentEpisode}
                                            onChange={(e) => setFormData({ ...formData, currentEpisode: parseInt(e.target.value) })}
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Start Date</label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Completed Date</label>
                                    <input
                                        type="date"
                                        value={formData.completedDate}
                                        onChange={(e) => setFormData({ ...formData, completedDate: e.target.value })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Notes</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                                    placeholder="Your thoughts, reviews, etc..."
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
                                    {editingItem ? 'Update' : 'Add'} Media
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}