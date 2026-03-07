"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plane,
  MapPin,
  Calendar,
  Plus,
  Trash2,
  Edit3,
  ChevronLeft,
  Package,
  DollarSign,
  FileText,
  BookOpen,
  Clock,
  Car,
  Hotel,
  Utensils,
  ListTodo,
  MoreHorizontal,
  CheckSquare,
  Square,
} from "lucide-react";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import type {
  Trip,
  TripStatus,
  ItineraryItem,
  ItineraryType,
  TripEntry,
  TripPackingItem,
  TripExpense,
  TripDocument,
} from "@/types/database.types";

const OWNER_ID = "e2b952a0-c81a-4ff0-b362-82f906e02094";

type TabId = "overview" | "itinerary" | "checklist" | "expenses" | "documents" | "journal";

const STATUS_COLORS: Record<TripStatus, string> = {
  planning: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  upcoming: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  active: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  completed: "text-gray-400 bg-gray-500/10 border-gray-500/20",
};

const TYPE_ICONS: Record<ItineraryType, typeof Plane> = {
  flight: Plane,
  accommodation: Hotel,
  activity: MapPin,
  transport: Car,
  dining: Utensils,
  todo: ListTodo,
  other: MoreHorizontal,
};

const TYPE_COLORS: Record<ItineraryType, string> = {
  flight: "text-blue-400 bg-blue-500/10",
  accommodation: "text-purple-400 bg-purple-500/10",
  activity: "text-emerald-400 bg-emerald-500/10",
  transport: "text-orange-400 bg-orange-500/10",
  dining: "text-red-400 bg-red-500/10",
  todo: "text-yellow-400 bg-yellow-500/10",
  other: "text-gray-400 bg-gray-500/10",
};

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatCents(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

export default function TravelPage() {
  // Trip list state
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  // Trip detail data
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);
  const [packingItems, setPackingItems] = useState<TripPackingItem[]>([]);
  const [expenses, setExpenses] = useState<TripExpense[]>([]);
  const [documents, setDocuments] = useState<TripDocument[]>([]);
  const [entries, setEntries] = useState<TripEntry[]>([]);

  // Form states
  const [isAddingTrip, setIsAddingTrip] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: string;
    id: string;
    name: string;
  } | null>(null);

  // Add forms
  const [showAddItinerary, setShowAddItinerary] = useState(false);
  const [showAddPacking, setShowAddPacking] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddDocument, setShowAddDocument] = useState(false);
  const [showAddEntry, setShowAddEntry] = useState(false);

  // New trip form
  const [tripForm, setTripForm] = useState({
    name: "",
    destination: "",
    start_date: "",
    end_date: "",
    status: "planning" as TripStatus,
    notes: "",
  });

  // New itinerary form
  const [itineraryForm, setItineraryForm] = useState({
    at: "",
    type: "activity" as ItineraryType,
    title: "",
    details: "",
  });

  // New packing form
  const [packingForm, setPackingForm] = useState({
    item: "",
    qty: 1,
    category: "",
  });

  // New expense form
  const [expenseForm, setExpenseForm] = useState({
    description: "",
    amount: "",
    currency: "USD",
    category: "",
    expense_date: "",
    notes: "",
  });

  // New document form
  const [documentForm, setDocumentForm] = useState({
    name: "",
    url: "",
    doc_type: "other",
    notes: "",
  });

  // New entry form
  const [entryForm, setEntryForm] = useState({
    entry_date: "",
    content_md: "",
  });

  // Fetch trips
  const fetchTrips = useCallback(async () => {
    try {
      const res = await fetch("/api/travel/trips");
      if (res.ok) {
        const data = await res.json();
        setTrips(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  // Fetch trip detail data
  const fetchTripData = useCallback(async (tripId: string) => {
    const endpoints = ["itinerary", "packing", "expenses", "documents", "entries"];
    const results = await Promise.allSettled(
      endpoints.map((e) => fetch(`/api/travel/trips/${tripId}/${e}`).then((r) => r.json())),
    );

    if (results[0].status === "fulfilled") setItinerary(results[0].value);
    if (results[1].status === "fulfilled") setPackingItems(results[1].value);
    if (results[2].status === "fulfilled") setExpenses(results[2].value);
    if (results[3].status === "fulfilled") setDocuments(results[3].value);
    if (results[4].status === "fulfilled") setEntries(results[4].value);
  }, []);

  const selectTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    setActiveTab("overview");
    fetchTripData(trip.id);
  };

  const goBack = () => {
    setSelectedTrip(null);
    setActiveTab("overview");
    setItinerary([]);
    setPackingItems([]);
    setExpenses([]);
    setDocuments([]);
    setEntries([]);
  };

  // CRUD: Trip
  const createTrip = async () => {
    if (!tripForm.name.trim() || !tripForm.start_date || !tripForm.end_date) return;
    const res = await fetch("/api/travel/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        owner_id: OWNER_ID,
        name: tripForm.name.trim(),
        destination: tripForm.destination.trim() || null,
        start_date: tripForm.start_date,
        end_date: tripForm.end_date,
        status: tripForm.status,
        notes: tripForm.notes.trim() || null,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setTrips([data, ...trips]);
      setTripForm({ name: "", destination: "", start_date: "", end_date: "", status: "planning", notes: "" });
      setIsAddingTrip(false);
    }
  };

  const updateTrip = async () => {
    if (!editingTrip) return;
    const res = await fetch(`/api/travel/trips/${editingTrip.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: tripForm.name.trim(),
        destination: tripForm.destination.trim() || null,
        start_date: tripForm.start_date,
        end_date: tripForm.end_date,
        status: tripForm.status,
        notes: tripForm.notes.trim() || null,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setTrips(trips.map((t) => (t.id === data.id ? data : t)));
      if (selectedTrip?.id === data.id) setSelectedTrip(data);
      setEditingTrip(null);
      setTripForm({ name: "", destination: "", start_date: "", end_date: "", status: "planning", notes: "" });
    }
  };

  const startEditTrip = (trip: Trip) => {
    setEditingTrip(trip);
    setTripForm({
      name: trip.name,
      destination: trip.destination || "",
      start_date: trip.start_date,
      end_date: trip.end_date,
      status: trip.status,
      notes: trip.notes || "",
    });
    setIsAddingTrip(true);
  };

  // CRUD: Itinerary
  const createItinerary = async () => {
    if (!selectedTrip || !itineraryForm.at || !itineraryForm.title.trim()) return;
    const res = await fetch(`/api/travel/trips/${selectedTrip.id}/itinerary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        owner_id: OWNER_ID,
        trip_id: selectedTrip.id,
        at: itineraryForm.at,
        type: itineraryForm.type,
        title: itineraryForm.title.trim(),
        details: itineraryForm.details.trim() ? { note: itineraryForm.details.trim() } : null,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setItinerary([...itinerary, data]);
      setItineraryForm({ at: "", type: "activity", title: "", details: "" });
      setShowAddItinerary(false);
    }
  };

  // CRUD: Packing
  const createPacking = async () => {
    if (!selectedTrip || !packingForm.item.trim()) return;
    const res = await fetch(`/api/travel/trips/${selectedTrip.id}/packing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        owner_id: OWNER_ID,
        trip_id: selectedTrip.id,
        item: packingForm.item.trim(),
        qty: packingForm.qty,
        packed: false,
        category: packingForm.category.trim() || null,
        sort_order: packingItems.length,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setPackingItems([...packingItems, data]);
      setPackingForm({ item: "", qty: 1, category: "" });
      setShowAddPacking(false);
    }
  };

  const togglePacked = async (item: TripPackingItem) => {
    const res = await fetch(`/api/travel/packing/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packed: !item.packed }),
    });
    if (res.ok) {
      const data = await res.json();
      setPackingItems(packingItems.map((p) => (p.id === data.id ? data : p)));
    }
  };

  // CRUD: Expense
  const createExpense = async () => {
    if (!selectedTrip || !expenseForm.description.trim() || !expenseForm.amount || !expenseForm.expense_date) return;
    const amountCents = Math.round(parseFloat(expenseForm.amount) * 100);
    const res = await fetch(`/api/travel/trips/${selectedTrip.id}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        owner_id: OWNER_ID,
        trip_id: selectedTrip.id,
        description: expenseForm.description.trim(),
        amount_cents: amountCents,
        currency: expenseForm.currency,
        category: expenseForm.category.trim() || null,
        expense_date: expenseForm.expense_date,
        notes: expenseForm.notes.trim() || null,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setExpenses([...expenses, data]);
      setExpenseForm({ description: "", amount: "", currency: "USD", category: "", expense_date: "", notes: "" });
      setShowAddExpense(false);
    }
  };

  // CRUD: Document
  const createDocument = async () => {
    if (!selectedTrip || !documentForm.name.trim()) return;
    const res = await fetch(`/api/travel/trips/${selectedTrip.id}/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        owner_id: OWNER_ID,
        trip_id: selectedTrip.id,
        name: documentForm.name.trim(),
        url: documentForm.url.trim() || null,
        doc_type: documentForm.doc_type,
        notes: documentForm.notes.trim() || null,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setDocuments([...documents, data]);
      setDocumentForm({ name: "", url: "", doc_type: "other", notes: "" });
      setShowAddDocument(false);
    }
  };

  // CRUD: Entry
  const createEntry = async () => {
    if (!selectedTrip || !entryForm.entry_date || !entryForm.content_md.trim()) return;
    const res = await fetch(`/api/travel/trips/${selectedTrip.id}/entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        owner_id: OWNER_ID,
        trip_id: selectedTrip.id,
        entry_date: entryForm.entry_date,
        content_md: entryForm.content_md.trim(),
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setEntries([data, ...entries]);
      setEntryForm({ entry_date: "", content_md: "" });
      setShowAddEntry(false);
    }
  };

  // Generic delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { type, id } = deleteTarget;
    let url = "";
    if (type === "trip") url = `/api/travel/trips/${id}`;
    else if (type === "itinerary") url = `/api/travel/itinerary/${id}`;
    else if (type === "packing") url = `/api/travel/packing/${id}`;
    else if (type === "expense") url = `/api/travel/expenses/${id}`;
    else if (type === "document") url = `/api/travel/documents/${id}`;
    else if (type === "entry") url = `/api/travel/entries/${id}`;

    const res = await fetch(url, { method: "DELETE" });
    if (res.ok) {
      if (type === "trip") {
        setTrips(trips.filter((t) => t.id !== id));
        if (selectedTrip?.id === id) goBack();
      } else if (type === "itinerary") setItinerary(itinerary.filter((i) => i.id !== id));
      else if (type === "packing") setPackingItems(packingItems.filter((p) => p.id !== id));
      else if (type === "expense") setExpenses(expenses.filter((e) => e.id !== id));
      else if (type === "document") setDocuments(documents.filter((d) => d.id !== id));
      else if (type === "entry") setEntries(entries.filter((e) => e.id !== id));
    }
    setDeleteTarget(null);
  };

  // Computed values
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount_cents, 0);
  const packedCount = packingItems.filter((p) => p.packed).length;
  const packingTotal = packingItems.length;
  const packingPercent = packingTotal > 0 ? Math.round((packedCount / packingTotal) * 100) : 0;

  // Group packing items by category
  const packingByCategory = packingItems.reduce(
    (acc, item) => {
      const cat = item.category || "Uncategorized";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    },
    {} as Record<string, TripPackingItem[]>,
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="text-gray-400">Loading trips...</div>
      </div>
    );
  }

  // Trip Detail View
  if (selectedTrip) {
    const tabs: { id: TabId; label: string; icon: typeof Plane }[] = [
      { id: "overview", label: "Overview", icon: MapPin },
      { id: "itinerary", label: "Itinerary", icon: Clock },
      { id: "checklist", label: "Checklist", icon: Package },
      { id: "expenses", label: "Expenses", icon: DollarSign },
      { id: "documents", label: "Documents", icon: FileText },
      { id: "journal", label: "Journal", icon: BookOpen },
    ];

    return (
      <div className="min-h-screen bg-gray-950 p-4 md:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Trip Header */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <div className="mb-4 flex items-center gap-3">
              <button onClick={goBack} className="text-gray-400 transition-colors hover:text-white">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-white">{selectedTrip.name}</h1>
                  <span
                    className={`rounded-lg border px-3 py-1 text-xs font-medium ${STATUS_COLORS[selectedTrip.status]}`}
                  >
                    {selectedTrip.status.charAt(0).toUpperCase() + selectedTrip.status.slice(1)}
                  </span>
                </div>
                {selectedTrip.destination && (
                  <p className="mt-1 text-sm text-gray-400">
                    <MapPin className="mr-1 inline h-3.5 w-3.5" />
                    {selectedTrip.destination}
                  </p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  <Calendar className="mr-1 inline h-3.5 w-3.5" />
                  {formatDate(selectedTrip.start_date)} - {formatDate(selectedTrip.end_date)}
                </p>
              </div>
              <button
                onClick={() => startEditTrip(selectedTrip)}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
              >
                <Edit3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setDeleteTarget({ type: "trip", id: selectedTrip.id, name: selectedTrip.name })}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="-mx-6 -mb-6 flex overflow-x-auto border-t border-gray-800">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? "border-b-2 border-emerald-400 bg-emerald-500/10 text-emerald-400"
                        : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-300"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
                  <p className="text-xs text-gray-500">Itinerary Items</p>
                  <p className="mt-1 text-2xl font-bold text-white">{itinerary.length}</p>
                </div>
                <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
                  <p className="text-xs text-gray-500">Packing Progress</p>
                  <p className="mt-1 text-2xl font-bold text-white">{packingPercent}%</p>
                  <div className="mt-1 h-1.5 rounded-full bg-gray-800">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${packingPercent}%` }}
                    />
                  </div>
                </div>
                <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
                  <p className="text-xs text-gray-500">Total Expenses</p>
                  <p className="mt-1 text-2xl font-bold text-white">{formatCents(totalExpenses)}</p>
                </div>
                <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
                  <p className="text-xs text-gray-500">Journal Entries</p>
                  <p className="mt-1 text-2xl font-bold text-white">{entries.length}</p>
                </div>
              </div>

              {/* Notes */}
              {selectedTrip.notes && (
                <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
                  <h3 className="mb-2 text-sm font-medium text-gray-400">Notes</h3>
                  <p className="whitespace-pre-wrap text-gray-300">{selectedTrip.notes}</p>
                </div>
              )}

              {/* Upcoming Itinerary */}
              {itinerary.length > 0 && (
                <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
                  <h3 className="mb-4 text-sm font-medium text-gray-400">Upcoming Itinerary</h3>
                  <div className="space-y-3">
                    {itinerary
                      .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
                      .slice(0, 5)
                      .map((item) => {
                        const Icon = TYPE_ICONS[item.type];
                        return (
                          <div key={item.id} className="flex items-center gap-3">
                            <div className={`rounded-lg p-2 ${TYPE_COLORS[item.type]}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-white">{item.title}</p>
                              <p className="text-xs text-gray-500">{formatDateTime(item.at)}</p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Itinerary Tab */}
          {activeTab === "itinerary" && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowAddItinerary(true)}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-sm text-white shadow-md transition-all duration-200 hover:from-emerald-600 hover:to-emerald-700"
                >
                  <Plus className="h-4 w-4" /> Add Item
                </button>
              </div>

              {showAddItinerary && (
                <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
                  <h3 className="mb-4 text-lg font-semibold text-white">Add Itinerary Item</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-300">Date & Time*</label>
                        <input
                          type="datetime-local"
                          value={itineraryForm.at}
                          onChange={(e) => setItineraryForm({ ...itineraryForm, at: e.target.value })}
                          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-300">Type*</label>
                        <select
                          value={itineraryForm.type}
                          onChange={(e) =>
                            setItineraryForm({ ...itineraryForm, type: e.target.value as ItineraryType })
                          }
                          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        >
                          <option value="activity">Activity</option>
                          <option value="flight">Flight</option>
                          <option value="accommodation">Accommodation</option>
                          <option value="transport">Transport</option>
                          <option value="dining">Dining</option>
                          <option value="todo">To-Do</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-300">Title*</label>
                      <input
                        type="text"
                        value={itineraryForm.title}
                        onChange={(e) => setItineraryForm({ ...itineraryForm, title: e.target.value })}
                        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        placeholder="e.g., Drive to Dallas"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-300">Details (optional note)</label>
                      <textarea
                        value={itineraryForm.details}
                        onChange={(e) => setItineraryForm({ ...itineraryForm, details: e.target.value })}
                        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        rows={2}
                        placeholder="Additional details..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={createItinerary}
                        disabled={!itineraryForm.at || !itineraryForm.title.trim()}
                        className="rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-white shadow-md transition-all duration-200 hover:from-emerald-600 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setShowAddItinerary(false);
                          setItineraryForm({ at: "", type: "activity", title: "", details: "" });
                        }}
                        className="rounded-lg bg-gray-700 px-4 py-2 text-white transition-all duration-200 hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="space-y-3">
                {itinerary
                  .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
                  .map((item) => {
                    const Icon = TYPE_ICONS[item.type];
                    const details =
                      item.details && typeof item.details === "object"
                        ? (item.details as Record<string, unknown>)
                        : null;
                    const noteText = details?.note as string | undefined;
                    return (
                      <div
                        key={item.id}
                        className="flex items-start gap-4 rounded-xl border border-gray-800 bg-gray-900 p-5 transition-all duration-200 hover:border-emerald-500/30"
                      >
                        <div className={`rounded-lg p-2.5 ${TYPE_COLORS[item.type]}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-white">{item.title}</h4>
                              <p className="text-sm text-gray-500">{formatDateTime(item.at)}</p>
                            </div>
                            <button
                              onClick={() =>
                                setDeleteTarget({
                                  type: "itinerary",
                                  id: item.id,
                                  name: item.title || "this item",
                                })
                              }
                              className="text-gray-600 transition-colors hover:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          {noteText && <p className="mt-1 text-sm text-gray-400">{noteText}</p>}
                        </div>
                      </div>
                    );
                  })}

                {itinerary.length === 0 && (
                  <div className="rounded-xl border border-gray-800 bg-gray-900 py-12 text-center text-gray-500">
                    <Clock className="mx-auto mb-2 h-8 w-8" />
                    <p>No itinerary items yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Checklist Tab */}
          {activeTab === "checklist" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">
                  {packedCount} of {packingTotal} packed ({packingPercent}%)
                </p>
                <button
                  onClick={() => setShowAddPacking(true)}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-sm text-white shadow-md transition-all duration-200 hover:from-emerald-600 hover:to-emerald-700"
                >
                  <Plus className="h-4 w-4" /> Add Item
                </button>
              </div>

              {/* Progress bar */}
              <div className="h-2 rounded-full bg-gray-800">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${packingPercent}%` }}
                />
              </div>

              {showAddPacking && (
                <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
                  <h3 className="mb-4 text-lg font-semibold text-white">Add Packing Item</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2">
                        <label className="mb-1 block text-sm font-medium text-gray-300">Item*</label>
                        <input
                          type="text"
                          value={packingForm.item}
                          onChange={(e) => setPackingForm({ ...packingForm, item: e.target.value })}
                          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          placeholder="e.g., Passport"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-300">Qty</label>
                        <input
                          type="number"
                          min={1}
                          value={packingForm.qty}
                          onChange={(e) => setPackingForm({ ...packingForm, qty: parseInt(e.target.value) || 1 })}
                          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-300">Category</label>
                      <input
                        type="text"
                        value={packingForm.category}
                        onChange={(e) => setPackingForm({ ...packingForm, category: e.target.value })}
                        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        placeholder="e.g., Clothing, Electronics, Toiletries"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={createPacking}
                        disabled={!packingForm.item.trim()}
                        className="rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-white shadow-md transition-all duration-200 hover:from-emerald-600 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setShowAddPacking(false);
                          setPackingForm({ item: "", qty: 1, category: "" });
                        }}
                        className="rounded-lg bg-gray-700 px-4 py-2 text-white transition-all duration-200 hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Packing items grouped by category */}
              {Object.entries(packingByCategory)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([category, items]) => (
                  <div key={category} className="rounded-xl border border-gray-800 bg-gray-900 p-4">
                    <h4 className="mb-3 text-sm font-medium text-gray-400">{category}</h4>
                    <div className="space-y-1">
                      {items
                        .sort((a, b) => a.sort_order - b.sort_order)
                        .map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-gray-800/50"
                          >
                            <button onClick={() => togglePacked(item)} className="flex-shrink-0">
                              {item.packed ? (
                                <CheckSquare className="h-5 w-5 text-emerald-400" />
                              ) : (
                                <Square className="h-5 w-5 text-gray-600" />
                              )}
                            </button>
                            <span
                              className={`flex-1 text-sm ${item.packed ? "text-gray-500 line-through" : "text-white"}`}
                            >
                              {item.item}
                              {item.qty && item.qty > 1 && (
                                <span className="ml-1 text-gray-500">x{item.qty}</span>
                              )}
                            </span>
                            <button
                              onClick={() => setDeleteTarget({ type: "packing", id: item.id, name: item.item })}
                              className="text-gray-600 transition-colors hover:text-red-400"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}

              {packingItems.length === 0 && (
                <div className="rounded-xl border border-gray-800 bg-gray-900 py-12 text-center text-gray-500">
                  <Package className="mx-auto mb-2 h-8 w-8" />
                  <p>No packing items yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Expenses Tab */}
          {activeTab === "expenses" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">{formatCents(totalExpenses)}</p>
                  <p className="text-sm text-gray-500">{expenses.length} expenses</p>
                </div>
                <button
                  onClick={() => setShowAddExpense(true)}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-sm text-white shadow-md transition-all duration-200 hover:from-emerald-600 hover:to-emerald-700"
                >
                  <Plus className="h-4 w-4" /> Add Expense
                </button>
              </div>

              {showAddExpense && (
                <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
                  <h3 className="mb-4 text-lg font-semibold text-white">Add Expense</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2">
                        <label className="mb-1 block text-sm font-medium text-gray-300">Description*</label>
                        <input
                          type="text"
                          value={expenseForm.description}
                          onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          placeholder="e.g., Gas fill-up"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-300">Date*</label>
                        <input
                          type="date"
                          value={expenseForm.expense_date}
                          onChange={(e) => setExpenseForm({ ...expenseForm, expense_date: e.target.value })}
                          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-300">Amount ($)*</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={expenseForm.amount}
                          onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-300">Currency</label>
                        <select
                          value={expenseForm.currency}
                          onChange={(e) => setExpenseForm({ ...expenseForm, currency: e.target.value })}
                          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        >
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                          <option value="JPY">JPY</option>
                          <option value="MXN">MXN</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-300">Category</label>
                        <input
                          type="text"
                          value={expenseForm.category}
                          onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          placeholder="e.g., Gas, Food, Lodging"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-300">Notes</label>
                      <textarea
                        value={expenseForm.notes}
                        onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        rows={2}
                        placeholder="Optional notes..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={createExpense}
                        disabled={
                          !expenseForm.description.trim() || !expenseForm.amount || !expenseForm.expense_date
                        }
                        className="rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-white shadow-md transition-all duration-200 hover:from-emerald-600 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setShowAddExpense(false);
                          setExpenseForm({
                            description: "",
                            amount: "",
                            currency: "USD",
                            category: "",
                            expense_date: "",
                            notes: "",
                          });
                        }}
                        className="rounded-lg bg-gray-700 px-4 py-2 text-white transition-all duration-200 hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Expense list */}
              <div className="space-y-2">
                {expenses
                  .sort((a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime())
                  .map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900 p-4 transition-all hover:border-emerald-500/30"
                    >
                      <div className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-400">
                        <DollarSign className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-white">{expense.description}</p>
                            <p className="text-xs text-gray-500">
                              {formatDate(expense.expense_date)}
                              {expense.category && ` · ${expense.category}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="font-semibold text-white">
                              {formatCents(expense.amount_cents, expense.currency)}
                            </p>
                            <button
                              onClick={() =>
                                setDeleteTarget({
                                  type: "expense",
                                  id: expense.id,
                                  name: expense.description,
                                })
                              }
                              className="text-gray-600 transition-colors hover:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        {expense.notes && <p className="mt-1 text-xs text-gray-500">{expense.notes}</p>}
                      </div>
                    </div>
                  ))}

                {expenses.length === 0 && (
                  <div className="rounded-xl border border-gray-800 bg-gray-900 py-12 text-center text-gray-500">
                    <DollarSign className="mx-auto mb-2 h-8 w-8" />
                    <p>No expenses logged yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === "documents" && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowAddDocument(true)}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-sm text-white shadow-md transition-all duration-200 hover:from-emerald-600 hover:to-emerald-700"
                >
                  <Plus className="h-4 w-4" /> Add Document
                </button>
              </div>

              {showAddDocument && (
                <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
                  <h3 className="mb-4 text-lg font-semibold text-white">Add Document</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-300">Name*</label>
                        <input
                          type="text"
                          value={documentForm.name}
                          onChange={(e) => setDocumentForm({ ...documentForm, name: e.target.value })}
                          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          placeholder="e.g., Lease Agreement"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-300">Type</label>
                        <select
                          value={documentForm.doc_type}
                          onChange={(e) => setDocumentForm({ ...documentForm, doc_type: e.target.value })}
                          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        >
                          <option value="confirmation">Confirmation</option>
                          <option value="reservation">Reservation</option>
                          <option value="ticket">Ticket</option>
                          <option value="insurance">Insurance</option>
                          <option value="visa">Visa</option>
                          <option value="receipt">Receipt</option>
                          <option value="map">Map</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-300">URL</label>
                      <input
                        type="url"
                        value={documentForm.url}
                        onChange={(e) => setDocumentForm({ ...documentForm, url: e.target.value })}
                        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-300">Notes</label>
                      <textarea
                        value={documentForm.notes}
                        onChange={(e) => setDocumentForm({ ...documentForm, notes: e.target.value })}
                        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        rows={2}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={createDocument}
                        disabled={!documentForm.name.trim()}
                        className="rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-white shadow-md transition-all duration-200 hover:from-emerald-600 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setShowAddDocument(false);
                          setDocumentForm({ name: "", url: "", doc_type: "other", notes: "" });
                        }}
                        className="rounded-lg bg-gray-700 px-4 py-2 text-white transition-all duration-200 hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Document list */}
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900 p-4 transition-all hover:border-emerald-500/30"
                  >
                    <div className="rounded-lg bg-blue-500/10 p-2.5 text-blue-400">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-white">
                            {doc.url ? (
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-emerald-400 hover:underline"
                              >
                                {doc.name}
                              </a>
                            ) : (
                              doc.name
                            )}
                          </p>
                          <p className="text-xs text-gray-500">
                            {doc.doc_type.charAt(0).toUpperCase() + doc.doc_type.slice(1)}
                          </p>
                        </div>
                        <button
                          onClick={() => setDeleteTarget({ type: "document", id: doc.id, name: doc.name })}
                          className="text-gray-600 transition-colors hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      {doc.notes && <p className="mt-1 text-xs text-gray-500">{doc.notes}</p>}
                    </div>
                  </div>
                ))}

                {documents.length === 0 && (
                  <div className="rounded-xl border border-gray-800 bg-gray-900 py-12 text-center text-gray-500">
                    <FileText className="mx-auto mb-2 h-8 w-8" />
                    <p>No documents yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Journal Tab */}
          {activeTab === "journal" && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowAddEntry(true)}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-violet-600 px-4 py-2 text-sm text-white shadow-md transition-all duration-200 hover:from-violet-600 hover:to-violet-700"
                >
                  <Plus className="h-4 w-4" /> Add Entry
                </button>
              </div>

              {showAddEntry && (
                <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
                  <h3 className="mb-4 text-lg font-semibold text-white">Add Journal Entry</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-300">Date*</label>
                      <input
                        type="date"
                        value={entryForm.entry_date}
                        onChange={(e) => setEntryForm({ ...entryForm, entry_date: e.target.value })}
                        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-300">Entry* (Markdown)</label>
                      <textarea
                        value={entryForm.content_md}
                        onChange={(e) => setEntryForm({ ...entryForm, content_md: e.target.value })}
                        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 font-mono text-sm text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
                        rows={8}
                        placeholder="Write about your day..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={createEntry}
                        disabled={!entryForm.entry_date || !entryForm.content_md.trim()}
                        className="rounded-lg bg-gradient-to-r from-violet-500 to-violet-600 px-4 py-2 text-white shadow-md transition-all duration-200 hover:from-violet-600 hover:to-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setShowAddEntry(false);
                          setEntryForm({ entry_date: "", content_md: "" });
                        }}
                        className="rounded-lg bg-gray-700 px-4 py-2 text-white transition-all duration-200 hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Journal entries */}
              <div className="space-y-4">
                {entries
                  .sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime())
                  .map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-xl border border-gray-800 bg-gray-900 p-6 transition-all hover:border-violet-500/30"
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <h4 className="text-lg font-semibold text-white">{formatDate(entry.entry_date)}</h4>
                        <button
                          onClick={() =>
                            setDeleteTarget({
                              type: "entry",
                              id: entry.id,
                              name: `entry from ${formatDate(entry.entry_date)}`,
                            })
                          }
                          className="text-gray-600 transition-colors hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="whitespace-pre-wrap text-gray-300">{entry.content_md}</p>
                    </div>
                  ))}

                {entries.length === 0 && (
                  <div className="rounded-xl border border-gray-800 bg-gray-900 py-12 text-center text-gray-500">
                    <BookOpen className="mx-auto mb-2 h-8 w-8" />
                    <p>No journal entries yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation */}
        <DeleteConfirmationModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          itemName={deleteTarget?.name || ""}
        />

        {/* Trip Add/Edit Modal */}
        {isAddingTrip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-lg rounded-xl border border-gray-800 bg-gray-900 p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">
                {editingTrip ? "Edit Trip" : "Add New Trip"}
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-300">Trip Name*</label>
                    <input
                      type="text"
                      value={tripForm.name}
                      onChange={(e) => setTripForm({ ...tripForm, name: e.target.value })}
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="e.g., Move to Dallas"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-300">Destination</label>
                    <input
                      type="text"
                      value={tripForm.destination}
                      onChange={(e) => setTripForm({ ...tripForm, destination: e.target.value })}
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="e.g., Dallas, TX"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-300">Start Date*</label>
                    <input
                      type="date"
                      value={tripForm.start_date}
                      onChange={(e) => setTripForm({ ...tripForm, start_date: e.target.value })}
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-300">End Date*</label>
                    <input
                      type="date"
                      value={tripForm.end_date}
                      onChange={(e) => setTripForm({ ...tripForm, end_date: e.target.value })}
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-300">Status</label>
                    <select
                      value={tripForm.status}
                      onChange={(e) => setTripForm({ ...tripForm, status: e.target.value as TripStatus })}
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="planning">Planning</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-300">Notes</label>
                  <textarea
                    value={tripForm.notes}
                    onChange={(e) => setTripForm({ ...tripForm, notes: e.target.value })}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    rows={2}
                    placeholder="Optional notes"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={editingTrip ? updateTrip : createTrip}
                    disabled={!tripForm.name.trim() || !tripForm.start_date || !tripForm.end_date}
                    className="rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-white shadow-md transition-all duration-200 hover:from-emerald-600 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {editingTrip ? "Save" : "Add Trip"}
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingTrip(false);
                      setEditingTrip(null);
                      setTripForm({
                        name: "",
                        destination: "",
                        start_date: "",
                        end_date: "",
                        status: "planning",
                        notes: "",
                      });
                    }}
                    className="rounded-lg bg-gray-700 px-4 py-2 text-white transition-all duration-200 hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Trip List View
  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Travel</h1>
              <p className="text-gray-400">Plan trips, organize itineraries, and journal your adventures</p>
            </div>
            <button
              onClick={() => setIsAddingTrip(true)}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-white shadow-md transition-all duration-200 hover:from-emerald-600 hover:to-emerald-700"
            >
              <Plus className="h-4 w-4" /> Add Trip
            </button>
          </div>
        </div>

        {/* Trips Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {trips.map((trip) => (
            <div
              key={trip.id}
              onClick={() => selectTrip(trip)}
              className="cursor-pointer rounded-xl border border-gray-800 bg-gray-900 p-6 transition-all duration-200 hover:border-emerald-500/30"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white">{trip.name}</h3>
                  {trip.destination && (
                    <p className="mt-1 text-sm text-gray-400">
                      <MapPin className="mr-1 inline h-3.5 w-3.5" />
                      {trip.destination}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditTrip(trip);
                    }}
                    className="text-gray-500 transition-colors hover:text-white"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget({ type: "trip", id: trip.id, name: trip.name });
                    }}
                    className="text-gray-500 transition-colors hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <span className={`inline-block rounded-lg border px-3 py-1 text-xs font-medium ${STATUS_COLORS[trip.status]}`}>
                {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
              </span>

              <p className="mt-3 text-sm text-gray-400">
                <Calendar className="mr-1 inline h-3.5 w-3.5" />
                {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
              </p>

              {trip.notes && <p className="mt-2 text-sm text-gray-500 italic">{trip.notes}</p>}
            </div>
          ))}
        </div>

        {trips.length === 0 && (
          <div className="rounded-xl border border-gray-800 bg-gray-900 py-12 text-center text-gray-500">
            <Plane className="mx-auto mb-2 h-8 w-8" />
            <p className="text-lg">No trips yet.</p>
            <p className="text-sm">Add your first trip to start planning!</p>
          </div>
        )}
      </div>

      {/* Trip Add/Edit Modal (also accessible from list view) */}
      {isAddingTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-xl border border-gray-800 bg-gray-900 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">
              {editingTrip ? "Edit Trip" : "Add New Trip"}
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-300">Trip Name*</label>
                  <input
                    type="text"
                    value={tripForm.name}
                    onChange={(e) => setTripForm({ ...tripForm, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="e.g., Move to Dallas"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-300">Destination</label>
                  <input
                    type="text"
                    value={tripForm.destination}
                    onChange={(e) => setTripForm({ ...tripForm, destination: e.target.value })}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="e.g., Dallas, TX"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-300">Start Date*</label>
                  <input
                    type="date"
                    value={tripForm.start_date}
                    onChange={(e) => setTripForm({ ...tripForm, start_date: e.target.value })}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-300">End Date*</label>
                  <input
                    type="date"
                    value={tripForm.end_date}
                    onChange={(e) => setTripForm({ ...tripForm, end_date: e.target.value })}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-300">Status</label>
                  <select
                    value={tripForm.status}
                    onChange={(e) => setTripForm({ ...tripForm, status: e.target.value as TripStatus })}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="planning">Planning</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Notes</label>
                <textarea
                  value={tripForm.notes}
                  onChange={(e) => setTripForm({ ...tripForm, notes: e.target.value })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  rows={2}
                  placeholder="Optional notes"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={editingTrip ? updateTrip : createTrip}
                  disabled={!tripForm.name.trim() || !tripForm.start_date || !tripForm.end_date}
                  className="rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-white shadow-md transition-all duration-200 hover:from-emerald-600 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {editingTrip ? "Save" : "Add Trip"}
                </button>
                <button
                  onClick={() => {
                    setIsAddingTrip(false);
                    setEditingTrip(null);
                    setTripForm({
                      name: "",
                      destination: "",
                      start_date: "",
                      end_date: "",
                      status: "planning",
                      notes: "",
                    });
                  }}
                  className="rounded-lg bg-gray-700 px-4 py-2 text-white transition-all duration-200 hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <DeleteConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        itemName={deleteTarget?.name || ""}
      />
    </div>
  );
}
