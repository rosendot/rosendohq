// src/app/travel/page.tsx
'use client';

import { useState } from 'react';

type TripStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
type ItineraryItemType = 'flight' | 'lodging' | 'activity' | 'meal' | 'transport' | 'other';

interface Trip {
    id: string;
    name: string;
    location: string;
    start_date: string;
    end_date: string;
    status: TripStatus;
    tags: string[];
    notes?: string;
    budget?: number;
    created_at: string;
}

interface ItineraryItem {
    id: string;
    trip_id: string;
    datetime: string;
    type: ItineraryItemType;
    title: string;
    location?: string;
    cost?: number;
    confirmation?: string;
    notes?: string;
    details?: string;
    created_at: string;
}

interface TripEntry {
    id: string;
    trip_id: string;
    entry_date: string;
    title?: string;
    content: string;
    photos?: string[];
    created_at: string;
}

// Mock data for development
const mockTrips: Trip[] = [
    {
        id: '1',
        name: 'Japan Adventure',
        location: 'Tokyo, Kyoto, Osaka',
        start_date: '2025-03-15',
        end_date: '2025-03-25',
        status: 'upcoming',
        tags: ['international', 'culture', 'food'],
        notes: 'Cherry blossom season!',
        budget: 5000,
        created_at: '2025-01-01T10:00:00Z'
    },
    {
        id: '2',
        name: 'NYC Weekend',
        location: 'New York City, NY',
        start_date: '2025-02-10',
        end_date: '2025-02-12',
        status: 'upcoming',
        tags: ['domestic', 'city', 'museums'],
        budget: 1500,
        created_at: '2025-01-05T10:00:00Z'
    },
    {
        id: '3',
        name: 'California Road Trip',
        location: 'San Francisco to LA',
        start_date: '2024-12-20',
        end_date: '2024-12-28',
        status: 'completed',
        tags: ['domestic', 'road-trip', 'coast'],
        notes: 'PCH scenic drive',
        budget: 3000,
        created_at: '2024-12-01T10:00:00Z'
    }
];

const mockItineraryItems: ItineraryItem[] = [
    {
        id: '1',
        trip_id: '1',
        datetime: '2025-03-15T10:30:00',
        type: 'flight',
        title: 'Flight to Tokyo',
        location: 'JFK → NRT',
        cost: 1200,
        confirmation: 'ABC123XYZ',
        notes: 'United Airlines UA79',
        created_at: '2025-01-02T10:00:00Z'
    },
    {
        id: '2',
        trip_id: '1',
        datetime: '2025-03-15T15:00:00',
        type: 'lodging',
        title: 'Check-in Hotel',
        location: 'Tokyo Shibuya Hotel',
        cost: 150,
        confirmation: 'HTL-789',
        notes: '3 nights',
        created_at: '2025-01-02T10:05:00Z'
    },
    {
        id: '3',
        trip_id: '1',
        datetime: '2025-03-16T09:00:00',
        type: 'activity',
        title: 'Tsukiji Fish Market Tour',
        location: 'Tsukiji Outer Market',
        cost: 50,
        notes: 'Guided food tour',
        created_at: '2025-01-02T10:10:00Z'
    },
    {
        id: '4',
        trip_id: '1',
        datetime: '2025-03-16T19:00:00',
        type: 'meal',
        title: 'Sushi Dinner',
        location: 'Sukiyabashi Jiro',
        cost: 300,
        confirmation: 'RES-456',
        notes: 'Michelin 3-star',
        created_at: '2025-01-02T10:15:00Z'
    },
    {
        id: '5',
        trip_id: '2',
        datetime: '2025-02-10T08:00:00',
        type: 'flight',
        title: 'Flight to NYC',
        location: 'CLT → JFK',
        cost: 250,
        confirmation: 'DL456',
        created_at: '2025-01-05T10:00:00Z'
    },
    {
        id: '6',
        trip_id: '2',
        datetime: '2025-02-10T14:00:00',
        type: 'lodging',
        title: 'Hotel Check-in',
        location: 'Manhattan Midtown Hotel',
        cost: 350,
        confirmation: 'NYC-HTL-123',
        notes: '2 nights',
        created_at: '2025-01-05T10:05:00Z'
    }
];

