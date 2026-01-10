// src/app/habits/AddGoalModal.tsx
'use client';

import { useState } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import type { Goal, Habit, GoalProgressSource } from '@/types/database.types';

const OWNER_ID = 'd5682543-5b15-4bf2-90a3-6a3ddf9dc509';

const CATEGORIES = [
    { value: 'health', label: 'Health' },
    { value: 'fitness', label: 'Fitness' },
    { value: 'finance', label: 'Finance' },
    { value: 'learning', label: 'Learning' },
    { value: 'career', label: 'Career' },
    { value: 'personal', label: 'Personal' },
    { value: 'other', label: 'Other' },
];

interface AddGoalModalProps {
    isOpen: boolean;
    habits: Habit[];
    onClose: () => void;
    onSuccess: (goal: Goal) => void;
}

export default function AddGoalModal({ isOpen, habits, onClose, onSuccess }: AddGoalModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        target_value: '',
        unit: '',
        due_date: '',
        started_at: new Date().toISOString().split('T')[0],
        progress_source: 'manual' as GoalProgressSource,
        habit_id: '',
    });

    const resetForm = () => {
        setFormData({
            name: '',
            category: '',
            target_value: '',
            unit: '',
            due_date: '',
            started_at: new Date().toISOString().split('T')[0],
            progress_source: 'manual',
            habit_id: '',
        });
        setError(null);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload = {
                owner_id: OWNER_ID,
                name: formData.name.trim(),
                category: formData.category || null,
                target_value: formData.target_value ? parseFloat(formData.target_value) : null,
                current_value: 0,
                unit: formData.unit.trim() || null,
                due_date: formData.due_date || null,
                started_at: formData.started_at || null,
                progress_source: formData.progress_source,
                habit_id: formData.progress_source === 'habit' && formData.habit_id ? formData.habit_id : null,
                status: 'active',
            };

            const response = await fetch('/api/habits/goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add goal');
            }

            const newGoal = await response.json();
            resetForm();
            onSuccess(newGoal);
            onClose();
        } catch (err) {
            console.error('Error adding goal:', err);
            setError(err instanceof Error ? err.message : 'Failed to add goal');
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
                    <h2 className="text-xl font-bold text-white">Add Goal</h2>
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
                            Goal Name *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="e.g., Read 12 books this year"
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Category */}
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

                    {/* Target Value & Unit */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Target Value
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="any"
                                value={formData.target_value}
                                onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="e.g., 12"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Unit
                            </label>
                            <input
                                type="text"
                                value={formData.unit}
                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="e.g., books, miles, hours"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={formData.started_at}
                                onChange={(e) => setFormData({ ...formData, started_at: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Due Date
                            </label>
                            <input
                                type="date"
                                value={formData.due_date}
                                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Progress Source */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Progress Tracking
                        </label>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, progress_source: 'manual', habit_id: '' })}
                                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                                    formData.progress_source === 'manual'
                                        ? 'bg-violet-500 text-white'
                                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                                }`}
                                disabled={loading}
                            >
                                Manual
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, progress_source: 'habit' })}
                                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                                    formData.progress_source === 'habit'
                                        ? 'bg-violet-500 text-white'
                                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                                }`}
                                disabled={loading}
                            >
                                Link to Habit
                            </button>
                        </div>
                    </div>

                    {/* Habit Selection (if progress_source === 'habit') */}
                    {formData.progress_source === 'habit' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Select Habit
                            </label>
                            <select
                                value={formData.habit_id}
                                onChange={(e) => setFormData({ ...formData, habit_id: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                disabled={loading}
                            >
                                <option value="">Select a habit</option>
                                {habits.map(habit => (
                                    <option key={habit.id} value={habit.id}>{habit.name}</option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                Progress will be automatically tracked from this habit's completions
                            </p>
                        </div>
                    )}

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
                                    Add Goal
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
