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
} from "lucide-react";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import TripModal from "./modals/TripModal";
import type {
  Trip,
  ItineraryItem,
  TripEntry,
  TripPackingItem,
  TripExpense,
  TripDocument,
} from "@/types/travel.types";
import { STATUS_COLORS, formatDate } from "./components/shared";
import OverviewTab from "./components/OverviewTab";
import ItineraryTab from "./components/ItineraryTab";
import ChecklistTab from "./components/ChecklistTab";
import ExpensesTab from "./components/ExpensesTab";
import DocumentsTab from "./components/DocumentsTab";
import JournalTab from "./components/JournalTab";

type TabId = "overview" | "itinerary" | "checklist" | "expenses" | "documents" | "journal";

const TABS: { id: TabId; label: string; icon: typeof Plane }[] = [
  { id: "overview", label: "Overview", icon: MapPin },
  { id: "itinerary", label: "Itinerary", icon: Clock },
  { id: "checklist", label: "Checklist", icon: Package },
  { id: "expenses", label: "Expenses", icon: DollarSign },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "journal", label: "Journal", icon: BookOpen },
];

export default function TravelPage() {
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

  // Fetch trips
  const fetchTrips = useCallback(async () => {
    try {
      const res = await fetch("/api/travel/trips");
      if (res.ok) setTrips(await res.json());
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

  // Generic delete handler (used by all tabs via onDelete prop)
  const requestDelete = (type: string, id: string, name: string) => {
    setDeleteTarget({ type, id, name });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { type, id } = deleteTarget;
    const urlMap: Record<string, string> = {
      trip: `/api/travel/trips/${id}`,
      itinerary: `/api/travel/itinerary/${id}`,
      packing: `/api/travel/packing/${id}`,
      expense: `/api/travel/expenses/${id}`,
      document: `/api/travel/documents/${id}`,
      entry: `/api/travel/entries/${id}`,
    };

    const res = await fetch(urlMap[type], { method: "DELETE" });
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="text-gray-400">Loading trips...</div>
      </div>
    );
  }

  // Trip Detail View
  if (selectedTrip) {
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
                onClick={() => { setEditingTrip(selectedTrip); setIsAddingTrip(true); }}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
              >
                <Edit3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => requestDelete("trip", selectedTrip.id, selectedTrip.name)}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="-mx-6 -mb-6 flex overflow-x-auto border-t border-gray-800">
              {TABS.map((tab) => {
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

          {/* Tab Content */}
          {activeTab === "overview" && (
            <OverviewTab
              trip={selectedTrip}
              itinerary={itinerary}
              packingItems={packingItems}
              expenses={expenses}
              entries={entries}
            />
          )}
          {activeTab === "itinerary" && (
            <ItineraryTab
              tripId={selectedTrip.id}
              itinerary={itinerary}
              setItinerary={setItinerary}
              onDelete={requestDelete}
            />
          )}
          {activeTab === "checklist" && (
            <ChecklistTab
              tripId={selectedTrip.id}
              packingItems={packingItems}
              setPackingItems={setPackingItems}
              onDelete={requestDelete}
            />
          )}
          {activeTab === "expenses" && (
            <ExpensesTab
              tripId={selectedTrip.id}
              expenses={expenses}
              setExpenses={setExpenses}
              onDelete={requestDelete}
            />
          )}
          {activeTab === "documents" && (
            <DocumentsTab
              tripId={selectedTrip.id}
              documents={documents}
              setDocuments={setDocuments}
              onDelete={requestDelete}
            />
          )}
          {activeTab === "journal" && (
            <JournalTab
              tripId={selectedTrip.id}
              entries={entries}
              setEntries={setEntries}
              onDelete={requestDelete}
            />
          )}
        </div>

        <TripModal
          isOpen={isAddingTrip}
          onClose={() => { setIsAddingTrip(false); setEditingTrip(null); }}
          editingTrip={editingTrip}
          onSuccess={(trip, isNew) => {
            if (isNew) {
              setTrips(prev => [trip, ...prev]);
            } else {
              setTrips(prev => prev.map(t => t.id === trip.id ? trip : t));
              if (selectedTrip?.id === trip.id) setSelectedTrip(trip);
            }
            setIsAddingTrip(false);
            setEditingTrip(null);
          }}
        />
        <DeleteConfirmationModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          itemName={deleteTarget?.name || ""}
        />
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
                      setEditingTrip(trip); setIsAddingTrip(true);
                    }}
                    className="text-gray-500 transition-colors hover:text-white"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      requestDelete("trip", trip.id, trip.name);
                    }}
                    className="text-gray-500 transition-colors hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <span
                className={`inline-block rounded-lg border px-3 py-1 text-xs font-medium ${STATUS_COLORS[trip.status]}`}
              >
                {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
              </span>

              <p className="mt-3 text-sm text-gray-400">
                <Calendar className="mr-1 inline h-3.5 w-3.5" />
                {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
              </p>

              {trip.notes && <p className="mt-2 text-sm italic text-gray-500">{trip.notes}</p>}
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

      <TripModal
        isOpen={isAddingTrip}
        onClose={() => { setIsAddingTrip(false); setEditingTrip(null); }}
        editingTrip={editingTrip}
        onSuccess={(trip, isNew) => {
          if (isNew) {
            setTrips(prev => [trip, ...prev]);
          } else {
            setTrips(prev => prev.map(t => t.id === trip.id ? trip : t));
          }
          setIsAddingTrip(false);
          setEditingTrip(null);
        }}
      />
      <DeleteConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        itemName={deleteTarget?.name || ""}
      />
    </div>
  );
}
