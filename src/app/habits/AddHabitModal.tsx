// src/app/habits/AddHabitModal.tsx
'use client';

import { useState } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import type { Habit, HabitSchedule } from '@/types/database.types';

const OWNER_ID = 'd5682543-5b15-4bf2-90a3-6a3ddf9dc509';

const CATEGORIES = [
    { value: 'oral_care', label: 'Oral Care' },
    { value: 'beard_care', label: 'Beard Care' },
    { value: 'hair_care', label: 'Hair Care' },
    { value: 'shower', label: 'Shower' },
    { value: 'body_care', label: 'Body Care' },
    { value: 'supplements', label: 'Supplements' },
    { value: 'exercise', label: 'Exercise' },
    { value: 'mindfulness', label: 'Mindfulness' },
    { value: 'productivity', label: 'Productivity' },
    { value: 'other', label: 'Other' },
];

const TIME_OF_DAY = [
    { value: 'morning', label: 'Morning' },
    { value: 'midday', label: 'Midday' },
    { value: 'evening', label: 'Evening' },
];

const DAYS_OF_WEEK = [
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
    { value: 7, label: 'Sun' },
];

interface AddHabitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (habit: Habit) => void;
}

export default function AddHabitModal({ isOpen, onClose, onSuccess }: AddHabitModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        time_of_day: 'morning',
        unit: '',
        target_value: '',
        sort_order: '',
        schedule_days: [1, 2, 3, 4, 5, 6, 7] as number[],
        target_per_day: '',
    });

    const resetForm = () => {
        setFormData({
            name: '',
            category: '',
            time_of_day: 'morning',
            unit: '',
            target_value: '',
            sort_order: '',
            schedule_days: [1, 2, 3, 4, 5, 6, 7],
            target_per_day: '',
        });
        setError(null);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const toggleDay = (day: number) => {
        setFormData(prev => ({
            ...prev,
            schedule_days: prev.schedule_days.includes(day)
                ? prev.schedule_days.filter(d => d !== day)
                : [...prev.schedule_days, day].sort((a, b) => a - b)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const schedule: HabitSchedule = {
                days: formData.schedule_days,
                target_per_day: formData.target_per_day ? parseFloat(formData.target_per_day) : null,
            };

            const payload = {
                owner_id: OWNER_ID,
                name: formData.name.trim(),
                category: formData.category || null,
                time_of_day: formData.time_of_day || null,
                unit: formData.unit.trim() || null,
                target_value: formData.target_value ? parseFloat(formData.target_value) : null,
                sort_order: formData.sort_order ? parseInt(formData.sort_order) : null,
                schedule,
                is_active: true,
            };

            const response = await fetch('/api/habits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add habit');
            }

            const newHabit = await response.json();
            resetForm();
            onSuccess(newHabit);
            onClose();
        } catch (err) {
            console.error('Error adding habit:', err);
            setError(err instanceof Error ? err.message : 'Failed to add habit');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-gray-900 rounded-lg border border-gray-800 w-full max-w-lg my-8">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    <h2 className="text-xl font-bold text-white">Add Habit</h2>
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

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Habit Name *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="e.g., Brush teeth"
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Category & Time of Day */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Category
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                disabled={loading}
                            >
                                <option value="">Select category</option>
                                {CATEGORIES.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Time of Day
                            </label>
                            <select
                                value={formData.time_of_day}
                                onChange={(e) => setFormData({ ...formData, time_of_day: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                disabled={loading}
                            >
                                {TIME_OF_DAY.map(time => (
                                    <option key={time.value} value={time.value}>{time.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Unit & Target Value */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Unit (optional)
                            </label>
                            <input
                                type="text"
                                value={formData.unit}
                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="e.g., times, minutes"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Target per Day
                            </label>
                            <input
                                type="number"
                                min="1"
                                step="1"
                                value={formData.target_per_day}
                                onChange={(e) => setFormData({ ...formData, target_per_day: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="1"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Schedule Days */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Schedule (days of week)
                        </label>
                        <div className="flex gap-2">
                            {DAYS_OF_WEEK.map(day => (
                                <button
                                    key={day.value}
                                    type="button"
                                    onClick={() => toggleDay(day.value)}
                                    className={`flex-1 py-2 rounded text-xs font-medium transition-all ${
                                        formData.schedule_days.includes(day.value)
                                            ? 'bg-violet-500 text-white'
                                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                                    }`}
                                    disabled={loading}
                                >
                                    {day.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sort Order */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Sort Order (optional)
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={formData.sort_order}
                            onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Lower numbers appear first"
                            disabled={loading}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-3">
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
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    Add Habit
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
