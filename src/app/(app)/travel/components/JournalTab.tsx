"use client";

import { useState } from "react";
import { Plus, Trash2, BookOpen } from "lucide-react";
import type { TripEntry } from "@/types/travel.types";
import { formatDate } from "./shared";

interface JournalTabProps {
  tripId: string;
  entries: TripEntry[];
  setEntries: React.Dispatch<React.SetStateAction<TripEntry[]>>;
  onDelete: (type: string, id: string, name: string) => void;
}

export default function JournalTab({ tripId, entries, setEntries, onDelete }: JournalTabProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ entry_date: "", content_md: "" });

  const create = async () => {
    if (!form.entry_date || !form.content_md.trim()) return;
    const res = await fetch(`/api/travel/trips/${tripId}/entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trip_id: tripId,
        entry_date: form.entry_date,
        content_md: form.content_md.trim(),
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setEntries((prev) => [data, ...prev]);
      setForm({ entry_date: "", content_md: "" });
      setShowAdd(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-violet-600 px-4 py-2 text-sm text-white shadow-md transition-all duration-200 hover:from-violet-600 hover:to-violet-700"
        >
          <Plus className="h-4 w-4" /> Add Entry
        </button>
      </div>

      {showAdd && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Add Journal Entry</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">Date*</label>
              <input
                type="date"
                value={form.entry_date}
                onChange={(e) => setForm({ ...form, entry_date: e.target.value })}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">Entry* (Markdown)</label>
              <textarea
                value={form.content_md}
                onChange={(e) => setForm({ ...form, content_md: e.target.value })}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 font-mono text-sm text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
                rows={8}
                placeholder="Write about your day..."
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={create}
                disabled={!form.entry_date || !form.content_md.trim()}
                className="rounded-lg bg-gradient-to-r from-violet-500 to-violet-600 px-4 py-2 text-white shadow-md transition-all duration-200 hover:from-violet-600 hover:to-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAdd(false);
                  setForm({ entry_date: "", content_md: "" });
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
        {[...entries]
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
                    onDelete("entry", entry.id, `entry from ${formatDate(entry.entry_date)}`)
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
  );
}