const mockTripEntries: TripEntry[] = [
    {
        id: '1',
        trip_id: '3',
        entry_date: '2024-12-20',
        title: 'Day 1 - San Francisco',
        content: `# Amazing start to the trip!

Started the day with breakfast at Tartine Bakery - the morning bun was incredible. Then walked across the Golden Gate Bridge. The views were stunning despite the fog.

Had lunch at Fisherman's Wharf and visited Pier 39. So many sea lions!

Evening: Drove to Sausalito and watched sunset. Perfect first day.`,
        created_at: '2024-12-20T22:00:00Z'
    },
    {
        id: '2',
        trip_id: '3',
        entry_date: '2024-12-21',
        title: 'Day 2 - Heading South',
        content: `# PCH Drive Day 1

Left SF early to avoid traffic. Stopped at Half Moon Bay for coffee.

Highlights:
- Elephant seals at Ano Nuevo
- Lunch at a tiny taco place in Santa Cruz
- Walked around Carmel-by-the-Sea
- Sunset at Point Lobos

Currently in Monterey. Tomorrow: Big Sur!`,
        created_at: '2024-12-21T21:30:00Z'
    }
];

const statusColors = {
    upcoming: 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 text-blue-900',
    ongoing: 'bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-900',
    completed: 'bg-gradient-to-r from-violet-50 to-violet-100 border-violet-200 text-violet-900',
    cancelled: 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 text-gray-600'
};

const statusLabels = {
    upcoming: 'Upcoming',
    ongoing: 'Ongoing',
    completed: 'Completed',
    cancelled: 'Cancelled'
};

const itemTypeIcons = {
    flight: '✈️',
    lodging: '🏨',
    activity: '🎯',
    meal: '🍽️',
    transport: '🚗',
    other: '📌'
};

const itemTypeColors = {
    flight: 'bg-blue-100 text-blue-800',
    lodging: 'bg-purple-100 text-purple-800',
    activity: 'bg-green-100 text-green-800',
    meal: 'bg-orange-100 text-orange-800',
    transport: 'bg-yellow-100 text-yellow-800',
    other: 'bg-gray-100 text-gray-800'
};

