// src/app/habits/EditGoalModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import type { Goal, Habit, GoalStatus, GoalProgressSource } from '@/types/database.types';

const CATEGORIES = [
    { value: 'health', label: 'Health' },
    { value: 'fitness', label: 'Fitness' },
    { value: 'finance', label: 'Finance' },
    { value: 'learning', label: 'Learning' },
    { value: 'career', label: 'Career' },
    { value: 'personal', label: 'Personal' },
    { value: 'other', label: 'Other' },
];

const STATUSES: { value: GoalStatus; label: string; color: string }[] = [
    { value: 'active', label: 'Active', color: 'bg-blue-500' },
    { value: 'completed', label: 'Completed', color: 'bg-green-500' },
    { value: 'on_hold', label: 'On Hold', color: 'bg-yellow-500' },
    { value: 'abandoned', label: 'Abandoned', color: 'bg-red-500' },
];

interface EditGoalModalProps {
    isOpen: boolean;
    goal: Goal | null;
    habits: Habit[];
    onClose: () => void;
    onSuccess: (goal: Goal) => void;
}

export default function EditGoalModal({ isOpen, goal, habits, onClose, onSuccess }: EditGoalModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        target_value: '',
        current_value: '',
        unit: '',
        due_date: '',
        started_at: '',
        status: 'active' as GoalStatus,
        progress_source: 'manual' as GoalProgressSource,
        habit_id: '',
    });

    useEffect(() => {
        if (goal) {
            setFormData({
                name: goal.name || '',
                category: goal.category || '',
                target_value: goal.target_value?.toString() || '',
                current_value: goal.current_value?.toString() || '0',
                unit: goal.unit || '',
                due_date: goal.due_date ? goal.due_date.split('T')[0] : '',
                started_at: goal.started_at ? goal.started_at.split('T')[0] : '',
                status: goal.status || 'active',
                progress_source: goal.progress_source || 'manual',
                habit_id: goal.habit_id || '',
            });
            setError(null);
        }
    }, [goal]);

    const handleClose = () => {
        setError(null);
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!goal) return;

        setLoading(true);
        setError(null);

        try {
            const payload: Record<string, unknown> = {
                name: formData.name.trim(),
                category: formData.category || null,
                target_value: formData.target_value ? parseFloat(formData.target_value) : null,
                current_value: formData.current_value ? parseFloat(formData.current_value) : 0,
                unit: formData.unit.trim() || null,
                due_date: formData.due_date || null,
                started_at: formData.started_at || null,
                status: formData.status,
                progress_source: formData.progress_source,
                habit_id: formData.progress_source === 'habit' && formData.habit_id ? formData.habit_id : null,
            };

            // Auto-set completed_at when marking as completed
            if (formData.status === 'completed' && goal.status !== 'completed') {
                payload.completed_at = new Date().toISOString();
            } else if (formData.status !== 'completed') {
                payload.completed_at = null;
            }

            const response = await fetch(`/api/habits/goals/${goal.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update goal');
            }

            const updatedGoal = await response.json();
            onSuccess(updatedGoal);
            onClose();
        } catch (err) {
            console.error('Error updating goal:', err);
            setError(err instanceof Error ? err.message : 'Failed to update goal');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !goal) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-gray-900 rounded-lg border border-gray-800 w-full max-w-lg my-8">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    <h2 className="text-xl font-bold text-white">Edit Goal</h2>
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

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Status
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {STATUSES.map(status => (
                                <button
                                    key={status.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, status: status.value })}
                                    className={`py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                                        formData.status === status.value
                                            ? `${status.color} text-white`
                                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                                    }`}
                                    disabled={loading}
                                >
                                    {status.label}
                                </button>
                            ))}
                        </div>
                    </div>

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

                    {/* Progress */}
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Current
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="any"
                                value={formData.current_value}
                                onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                disabled={loading || formData.progress_source === 'habit'}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Target
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="any"
                                value={formData.target_value}
                                onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                                placeholder="e.g., books"
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

                    {/* Habit Selection */}
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
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
