// src/app/habits/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Target, Calendar, Check, Plus, Edit2, Trash2, MoreHorizontal } from 'lucide-react';
import type { Habit, HabitLog, Goal, HabitSchedule } from '@/types/database.types';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import AddHabitModal from './AddHabitModal';
import EditHabitModal from './EditHabitModal';
import AddGoalModal from './AddGoalModal';
import EditGoalModal from './EditGoalModal';
import HabitLogModal from './HabitLogModal';

const TIME_OF_DAY_ORDER = ['morning', 'midday', 'evening'];
const TIME_OF_DAY_LABELS: Record<string, string> = {
    morning: '🌅 Morning',
    midday: '☀️ Midday',
    evening: '🌙 Evening',
};

const CATEGORY_LABELS: Record<string, string> = {
    oral_care: '🦷 Oral Care',
    beard_care: '🧔 Beard Care',
    hair_care: '💇 Hair Care',
    shower: '🚿 Shower',
    body_care: '🧴 Body Care',
    supplements: '💊 Supplements',
    exercise: '🏃 Exercise',
    mindfulness: '🧘 Mindfulness',
    productivity: '📈 Productivity',
    other: '📌 Other',
};

const MOOD_LABELS: Record<number, string> = {
    1: '😫',
    2: '😕',
    3: '😐',
    4: '🙂',
    5: '😄',
};

// Helper to get date range (1 week before and after)
const getDateRange = (date: string) => {
    const d = new Date(date);
    const start = new Date(d);
    start.setDate(d.getDate() - 7);
    const end = new Date(d);
    end.setDate(d.getDate() + 7);
    return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
    };
};

