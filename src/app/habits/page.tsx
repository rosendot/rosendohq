// src/app/habits/page.tsx
'use client';

import { useState } from 'react';

interface Habit {
    id: string;
    name: string;
    unit?: string;
    target_value?: number;
    created_at: string;
}

interface HabitLog {
    id: string;
    habit_id: string;
    log_date: string;
    value: number;
    note?: string;
    created_at: string;
}

interface Goal {
    id: string;
    name: string;
    target_value: number;
    unit?: string;
    due_date?: string;
    progress_source?: 'manual' | 'habit';
    linked_habit_id?: string;
    current_value?: number;
    notes?: string;
    created_at: string;
}

// Minimal mock data
const mockHabits: Habit[] = [
    {
        id: '1',
        name: 'Exercise',
        unit: 'minutes',
        target_value: 30,
        created_at: '2025-01-01T10:00:00Z'
    },
    {
        id: '2',
        name: 'Read',
        unit: 'pages',
        target_value: 20,
        created_at: '2025-01-01T10:00:00Z'
    }
];

const mockHabitLogs: HabitLog[] = [
    { id: '1', habit_id: '1', log_date: '2025-01-05', value: 30, created_at: '2025-01-05T18:00:00Z' },
    { id: '2', habit_id: '2', log_date: '2025-01-05', value: 25, created_at: '2025-01-05T21:00:00Z' },
];

const mockGoals: Goal[] = [
    {
        id: '1',
        name: 'Exercise 100 hours this year',
        target_value: 100,
        unit: 'hours',
        due_date: '2025-12-31',
        progress_source: 'habit',
        linked_habit_id: '1',
        current_value: 5,
        created_at: '2025-01-01T10:00:00Z'
    }
];

