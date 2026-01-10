// src/app/habits/HabitLogModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import type { Habit, HabitLog, HabitSchedule } from '@/types/database.types';

const OWNER_ID = 'd5682543-5b15-4bf2-90a3-6a3ddf9dc509';

const MOOD_OPTIONS = [
    { value: 1, label: '😫', description: 'Terrible' },
    { value: 2, label: '😕', description: 'Bad' },
    { value: 3, label: '😐', description: 'Okay' },
    { value: 4, label: '🙂', description: 'Good' },
    { value: 5, label: '😄', description: 'Great' },
];

interface HabitLogModalProps {
    isOpen: boolean;
    habit: Habit | null;
    existingLog: HabitLog | null;
    selectedDate: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function HabitLogModal({
    isOpen,
    habit,
    existingLog,
    selectedDate,
    onClose,
    onSuccess
}: HabitLogModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        value: '',
        note: '',
        mood: null as number | null,
        time_of_day: '',
    });

    useEffect(() => {
        if (habit) {
            const schedule = habit.schedule as HabitSchedule | null;
            const targetValue = schedule?.target_per_day || habit.target_value || 1;

            if (existingLog) {
                setFormData({
                    value: existingLog.value?.toString() || targetValue.toString(),
                    note: existingLog.note || '',
                    mood: existingLog.mood,
                    time_of_day: existingLog.time_of_day || '',
                });
            } else {
                setFormData({
                    value: targetValue.toString(),
                    note: '',
                    mood: null,
                    time_of_day: new Date().toTimeString().slice(0, 5),
                });
            }
            setError(null);
        }
    }, [habit, existingLog]);

    const handleClose = () => {
        setError(null);
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!habit) return;

        setLoading(true);
        setError(null);

        try {
            const payload = {
                owner_id: OWNER_ID,
                habit_id: habit.id,
                log_date: selectedDate,
                value: parseFloat(formData.value) || 1,
                note: formData.note.trim() || null,
                mood: formData.mood,
                time_of_day: formData.time_of_day || null,
            };

            const url = existingLog
                ? `/api/habits/logs/${existingLog.id}`
                : '/api/habits/logs';

            const method = existingLog ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save log');
            }

            onSuccess();
            onClose();
        } catch (err) {
            console.error('Error saving log:', err);
            setError(err instanceof Error ? err.message : 'Failed to save log');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !habit) return null;

    const schedule = habit.schedule as HabitSchedule | null;
    const targetValue = schedule?.target_per_day || habit.target_value || 1;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-lg border border-gray-800 w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    <div>
                        <h2 className="text-lg font-bold text-white">{habit.name}</h2>
                        <p className="text-xs text-gray-400">
                            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'short',
                                day: 'numeric',
                            })}
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-white transition-colors"
                        disabled={loading}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {error && (
                        <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
                            {error}
                        </div>
                    )}

                    {/* Value */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            {habit.unit ? `${habit.unit} completed` : 'Completed'}
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="number"
                                min="0"
                                step="1"
                                value={formData.value}
                                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                disabled={loading}
                            />
                            <span className="text-gray-400 text-sm">/ {targetValue}</span>
                        </div>
                    </div>

                    {/* Time */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Time (optional)
                        </label>
                        <input
                            type="time"
                            value={formData.time_of_day}
                            onChange={(e) => setFormData({ ...formData, time_of_day: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            disabled={loading}
                        />
                    </div>

                    {/* Mood */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            How are you feeling? (optional)
                        </label>
                        <div className="flex gap-2">
                            {MOOD_OPTIONS.map(mood => (
                                <button
                                    key={mood.value}
                                    type="button"
                                    onClick={() => setFormData({
                                        ...formData,
                                        mood: formData.mood === mood.value ? null : mood.value
                                    })}
                                    className={`flex-1 py-2 rounded-lg text-xl transition-all ${
                                        formData.mood === mood.value
                                            ? 'bg-violet-500/30 border-2 border-violet-500'
                                            : 'bg-gray-800 border-2 border-transparent hover:bg-gray-700'
                                    }`}
                                    title={mood.description}
                                    disabled={loading}
                                >
                                    {mood.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Note */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Note (optional)
                        </label>
                        <textarea
                            value={formData.note}
                            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                            placeholder="Add a note about this session..."
                            rows={3}
                            disabled={loading}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors border border-gray-700"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
