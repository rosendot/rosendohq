"use client";

import { useState } from "react";
import { Plus, Trash2, FileText } from "lucide-react";
import type { TripDocument } from "@/types/database.types";
import { OWNER_ID } from "./shared";

interface DocumentsTabProps {
  tripId: string;
  documents: TripDocument[];
  setDocuments: React.Dispatch<React.SetStateAction<TripDocument[]>>;
  onDelete: (type: string, id: string, name: string) => void;
}

export default function DocumentsTab({ tripId, documents, setDocuments, onDelete }: DocumentsTabProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", url: "", doc_type: "other", notes: "" });

  const create = async () => {
    if (!form.name.trim()) return;
    const res = await fetch(`/api/travel/trips/${tripId}/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        owner_id: OWNER_ID,
        trip_id: tripId,
        name: form.name.trim(),
        url: form.url.trim() || null,
        doc_type: form.doc_type,
        notes: form.notes.trim() || null,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setDocuments((prev) => [...prev, data]);
      setForm({ name: "", url: "", doc_type: "other", notes: "" });
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
          <Plus className="h-4 w-4" /> Add Document
        </button>
      </div>

      {showAdd && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Add Document</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Name*</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="e.g., Lease Agreement"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Type</label>
                <select
                  value={form.doc_type}
                  onChange={(e) => setForm({ ...form, doc_type: e.target.value })}
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
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={create}
                disabled={!form.name.trim()}
                className="rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-white shadow-md transition-all duration-200 hover:from-emerald-600 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAdd(false);
                  setForm({ name: "", url: "", doc_type: "other", notes: "" });
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
                  onClick={() => onDelete("document", doc.id, doc.name)}
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
  );
}