export default function TravelPage() {
    const [trips, setTrips] = useState<Trip[]>(mockTrips);
    const [itineraryItems, setItineraryItems] = useState<ItineraryItem[]>(mockItineraryItems);
    const [tripEntries, setTripEntries] = useState<TripEntry[]>(mockTripEntries);
    const [selectedTripId, setSelectedTripId] = useState<string>('1');
    const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'journal'>('overview');
    const [isAddingTrip, setIsAddingTrip] = useState(false);
    const [isAddingItinerary, setIsAddingItinerary] = useState(false);
    const [isAddingEntry, setIsAddingEntry] = useState(false);

    const [newTrip, setNewTrip] = useState({
        name: '',
        location: '',
        start_date: '',
        end_date: '',
        tags: '',
        notes: '',
        budget: ''
    });

    const [newItinerary, setNewItinerary] = useState({
        datetime: '',
        type: 'activity' as ItineraryItemType,
        title: '',
        location: '',
        cost: '',
        confirmation: '',
        notes: ''
    });

    const [newEntry, setNewEntry] = useState({
        entry_date: new Date().toISOString().split('T')[0],
        title: '',
        content: ''
    });

    const selectedTrip = trips.find(t => t.id === selectedTripId);
    const tripItinerary = itineraryItems
        .filter(item => item.trip_id === selectedTripId)
        .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
    const tripJournal = tripEntries
        .filter(entry => entry.trip_id === selectedTripId)
        .sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime());

    const upcomingTrips = trips
        .filter(t => t.status === 'upcoming')
        .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

    const getDaysUntil = (dateStr: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const target = new Date(dateStr);
        target.setHours(0, 0, 0, 0);
        const diffTime = target.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getTripDuration = (trip: Trip) => {
        const start = new Date(trip.start_date);
        const end = new Date(trip.end_date);
        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    };

    const getTotalCost = (tripId: string) => {
        return itineraryItems
            .filter(item => item.trip_id === tripId && item.cost)
            .reduce((sum, item) => sum + (item.cost || 0), 0);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const addNewTrip = () => {
        if (!newTrip.name.trim() || !newTrip.start_date || !newTrip.end_date) return;

        const trip: Trip = {
            id: Date.now().toString(),
            name: newTrip.name.trim(),
            location: newTrip.location.trim(),
            start_date: newTrip.start_date,
            end_date: newTrip.end_date,
            status: 'upcoming',
            tags: newTrip.tags.split(',').map(t => t.trim()).filter(Boolean),
            notes: newTrip.notes.trim() || undefined,
            budget: newTrip.budget ? Number(newTrip.budget) : undefined,
            created_at: new Date().toISOString()
        };

        setTrips([trip, ...trips]);
        setNewTrip({ name: '', location: '', start_date: '', end_date: '', tags: '', notes: '', budget: '' });
        setIsAddingTrip(false);
        setSelectedTripId(trip.id);
    };

    const addNewItinerary = () => {
        if (!newItinerary.datetime || !newItinerary.title.trim() || !selectedTripId) return;

        const item: ItineraryItem = {
            id: Date.now().toString(),
            trip_id: selectedTripId,
            datetime: newItinerary.datetime,
            type: newItinerary.type,
            title: newItinerary.title.trim(),
            location: newItinerary.location.trim() || undefined,
            cost: newItinerary.cost ? Number(newItinerary.cost) : undefined,
            confirmation: newItinerary.confirmation.trim() || undefined,
            notes: newItinerary.notes.trim() || undefined,
            created_at: new Date().toISOString()
        };

        setItineraryItems([...itineraryItems, item]);
        setNewItinerary({
            datetime: '',
            type: 'activity',
            title: '',
            location: '',
            cost: '',
            confirmation: '',
            notes: ''
        });
        setIsAddingItinerary(false);
    };

    const addNewEntry = () => {
        if (!newEntry.content.trim() || !selectedTripId) return;

        const entry: TripEntry = {
            id: Date.now().toString(),
            trip_id: selectedTripId,
            entry_date: newEntry.entry_date,
            title: newEntry.title.trim() || undefined,
            content: newEntry.content.trim(),
            created_at: new Date().toISOString()
        };

        setTripEntries([entry, ...tripEntries]);
        setNewEntry({ entry_date: new Date().toISOString().split('T')[0], title: '', content: '' });
        setIsAddingEntry(false);
    };

    const deleteTrip = (tripId: string) => {
        if (confirm('Are you sure? This will delete the trip and all itinerary items and journal entries.')) {
            setTrips(trips.filter(t => t.id !== tripId));
            setItineraryItems(itineraryItems.filter(i => i.trip_id !== tripId));
            setTripEntries(tripEntries.filter(e => e.trip_id !== tripId));
            if (selectedTripId === tripId && trips.length > 1) {
                setSelectedTripId(trips.find(t => t.id !== tripId)?.id || '');
            }
        }
    };

    const deleteItineraryItem = (itemId: string) => {
        if (confirm('Delete this itinerary item?')) {
            setItineraryItems(itineraryItems.filter(i => i.id !== itemId));
        }
    };

    const deleteEntry = (entryId: string) => {
        if (confirm('Delete this journal entry?')) {
            setTripEntries(tripEntries.filter(e => e.id !== entryId));
        }
    };

    // Group itinerary by day
    const getItineraryByDay = () => {
        const byDay: Record<string, ItineraryItem[]> = {};
        tripItinerary.forEach(item => {
            const day = item.datetime.split('T')[0];
            if (!byDay[day]) byDay[day] = [];
            byDay[day].push(item);
        });
        return byDay;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-violet-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-violet-600 bg-clip-text text-transparent mb-2">
                        Travel Planner
                    </h1>
                    <p className="text-gray-600">Plan your trips, organize itineraries, and capture memories</p>
                </div>

                {/* Upcoming Trips Countdown */}
                {upcomingTrips.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Upcoming Trips</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {upcomingTrips.map(trip => {
                                const daysUntil = getDaysUntil(trip.start_date);
                                const duration = getTripDuration(trip);

                                return (
                                    <button
                                        key={trip.id}
                                        onClick={() => {
                                            setSelectedTripId(trip.id);
                                            setActiveTab('overview');
                                        }}
                                        className="bg-white rounded-xl shadow-lg border border-blue-200 p-6 text-left hover:shadow-xl transition-all duration-200 hover:border-blue-300"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-gray-900 mb-1">{trip.name}</h3>
                                                <p className="text-gray-600">{trip.location}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-3xl font-bold text-blue-600">{daysUntil}</div>
                                                <div className="text-sm text-gray-600">
                                                    {daysUntil === 0 ? 'today!' : daysUntil === 1 ? 'day' : 'days'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-700">
                                            <span>📅 {new Date(trip.start_date).toLocaleDateString()}</span>
                                            <span>⏱️ {duration} days</span>
                                        </div>
                                        {trip.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {trip.tags.slice(0, 3).map(tag => (
                                                    <span
                                                        key={tag}
                                                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Trips Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg border border-emerald-100 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">Your Trips</h2>
                                <button
                                    onClick={() => setIsAddingTrip(true)}
                                    className="text-sm bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-3 py-1 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-md"
                                >
                                    New Trip
                                </button>
                            </div>

                            <div className="space-y-2">
                                {trips.map(trip => (
                                    <button
                                        key={trip.id}
                                        onClick={() => setSelectedTripId(trip.id)}
                                        className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${selectedTripId === trip.id
                                            ? 'bg-gradient-to-r from-emerald-50 to-violet-50 border-emerald-200 shadow-md'
                                            : 'bg-gray-50 border-gray-200 hover:bg-gradient-to-r hover:from-emerald-25 hover:to-violet-25 hover:border-emerald-100'
                                            }`}
                                    >
                                        <div className="font-medium text-gray-900 line-clamp-1">{trip.name}</div>
                                        <div className="text-sm text-gray-600 line-clamp-1">{trip.location}</div>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-xs text-gray-500">
                                                {new Date(trip.start_date).toLocaleDateString()}
                                            </span>
                                            <span className={`text-xs px-2 py-0.5 rounded ${statusColors[trip.status]}`}>
                                                {statusLabels[trip.status]}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {selectedTrip ? (
                            <div className="space-y-6">
                                {/* Trip Header */}
                                <div className="bg-white rounded-xl shadow-lg border border-violet-100 p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedTrip.name}</h2>
                                            <p className="text-lg text-gray-600 mb-3">📍 {selectedTrip.location}</p>
                                            <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                                                <span>
                                                    📅 {new Date(selectedTrip.start_date).toLocaleDateString()} -{' '}
                                                    {new Date(selectedTrip.end_date).toLocaleDateString()}
                                                </span>
                                                <span>⏱️ {getTripDuration(selectedTrip)} days</span>
                                                {selectedTrip.budget && (
                                                    <span>💰 Budget: {formatCurrency(selectedTrip.budget)}</span>
                                                )}
                                            </div>
                                            {selectedTrip.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {selectedTrip.tags.map(tag => (
                                                        <span
                                                            key={tag}
                                                            className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-sm font-medium"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => deleteTrip(selectedTrip.id)}
                                            className="text-red-500 hover:text-red-700 transition-colors"
                                        >
                                            Delete Trip
                                        </button>
                                    </div>
                                    {selectedTrip.notes && (
                                        <div className="bg-gradient-to-r from-violet-50 to-blue-50 p-4 rounded-lg">
                                            <p className="text-gray-700 italic">{selectedTrip.notes}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Tabs */}
                                <div className="bg-white rounded-xl shadow-lg border border-emerald-100">
                                    <div className="flex border-b border-gray-200">
                                        <button
                                            onClick={() => setActiveTab('overview')}
                                            className={`flex-1 px-6 py-4 font-medium transition-colors ${activeTab === 'overview'
                                                ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                                }`}
                                        >
                                            Overview
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('itinerary')}
                                            className={`flex-1 px-6 py-4 font-medium transition-colors ${activeTab === 'itinerary'
                                                ? 'text-violet-600 border-b-2 border-violet-600 bg-violet-50'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                                }`}
                                        >
                                            Itinerary ({tripItinerary.length})
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('journal')}
                                            className={`flex-1 px-6 py-4 font-medium transition-colors ${activeTab === 'journal'
                                                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                                }`}
                                        >
                                            Journal ({tripJournal.length})
                                        </button>
                                    </div>

                                    <div className="p-6">
                                        {/* Overview Tab */}
                                        {activeTab === 'overview' && (
                                            <div className="space-y-6">
                                                {/* Stats */}
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                                                        <div className="text-sm text-blue-700 mb-1">Total Planned</div>
                                                        <div className="text-2xl font-bold text-blue-900">
                                                            {formatCurrency(getTotalCost(selectedTrip.id))}
                                                        </div>
                                                    </div>
                                                    <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-lg p-4 border border-violet-200">
                                                        <div className="text-sm text-violet-700 mb-1">Activities</div>
                                                        <div className="text-2xl font-bold text-violet-900">
                                                            {tripItinerary.length}
                                                        </div>
                                                    </div>
                                                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4 border border-emerald-200">
                                                        <div className="text-sm text-emerald-700 mb-1">Journal Entries</div>
                                                        <div className="text-2xl font-bold text-emerald-900">
                                                            {tripJournal.length}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Quick Preview */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {/* Upcoming Events */}
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                                            Next Events
                                                        </h3>
                                                        {tripItinerary.slice(0, 3).length > 0 ? (
                                                            <div className="space-y-2">
                                                                {tripItinerary.slice(0, 3).map(item => (
                                                                    <div
                                                                        key={item.id}
                                                                        className="p-3 bg-gradient-to-r from-blue-50 to-violet-50 rounded-lg border border-blue-200"
                                                                    >
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <span className="text-lg">
                                                                                {itemTypeIcons[item.type]}
                                                                            </span>
                                                                            <span className="font-medium text-gray-900">
                                                                                {item.title}
                                                                            </span>
                                                                        </div>
                                                                        <div className="text-sm text-gray-600">
                                                                            {new Date(item.datetime).toLocaleString()}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-gray-500 text-sm">
                                                                No itinerary items yet
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Recent Journal */}
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                                            Recent Journal Entries
                                                        </h3>
                                                        {tripJournal.slice(0, 2).length > 0 ? (
                                                            <div className="space-y-2">
                                                                {tripJournal.slice(0, 2).map(entry => (
                                                                    <div
                                                                        key={entry.id}
                                                                        className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200"
                                                                    >
                                                                        <div className="font-medium text-gray-900 mb-1">
                                                                            {entry.title || 'Untitled Entry'}
                                                                        </div>
                                                                        <div className="text-sm text-gray-600 mb-1">
                                                                            {new Date(entry.entry_date).toLocaleDateString()}
                                                                        </div>
                                                                        <p className="text-sm text-gray-700 line-clamp-2">
                                                                            {entry.content.substring(0, 100)}...
                                                                        </p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-gray-500 text-sm">
                                                                No journal entries yet
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Itinerary Tab */}
                                        {activeTab === 'itinerary' && (
                                            <div className="space-y-6">
                                                <div className="flex justify-end">
                                                    <button
                                                        onClick={() => setIsAddingItinerary(true)}
                                                        className="px-4 py-2 bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-lg hover:from-violet-600 hover:to-violet-700 transition-all duration-200 shadow-md"
                                                    >
                                                        Add Itinerary Item
                                                    </button>
                                                </div>

                                                {/* Add Itinerary Form */}
                                                {isAddingItinerary && (
                                                    <div className="bg-gradient-to-r from-violet-50 to-blue-50 rounded-lg p-6 border border-violet-200">
                                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                                            Add Itinerary Item
                                                        </h3>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Date & Time*
                                                                </label>
                                                                <input
                                                                    type="datetime-local"
                                                                    value={newItinerary.datetime}
                                                                    onChange={(e) =>
                                                                        setNewItinerary({
                                                                            ...newItinerary,
                                                                            datetime: e.target.value
                                                                        })
                                                                    }
                                                                    className="w-full px-3 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Type*
                                                                </label>
                                                                <select
                                                                    value={newItinerary.type}
                                                                    onChange={(e) =>
                                                                        setNewItinerary({
                                                                            ...newItinerary,
                                                                            type: e.target.value as ItineraryItemType
                                                                        })
                                                                    }
                                                                    className="w-full px-3 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                                                                >
                                                                    <option value="flight">✈️ Flight</option>
                                                                    <option value="lodging">🏨 Lodging</option>
                                                                    <option value="activity">🎯 Activity</option>
                                                                    <option value="meal">🍽️ Meal</option>
                                                                    <option value="transport">🚗 Transport</option>
                                                                    <option value="other">📌 Other</option>
                                                                </select>
                                                            </div>
                                                            <div className="md:col-span-2">
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Title*
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={newItinerary.title}
                                                                    onChange={(e) =>
                                                                        setNewItinerary({
                                                                            ...newItinerary,
                                                                            title: e.target.value
                                                                        })
                                                                    }
                                                                    className="w-full px-3 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                                                                    placeholder="e.g., Flight to Tokyo, Museum Visit"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Location
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={newItinerary.location}
                                                                    onChange={(e) =>
                                                                        setNewItinerary({
                                                                            ...newItinerary,
                                                                            location: e.target.value
                                                                        })
                                                                    }
                                                                    className="w-full px-3 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                                                                    placeholder="Specific location"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Cost ($)
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    value={newItinerary.cost}
                                                                    onChange={(e) =>
                                                                        setNewItinerary({
                                                                            ...newItinerary,
                                                                            cost: e.target.value
                                                                        })
                                                                    }
                                                                    className="w-full px-3 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                                                                    placeholder="Optional"
                                                                    min="0"
                                                                    step="0.01"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Confirmation #
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={newItinerary.confirmation}
                                                                    onChange={(e) =>
                                                                        setNewItinerary({
                                                                            ...newItinerary,
                                                                            confirmation: e.target.value
                                                                        })
                                                                    }
                                                                    className="w-full px-3 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                                                                    placeholder="Booking reference"
                                                                />
                                                            </div>
                                                            <div className="md:col-span-2">
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Notes
                                                                </label>
                                                                <textarea
                                                                    value={newItinerary.notes}
                                                                    onChange={(e) =>
                                                                        setNewItinerary({
                                                                            ...newItinerary,
                                                                            notes: e.target.value
                                                                        })
                                                                    }
                                                                    className="w-full px-3 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                                                                    rows={2}
                                                                    placeholder="Additional details..."
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2 mt-4">
                                                            <button
                                                                onClick={addNewItinerary}
                                                                disabled={
                                                                    !newItinerary.datetime || !newItinerary.title.trim()
                                                                }
                                                                className="px-4 py-2 bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-lg hover:from-violet-600 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
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
                                                                        location: '',
                                                                        cost: '',
                                                                        confirmation: '',
                                                                        notes: ''
                                                                    });
                                                                }}
                                                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Itinerary Timeline */}
                                                {tripItinerary.length > 0 ? (
                                                    <div className="space-y-6">
                                                        {Object.entries(getItineraryByDay()).map(([day, items]) => (
                                                            <div key={day}>
                                                                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                                    📅 {new Date(day).toLocaleDateString('en-US', {
                                                                        weekday: 'long',
                                                                        year: 'numeric',
                                                                        month: 'long',
                                                                        day: 'numeric'
                                                                    })}
                                                                    <span className="text-sm text-gray-500 font-normal">
                                                                        ({items.length} {items.length === 1 ? 'item' : 'items'})
                                                                    </span>
                                                                </h3>
                                                                <div className="space-y-3">
                                                                    {items.map(item => (
                                                                        <div
                                                                            key={item.id}
                                                                            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                                                                        >
                                                                            <div className="flex items-start justify-between">
                                                                                <div className="flex-1">
                                                                                    <div className="flex items-center gap-3 mb-2">
                                                                                        <span className="text-sm font-medium text-gray-600">
                                                                                            {new Date(
                                                                                                item.datetime
                                                                                            ).toLocaleTimeString('en-US', {
                                                                                                hour: 'numeric',
                                                                                                minute: '2-digit'
                                                                                            })}
                                                                                        </span>
                                                                                        <span
                                                                                            className={`px-2 py-1 rounded text-xs font-medium ${itemTypeColors[item.type]}`}
                                                                                        >
                                                                                            {itemTypeIcons[item.type]}{' '}
                                                                                            {item.type}
                                                                                        </span>
                                                                                    </div>
                                                                                    <h4 className="text-lg font-semibold text-gray-900 mb-1">
                                                                                        {item.title}
                                                                                    </h4>
                                                                                    {item.location && (
                                                                                        <p className="text-sm text-gray-600 mb-1">
                                                                                            📍 {item.location}
                                                                                        </p>
                                                                                    )}
                                                                                    <div className="flex flex-wrap gap-3 text-sm text-gray-700">
                                                                                        {item.cost && (
                                                                                            <span>💰 {formatCurrency(item.cost)}</span>
                                                                                        )}
                                                                                        {item.confirmation && (
                                                                                            <span>
                                                                                                🎫 Conf: {item.confirmation}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                    {item.notes && (
                                                                                        <p className="text-sm text-gray-600 italic mt-2 bg-gray-50 p-2 rounded">
                                                                                            {item.notes}
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                                <button
                                                                                    onClick={() => deleteItineraryItem(item.id)}
                                                                                    className="text-red-500 hover:text-red-700 text-sm transition-colors ml-4"
                                                                                    title="Delete"
                                                                                >
                                                                                    ✕
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center text-gray-500 py-12">
                                                        <p className="text-lg">No itinerary items yet.</p>
                                                        <p className="text-sm">
                                                            Add your first activity to start planning!
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Journal Tab */}
                                        {activeTab === 'journal' && (
                                            <div className="space-y-6">
                                                <div className="flex justify-end">
                                                    <button
                                                        onClick={() => setIsAddingEntry(true)}
                                                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md"
                                                    >
                                                        New Journal Entry
                                                    </button>
                                                </div>

                                                {/* Add Entry Form */}
                                                {isAddingEntry && (
                                                    <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg p-6 border border-blue-200">
                                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                                            New Journal Entry
                                                        </h3>
                                                        <div className="space-y-4">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                        Date*
                                                                    </label>
                                                                    <input
                                                                        type="date"
                                                                        value={newEntry.entry_date}
                                                                        onChange={(e) =>
                                                                            setNewEntry({
                                                                                ...newEntry,
                                                                                entry_date: e.target.value
                                                                            })
                                                                        }
                                                                        className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                        Title
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={newEntry.title}
                                                                        onChange={(e) =>
                                                                            setNewEntry({
                                                                                ...newEntry,
                                                                                title: e.target.value
                                                                            })
                                                                        }
                                                                        className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                        placeholder="Optional entry title"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Entry* (Markdown supported)
                                                                </label>
                                                                <textarea
                                                                    value={newEntry.content}
                                                                    onChange={(e) =>
                                                                        setNewEntry({
                                                                            ...newEntry,
                                                                            content: e.target.value
                                                                        })
                                                                    }
                                                                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                                                    rows={8}
                                                                    placeholder="What did you do today? What did you see? How did you feel?"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2 mt-4">
                                                            <button
                                                                onClick={addNewEntry}
                                                                disabled={!newEntry.content.trim()}
                                                                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
                                                            >
                                                                Save Entry
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setIsAddingEntry(false);
                                                                    setNewEntry({
                                                                        entry_date: new Date()
                                                                            .toISOString()
                                                                            .split('T')[0],
                                                                        title: '',
                                                                        content: ''
                                                                    });
                                                                }}
                                                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Journal Entries */}
                                                {tripJournal.length > 0 ? (
                                                    <div className="space-y-6">
                                                        {tripJournal.map(entry => (
                                                            <div
                                                                key={entry.id}
                                                                className="bg-white rounded-lg border border-blue-200 p-6 hover:shadow-lg transition-shadow"
                                                            >
                                                                <div className="flex items-start justify-between mb-4">
                                                                    <div className="flex-1">
                                                                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                                                                            {entry.title || 'Journal Entry'}
                                                                        </h3>
                                                                        <div className="text-sm text-gray-600">
                                                                            📅{' '}
                                                                            {new Date(entry.entry_date).toLocaleDateString(
                                                                                'en-US',
                                                                                {
                                                                                    weekday: 'long',
                                                                                    year: 'numeric',
                                                                                    month: 'long',
                                                                                    day: 'numeric'
                                                                                }
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => deleteEntry(entry.id)}
                                                                        className="text-red-500 hover:text-red-700 text-sm transition-colors"
                                                                        title="Delete"
                                                                    >
                                                                        ✕
                                                                    </button>
                                                                </div>
                                                                <div className="prose prose-blue max-w-none">
                                                                    <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
                                                                        {entry.content}
                                                                    </pre>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center text-gray-500 py-12">
                                                        <p className="text-lg">No journal entries yet.</p>
                                                        <p className="text-sm">
                                                            Start documenting your journey!
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
                                <div className="text-6xl mb-4">✈️</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No trip selected</h3>
                                <p className="text-gray-600 mb-6">
                                    Select a trip from the sidebar or create a new one
                                </p>
                                <button
                                    onClick={() => setIsAddingTrip(true)}
                                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-md font-medium"
                                >
                                    Plan Your First Trip
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Add Trip Modal */}
                {isAddingTrip && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Plan a New Trip</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Trip Name*
                                        </label>
                                        <input
                                            type="text"
                                            value={newTrip.name}
                                            onChange={(e) => setNewTrip({ ...newTrip, name: e.target.value })}
                                            className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            placeholder="e.g., Japan Adventure, NYC Weekend"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Location*
                                        </label>
                                        <input
                                            type="text"
                                            value={newTrip.location}
                                            onChange={(e) => setNewTrip({ ...newTrip, location: e.target.value })}
                                            className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            placeholder="City, Country or multiple locations"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Start Date*
                                            </label>
                                            <input
                                                type="date"
                                                value={newTrip.start_date}
                                                onChange={(e) =>
                                                    setNewTrip({ ...newTrip, start_date: e.target.value })
                                                }
                                                className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                End Date*
                                            </label>
                                            <input
                                                type="date"
                                                value={newTrip.end_date}
                                                onChange={(e) =>
                                                    setNewTrip({ ...newTrip, end_date: e.target.value })
                                                }
                                                className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tags (comma-separated)
                                        </label>
                                        <input
                                            type="text"
                                            value={newTrip.tags}
                                            onChange={(e) => setNewTrip({ ...newTrip, tags: e.target.value })}
                                            className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            placeholder="e.g., international, beach, adventure"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Budget ($)
                                        </label>
                                        <input
                                            type="number"
                                            value={newTrip.budget}
                                            onChange={(e) => setNewTrip({ ...newTrip, budget: e.target.value })}
                                            className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            placeholder="Optional"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                        <textarea
                                            value={newTrip.notes}
                                            onChange={(e) => setNewTrip({ ...newTrip, notes: e.target.value })}
                                            className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            rows={3}
                                            placeholder="Any additional details about your trip..."
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={addNewTrip}
                                        disabled={
                                            !newTrip.name.trim() || !newTrip.start_date || !newTrip.end_date
                                        }
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md font-medium"
                                    >
                                        Create Trip
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsAddingTrip(false);
                                            setNewTrip({
                                                name: '',
                                                location: '',
                                                start_date: '',
                                                end_date: '',
                                                tags: '',
                                                notes: '',
                                                budget: ''
                                            });
                                        }}
                                        className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 font-medium"
                                    >
                                        Cancel
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