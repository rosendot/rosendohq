// src/app/habits/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Target, TrendingUp, Calendar, Check } from 'lucide-react';
import type { Habit, HabitLog, Goal, HabitSchedule } from '@/types/database.types';

const OWNER_ID = 'd5682543-5b15-4bf2-90a3-6a3ddf9dc509';

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
};

export default function HabitsPage() {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [logs, setLogs] = useState<HabitLog[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>(
        new Date().toISOString().split('T')[0]
    );
    const [activeTab, setActiveTab] = useState<'today' | 'goals'>('today');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHabits();
        fetchGoals();
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [selectedDate]);

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

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/habits/logs?date=${selectedDate}`);
            if (!response.ok) throw new Error('Failed to fetch logs');
            const data = await response.json();
            setLogs(data);
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
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

    // Toggle habit completion
    const toggleHabit = async (habit: Habit) => {
        const existingLog = getLogForHabit(habit.id);
        const schedule = habit.schedule as HabitSchedule | null;
        const targetValue = schedule?.target_per_day || habit.target_value || 1;

        if (existingLog) {
            // If completed, delete log; if incomplete, complete it
            if (existingLog.value >= targetValue) {
                await fetch(`/api/habits/logs/${existingLog.id}`, {
                    method: 'DELETE',
                });
            } else {
                await fetch(`/api/habits/logs/${existingLog.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ value: targetValue }),
                });
            }
        } else {
            // Create new log
            await fetch('/api/habits/logs', {  // ← Changed from /api/habit-logs
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    owner_id: OWNER_ID,
                    habit_id: habit.id,
                    log_date: selectedDate,
                    value: targetValue,
                }),
            });
        }

        fetchLogs();
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
        <div className="min-h-screen bg-black text-white p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">Habits & Goals</h1>
                    <p className="text-gray-400">Track your daily habits and long-term goals</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b border-gray-800">
                    <button
                        onClick={() => setActiveTab('today')}
                        className={`px-6 py-3 font-medium transition-colors relative ${activeTab === 'today'
                            ? 'text-violet-400'
                            : 'text-gray-400 hover:text-gray-300'
                            }`}
                    >
                        <Calendar className="w-5 h-5 inline mr-2" />
                        Today
                        {activeTab === 'today' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-400" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('goals')}
                        className={`px-6 py-3 font-medium transition-colors relative ${activeTab === 'goals'
                            ? 'text-violet-400'
                            : 'text-gray-400 hover:text-gray-300'
                            }`}
                    >
                        <Target className="w-5 h-5 inline mr-2" />
                        Goals
                        {activeTab === 'goals' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-400" />
                        )}
                    </button>
                </div>

                {/* Today Tab */}
                {activeTab === 'today' && (
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
                                            className="text-sm text-violet-400 hover:text-violet-300 mt-1"
                                        >
                                            Go to today
                                        </button>
                                    )}
                                </div>

                                <button
                                    onClick={() => changeDate(1)}
                                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                                    disabled={isToday}
                                >
                                    <svg className={`w-5 h-5 ${isToday ? 'opacity-30' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                        className="bg-gradient-to-r from-violet-500 to-violet-600 h-full rounded-full transition-all duration-500"
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
                                                                <button
                                                                    key={habit.id}
                                                                    onClick={() => toggleHabit(habit)}
                                                                    className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${isCompleted
                                                                        ? 'bg-violet-500/10 border-violet-500/50 hover:bg-violet-500/20'
                                                                        : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800'
                                                                        }`}
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <div
                                                                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isCompleted
                                                                                ? 'bg-violet-500 border-violet-500'
                                                                                : 'border-gray-600'
                                                                                }`}
                                                                        >
                                                                            {isCompleted && (
                                                                                <Check className="w-4 h-4 text-white" />
                                                                            )}
                                                                        </div>
                                                                        <div className="text-left">
                                                                            <div className={`font-medium ${isCompleted ? 'text-violet-300' : ''}`}>
                                                                                {habit.name}
                                                                            </div>
                                                                            {habit.unit && (
                                                                                <div className="text-sm text-gray-500">
                                                                                    Target: {targetValue} {habit.unit}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    {log && (
                                                                        <div className="text-sm text-gray-400">
                                                                            {log.value} / {targetValue}
                                                                        </div>
                                                                    )}
                                                                </button>
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
                                <p className="text-sm text-gray-600">Add your first goal to start tracking progress</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {goals
                                    .filter(goal => goal.status === 'active')
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
                                                className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-violet-500/30 transition-all"
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex-1">
                                                        <h3 className="text-xl font-bold mb-1">{goal.name}</h3>
                                                        {goal.category && (
                                                            <span className="text-xs text-gray-500 uppercase tracking-wider">
                                                                {goal.category}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <TrendingUp className="w-5 h-5 text-violet-400" />
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
                                                            className="bg-gradient-to-r from-violet-500 to-violet-600 h-full rounded-full transition-all duration-500"
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                    <div className="text-right text-sm text-gray-500 mt-1">
                                                        {percentage}%
                                                    </div>
                                                </div>

                                                {daysLeft !== null && (
                                                    <div className="text-sm text-gray-400">
                                                        {daysLeft > 0 ? (
                                                            <>
                                                                <Calendar className="w-4 h-4 inline mr-1" />
                                                                {daysLeft} days left
                                                            </>
                                                        ) : daysLeft === 0 ? (
                                                            <span className="text-yellow-400">Due today!</span>
                                                        ) : (
                                                            <span className="text-red-400">Overdue by {Math.abs(daysLeft)} days</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}