export default function HabitsPage() {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [allLogs, setAllLogs] = useState<HabitLog[]>([]); // All logs for date range
    const [goals, setGoals] = useState<Goal[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>(
        new Date().toISOString().split('T')[0]
    );
    const [loadedRange, setLoadedRange] = useState<{ start: string; end: string } | null>(null);
    const [activeTab, setActiveTab] = useState<'habits' | 'goals' | 'manage'>('habits');
    const [loading, setLoading] = useState(true);

    // Modal states
    const [showAddHabitModal, setShowAddHabitModal] = useState(false);
    const [showEditHabitModal, setShowEditHabitModal] = useState(false);
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
    const [showAddGoalModal, setShowAddGoalModal] = useState(false);
    const [showEditGoalModal, setShowEditGoalModal] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
    const [showHabitLogModal, setShowHabitLogModal] = useState(false);
    const [loggingHabit, setLoggingHabit] = useState<Habit | null>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        show: boolean;
        type: 'habit' | 'goal';
        id: string | null;
        name: string;
    }>({ show: false, type: 'habit', id: null, name: '' });

    // Initial load
    useEffect(() => {
        fetchHabits();
        fetchGoals();
        fetchLogsForRange(selectedDate);
    }, []);

    // Check if we need to fetch more logs when date changes
    useEffect(() => {
        if (loadedRange) {
            // Check if selected date is outside loaded range
            if (selectedDate < loadedRange.start || selectedDate > loadedRange.end) {
                fetchLogsForRange(selectedDate);
            }
        }
    }, [selectedDate, loadedRange]);

    const fetchHabits = async () => {
        try {
            const response = await fetch('/api/habits');
            if (!response.ok) throw new Error('Failed to fetch habits');
            const data = await response.json();
            setHabits(data);
        } catch (error) {
            console.error('Error fetching habits:', error);
        }
    };

    const fetchLogsForRange = async (centerDate: string) => {
        try {
            setLoading(true);
            const range = getDateRange(centerDate);
            const response = await fetch(`/api/habits/logs?start_date=${range.start}&end_date=${range.end}`);
            if (!response.ok) throw new Error('Failed to fetch logs');
            const data = await response.json();
            setAllLogs(data);
            setLoadedRange(range);
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter logs for selected date (client-side)
    const logs = allLogs.filter(log => log.log_date === selectedDate);

    // Refresh logs after a change (updates local state without full refetch)
    const refreshLogs = async () => {
        // Fetch just the current date's logs and update allLogs
        const response = await fetch(`/api/habits/logs?date=${selectedDate}`);
        if (response.ok) {
            const newLogs = await response.json();
            setAllLogs(prev => {
                // Remove old logs for this date, add new ones
                const filtered = prev.filter(log => log.log_date !== selectedDate);
                return [...filtered, ...newLogs];
            });
        }
    };

    const fetchGoals = async () => {
        try {
            const response = await fetch('/api/habits/goals');
            if (!response.ok) throw new Error('Failed to fetch goals');
            const data = await response.json();
            setGoals(data);
        } catch (error) {
            console.error('Error fetching goals:', error);
        }
    };

    // Check if habit is scheduled for selected date
    const isHabitScheduledToday = (habit: Habit): boolean => {
        const schedule = habit.schedule as HabitSchedule | null;
        if (!schedule || !schedule.days || schedule.days.length === 0) return true;

        const date = new Date(selectedDate);
        const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();
        return schedule.days.includes(dayOfWeek);
    };

    // Get log for habit
    const getLogForHabit = (habitId: string): HabitLog | undefined => {
        return logs.find(log => log.habit_id === habitId);
    };

    // Check if habit is completed
    const isHabitCompleted = (habit: Habit): boolean => {
        const log = getLogForHabit(habit.id);
        if (!log) return false;

        const schedule = habit.schedule as HabitSchedule | null;
        const targetValue = schedule?.target_per_day || habit.target_value || 1;

        return log.value >= targetValue;
    };

    // Open habit log modal
    const openHabitLogModal = (habit: Habit) => {
        setLoggingHabit(habit);
        setShowHabitLogModal(true);
    };

    // Quick toggle habit (simple complete/uncomplete)
    const quickToggleHabit = async (habit: Habit) => {
        const existingLog = getLogForHabit(habit.id);
        const schedule = habit.schedule as HabitSchedule | null;
        const targetValue = schedule?.target_per_day || habit.target_value || 1;

        if (existingLog) {
            if (existingLog.value >= targetValue) {
                // Delete log
                await fetch(`/api/habits/logs/${existingLog.id}`, { method: 'DELETE' });
            } else {
                // Complete it
                await fetch(`/api/habits/logs/${existingLog.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ value: targetValue }),
                });
            }
        } else {
            // Create new log
            await fetch('/api/habits/logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    owner_id: 'd5682543-5b15-4bf2-90a3-6a3ddf9dc509',
                    habit_id: habit.id,
                    log_date: selectedDate,
                    value: targetValue,
                }),
            });
        }
        refreshLogs();
    };

    // Delete handler
    const handleDelete = async () => {
        if (!deleteConfirmation.id) return;

        try {
            const endpoint = deleteConfirmation.type === 'habit'
                ? `/api/habits/${deleteConfirmation.id}`
                : `/api/habits/goals/${deleteConfirmation.id}`;

            const response = await fetch(endpoint, { method: 'DELETE' });

            if (!response.ok) throw new Error('Failed to delete');

            if (deleteConfirmation.type === 'habit') {
                setHabits(prev => prev.filter(h => h.id !== deleteConfirmation.id));
            } else {
                setGoals(prev => prev.filter(g => g.id !== deleteConfirmation.id));
            }

            setDeleteConfirmation({ show: false, type: 'habit', id: null, name: '' });
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    // Group habits by category and time
    const groupedHabits = habits.reduce((acc, habit) => {
        if (!isHabitScheduledToday(habit)) return acc;

        const category = habit.category || 'other';
        const timeOfDay = habit.time_of_day || 'anytime';

        if (!acc[category]) acc[category] = {};
        if (!acc[category][timeOfDay]) acc[category][timeOfDay] = [];

        acc[category][timeOfDay].push(habit);
        return acc;
    }, {} as Record<string, Record<string, Habit[]>>);

    // Calculate completion stats
    const scheduledHabits = habits.filter(isHabitScheduledToday);
    const completedCount = scheduledHabits.filter(isHabitCompleted).length;
    const totalCount = scheduledHabits.length;
    const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // Date navigation
    const changeDate = (days: number) => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + days);
        setSelectedDate(date.toISOString().split('T')[0]);
    };

    const goToToday = () => {
        setSelectedDate(new Date().toISOString().split('T')[0]);
    };

    const isToday = selectedDate === new Date().toISOString().split('T')[0];

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Habits & Goals</h1>
                        <p className="text-gray-400">Track your daily habits and long-term goals</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowAddHabitModal(true)}
                            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors flex items-center gap-1.5 text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Add Habit
                        </button>
                        <button
                            onClick={() => setShowAddGoalModal(true)}
                            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center gap-1.5 text-sm border border-gray-700"
                        >
                            <Plus className="w-4 h-4" />
                            Add Goal
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm font-medium">Today's Habits</p>
                                <p className="text-3xl font-bold text-white mt-1">{totalCount}</p>
                            </div>
                            <div className="p-3 bg-blue-500/10 rounded-lg">
                                <Check className="w-8 h-8 text-blue-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm font-medium">Completed</p>
                                <p className="text-3xl font-bold text-white mt-1">{completedCount}</p>
                            </div>
                            <div className="p-3 bg-green-500/10 rounded-lg">
                                <Check className="w-8 h-8 text-green-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm font-medium">Active Goals</p>
                                <p className="text-3xl font-bold text-white mt-1">{goals.filter(g => g.status === 'active').length}</p>
                            </div>
                            <div className="p-3 bg-purple-500/10 rounded-lg">
                                <Target className="w-8 h-8 text-purple-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b border-gray-800">
                    <button
                        onClick={() => setActiveTab('habits')}
                        className={`px-6 py-3 font-medium transition-colors relative ${activeTab === 'habits'
                            ? 'text-blue-400'
                            : 'text-gray-400 hover:text-gray-300'
                            }`}
                    >
                        <Calendar className="w-5 h-5 inline mr-2" />
                        Habits
                        {activeTab === 'habits' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('goals')}
                        className={`px-6 py-3 font-medium transition-colors relative ${activeTab === 'goals'
                            ? 'text-blue-400'
                            : 'text-gray-400 hover:text-gray-300'
                            }`}
                    >
                        <Target className="w-5 h-5 inline mr-2" />
                        Goals
                        {activeTab === 'goals' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('manage')}
                        className={`px-6 py-3 font-medium transition-colors relative ${activeTab === 'manage'
                            ? 'text-blue-400'
                            : 'text-gray-400 hover:text-gray-300'
                            }`}
                    >
                        <MoreHorizontal className="w-5 h-5 inline mr-2" />
                        Manage
                        {activeTab === 'manage' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
                        )}
                    </button>
                </div>

                {/* Habits Tab */}
                {activeTab === 'habits' && (
                    <div className="space-y-6">
                        {/* Date Selector */}
                        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => changeDate(-1)}
                                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>

                                <div className="text-center">
                                    <h3 className="text-2xl font-bold">
                                        {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </h3>
                                    {!isToday && (
                                        <button
                                            onClick={goToToday}
                                            className="text-sm text-blue-400 hover:text-blue-300 mt-1"
                                        >
                                            Go to today
                                        </button>
                                    )}
                                </div>

                                <button
                                    onClick={() => changeDate(1)}
                                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-6">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-400">Progress</span>
                                    <span className="font-medium">
                                        {completedCount} / {totalCount} ({completionPercentage}%)
                                    </span>
                                </div>
                                <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500"
                                        style={{ width: `${completionPercentage}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Habits by Category */}
                        {loading ? (
                            <div className="text-center py-12 text-gray-500">Loading habits...</div>
                        ) : Object.keys(groupedHabits).length === 0 ? (
                            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-12 text-center">
                                <p className="text-gray-500 mb-4">No habits scheduled for this day</p>
                            </div>
                        ) : (
                            Object.entries(groupedHabits)
                                .sort(([catA], [catB]) => catA.localeCompare(catB))
                                .map(([category, timeGroups]) => (
                                    <div key={category} className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                                        <h2 className="text-2xl font-bold mb-6">
                                            {CATEGORY_LABELS[category] || category}
                                        </h2>

                                        {TIME_OF_DAY_ORDER.filter(time => timeGroups[time]).map(timeOfDay => (
                                            <div key={timeOfDay} className="mb-6 last:mb-0">
                                                <h3 className="text-lg font-semibold text-gray-300 mb-3">
                                                    {TIME_OF_DAY_LABELS[timeOfDay]}
                                                </h3>

                                                <div className="space-y-2">
                                                    {timeGroups[timeOfDay]
                                                        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                                                        .map(habit => {
                                                            const isCompleted = isHabitCompleted(habit);
                                                            const log = getLogForHabit(habit.id);
                                                            const schedule = habit.schedule as HabitSchedule | null;
                                                            const targetValue = schedule?.target_per_day || habit.target_value || 1;

                                                            return (
                                                                <div
                                                                    key={habit.id}
                                                                    className={`flex items-center justify-between p-4 rounded-lg border transition-all ${isCompleted
                                                                        ? 'bg-violet-500/10 border-violet-500/50'
                                                                        : 'bg-gray-800/50 border-gray-700'
                                                                        }`}
                                                                >
                                                                    <button
                                                                        onClick={() => quickToggleHabit(habit)}
                                                                        className="flex items-center gap-3 flex-1 text-left"
                                                                    >
                                                                        <div
                                                                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isCompleted
                                                                                ? 'bg-violet-500 border-violet-500'
                                                                                : 'border-gray-600 hover:border-gray-500'
                                                                                }`}
                                                                        >
                                                                            {isCompleted && (
                                                                                <Check className="w-4 h-4 text-white" />
                                                                            )}
                                                                        </div>
                                                                        <div>
                                                                            <div className={`font-medium ${isCompleted ? 'text-violet-300' : ''}`}>
                                                                                {habit.name}
                                                                            </div>
                                                                            {habit.unit && (
                                                                                <div className="text-sm text-gray-500">
                                                                                    Target: {targetValue} {habit.unit}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </button>

                                                                    <div className="flex items-center gap-3">
                                                                        {/* Log info */}
                                                                        {log && (
                                                                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                                                                {log.mood && (
                                                                                    <span title="Mood">{MOOD_LABELS[log.mood]}</span>
                                                                                )}
                                                                                {log.time_of_day && (
                                                                                    <span className="text-xs">{log.time_of_day.slice(0, 5)}</span>
                                                                                )}
                                                                                <span>{log.value} / {targetValue}</span>
                                                                            </div>
                                                                        )}

                                                                        {/* Details button */}
                                                                        <button
                                                                            onClick={() => openHabitLogModal(habit)}
                                                                            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                                                                            title="Log details"
                                                                        >
                                                                            <MoreHorizontal className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))
                        )}
                    </div>
                )}

                {/* Goals Tab */}
                {activeTab === 'goals' && (
                    <div className="space-y-6">
                        {goals.length === 0 ? (
                            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-12 text-center">
                                <Target className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                                <p className="text-gray-500 mb-4">No goals yet</p>
                                <button
                                    onClick={() => setShowAddGoalModal(true)}
                                    className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    Add Your First Goal
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {goals
                                    .sort((a, b) => {
                                        if (a.status === 'active' && b.status !== 'active') return -1;
                                        if (a.status !== 'active' && b.status === 'active') return 1;
                                        return 0;
                                    })
                                    .map(goal => {
                                        const progress = goal.current_value || 0;
                                        const target = goal.target_value || 1;
                                        const percentage = Math.min(100, Math.round((progress / target) * 100));
                                        const daysLeft = goal.due_date
                                            ? Math.ceil((new Date(goal.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                                            : null;

                                        return (
                                            <div
                                                key={goal.id}
                                                className={`bg-gray-900 rounded-xl border p-6 transition-all ${
                                                    goal.status === 'active'
                                                        ? 'border-gray-800 hover:border-violet-500/30'
                                                        : goal.status === 'completed'
                                                        ? 'border-green-500/30 bg-green-500/5'
                                                        : 'border-gray-800 opacity-60'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="text-xl font-bold">{goal.name}</h3>
                                                            {goal.status !== 'active' && (
                                                                <span className={`text-xs px-2 py-0.5 rounded ${
                                                                    goal.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                                                    goal.status === 'on_hold' ? 'bg-yellow-500/20 text-yellow-400' :
                                                                    'bg-red-500/20 text-red-400'
                                                                }`}>
                                                                    {goal.status}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {goal.category && (
                                                            <span className="text-xs text-gray-500 uppercase tracking-wider">
                                                                {goal.category}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => {
                                                                setEditingGoal(goal);
                                                                setShowEditGoalModal(true);
                                                            }}
                                                            className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirmation({
                                                                show: true,
                                                                type: 'goal',
                                                                id: goal.id,
                                                                name: goal.name
                                                            })}
                                                            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="mb-4">
                                                    <div className="flex justify-between text-sm mb-2">
                                                        <span className="text-gray-400">Progress</span>
                                                        <span className="font-medium">
                                                            {progress} / {target} {goal.unit}
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-500 ${
                                                                goal.status === 'completed'
                                                                    ? 'bg-gradient-to-r from-green-500 to-green-600'
                                                                    : 'bg-gradient-to-r from-violet-500 to-violet-600'
                                                            }`}
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                    <div className="text-right text-sm text-gray-500 mt-1">
                                                        {percentage}%
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between text-sm text-gray-400">
                                                    {goal.started_at && (
                                                        <span>Started {new Date(goal.started_at).toLocaleDateString()}</span>
                                                    )}
                                                    {daysLeft !== null && goal.status === 'active' && (
                                                        <span className={
                                                            daysLeft < 0 ? 'text-red-400' :
                                                            daysLeft === 0 ? 'text-yellow-400' :
                                                            ''
                                                        }>
                                                            {daysLeft > 0 ? (
                                                                <><Calendar className="w-4 h-4 inline mr-1" />{daysLeft} days left</>
                                                            ) : daysLeft === 0 ? (
                                                                'Due today!'
                                                            ) : (
                                                                `Overdue by ${Math.abs(daysLeft)} days`
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        )}
                    </div>
                )}

                {/* Manage Tab */}
                {activeTab === 'manage' && (
                    <div className="space-y-6">
                        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold">All Habits ({habits.length})</h2>
                                <button
                                    onClick={() => setShowAddHabitModal(true)}
                                    className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm flex items-center gap-1"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add
                                </button>
                            </div>

                            <div className="space-y-2">
                                {habits.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No habits created yet</p>
                                ) : (
                                    habits
                                        .sort((a, b) => (a.category || '').localeCompare(b.category || ''))
                                        .map(habit => {
                                            const schedule = habit.schedule as HabitSchedule | null;
                                            return (
                                                <div
                                                    key={habit.id}
                                                    className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                                                        habit.is_active
                                                            ? 'bg-gray-800/50 border-gray-700'
                                                            : 'bg-gray-800/20 border-gray-800 opacity-50'
                                                    }`}
                                                >
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">{habit.name}</span>
                                                            {!habit.is_active && (
                                                                <span className="text-xs px-1.5 py-0.5 bg-gray-700 text-gray-400 rounded">
                                                                    Inactive
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                                            {habit.category && (
                                                                <span>{CATEGORY_LABELS[habit.category] || habit.category}</span>
                                                            )}
                                                            {habit.time_of_day && (
                                                                <span>{TIME_OF_DAY_LABELS[habit.time_of_day]}</span>
                                                            )}
                                                            {schedule?.days && schedule.days.length < 7 && (
                                                                <span>
                                                                    {schedule.days.map(d => ['', 'M', 'T', 'W', 'T', 'F', 'S', 'S'][d]).join('')}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => {
                                                                setEditingHabit(habit);
                                                                setShowEditHabitModal(true);
                                                            }}
                                                            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirmation({
                                                                show: true,
                                                                type: 'habit',
                                                                id: habit.id,
                                                                name: habit.name
                                                            })}
                                                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <AddHabitModal
                isOpen={showAddHabitModal}
                onClose={() => setShowAddHabitModal(false)}
                onSuccess={(habit) => {
                    setHabits(prev => [...prev, habit]);
                }}
            />

            <EditHabitModal
                isOpen={showEditHabitModal}
                habit={editingHabit}
                onClose={() => {
                    setShowEditHabitModal(false);
                    setEditingHabit(null);
                }}
                onSuccess={(habit) => {
                    setHabits(prev => prev.map(h => h.id === habit.id ? habit : h));
                }}
            />

            <AddGoalModal
                isOpen={showAddGoalModal}
                habits={habits}
                onClose={() => setShowAddGoalModal(false)}
                onSuccess={(goal) => {
                    setGoals(prev => [...prev, goal]);
                }}
            />

            <EditGoalModal
                isOpen={showEditGoalModal}
                goal={editingGoal}
                habits={habits}
                onClose={() => {
                    setShowEditGoalModal(false);
                    setEditingGoal(null);
                }}
                onSuccess={(goal) => {
                    setGoals(prev => prev.map(g => g.id === goal.id ? goal : g));
                }}
            />

            <HabitLogModal
                isOpen={showHabitLogModal}
                habit={loggingHabit}
                existingLog={loggingHabit ? getLogForHabit(loggingHabit.id) || null : null}
                selectedDate={selectedDate}
                onClose={() => {
                    setShowHabitLogModal(false);
                    setLoggingHabit(null);
                }}
                onSuccess={refreshLogs}
            />

            <DeleteConfirmationModal
                isOpen={deleteConfirmation.show}
                onClose={() => setDeleteConfirmation({ show: false, type: 'habit', id: null, name: '' })}
                onConfirm={handleDelete}
                itemName={deleteConfirmation.name}
            />
        </div>
    );
}
