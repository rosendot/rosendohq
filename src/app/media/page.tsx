// src/app/media/page.tsx
'use client';

import { useState } from 'react';

type MediaType = 'anime' | 'show' | 'movie';
type MediaStatus = 'planned' | 'watching' | 'completed' | 'on_hold' | 'dropped';

interface MediaItem {
    id: string;
    title: string;
    type: MediaType;
    status: MediaStatus;
    total_episodes?: number;
    notes?: string;
    created_at: string;
    updated_at: string;
}

interface MediaLog {
    id: string;
    media_item_id: string;
    log_date: string;
    progress: number;
    note?: string;
    created_at: string;
}

// Mock data for development
const mockMediaItems: MediaItem[] = [
    {
        id: '1',
        title: 'One Piece',
        type: 'anime',
        status: 'watching',
        total_episodes: 1100,
        notes: 'Catching up slowly',
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2025-01-03T15:30:00Z'
    },
    {
        id: '2',
        title: 'Breaking Bad',
        type: 'show',
        status: 'completed',
        total_episodes: 62,
        created_at: '2024-06-01T10:00:00Z',
        updated_at: '2024-12-15T20:00:00Z'
    },
    {
        id: '3',
        title: 'The Matrix',
        type: 'movie',
        status: 'completed',
        total_episodes: 1,
        created_at: '2024-03-10T10:00:00Z',
        updated_at: '2024-03-10T22:30:00Z'
    },
    {
        id: '4',
        title: 'Attack on Titan',
        type: 'anime',
        status: 'watching',
        total_episodes: 87,
        notes: 'Final season',
        created_at: '2024-11-01T10:00:00Z',
        updated_at: '2025-01-05T18:00:00Z'
    },
    {
        id: '5',
        title: 'The Office',
        type: 'show',
        status: 'on_hold',
        total_episodes: 201,
        notes: 'Season 5',
        created_at: '2024-08-15T10:00:00Z',
        updated_at: '2024-12-20T14:00:00Z'
    },
    {
        id: '6',
        title: 'Inception',
        type: 'movie',
        status: 'planned',
        total_episodes: 1,
        created_at: '2025-01-01T10:00:00Z',
        updated_at: '2025-01-01T10:00:00Z'
    }
];

const mockMediaLogs: MediaLog[] = [
    {
        id: '1',
        media_item_id: '1',
        log_date: '2025-01-05',
        progress: 1015,
        note: 'Wano arc is fire',
        created_at: '2025-01-05T20:00:00Z'
    },
    {
        id: '2',
        media_item_id: '1',
        log_date: '2025-01-03',
        progress: 1010,
        created_at: '2025-01-03T19:30:00Z'
    },
    {
        id: '3',
        media_item_id: '4',
        log_date: '2025-01-05',
        progress: 75,
        created_at: '2025-01-05T18:00:00Z'
    },
    {
        id: '4',
        media_item_id: '4',
        log_date: '2025-01-02',
        progress: 70,
        note: 'Getting intense',
        created_at: '2025-01-02T21:00:00Z'
    }
];

const statusColors = {
    planned: 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 text-gray-900',
    watching: 'bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-900',
    completed: 'bg-gradient-to-r from-violet-50 to-violet-100 border-violet-200 text-violet-900',
    on_hold: 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-900',
    dropped: 'bg-gradient-to-r from-red-50 to-red-100 border-red-200 text-red-900'
};

const statusLabels = {
    planned: 'Planned',
    watching: 'Watching',
    completed: 'Completed',
    on_hold: 'On Hold',
    dropped: 'Dropped'
};

const typeIcons = {
    anime: '📺',
    show: '🎬',
    movie: '🎥'
};

