"use client";

import { useState, useEffect } from "react";
import { Bell, Plus, Trash2, Loader2 } from "lucide-react";
import type { MediaItem, MediaReminder } from "@/types/media.types";
import BaseFormModal from "@/components/BaseFormModal";

const DAYS = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

const DEFAULT_TZ =
  typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "America/New_York";

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MediaItem | null;
}

export default function ReminderModal({ isOpen, onClose, item }: ReminderModalProps) {
  const [reminders, setReminders] = useState<MediaReminder[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [day, setDay] = useState(2);
  const [time, setTime] = useState("19:00");

  useEffect(() => {
    if (!isOpen || !item) return;
    setLoading(true);
    fetch(`/api/media/reminders?mediaItemId=${item.id}`)
      .then((r) => r.json())
      .then((data) => setReminders(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [isOpen, item]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    setSaving(true);
    try {
      const res = await fetch("/api/media/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          media_item_id: item.id,
          day_of_week: day,
          time_of_day: time,
          timezone: DEFAULT_TZ,
          is_active: true,
        }),
      });
      if (!res.ok) throw new Error("Failed to create reminder");
      const created = await res.json();
      setReminders((prev) => [...prev, created]);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (r: MediaReminder) => {
    const next = !r.is_active;
    setReminders((prev) => prev.map((x) => (x.id === r.id ? { ...x, is_active: next } : x)));
    await fetch(`/api/media/reminders/${r.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: next }),
    });
  };

  const handleDelete = async (r: MediaReminder) => {
    setReminders((prev) => prev.filter((x) => x.id !== r.id));
    await fetch(`/api/media/reminders/${r.id}`, { method: "DELETE" });
  };

  const formatTime = (t: string) => {
    const [h, m] = t.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const display = hour % 12 || 12;
    return `${display}:${m} ${ampm}`;
  };

  return (
    <BaseFormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Watch Reminders"
      subtitle={item?.title}
      onSubmit={handleAdd}
      loading={saving}
      submitLabel="Add Reminder"
      submitIcon={<Plus className="h-4 w-4" />}
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Day</label>
          <select
            value={day}
            onChange={(e) => setDay(parseInt(e.target.value))}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
          >
            {DAYS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Time</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>
      <p className="text-xs text-gray-500">Timezone: {DEFAULT_TZ}</p>

      <div className="border-t border-gray-800 pt-3">
        <h3 className="mb-2 text-sm font-medium text-gray-300">Active reminders</h3>
        {loading ? (
          <div className="flex items-center justify-center py-4 text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : reminders.length === 0 ? (
          <p className="text-sm text-gray-500">No reminders yet.</p>
        ) : (
          <ul className="space-y-2">
            {reminders.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-800/50 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <Bell
                    className={`h-4 w-4 ${r.is_active ? "text-blue-400" : "text-gray-600"}`}
                  />
                  <span className={r.is_active ? "text-white" : "text-gray-500 line-through"}>
                    {DAYS[r.day_of_week].label} at {formatTime(r.time_of_day)}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => handleToggle(r)}
                    className="rounded px-2 py-1 text-xs text-gray-400 hover:bg-gray-700 hover:text-white"
                  >
                    {r.is_active ? "Pause" : "Resume"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(r)}
                    className="rounded p-1 text-red-400 hover:bg-gray-700"
                    aria-label="Delete reminder"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </BaseFormModal>
  );
}
