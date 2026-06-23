"use client";

import { useState, useEffect } from "react";
import { Bell, Plus, Trash2, Play, Pause, X, ChevronDown } from "lucide-react";
import type { MediaItem, MediaReminder } from "@/types/media.types";

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

const FIELD =
  "w-full rounded-[10px] border border-white/[0.08] bg-[#16161f] px-3 py-2.5 text-[14px] text-[#f3f4f8] outline-none transition-colors focus:border-[#4f8dff]/50 [color-scheme:dark]";

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MediaItem | null;
  initialReminders?: MediaReminder[];
}

export default function ReminderModal({ isOpen, onClose, item, initialReminders }: ReminderModalProps) {
  const [reminders, setReminders] = useState<MediaReminder[]>([]);
  const [saving, setSaving] = useState(false);
  const [day, setDay] = useState(2);
  const [time, setTime] = useState("19:00");

  useEffect(() => {
    if (!isOpen || !item) return;
    setReminders(initialReminders ?? []);
  }, [isOpen, item, initialReminders]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

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

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[70] flex items-end justify-center bg-[#040408]/[0.7] backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-[480px] overflow-y-auto rounded-t-[22px] border border-white/[0.09] bg-[#101019]"
      >
        {/* sticky header */}
        <div className="sticky top-0 z-[2] flex items-center justify-between border-b border-white/[0.06] bg-[#101019]/95 px-[18px] py-4 backdrop-blur">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#4f8dff]/[0.14]">
              <Bell className="h-4 w-4 text-[#4f8dff]" />
            </div>
            <div>
              <h3 className="text-[16px] font-bold leading-tight">Watch reminders</h3>
              {item?.title && (
                <p className="text-[12px] text-[#9a9db0]">{item.title}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] border border-white/[0.08] bg-[#1a1a25] text-[#9a9db0]"
          >
            <X className="h-4 w-4" strokeWidth={2.2} />
          </button>
        </div>

        <form onSubmit={handleAdd} className="px-[18px] pb-6 pt-5">
          {/* add a reminder */}
          <div className="mb-2.5 font-mono text-[10.5px] font-semibold uppercase tracking-widest text-[#6b6e80]">
            New weekly reminder
          </div>
          <div className="mb-2 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[11.5px] font-medium text-[#9a9db0]">Day</label>
              <div className="relative">
                <select
                  value={day}
                  onChange={(e) => setDay(parseInt(e.target.value))}
                  className={`${FIELD} cursor-pointer appearance-none pr-8`}
                >
                  {DAYS.map((d) => (
                    <option key={d.value} value={d.value} className="bg-[#16161f]">
                      {d.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6b6e80]" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[11.5px] font-medium text-[#9a9db0]">Time</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={FIELD} />
            </div>
          </div>
          <p className="mb-4 font-mono text-[10.5px] text-[#6b6e80]">Timezone · {DEFAULT_TZ}</p>
          <button
            type="submit"
            disabled={saving}
            className="mb-6 flex w-full items-center justify-center gap-1.5 rounded-[11px] bg-[#4f8dff] py-3 text-sm font-bold text-[#04122b] transition-colors disabled:cursor-not-allowed disabled:bg-[#4f8dff]/40"
            style={{ boxShadow: "0 4px 14px rgba(79,141,255,.32)" }}
          >
            <Plus className="h-4 w-4" strokeWidth={2.6} />
            {saving ? "Adding…" : "Add reminder"}
          </button>

          {/* active reminders */}
          <div className="mb-2.5 font-mono text-[10.5px] font-semibold uppercase tracking-widest text-[#6b6e80]">
            Scheduled
          </div>
          {reminders.length === 0 ? (
            <div className="rounded-[11px] border border-dashed border-white/[0.08] py-6 text-center text-[13px] text-[#6b6e80]">
              No reminders yet.
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {reminders.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center gap-2.5 rounded-[11px] border border-white/[0.07] bg-[#16161f] px-3 py-2.5"
                  style={{ opacity: r.is_active ? 1 : 0.55 }}
                >
                  <Bell
                    className="h-4 w-4 flex-none"
                    style={{ color: r.is_active ? "#4f8dff" : "#6b6e80" }}
                  />
                  <span className="flex-1 font-mono text-[12.5px] text-[#dfe2ee]">
                    {DAYS[r.day_of_week].label} · {formatTime(r.time_of_day)}
                  </span>
                  <span
                    className="font-mono text-[10px] uppercase tracking-wide"
                    style={{ color: r.is_active ? "#3ad07f" : "#6b6e80" }}
                  >
                    {r.is_active ? "Active" : "Paused"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggle(r)}
                    aria-label={r.is_active ? "Pause reminder" : "Resume reminder"}
                    className="flex h-8 w-8 flex-none items-center justify-center rounded-[8px] border border-white/[0.08] bg-[#1a1a25] text-[#9a9db0] hover:text-[#f3f4f8]"
                  >
                    {r.is_active ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(r)}
                    aria-label="Delete reminder"
                    className="flex h-8 w-8 flex-none items-center justify-center rounded-[8px] border border-white/[0.08] bg-[#1a1a25] text-[#f06a6a] hover:bg-[#f06a6a]/[0.12]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </form>
      </div>
    </div>
  );
}
