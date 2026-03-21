"use client";

import { useState, useEffect } from "react";
import BaseFormModal from "@/components/BaseFormModal";
import type { Trip, TripStatus } from "@/types/travel.types";

interface TripModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTrip: Trip | null;
  onSuccess: (trip: Trip, isNew: boolean) => void;
}

export default function TripModal({ isOpen, onClose, editingTrip, onSuccess }: TripModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    destination: "",
    start_date: "",
    end_date: "",
    status: "planning" as TripStatus,
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editingTrip) {
        setFormData({
          name: editingTrip.name,
          destination: editingTrip.destination || "",
          start_date: editingTrip.start_date,
          end_date: editingTrip.end_date,
          status: editingTrip.status,
          notes: editingTrip.notes || "",
        });
      } else {
        setFormData({
          name: "",
          destination: "",
          start_date: "",
          end_date: "",
          status: "planning",
          notes: "",
        });
      }
    }
  }, [isOpen, editingTrip]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        name: formData.name.trim(),
        destination: formData.destination.trim() || null,
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: formData.status,
        notes: formData.notes.trim() || null,
      };

      let res;
      if (editingTrip) {
        res = await fetch(`/api/travel/trips/${editingTrip.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/travel/trips", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) throw new Error("Failed to save trip");

      const data = await res.json();
      onSuccess(data, !editingTrip);
    } catch (error) {
      console.error("Error saving trip:", error);
      alert("Failed to save trip");
    } finally {
      setSaving(false);
    }
  };

  return (
    <BaseFormModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingTrip ? "Edit Trip" : "Add New Trip"}
      onSubmit={handleSubmit}
      submitLabel={editingTrip ? "Save" : "Add Trip"}
      loading={saving}
      submitDisabled={!formData.name.trim() || !formData.start_date || !formData.end_date}
      submitColor="emerald"
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Trip Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            placeholder="Trip name"
            autoFocus
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Destination</label>
          <input
            type="text"
            value={formData.destination}
            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            placeholder="Where are you going?"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Start Date *</label>
          <input
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">End Date *</label>
          <input
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as TripStatus })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="planning">Planning</option>
            <option value="upcoming">Upcoming</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          rows={2}
          placeholder="Optional notes"
        />
      </div>
    </BaseFormModal>
  );
}
