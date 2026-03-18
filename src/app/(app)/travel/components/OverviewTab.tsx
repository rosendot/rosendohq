"use client";

import type { Trip, ItineraryItem, TripPackingItem, TripExpense, TripEntry } from "@/types/travel.types";
import { TYPE_ICONS, TYPE_COLORS, formatDateTime, formatCents } from "./shared";

interface OverviewTabProps {
  trip: Trip;
  itinerary: ItineraryItem[];
  packingItems: TripPackingItem[];
  expenses: TripExpense[];
  entries: TripEntry[];
}

export default function OverviewTab({ trip, itinerary, packingItems, expenses, entries }: OverviewTabProps) {
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount_cents, 0);
  const packedCount = packingItems.filter((p) => p.packed).length;
  const packingTotal = packingItems.length;
  const packingPercent = packingTotal > 0 ? Math.round((packedCount / packingTotal) * 100) : 0;

  return (
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
      {trip.notes && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h3 className="mb-2 text-sm font-medium text-gray-400">Notes</h3>
          <p className="whitespace-pre-wrap text-gray-300">{trip.notes}</p>
        </div>
      )}

      {/* Upcoming Itinerary */}
      {itinerary.length > 0 && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h3 className="mb-4 text-sm font-medium text-gray-400">Upcoming Itinerary</h3>
          <div className="space-y-3">
            {[...itinerary]
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
  );
}