export default function HabitsPage() {
    const [habits, setHabits] = useState<Habit[]>(mockHabits);
    const [logs, setLogs] = useState<HabitLog[]>(mockHabitLogs);
    const [goals, setGoals] = useState<Goal[]>(mockGoals);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [isAddingHabit, setIsAddingHabit] = useState(false);
    const [isAddingGoal, setIsAddingGoal] = useState(false);
    const [activeTab, setActiveTab] = useState<'today' | 'goals'>('today');

    const [newHabit, setNewHabit] = useState({
        name: '',
        unit: '',
        target_value: ''
    });

    const [newGoal, setNewGoal] = useState({
        name: '',
        target_value: '',
        unit: '',
        due_date: '',
        progress_source: 'manual' as 'manual' | 'habit',
        linked_habit_id: '',
        current_value: '0',
        notes: ''
    });

    const getHabitLogForDate = (habitId: string, date: string) => {
        return logs.find(log => log.habit_id === habitId && log.log_date === date);
    };

    const calculateStreak = (habitId: string) => {
        const habitLogs = logs
            .filter(log => log.habit_id === habitId)
            .sort((a, b) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime());

        if (habitLogs.length === 0) return 0;

        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < habitLogs.length; i++) {
            const logDate = new Date(habitLogs[i].log_date);
            logDate.setHours(0, 0, 0, 0);

            const expectedDate = new Date(today);
            expectedDate.setDate(expectedDate.getDate() - i);
            expectedDate.setHours(0, 0, 0, 0);

            if (logDate.getTime() === expectedDate.getTime()) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    };

    const logHabitQuick = (habitId: string, value: number) => {
        const existingLog = getHabitLogForDate(habitId, selectedDate);

        if (existingLog) {
            setLogs(logs.map(log =>
                log.id === existingLog.id
                    ? { ...log, value: existingLog.value + value }
                    : log
            ));
        } else {
            const newLog: HabitLog = {
                id: Date.now().toString(),
                habit_id: habitId,
                log_date: selectedDate,
                value: value,
                created_at: new Date().toISOString()
            };
            setLogs([newLog, ...logs]);
        }
    };

    const addNewHabit = () => {
        if (!newHabit.name.trim()) return;

        const habit: Habit = {
            id: Date.now().toString(),
            name: newHabit.name.trim(),
            unit: newHabit.unit.trim() || undefined,
            target_value: newHabit.target_value ? Number(newHabit.target_value) : undefined,
            created_at: new Date().toISOString()
        };

        setHabits([...habits, habit]);
        setNewHabit({ name: '', unit: '', target_value: '' });
        setIsAddingHabit(false);
    };

    const addNewGoal = () => {
        if (!newGoal.name.trim() || !newGoal.target_value) return;

        const goal: Goal = {
            id: Date.now().toString(),
            name: newGoal.name.trim(),
            target_value: Number(newGoal.target_value),
            unit: newGoal.unit.trim() || undefined,
            due_date: newGoal.due_date || undefined,
            progress_source: newGoal.progress_source,
            linked_habit_id: newGoal.linked_habit_id || undefined,
            current_value: Number(newGoal.current_value),
            notes: newGoal.notes.trim() || undefined,
            created_at: new Date().toISOString()
        };

        setGoals([...goals, goal]);
        setNewGoal({
            name: '',
            target_value: '',
            unit: '',
            due_date: '',
            progress_source: 'manual',
            linked_habit_id: '',
            current_value: '0',
            notes: ''
        });
        setIsAddingGoal(false);
    };

    const updateGoalProgress = (goalId: string, delta: number) => {
        setGoals(goals.map(goal =>
            goal.id === goalId
                ? { ...goal, current_value: Math.max(0, (goal.current_value || 0) + delta) }
                : goal
        ));
    };

    const deleteHabit = (habitId: string) => {
        if (confirm('Are you sure you want to delete this habit? All logs will be deleted.')) {
            setHabits(habits.filter(h => h.id !== habitId));
            setLogs(logs.filter(l => l.habit_id !== habitId));
        }
    };

    const deleteGoal = (goalId: string) => {
        if (confirm('Are you sure you want to delete this goal?')) {
            setGoals(goals.filter(g => g.id !== goalId));
        }
    };

    const getGoalProgress = (goal: Goal) => {
        const current = goal.current_value || 0;
        const percentage = Math.min(100, Math.round((current / goal.target_value) * 100));
        return { current, percentage };
    };

    const getDaysUntilDue = (dueDate?: string) => {
        if (!dueDate) return null;
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    return (
        <div className="min-h-screen bg-gray-950 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                    <h1 className="text-3xl font-bold text-white mb-2">Habits & Goals</h1>
                    <p className="text-gray-400">Track your daily habits and long-term goals</p>
                </div>

                {/* Tabs */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                    <div className="flex border-b border-gray-800">
                        <button
                            onClick={() => setActiveTab('today')}
                            className={`flex-1 px-6 py-4 font-medium transition-colors ${activeTab === 'today'
                                ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-500/10'
                                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
                                }`}
                        >
                            Today's Habits
                        </button>
                        <button
                            onClick={() => setActiveTab('goals')}
                            className={`flex-1 px-6 py-4 font-medium transition-colors ${activeTab === 'goals'
                                ? 'text-violet-400 border-b-2 border-violet-400 bg-violet-500/10'
                                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
                                }`}
                        >
                            Goals
                        </button>
                    </div>
                </div>

                {/* Today's Habits Tab */}
                {activeTab === 'today' && (
                    <div className="space-y-6">
                        {/* Date Selector */}
                        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Tracking Date
                                    </label>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>
                                <button
                                    onClick={() => setIsAddingHabit(true)}
                                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-md"
                                >
                                    Add Habit
                                </button>
                            </div>
                        </div>

                        {/* Add Habit Form */}
                        {isAddingHabit && (
                            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Add New Habit</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            Habit Name*
                                        </label>
                                        <input
                                            type="text"
                                            value={newHabit.name}
                                            onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            placeholder="e.g., Exercise, Read, Meditate"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                                Unit
                                            </label>
                                            <input
                                                type="text"
                                                value={newHabit.unit}
                                                onChange={(e) => setNewHabit({ ...newHabit, unit: e.target.value })}
                                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                placeholder="e.g., minutes, pages"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                                Daily Target
                                            </label>
                                            <input
                                                type="number"
                                                value={newHabit.target_value}
                                                onChange={(e) => setNewHabit({ ...newHabit, target_value: e.target.value })}
                                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                placeholder="Optional"
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        <button
                                            onClick={addNewHabit}
                                            disabled={!newHabit.name.trim()}
                                            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
                                        >
                                            Add Habit
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsAddingHabit(false);
                                                setNewHabit({ name: '', unit: '', target_value: '' });
                                            }}
                                            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Habits Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {habits.map(habit => {
                                const todayLog = getHabitLogForDate(habit.id, selectedDate);
                                const streak = calculateStreak(habit.id);
                                const currentValue = todayLog?.value || 0;
                                const targetValue = habit.target_value || 1;
                                const percentage = Math.min(100, Math.round((currentValue / targetValue) * 100));
                                const isComplete = currentValue >= targetValue;

                                return (
                                    <div
                                        key={habit.id}
                                        className={`bg-gray-900 rounded-xl border p-6 transition-all duration-200 ${isComplete
                                            ? 'border-emerald-500/50 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5'
                                            : 'border-gray-800 hover:border-emerald-500/30'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-xl font-bold text-white">{habit.name}</h3>
                                                    {isComplete && <span className="text-2xl">✅</span>}
                                                </div>
                                                {streak > 0 && (
                                                    <div className="flex items-center gap-1 text-orange-400">
                                                        <span className="text-lg">🔥</span>
                                                        <span className="font-semibold">{streak} day streak</span>
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => deleteHabit(habit.id)}
                                                className="text-red-400 hover:text-red-300 text-sm transition-colors"
                                                title="Delete habit"
                                            >
                                                ✕
                                            </button>
                                        </div>

                                        {/* Progress */}
                                        <div className="mb-4">
                                            <div className="flex justify-between text-sm text-gray-400 mb-2">
                                                <span>
                                                    {currentValue} {habit.unit && `${habit.unit}`}
                                                    {habit.target_value && ` / ${habit.target_value}`}
                                                </span>
                                                <span className="font-medium">{percentage}%</span>
                                            </div>
                                            <div className="w-full bg-gray-800 rounded-full h-3">
                                                <div
                                                    className={`h-3 rounded-full transition-all duration-300 ${isComplete
                                                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                                                        : 'bg-gradient-to-r from-emerald-600 to-emerald-700'
                                                        }`}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Quick Actions */}
                                        <div className="flex gap-2">
                                            {habit.target_value && (
                                                <button
                                                    onClick={() => logHabitQuick(habit.id, habit.target_value!)}
                                                    className="flex-1 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors font-medium"
                                                >
                                                    +{habit.target_value}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => logHabitQuick(habit.id, 1)}
                                                className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors font-medium"
                                            >
                                                +1
                                            </button>
                                            {!isComplete && habit.target_value && (
                                                <button
                                                    onClick={() => logHabitQuick(habit.id, habit.target_value! - currentValue)}
                                                    className="px-3 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-500 transition-colors font-medium"
                                                >
                                                    Complete
                                                </button>
                                            )}
                                        </div>

                                        {todayLog?.note && (
                                            <div className="mt-3 text-sm text-gray-400 italic bg-gray-800/60 p-2 rounded">
                                                &ldquo;{todayLog.note}&rdquo;
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {habits.length === 0 && (
                            <div className="text-center text-gray-500 py-12 bg-gray-900 rounded-xl border border-gray-800">
                                <p className="text-lg">No habits yet.</p>
                                <p className="text-sm">Add your first habit to start tracking!</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Goals Tab */}
                {activeTab === 'goals' && (
                    <div className="space-y-6">
                        {/* Add Goal Button */}
                        <div className="flex justify-end">
                            <button
                                onClick={() => setIsAddingGoal(true)}
                                className="px-4 py-2 bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-lg hover:from-violet-600 hover:to-violet-700 transition-all duration-200 shadow-md"
                            >
                                Add Goal
                            </button>
                        </div>

                        {/* Add Goal Form */}
                        {isAddingGoal && (
                            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Add New Goal</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            Goal Name*
                                        </label>
                                        <input
                                            type="text"
                                            value={newGoal.name}
                                            onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                            placeholder="e.g., Read 12 books, Exercise 100 hours"
                                        />
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                                Target Value*
                                            </label>
                                            <input
                                                type="number"
                                                value={newGoal.target_value}
                                                onChange={(e) => setNewGoal({ ...newGoal, target_value: e.target.value })}
                                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                                placeholder="100"
                                                min="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                                Unit
                                            </label>
                                            <input
                                                type="text"
                                                value={newGoal.unit}
                                                onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                                placeholder="hours"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                                Due Date
                                            </label>
                                            <input
                                                type="date"
                                                value={newGoal.due_date}
                                                onChange={(e) => setNewGoal({ ...newGoal, due_date: e.target.value })}
                                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            Notes
                                        </label>
                                        <textarea
                                            value={newGoal.notes}
                                            onChange={(e) => setNewGoal({ ...newGoal, notes: e.target.value })}
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                            rows={2}
                                            placeholder="Optional notes about this goal"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={addNewGoal}
                                            disabled={!newGoal.name.trim() || !newGoal.target_value}
                                            className="px-4 py-2 bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-lg hover:from-violet-600 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
                                        >
                                            Add Goal
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsAddingGoal(false);
                                                setNewGoal({
                                                    name: '',
                                                    target_value: '',
                                                    unit: '',
                                                    due_date: '',
                                                    progress_source: 'manual',
                                                    linked_habit_id: '',
                                                    current_value: '0',
                                                    notes: ''
                                                });
                                            }}
                                            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Goals Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {goals.map(goal => {
                                const { current, percentage } = getGoalProgress(goal);
                                const daysUntilDue = getDaysUntilDue(goal.due_date);

                                return (
                                    <div
                                        key={goal.id}
                                        className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-violet-500/30 transition-all duration-200"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-white mb-1">{goal.name}</h3>
                                                {goal.notes && (
                                                    <p className="text-sm text-gray-400 italic">{goal.notes}</p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => deleteGoal(goal.id)}
                                                className="text-red-400 hover:text-red-300 text-sm transition-colors"
                                                title="Delete goal"
                                            >
                                                ✕
                                            </button>
                                        </div>

                                        {/* Progress */}
                                        <div className="mb-4">
                                            <div className="flex justify-between text-sm text-gray-400 mb-2">
                                                <span>
                                                    {current} / {goal.target_value} {goal.unit}
                                                </span>
                                                <span className="font-medium">{percentage}%</span>
                                            </div>
                                            <div className="w-full bg-gray-800 rounded-full h-3">
                                                <div
                                                    className="h-3 rounded-full bg-gradient-to-r from-violet-600 to-violet-700 transition-all duration-300"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Due Date */}
                                        {daysUntilDue !== null && (
                                            <div className="mb-4 text-sm">
                                                {daysUntilDue > 0 ? (
                                                    <span className="text-gray-400">
                                                        📅 {daysUntilDue} days remaining
                                                    </span>
                                                ) : daysUntilDue === 0 ? (
                                                    <span className="text-yellow-400">📅 Due today!</span>
                                                ) : (
                                                    <span className="text-red-400">📅 Overdue by {Math.abs(daysUntilDue)} days</span>
                                                )}
                                            </div>
                                        )}

                                        {/* Manual Progress Controls */}
                                        {goal.progress_source === 'manual' && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => updateGoalProgress(goal.id, -1)}
                                                    className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                                                    disabled={current === 0}
                                                >
                                                    -1
                                                </button>
                                                <button
                                                    onClick={() => updateGoalProgress(goal.id, 1)}
                                                    className="flex-1 px-3 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-500 transition-colors font-medium"
                                                >
                                                    +1
                                                </button>
                                            </div>
                                        )}

                                        {/* Habit-Linked Badge */}
                                        {goal.progress_source === 'habit' && goal.linked_habit_id && (
                                            <div className="mt-3 text-sm text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20">
                                                🔗 Linked to habit
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {goals.length === 0 && (
                            <div className="text-center text-gray-500 py-12 bg-gray-900 rounded-xl border border-gray-800">
                                <p className="text-lg">No goals yet.</p>
                                <p className="text-sm">Add your first goal to start tracking!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}