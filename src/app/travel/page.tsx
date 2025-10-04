// src/app/travel/page.tsx
'use client';

import { useState } from 'react';

interface Trip {
    id: string;
    name: string;
    location: string;
    start_date: string;
    end_date: string;
    status: 'planning' | 'upcoming' | 'active' | 'completed';
    notes?: string;
    created_at: string;
}

interface ItineraryItem {
    id: string;
    trip_id: string;
    datetime: string;
    type: 'flight' | 'accommodation' | 'activity' | 'transport' | 'dining' | 'other';
    title: string;
    details?: string;
    created_at: string;
}

interface TripEntry {
    id: string;
    trip_id: string;
    entry_date: string;
    content: string;
    created_at: string;
}

// Minimal mock data
const mockTrips: Trip[] = [
    {
        id: '1',
        name: 'Tokyo Adventure',
        location: 'Tokyo, Japan',
        start_date: '2025-03-15',
        end_date: '2025-03-22',
        status: 'upcoming',
        notes: 'Cherry blossom season',
        created_at: '2025-01-01T10:00:00Z'
    },
    {
        id: '2',
        name: 'NYC Weekend',
        location: 'New York, USA',
        start_date: '2024-12-20',
        end_date: '2024-12-23',
        status: 'completed',
        created_at: '2024-11-15T10:00:00Z'
    }
];

const mockItinerary: ItineraryItem[] = [
    {
        id: '1',
        trip_id: '1',
        datetime: '2025-03-15T14:30:00',
        type: 'flight',
        title: 'Flight to Tokyo',
        details: 'AA 123 - JFK to NRT',
        created_at: '2025-01-01T10:00:00Z'
    },
    {
        id: '2',
        trip_id: '1',
        datetime: '2025-03-16T09:00:00',
        type: 'activity',
        title: 'Visit Senso-ji Temple',
        details: 'Asakusa district',
        created_at: '2025-01-01T10:00:00Z'
    }
];

const mockEntries: TripEntry[] = [
    {
        id: '1',
        trip_id: '2',
        entry_date: '2024-12-20',
        content: 'Arrived in NYC! The city is beautiful with holiday decorations everywhere.',
        created_at: '2024-12-20T20:00:00Z'
    }
];

