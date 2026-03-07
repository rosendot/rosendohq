"use client";

import { useState } from "react";
import { Plus, Trash2, Clock } from "lucide-react";
import type { ItineraryItem, ItineraryType } from "@/types/database.types";
import { OWNER_ID, TYPE_ICONS, TYPE_COLORS, formatDateTime } from "./shared";

interface ItineraryTabProps {
  tripId: string;
  itinerary: ItineraryItem[];
  setItinerary: React.Dispatch<React.SetStateAction<ItineraryItem[]>>;
  onDelete: (type: string, id: string, name: string) => void;
}

export default function ItineraryTab({ tripId, itinerary, setItinerary, onDelete }: ItineraryTabProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    at: "",
    type: "activity" as ItineraryType,
    title: "",
    details: "",
  });

  const create = async () => {
    if (!form.at || !form.title.trim()) return;
    const res = await fetch(`/api/travel/trips/${tripId}/itinerary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        owner_id: OWNER_ID,
        trip_id: tripId,
        at: form.at,
        type: form.type,
        title: form.title.trim(),
        details: form.details.trim() ? { note: form.details.trim() } : null,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setItinerary((prev) => [...prev, data]);
      setForm({ at: "", type: "activity", title: "", details: "" });
      setShowAdd(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-sm text-white shadow-md transition-all duration-200 hover:from-emerald-600 hover:to-emerald-700"
        >
          <Plus className="h-4 w-4" /> Add Item
        </button>
      </div>

      {showAdd && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Add Itinerary Item</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Date & Time*</label>
                <input
                  type="datetime-local"
                  value={form.at}
                  onChange={(e) => setForm({ ...form, at: e.target.value })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Type*</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as ItineraryType })}
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
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="e.g., Drive to Dallas"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">Details (optional note)</label>
              <textarea
                value={form.details}
                onChange={(e) => setForm({ ...form, details: e.target.value })}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                rows={2}
                placeholder="Additional details..."
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={create}
                disabled={!form.at || !form.title.trim()}
                className="rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-white shadow-md transition-all duration-200 hover:from-emerald-600 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAdd(false);
                  setForm({ at: "", type: "activity", title: "", details: "" });
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
        {[...itinerary]
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
                      onClick={() => onDelete("itinerary", item.id, item.title || "this item")}
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
  );
}