export default function MediaPage() {
    const [items, setItems] = useState<MediaItem[]>(mockMediaItems);
    const [logs, setLogs] = useState<MediaLog[]>(mockMediaLogs);
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [isAddingItem, setIsAddingItem] = useState(false);
    const [newItem, setNewItem] = useState({
        title: '',
        type: 'anime' as MediaType,
        status: 'planned' as MediaStatus,
        total_episodes: '',
        notes: ''
    });

    // Get latest progress for each media item
    const getLatestProgress = (mediaItemId: string) => {
        const itemLogs = logs
            .filter(log => log.media_item_id === mediaItemId)
            .sort((a, b) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime());
        return itemLogs[0]?.progress || 0;
    };

    // Filter items
    const filteredItems = items.filter(item => {
        const statusMatch = selectedStatus === 'all' || item.status === selectedStatus;
        const typeMatch = selectedType === 'all' || item.type === selectedType;
        return statusMatch && typeMatch;
    });

    // Continue watching - items currently watching sorted by recent activity
    const continueWatching = items
        .filter(item => item.status === 'watching')
        .map(item => ({
            ...item,
            latestProgress: getLatestProgress(item.id),
            lastWatched: logs
                .filter(log => log.media_item_id === item.id)
                .sort((a, b) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime())[0]?.log_date
        }))
        .sort((a, b) => {
            if (!a.lastWatched) return 1;
            if (!b.lastWatched) return -1;
            return new Date(b.lastWatched).getTime() - new Date(a.lastWatched).getTime();
        });

    const addNewItem = () => {
        if (!newItem.title.trim()) return;

        const item: MediaItem = {
            id: Date.now().toString(),
            title: newItem.title.trim(),
            type: newItem.type,
            status: newItem.status,
            total_episodes: newItem.total_episodes ? Number(newItem.total_episodes) : undefined,
            notes: newItem.notes.trim() || undefined,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        setItems([item, ...items]);
        setNewItem({ title: '', type: 'anime', status: 'planned', total_episodes: '', notes: '' });
        setIsAddingItem(false);
    };

    const logEpisode = (mediaItemId: string) => {
        const currentProgress = getLatestProgress(mediaItemId);
        const newLog: MediaLog = {
            id: Date.now().toString(),
            media_item_id: mediaItemId,
            log_date: new Date().toISOString().split('T')[0],
            progress: currentProgress + 1,
            created_at: new Date().toISOString()
        };

        setLogs([newLog, ...logs]);
        setItems(items.map(item =>
            item.id === mediaItemId
                ? { ...item, updated_at: new Date().toISOString() }
                : item
        ));
    };

    const updateStatus = (mediaItemId: string, newStatus: MediaStatus) => {
        setItems(items.map(item =>
            item.id === mediaItemId
                ? { ...item, status: newStatus, updated_at: new Date().toISOString() }
                : item
        ));
    };

    const deleteItem = (mediaItemId: string) => {
        if (confirm('Are you sure you want to delete this item?')) {
            setItems(items.filter(item => item.id !== mediaItemId));
            setLogs(logs.filter(log => log.media_item_id !== mediaItemId));
        }
    };

    const getProgressPercentage = (item: MediaItem) => {
        if (!item.total_episodes) return 0;
        const progress = getLatestProgress(item.id);
        return Math.min(100, Math.round((progress / item.total_episodes) * 100));
    };

    const getStatusCount = (status: string) => {
        if (status === 'all') return items.length;
        return items.filter(item => item.status === status).length;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-violet-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-violet-600 bg-clip-text text-transparent mb-2">
                        Media Tracker
                    </h1>
                    <p className="text-gray-600">Track your anime, shows, and movies</p>
                </div>

                {/* Continue Watching Section */}
                {continueWatching.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Continue Watching</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {continueWatching.map(item => (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-xl shadow-lg border border-emerald-200 p-5 hover:shadow-xl transition-all duration-200"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">{typeIcons[item.type]}</span>
                                            <h3 className="font-bold text-lg text-gray-900">{item.title}</h3>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mb-3">
                                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                                            <span>Episode {item.latestProgress}{item.total_episodes && ` / ${item.total_episodes}`}</span>
                                            <span>{getProgressPercentage(item)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${getProgressPercentage(item)}%` }}
                                            />
                                        </div>
                                    </div>

                                    {item.lastWatched && (
                                        <p className="text-sm text-gray-500 mb-3">
                                            Last watched: {new Date(item.lastWatched).toLocaleDateString()}
                                        </p>
                                    )}

                                    <button
                                        onClick={() => logEpisode(item.id)}
                                        className="w-full px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-md font-medium"
                                    >
                                        +1 Episode
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-lg border border-emerald-100 p-6 mb-6">
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex flex-wrap gap-4 items-center">
                            {/* Status Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                >
                                    <option value="all">All ({getStatusCount('all')})</option>
                                    <option value="watching">Watching ({getStatusCount('watching')})</option>
                                    <option value="planned">Planned ({getStatusCount('planned')})</option>
                                    <option value="completed">Completed ({getStatusCount('completed')})</option>
                                    <option value="on_hold">On Hold ({getStatusCount('on_hold')})</option>
                                    <option value="dropped">Dropped ({getStatusCount('dropped')})</option>
                                </select>
                            </div>

                            {/* Type Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <select
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                    className="px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                >
                                    <option value="all">All Types</option>
                                    <option value="anime">Anime</option>
                                    <option value="show">TV Shows</option>
                                    <option value="movie">Movies</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsAddingItem(true)}
                            className="px-4 py-2 bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-lg hover:from-violet-600 hover:to-violet-700 transition-all duration-200 shadow-md"
                        >
                            Add Media
                        </button>
                    </div>
                </div>

                {/* Add New Item Form */}
                {isAddingItem && (
                    <div className="bg-white rounded-xl shadow-lg border border-violet-100 p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Media</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title*</label>
                                <input
                                    type="text"
                                    value={newItem.title}
                                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="Enter title..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <select
                                    value={newItem.type}
                                    onChange={(e) => setNewItem({ ...newItem, type: e.target.value as MediaType })}
                                    className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                >
                                    <option value="anime">Anime</option>
                                    <option value="show">TV Show</option>
                                    <option value="movie">Movie</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={newItem.status}
                                    onChange={(e) => setNewItem({ ...newItem, status: e.target.value as MediaStatus })}
                                    className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                >
                                    <option value="planned">Planned</option>
                                    <option value="watching">Watching</option>
                                    <option value="completed">Completed</option>
                                    <option value="on_hold">On Hold</option>
                                    <option value="dropped">Dropped</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Total Episodes</label>
                                <input
                                    type="number"
                                    value={newItem.total_episodes}
                                    onChange={(e) => setNewItem({ ...newItem, total_episodes: e.target.value })}
                                    className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="Optional"
                                    min="1"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                <textarea
                                    value={newItem.notes}
                                    onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                                    className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    rows={2}
                                    placeholder="Any notes..."
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={addNewItem}
                                disabled={!newItem.title.trim()}
                                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
                            >
                                Add Media
                            </button>
                            <button
                                onClick={() => {
                                    setIsAddingItem(false);
                                    setNewItem({ title: '', type: 'anime', status: 'planned', total_episodes: '', notes: '' });
                                }}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* All Media Grid */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">All Media</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredItems.map(item => (
                            <div
                                key={item.id}
                                className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${statusColors[item.status]}`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2 flex-1">
                                        <span className="text-xl">{typeIcons[item.type]}</span>
                                        <h3 className="font-semibold text-lg">{item.title}</h3>
                                    </div>
                                    <button
                                        onClick={() => deleteItem(item.id)}
                                        className="text-red-500 hover:text-red-700 text-sm transition-colors ml-2"
                                        title="Delete"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">{statusLabels[item.status]}</span>
                                        <span className="text-gray-600 capitalize">{item.type}</span>
                                    </div>

                                    {item.total_episodes && (
                                        <div>
                                            <div className="flex justify-between text-sm text-gray-700 mb-1">
                                                <span>{getLatestProgress(item.id)} / {item.total_episodes} episodes</span>
                                                <span>{getProgressPercentage(item)}%</span>
                                            </div>
                                            <div className="w-full bg-white/60 rounded-full h-1.5">
                                                <div
                                                    className="bg-current h-1.5 rounded-full transition-all duration-300"
                                                    style={{ width: `${getProgressPercentage(item)}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {item.notes && (
                                        <p className="text-sm italic opacity-90">{item.notes}</p>
                                    )}

                                    {/* Quick Actions */}
                                    <div className="flex gap-2 mt-3">
                                        {item.status === 'watching' && (
                                            <button
                                                onClick={() => logEpisode(item.id)}
                                                className="flex-1 px-3 py-1.5 bg-white/60 hover:bg-white/80 rounded text-sm font-medium transition-colors"
                                            >
                                                +1 Episode
                                            </button>
                                        )}
                                        {item.status === 'planned' && (
                                            <button
                                                onClick={() => updateStatus(item.id, 'watching')}
                                                className="flex-1 px-3 py-1.5 bg-white/60 hover:bg-white/80 rounded text-sm font-medium transition-colors"
                                            >
                                                Start Watching
                                            </button>
                                        )}
                                        {item.status === 'watching' && (
                                            <button
                                                onClick={() => updateStatus(item.id, 'completed')}
                                                className="flex-1 px-3 py-1.5 bg-white/60 hover:bg-white/80 rounded text-sm font-medium transition-colors"
                                            >
                                                Complete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredItems.length === 0 && (
                        <div className="text-center text-gray-500 py-12">
                            <p className="text-lg">No media found.</p>
                            <p className="text-sm">Try adjusting your filters or add new media!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}