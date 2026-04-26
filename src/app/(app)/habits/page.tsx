// src/app/habits/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Target, Check, Plus, Edit2, Trash2, MoreHorizontal, Flame } from 'lucide-react';
import type { Habit, HabitLog, Goal } from '@/types/habits.types';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import AddHabitModal from './modals/AddHabitModal';
import EditHabitModal from './modals/EditHabitModal';
import AddGoalModal from './modals/AddGoalModal';
import EditGoalModal from './modals/EditGoalModal';
import HabitLogModal from './modals/HabitLogModal';

const STRIP_DAYS = 14;

const PERIOD_LABELS: Record<string, string> = {
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

type HabitFilter = 'all' | 'scheduled_today' | 'done_today' | 'pending_today' | 'inactive';

const FILTER_LABELS: Record<HabitFilter, string> = {
    all: 'All habits',
    scheduled_today: 'Scheduled today',
    done_today: 'Done today',
    pending_today: 'Pending today',
    inactive: 'Inactive',
};

const daysBetween = (a: string, b: string): number => {
    const aMs = Date.UTC(+a.slice(0, 4), +a.slice(5, 7) - 1, +a.slice(8, 10));
    const bMs = Date.UTC(+b.slice(0, 4), +b.slice(5, 7) - 1, +b.slice(8, 10));
    return Math.round((aMs - bMs) / 86_400_000);
};

const todayStr = () => new Date().toISOString().split('T')[0];

const dateMinusDays = (date: string, days: number): string => {
    const d = new Date(date + 'T00:00:00');
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
};

const lastNDates = (n: number, end: string): string[] => {
    const out: string[] = [];
    for (let i = n - 1; i >= 0; i--) out.push(dateMinusDays(end, i));
    return out;
};

const isHabitScheduledOn = (habit: Habit, date: string): boolean => {
    const n = habit.every_n_days || 1;
    if (n === 1) return true;
    const diff = Math.abs(daysBetween(date, habit.anchor_date));
    return diff % n === 0;
};

export default function HabitsPage() {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [logs, setLogs] = useState<HabitLog[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [activeTab, setActiveTab] = useState<'habits' | 'goals'>('habits');
    const [filter, setFilter] = useState<HabitFilter>('all');
    const [loading, setLoading] = useState(true);

    const today = todayStr();
    const stripDates = useMemo(() => lastNDates(STRIP_DAYS, today), [today]);

    // Format the date header — e.g. "Saturday, April 25"
    const todayLabel = useMemo(() => {
        return new Date(today + 'T00:00:00').toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
        });
    }, [today]);

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

    useEffect(() => {
        Promise.all([fetchHabits(), fetchGoals(), fetchRecentLogs()]).finally(() => setLoading(false));
    }, []);

    const fetchHabits = async () => {
        try {
            const response = await fetch('/api/habits?include_inactive=true');
            if (!response.ok) throw new Error('Failed to fetch habits');
            setHabits(await response.json());
        } catch (error) {
            console.error('Error fetching habits:', error);
        }
    };

    const fetchRecentLogs = async () => {
        try {
            const start = stripDates[0];
            const end = stripDates[stripDates.length - 1];
            const response = await fetch(`/api/habits/logs?start_date=${start}&end_date=${end}`);
            if (!response.ok) throw new Error('Failed to fetch logs');
            setLogs(await response.json());
        } catch (error) {
            console.error('Error fetching logs:', error);
        }
    };

    const fetchGoals = async () => {
        try {
            const response = await fetch('/api/habits/goals');
            if (!response.ok) throw new Error('Failed to fetch goals');
            setGoals(await response.json());
        } catch (error) {
            console.error('Error fetching goals:', error);
        }
    };

    const findLog = (habitId: string, date: string): HabitLog | undefined =>
        logs.find((l) => l.habit_id === habitId && l.log_date === date);

    const isCompleted = (habit: Habit, date: string): boolean => {
        const log = findLog(habit.id, date);
        if (!log) return false;
        const target = habit.target_per_day || habit.target_value || 1;
        return log.value >= target;
    };

    const computeStreak = (habit: Habit): number => {
        let streak = 0;
        let cursor = today;
        for (let i = 0; i < 365; i++) {
            if (isHabitScheduledOn(habit, cursor)) {
                if (isCompleted(habit, cursor)) {
                    streak += 1;
                } else if (cursor !== today) {
                    break;
                }
            }
            cursor = dateMinusDays(cursor, 1);
        }
        return streak;
    };

    const openHabitLogModal = (habit: Habit) => {
        setLoggingHabit(habit);
        setShowHabitLogModal(true);
    };

    const toggleHabitOn = async (habit: Habit, date: string) => {
        const existing = findLog(habit.id, date);
        const target = habit.target_per_day || habit.target_value || 1;

        if (existing) {
            if (existing.value >= target) {
                setLogs((prev) => prev.filter((l) => l.id !== existing.id));
                await fetch(`/api/habits/logs/${existing.id}`, { method: 'DELETE' });
            } else {
                setLogs((prev) =>
                    prev.map((l) => (l.id === existing.id ? { ...l, value: target } : l))
                );
                await fetch(`/api/habits/logs/${existing.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ value: target }),
                });
            }
        } else {
            const tempId = `temp-${Date.now()}`;
            const optimistic: HabitLog = {
                id: tempId,
                owner_id: '',
                habit_id: habit.id,
                log_date: date,
                value: target,
                note: null,
                time_of_day: null,
                mood: null,
                created_at: new Date().toISOString(),
            };
            setLogs((prev) => [...prev, optimistic]);
            const response = await fetch('/api/habits/logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ habit_id: habit.id, log_date: date, value: target }),
            });
            if (response.ok) {
                const real = await response.json();
                setLogs((prev) => prev.map((l) => (l.id === tempId ? real : l)));
            } else {
                setLogs((prev) => prev.filter((l) => l.id !== tempId));
            }
        }
    };

    const handleLogModalSuccess = async () => {
        await fetchRecentLogs();
    };

    const handleDelete = async () => {
        if (!deleteConfirmation.id) return;
        try {
            const endpoint =
                deleteConfirmation.type === 'habit'
                    ? `/api/habits/${deleteConfirmation.id}`
                    : `/api/habits/goals/${deleteConfirmation.id}`;

            const response = await fetch(endpoint, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete');

            if (deleteConfirmation.type === 'habit') {
                setHabits((prev) => prev.filter((h) => h.id !== deleteConfirmation.id));
            } else {
                setGoals((prev) => prev.filter((g) => g.id !== deleteConfirmation.id));
            }
            setDeleteConfirmation({ show: false, type: 'habit', id: null, name: '' });
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    // Apply the active filter
    const filteredHabits = habits.filter((h) => {
        switch (filter) {
            case 'all':
                return h.is_active;
            case 'scheduled_today':
                return h.is_active && isHabitScheduledOn(h, today);
            case 'done_today':
                return h.is_active && isHabitScheduledOn(h, today) && isCompleted(h, today);
            case 'pending_today':
                return h.is_active && isHabitScheduledOn(h, today) && !isCompleted(h, today);
            case 'inactive':
                return !h.is_active;
        }
    });

    // Counts for chip badges
    const activeHabits = habits.filter((h) => h.is_active);
    const scheduledTodayList = activeHabits.filter((h) => isHabitScheduledOn(h, today));
    const doneTodayList = scheduledTodayList.filter((h) => isCompleted(h, today));
    const filterCounts: Record<HabitFilter, number> = {
        all: activeHabits.length,
        scheduled_today: scheduledTodayList.length,
        done_today: doneTodayList.length,
        pending_today: scheduledTodayList.length - doneTodayList.length,
        inactive: habits.length - activeHabits.length,
    };

    const completionPct =
        scheduledTodayList.length > 0
            ? Math.round((doneTodayList.length / scheduledTodayList.length) * 100)
            : 0;

    // Group filtered habits by category
    const grouped = filteredHabits.reduce((acc, h) => {
        const cat = h.category || 'other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(h);
        return acc;
    }, {} as Record<string, Habit[]>);

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            {/* Sticky date header */}
            <div className="sticky top-0 z-20 bg-gray-950/90 backdrop-blur border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500">Today</p>
                        <p className="text-lg font-semibold text-white">{todayLabel}</p>
                    </div>
                    {scheduledTodayList.length > 0 && (
                        <div className="text-right">
                            <p className="text-xs text-gray-400">
                                {doneTodayList.length} / {scheduledTodayList.length} done
                            </p>
                            <div className="mt-1 w-32 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-violet-500 to-violet-400 transition-all"
                                    style={{ width: `${completionPct}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Habits & Goals</h1>
                        <p className="text-gray-400">Your everyday tasks, ongoing</p>
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
                                <p className="text-gray-400 text-sm font-medium">Active Habits</p>
                                <p className="text-3xl font-bold text-white mt-1">{activeHabits.length}</p>
                            </div>
                            <div className="p-3 bg-green-500/10 rounded-lg">
                                <Flame className="w-8 h-8 text-green-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm font-medium">This Week</p>
                                <p className="text-3xl font-bold text-white mt-1">
                                    {(() => {
                                        const weekDates = lastNDates(7, today);
                                        let scheduled = 0;
                                        let done = 0;
                                        for (const h of activeHabits) {
                                            for (const d of weekDates) {
                                                if (isHabitScheduledOn(h, d)) {
                                                    scheduled += 1;
                                                    if (isCompleted(h, d)) done += 1;
                                                }
                                            }
                                        }
                                        return scheduled === 0 ? '0%' : `${Math.round((done / scheduled) * 100)}%`;
                                    })()}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">last 7 days</p>
                            </div>
                            <div className="p-3 bg-blue-500/10 rounded-lg">
                                <Check className="w-8 h-8 text-blue-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm font-medium">Active Goals</p>
                                <p className="text-3xl font-bold text-white mt-1">
                                    {goals.filter((g) => g.status === 'active').length}
                                </p>
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
                        className={`px-6 py-3 font-medium transition-colors relative ${
                            activeTab === 'habits' ? 'text-blue-400' : 'text-gray-400 hover:text-gray-300'
                        }`}
                    >
                        Habits
                        {activeTab === 'habits' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('goals')}
                        className={`px-6 py-3 font-medium transition-colors relative ${
                            activeTab === 'goals' ? 'text-blue-400' : 'text-gray-400 hover:text-gray-300'
                        }`}
                    >
                        Goals
                        {activeTab === 'goals' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
                        )}
                    </button>
                </div>

                {/* Habits Tab */}
                {activeTab === 'habits' && (
                    <div className="space-y-6">
                        {/* Filter chips */}
                        <div className="flex flex-wrap gap-2">
                            {(Object.keys(FILTER_LABELS) as HabitFilter[]).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                                        filter === f
                                            ? 'bg-violet-600 text-white'
                                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                                    }`}
                                >
                                    {FILTER_LABELS[f]}
                                    <span
                                        className={`text-xs px-1.5 py-0.5 rounded ${
                                            filter === f ? 'bg-violet-700 text-violet-100' : 'bg-gray-900 text-gray-500'
                                        }`}
                                    >
                                        {filterCounts[f]}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Strip legend */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                            <span>Last {STRIP_DAYS} days · click any cell to toggle</span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded bg-violet-500" /> done
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded bg-gray-700" /> scheduled
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded bg-gray-900 border border-gray-800" /> not scheduled
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded ring-2 ring-blue-400" /> today
                            </span>
                        </div>


                        {loading ? (
                            <div className="text-center py-12 text-gray-500">Loading habits...</div>
                        ) : filteredHabits.length === 0 ? (
                            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-12 text-center">
                                <p className="text-gray-500 mb-4">
                                    {filter === 'all' && habits.length === 0
                                        ? 'No habits yet'
                                        : `No habits match "${FILTER_LABELS[filter]}"`}
                                </p>
                                {filter === 'all' && habits.length === 0 && (
                                    <button
                                        onClick={() => setShowAddHabitModal(true)}
                                        className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors"
                                    >
                                        Add Your First Habit
                                    </button>
                                )}
                            </div>
                        ) : (
                            Object.entries(grouped)
                                .sort(([a], [b]) => a.localeCompare(b))
                                .map(([category, categoryHabits]) => (
                                    <div
                                        key={category}
                                        className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden"
                                    >
                                        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between gap-4">
                                            <h2 className="text-lg font-bold">
                                                {CATEGORY_LABELS[category] || category}
                                                <span className="ml-2 text-sm font-normal text-gray-500">
                                                    ({categoryHabits.length})
                                                </span>
                                            </h2>
                                        </div>

                                        <div className="divide-y divide-gray-800">
                                            {categoryHabits
                                                .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                                                .map((habit) => {
                                                    const streak = computeStreak(habit);
                                                    const n = habit.every_n_days || 1;
                                                    const cadence = n === 1 ? 'Daily' : `Every ${n}d`;

                                                    return (
                                                        <div
                                                            key={habit.id}
                                                            className={`p-4 flex items-center gap-4 transition-colors ${
                                                                !habit.is_active ? 'opacity-50' : ''
                                                            }`}
                                                        >
                                                            {/* Name + meta */}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <Link
                                                                        href={`/habits/${habit.id}`}
                                                                        className="font-medium truncate hover:text-violet-400 transition-colors"
                                                                    >
                                                                        {habit.name}
                                                                    </Link>
                                                                    <span className="text-xs px-1.5 py-0.5 rounded font-normal bg-gray-700/50 text-gray-400">
                                                                        {cadence}
                                                                    </span>
                                                                    {habit.period && (
                                                                        <span className="text-xs text-gray-500">
                                                                            {PERIOD_LABELS[habit.period] || habit.period}
                                                                        </span>
                                                                    )}
                                                                    {!habit.is_active && (
                                                                        <span className="text-xs px-1.5 py-0.5 bg-gray-700 text-gray-400 rounded">
                                                                            Inactive
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {habit.unit && (
                                                                    <div className="text-xs text-gray-500 mt-0.5">
                                                                        Target:{' '}
                                                                        {habit.target_per_day ||
                                                                            habit.target_value ||
                                                                            1}{' '}
                                                                        {habit.unit}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Streak */}
                                                            {streak > 0 && (
                                                                <div className="flex items-center gap-1 text-sm text-orange-400 shrink-0">
                                                                    <Flame className="w-4 h-4" />
                                                                    <span className="font-semibold">{streak}</span>
                                                                </div>
                                                            )}

                                                            {/* Day strip — labels and boxes share the same flex column so widths line up exactly */}
                                                            <div className="flex flex-col gap-1 shrink-0">
                                                                <div className="flex gap-3">
                                                                    {[stripDates.slice(0, 7), stripDates.slice(7, 14)].map((week, wi) => (
                                                                        <div key={wi} className="flex gap-1">
                                                                            {week.map((d) => {
                                                                                const dow = new Date(d + 'T00:00:00').getDay();
                                                                                const isToday = d === today;
                                                                                const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                                                                                return (
                                                                                    <div
                                                                                        key={d}
                                                                                        className={`w-6 text-center text-[10px] font-semibold ${
                                                                                            isToday ? 'text-blue-400' : 'text-gray-600'
                                                                                        }`}
                                                                                    >
                                                                                        {labels[dow]}
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <div className="flex gap-3">
                                                                    {[stripDates.slice(0, 7), stripDates.slice(7, 14)].map((week, wi) => (
                                                                        <div key={wi} className="flex gap-1">
                                                                            {week.map((d) => {
                                                                                const scheduled = isHabitScheduledOn(habit, d);
                                                                                const done = isCompleted(habit, d);
                                                                                const isToday = d === today;
                                                                                return (
                                                                                    <button
                                                                                        key={d}
                                                                                        onClick={() =>
                                                                                            scheduled && toggleHabitOn(habit, d)
                                                                                        }
                                                                                        disabled={!scheduled}
                                                                                        title={`${new Date(
                                                                                            d + 'T00:00:00'
                                                                                        ).toLocaleDateString('en-US', {
                                                                                            weekday: 'short',
                                                                                            month: 'short',
                                                                                            day: 'numeric',
                                                                                        })}${isToday ? ' (today)' : ''}${
                                                                                            scheduled ? '' : ' · not scheduled'
                                                                                        }${done ? ' · done' : ''}`}
                                                                                        className={`w-6 h-6 rounded transition-colors ${
                                                                                            isToday ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-900' : ''
                                                                                        } ${
                                                                                            !scheduled
                                                                                                ? 'bg-gray-900 border border-gray-800 cursor-not-allowed'
                                                                                                : done
                                                                                                  ? 'bg-violet-500 hover:bg-violet-400'
                                                                                                  : 'bg-gray-700 hover:bg-gray-600'
                                                                                        }`}
                                                                                    />
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {/* Actions */}
                                                            <div className="flex gap-1 shrink-0">
                                                                <button
                                                                    onClick={() => openHabitLogModal(habit)}
                                                                    className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                                                                    title="Log details"
                                                                >
                                                                    <MoreHorizontal className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingHabit(habit);
                                                                        setShowEditHabitModal(true);
                                                                    }}
                                                                    className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
                                                                    title="Edit"
                                                                >
                                                                    <Edit2 className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        setDeleteConfirmation({
                                                                            show: true,
                                                                            type: 'habit',
                                                                            id: habit.id,
                                                                            name: habit.name,
                                                                        })
                                                                    }
                                                                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
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
                                    .map((goal) => {
                                        const progress = goal.current_value || 0;
                                        const target = goal.target_value || 1;
                                        const percentage = Math.min(100, Math.round((progress / target) * 100));
                                        const daysLeft = goal.due_date
                                            ? Math.ceil(
                                                  (new Date(goal.due_date).getTime() - new Date().getTime()) /
                                                      (1000 * 60 * 60 * 24)
                                              )
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
                                                                <span
                                                                    className={`text-xs px-2 py-0.5 rounded ${
                                                                        goal.status === 'completed'
                                                                            ? 'bg-green-500/20 text-green-400'
                                                                            : goal.status === 'on_hold'
                                                                              ? 'bg-yellow-500/20 text-yellow-400'
                                                                              : 'bg-red-500/20 text-red-400'
                                                                    }`}
                                                                >
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
                                                            onClick={() =>
                                                                setDeleteConfirmation({
                                                                    show: true,
                                                                    type: 'goal',
                                                                    id: goal.id,
                                                                    name: goal.name,
                                                                })
                                                            }
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
                                                        <span>
                                                            Started {new Date(goal.started_at).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                    {daysLeft !== null && goal.status === 'active' && (
                                                        <span
                                                            className={
                                                                daysLeft < 0
                                                                    ? 'text-red-400'
                                                                    : daysLeft === 0
                                                                      ? 'text-yellow-400'
                                                                      : ''
                                                            }
                                                        >
                                                            {daysLeft > 0
                                                                ? `${daysLeft} days left`
                                                                : daysLeft === 0
                                                                  ? 'Due today!'
                                                                  : `Overdue by ${Math.abs(daysLeft)} days`}
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
            </div>

            {/* Modals */}
            <AddHabitModal
                isOpen={showAddHabitModal}
                onClose={() => setShowAddHabitModal(false)}
                onSuccess={(habit) => setHabits((prev) => [...prev, habit])}
            />

            <EditHabitModal
                isOpen={showEditHabitModal}
                habit={editingHabit}
                onClose={() => {
                    setShowEditHabitModal(false);
                    setEditingHabit(null);
                }}
                onSuccess={(habit) => setHabits((prev) => prev.map((h) => (h.id === habit.id ? habit : h)))}
            />

            <AddGoalModal
                isOpen={showAddGoalModal}
                habits={habits}
                onClose={() => setShowAddGoalModal(false)}
                onSuccess={(goal) => setGoals((prev) => [...prev, goal])}
            />

            <EditGoalModal
                isOpen={showEditGoalModal}
                goal={editingGoal}
                habits={habits}
                onClose={() => {
                    setShowEditGoalModal(false);
                    setEditingGoal(null);
                }}
                onSuccess={(goal) => setGoals((prev) => prev.map((g) => (g.id === goal.id ? goal : g)))}
            />

            <HabitLogModal
                isOpen={showHabitLogModal}
                habit={loggingHabit}
                existingLog={loggingHabit ? findLog(loggingHabit.id, today) || null : null}
                selectedDate={today}
                onClose={() => {
                    setShowHabitLogModal(false);
                    setLoggingHabit(null);
                }}
                onSuccess={handleLogModalSuccess}
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