export default function TravelPage() {
    const [trips, setTrips] = useState<Trip[]>(mockTrips);
    const [itinerary, setItinerary] = useState<ItineraryItem[]>(mockItinerary);
    const [entries, setEntries] = useState<TripEntry[]>(mockEntries);
    const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
    const [activeView, setActiveView] = useState<'list' | 'itinerary' | 'journal'>('list');
    const [isAddingTrip, setIsAddingTrip] = useState(false);
    const [isAddingItinerary, setIsAddingItinerary] = useState(false);
    const [isAddingEntry, setIsAddingEntry] = useState(false);

    const [newTrip, setNewTrip] = useState({
        name: '',
        location: '',
        start_date: '',
        end_date: '',
        status: 'planning' as Trip['status'],
        notes: ''
    });

    const [newItinerary, setNewItinerary] = useState({
        datetime: '',
        type: 'activity' as ItineraryItem['type'],
        title: '',
        details: ''
    });

    const [newEntry, setNewEntry] = useState({
        entry_date: '',
        content: ''
    });

    const addTrip = () => {
        if (!newTrip.name.trim() || !newTrip.location.trim() || !newTrip.start_date || !newTrip.end_date) return;

        const trip: Trip = {
            id: Date.now().toString(),
            name: newTrip.name.trim(),
            location: newTrip.location.trim(),
            start_date: newTrip.start_date,
            end_date: newTrip.end_date,
            status: newTrip.status,
            notes: newTrip.notes.trim() || undefined,
            created_at: new Date().toISOString()
        };

        setTrips([trip, ...trips]);
        setNewTrip({
            name: '',
            location: '',
            start_date: '',
            end_date: '',
            status: 'planning',
            notes: ''
        });
        setIsAddingTrip(false);
    };

    const addItineraryItem = () => {
        if (!selectedTrip || !newItinerary.datetime || !newItinerary.title.trim()) return;

        const item: ItineraryItem = {
            id: Date.now().toString(),
            trip_id: selectedTrip.id,
            datetime: newItinerary.datetime,
            type: newItinerary.type,
            title: newItinerary.title.trim(),
            details: newItinerary.details.trim() || undefined,
            created_at: new Date().toISOString()
        };

        setItinerary([...itinerary, item]);
        setNewItinerary({
            datetime: '',
            type: 'activity',
            title: '',
            details: ''
        });
        setIsAddingItinerary(false);
    };

    const addEntry = () => {
        if (!selectedTrip || !newEntry.entry_date || !newEntry.content.trim()) return;

        const entry: TripEntry = {
            id: Date.now().toString(),
            trip_id: selectedTrip.id,
            entry_date: newEntry.entry_date,
            content: newEntry.content.trim(),
            created_at: new Date().toISOString()
        };

        setEntries([entry, ...entries]);
        setNewEntry({
            entry_date: '',
            content: ''
        });
        setIsAddingEntry(false);
    };

    const deleteTrip = (tripId: string) => {
        if (confirm('Delete this trip? All itinerary items and journal entries will be deleted.')) {
            setTrips(trips.filter(t => t.id !== tripId));
            setItinerary(itinerary.filter(i => i.trip_id !== tripId));
            setEntries(entries.filter(e => e.trip_id !== tripId));
            if (selectedTrip?.id === tripId) {
                setSelectedTrip(null);
                setActiveView('list');
            }
        }
    };

    const getTripItinerary = (tripId: string) => {
        return itinerary
            .filter(item => item.trip_id === tripId)
            .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
    };

    const getTripEntries = (tripId: string) => {
        return entries
            .filter(entry => entry.trip_id === tripId)
            .sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime());
    };

    const getTypeIcon = (type: ItineraryItem['type']) => {
        const icons = {
            flight: '✈️',
            accommodation: '🏨',
            activity: '🎯',
            transport: '🚗',
            dining: '🍽️',
            other: '📌'
        };
        return icons[type];
    };

    const getStatusColor = (status: Trip['status']) => {
        const colors = {
            planning: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
            upcoming: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
            active: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
            completed: 'text-gray-400 bg-gray-500/10 border-gray-500/20'
        };
        return colors[status];
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatDateTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gray-950 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                    <h1 className="text-3xl font-bold text-white mb-2">Travel Planner</h1>
                    <p className="text-gray-400">Plan trips, organize itineraries, and journal your adventures</p>
                </div>

                {/* View Selector */}
                {selectedTrip && (
                    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                        <div className="flex border-b border-gray-800">
                            <button
                                onClick={() => {
                                    setSelectedTrip(null);
                                    setActiveView('list');
                                }}
                                className="px-6 py-4 text-gray-400 hover:text-gray-300 hover:bg-gray-800/50 transition-colors"
                            >
                                ← Back to Trips
                            </button>
                            <button
                                onClick={() => setActiveView('itinerary')}
                                className={`flex-1 px-6 py-4 font-medium transition-colors ${activeView === 'itinerary'
                                    ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-500/10'
                                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
                                    }`}
                            >
                                Itinerary
                            </button>
                            <button
                                onClick={() => setActiveView('journal')}
                                className={`flex-1 px-6 py-4 font-medium transition-colors ${activeView === 'journal'
                                    ? 'text-violet-400 border-b-2 border-violet-400 bg-violet-500/10'
                                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
                                    }`}
                            >
                                Journal
                            </button>
                        </div>
                    </div>
                )}

                {/* Trip List View */}
                {activeView === 'list' && (
                    <div className="space-y-6">
                        {/* Add Trip Button */}
                        <div className="flex justify-end">
                            <button
                                onClick={() => setIsAddingTrip(true)}
                                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-md"
                            >
                                Add Trip
                            </button>
                        </div>

                        {/* Add Trip Form */}
                        {isAddingTrip && (
                            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Add New Trip</h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                                Trip Name*
                                            </label>
                                            <input
                                                type="text"
                                                value={newTrip.name}
                                                onChange={(e) => setNewTrip({ ...newTrip, name: e.target.value })}
                                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                placeholder="e.g., Tokyo Adventure"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                                Location*
                                            </label>
                                            <input
                                                type="text"
                                                value={newTrip.location}
                                                onChange={(e) => setNewTrip({ ...newTrip, location: e.target.value })}
                                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                placeholder="e.g., Tokyo, Japan"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                                Start Date*
                                            </label>
                                            <input
                                                type="date"
                                                value={newTrip.start_date}
                                                onChange={(e) => setNewTrip({ ...newTrip, start_date: e.target.value })}
                                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                                End Date*
                                            </label>
                                            <input
                                                type="date"
                                                value={newTrip.end_date}
                                                onChange={(e) => setNewTrip({ ...newTrip, end_date: e.target.value })}
                                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                                Status*
                                            </label>
                                            <select
                                                value={newTrip.status}
                                                onChange={(e) => setNewTrip({ ...newTrip, status: e.target.value as Trip['status'] })}
                                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            >
                                                <option value="planning">Planning</option>
                                                <option value="upcoming">Upcoming</option>
                                                <option value="active">Active</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            Notes
                                        </label>
                                        <textarea
                                            value={newTrip.notes}
                                            onChange={(e) => setNewTrip({ ...newTrip, notes: e.target.value })}
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            rows={2}
                                            placeholder="Optional notes about this trip"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={addTrip}
                                            disabled={!newTrip.name.trim() || !newTrip.location.trim() || !newTrip.start_date || !newTrip.end_date}
                                            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
                                        >
                                            Add Trip
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsAddingTrip(false);
                                                setNewTrip({
                                                    name: '',
                                                    location: '',
                                                    start_date: '',
                                                    end_date: '',
                                                    status: 'planning',
                                                    notes: ''
                                                });
                                            }}
                                            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Trips Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {trips.map(trip => {
                                const tripItinerary = getTripItinerary(trip.id);
                                const tripEntries = getTripEntries(trip.id);

                                return (
                                    <div
                                        key={trip.id}
                                        className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-emerald-500/30 transition-all duration-200 cursor-pointer"
                                        onClick={() => {
                                            setSelectedTrip(trip);
                                            setActiveView('itinerary');
                                        }}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-white mb-1">{trip.name}</h3>
                                                <p className="text-gray-400 text-sm">📍 {trip.location}</p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteTrip(trip.id);
                                                }}
                                                className="text-red-400 hover:text-red-300 text-sm transition-colors"
                                                title="Delete trip"
                                            >
                                                ✕
                                            </button>
                                        </div>

                                        <div className="mb-3">
                                            <span className={`inline-block px-3 py-1 rounded-lg text-xs font-medium border ${getStatusColor(trip.status)}`}>
                                                {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                                            </span>
                                        </div>

                                        <div className="text-sm text-gray-400 mb-3">
                                            📅 {formatDate(trip.start_date)} → {formatDate(trip.end_date)}
                                        </div>

                                        {trip.notes && (
                                            <p className="text-sm text-gray-500 italic mb-3">{trip.notes}</p>
                                        )}

                                        <div className="flex gap-4 text-sm text-gray-400">
                                            <span>📋 {tripItinerary.length} items</span>
                                            <span>📝 {tripEntries.length} entries</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {trips.length === 0 && (
                            <div className="text-center text-gray-500 py-12 bg-gray-900 rounded-xl border border-gray-800">
                                <p className="text-lg">No trips yet.</p>
                                <p className="text-sm">Add your first trip to start planning!</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Itinerary View */}
                {activeView === 'itinerary' && selectedTrip && (
                    <div className="space-y-6">
                        {/* Trip Header */}
                        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                            <h2 className="text-2xl font-bold text-white mb-2">{selectedTrip.name}</h2>
                            <p className="text-gray-400">📍 {selectedTrip.location}</p>
                            <p className="text-gray-400 text-sm mt-1">
                                📅 {formatDate(selectedTrip.start_date)} → {formatDate(selectedTrip.end_date)}
                            </p>
                        </div>

                        {/* Add Itinerary Button */}
                        <div className="flex justify-end">
                            <button
                                onClick={() => setIsAddingItinerary(true)}
                                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-md"
                            >
                                Add Itinerary Item
                            </button>
                        </div>

                        {/* Add Itinerary Form */}
                        {isAddingItinerary && (
                            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Add Itinerary Item</h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                                Date & Time*
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={newItinerary.datetime}
                                                onChange={(e) => setNewItinerary({ ...newItinerary, datetime: e.target.value })}
                                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                                Type*
                                            </label>
                                            <select
                                                value={newItinerary.type}
                                                onChange={(e) => setNewItinerary({ ...newItinerary, type: e.target.value as ItineraryItem['type'] })}
                                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            >
                                                <option value="activity">Activity</option>
                                                <option value="flight">Flight</option>
                                                <option value="accommodation">Accommodation</option>
                                                <option value="transport">Transport</option>
                                                <option value="dining">Dining</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            Title*
                                        </label>
                                        <input
                                            type="text"
                                            value={newItinerary.title}
                                            onChange={(e) => setNewItinerary({ ...newItinerary, title: e.target.value })}
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            placeholder="e.g., Visit Senso-ji Temple"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            Details
                                        </label>
                                        <textarea
                                            value={newItinerary.details}
                                            onChange={(e) => setNewItinerary({ ...newItinerary, details: e.target.value })}
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            rows={2}
                                            placeholder="Additional details..."
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={addItineraryItem}
                                            disabled={!newItinerary.datetime || !newItinerary.title.trim()}
                                            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
                                        >
                                            Add Item
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsAddingItinerary(false);
                                                setNewItinerary({
                                                    datetime: '',
                                                    type: 'activity',
                                                    title: '',
                                                    details: ''
                                                });
                                            }}
                                            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Itinerary Timeline */}
                        <div className="space-y-4">
                            {getTripItinerary(selectedTrip.id).map((item, index) => (
                                <div
                                    key={item.id}
                                    className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-emerald-500/30 transition-all duration-200"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="text-3xl">{getTypeIcon(item.type)}</div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h4 className="text-lg font-semibold text-white">{item.title}</h4>
                                                    <p className="text-sm text-gray-400">{formatDateTime(item.datetime)}</p>
                                                </div>
                                                <button
                                                    onClick={() => setItinerary(itinerary.filter(i => i.id !== item.id))}
                                                    className="text-red-400 hover:text-red-300 text-sm transition-colors"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                            {item.details && (
                                                <p className="text-gray-400 text-sm">{item.details}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {getTripItinerary(selectedTrip.id).length === 0 && (
                                <div className="text-center text-gray-500 py-12 bg-gray-900 rounded-xl border border-gray-800">
                                    <p className="text-lg">No itinerary items yet.</p>
                                    <p className="text-sm">Add items to plan your trip!</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Journal View */}
                {activeView === 'journal' && selectedTrip && (
                    <div className="space-y-6">
                        {/* Trip Header */}
                        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                            <h2 className="text-2xl font-bold text-white mb-2">{selectedTrip.name}</h2>
                            <p className="text-gray-400">📍 {selectedTrip.location}</p>
                        </div>

                        {/* Add Entry Button */}
                        <div className="flex justify-end">
                            <button
                                onClick={() => setIsAddingEntry(true)}
                                className="px-4 py-2 bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-lg hover:from-violet-600 hover:to-violet-700 transition-all duration-200 shadow-md"
                            >
                                Add Journal Entry
                            </button>
                        </div>

                        {/* Add Entry Form */}
                        {isAddingEntry && (
                            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Add Journal Entry</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            Date*
                                        </label>
                                        <input
                                            type="date"
                                            value={newEntry.entry_date}
                                            onChange={(e) => setNewEntry({ ...newEntry, entry_date: e.target.value })}
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            Entry*
                                        </label>
                                        <textarea
                                            value={newEntry.content}
                                            onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono text-sm"
                                            rows={8}
                                            placeholder="Write about your day..."
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={addEntry}
                                            disabled={!newEntry.entry_date || !newEntry.content.trim()}
                                            className="px-4 py-2 bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-lg hover:from-violet-600 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
                                        >
                                            Add Entry
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsAddingEntry(false);
                                                setNewEntry({
                                                    entry_date: '',
                                                    content: ''
                                                });
                                            }}
                                            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Journal Entries */}
                        <div className="space-y-4">
                            {getTripEntries(selectedTrip.id).map((entry) => (
                                <div
                                    key={entry.id}
                                    className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-violet-500/30 transition-all duration-200"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h4 className="text-lg font-semibold text-white mb-1">
                                                {formatDate(entry.entry_date)}
                                            </h4>
                                            <p className="text-xs text-gray-500">
                                                Added {new Date(entry.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setEntries(entries.filter(e => e.id !== entry.id))}
                                            className="text-red-400 hover:text-red-300 text-sm transition-colors"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <div className="prose prose-invert max-w-none">
                                        <p className="text-gray-300 whitespace-pre-wrap">{entry.content}</p>
                                    </div>
                                </div>
                            ))}

                            {getTripEntries(selectedTrip.id).length === 0 && (
                                <div className="text-center text-gray-500 py-12 bg-gray-900 rounded-xl border border-gray-800">
                                    <p className="text-lg">No journal entries yet.</p>
                                    <p className="text-sm">Start documenting your journey!</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}