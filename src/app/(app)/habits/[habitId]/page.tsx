'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit2, Trash2, Flame, Calendar } from 'lucide-react';
import type { Habit, HabitLog } from '@/types/habits.types';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import EditHabitModal from '../modals/EditHabitModal';
import HabitLogModal from '../modals/HabitLogModal';

const HEATMAP_DAYS = 90;

const PERIOD_LABELS: Record<string, string> = {
    morning: '🌅 Morning',
    midday: '☀️ Midday',
    evening: '🌙 Evening',
};

const MOOD_LABELS: Record<number, string> = {
    1: '😫',
    2: '😕',
    3: '😐',
    4: '🙂',
    5: '😄',
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

const isHabitScheduledOn = (habit: Habit, date: string): boolean => {
    const n = habit.every_n_days || 1;
    if (n === 1) return true;
    const diff = Math.abs(daysBetween(date, habit.anchor_date));
    return diff % n === 0;
};

export default function HabitDetailPage() {
    const params = useParams();
    const router = useRouter();
    const habitId = params.habitId as string;

    const [habit, setHabit] = useState<Habit | null>(null);
    const [logs, setLogs] = useState<HabitLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [showEditModal, setShowEditModal] = useState(false);
    const [showLogModal, setShowLogModal] = useState(false);
    const [logModalDate, setLogModalDate] = useState<string>(todayStr());
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const today = todayStr();

    useEffect(() => {
        if (!habitId) return;
        Promise.all([fetchHabit(), fetchLogs()]).finally(() => setLoading(false));
    }, [habitId]);

    const fetchHabit = async () => {
        try {
            const response = await fetch(`/api/habits/${habitId}`);
            if (!response.ok) throw new Error('Habit not found');
            setHabit(await response.json());
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load habit');
        }
    };

    const fetchLogs = async () => {
        try {
            const start = dateMinusDays(today, HEATMAP_DAYS - 1);
            const response = await fetch(
                `/api/habits/logs?habit_id=${habitId}&start_date=${start}&end_date=${today}`
            );
            if (!response.ok) throw new Error('Failed to fetch logs');
            setLogs(await response.json());
        } catch (err) {
            console.error('Error fetching logs:', err);
        }
    };

    const findLog = (date: string): HabitLog | undefined =>
        logs.find((l) => l.log_date === date);

    const isCompleted = (date: string): boolean => {
        if (!habit) return false;
        const log = findLog(date);
        if (!log) return false;
        const target = habit.target_per_day || habit.target_value || 1;
        return log.value >= target;
    };

    // Build the heatmap grid: HEATMAP_DAYS days, oldest first, organized into weeks (cols)
    const heatmapDates = useMemo(() => {
        const out: string[] = [];
        for (let i = HEATMAP_DAYS - 1; i >= 0; i--) {
            out.push(dateMinusDays(today, i));
        }
        return out;
    }, [today]);

    // Organize into 7-row weeks
    const heatmapWeeks = useMemo(() => {
        // Pad the start so week rows align Mon-Sun (ISO weekday)
        const firstDate = new Date(heatmapDates[0] + 'T00:00:00');
        const dow = firstDate.getDay() === 0 ? 7 : firstDate.getDay(); // 1=Mon..7=Sun
        const padding = dow - 1;
        const padded: (string | null)[] = [...Array(padding).fill(null), ...heatmapDates];
        const weeks: (string | null)[][] = [];
        for (let i = 0; i < padded.length; i += 7) {
            weeks.push(padded.slice(i, i + 7));
        }
        return weeks;
    }, [heatmapDates]);

    // Stats
    const stats = useMemo(() => {
        if (!habit) return null;
        const scheduled = heatmapDates.filter((d) => isHabitScheduledOn(habit, d));
        const done = scheduled.filter((d) => isCompleted(d));
        const completionRate = scheduled.length > 0 ? Math.round((done.length / scheduled.length) * 100) : 0;

        // Streak
        let streak = 0;
        let cursor = today;
        for (let i = 0; i < 365; i++) {
            if (isHabitScheduledOn(habit, cursor)) {
                if (isCompleted(cursor)) {
                    streak += 1;
                } else if (cursor !== today) {
                    break;
                }
            }
            cursor = dateMinusDays(cursor, 1);
        }

        // Longest streak in the window
        let longest = 0;
        let current = 0;
        for (const d of heatmapDates) {
            if (isHabitScheduledOn(habit, d)) {
                if (isCompleted(d)) {
                    current += 1;
                    if (current > longest) longest = current;
                } else {
                    current = 0;
                }
            }
        }

        return {
            totalCompletions: logs.length,
            scheduledInWindow: scheduled.length,
            doneInWindow: done.length,
            completionRate,
            currentStreak: streak,
            longestStreak: longest,
        };
    }, [habit, logs, heatmapDates, today]);

    const toggleDay = async (date: string) => {
        if (!habit) return;
        const existing = findLog(date);
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

    const handleDelete = async () => {
        if (!habit) return;
        const response = await fetch(`/api/habits/${habit.id}`, { method: 'DELETE' });
        if (response.ok) {
            router.push('/habits');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 text-white">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center py-12 text-gray-500">Loading...</div>
                </div>
            </div>
        );
    }

    if (error || !habit) {
        return (
            <div className="min-h-screen bg-gray-950 text-white">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Link
                        href="/habits"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to habits
                    </Link>
                    <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 text-red-400">
                        {error || 'Habit not found'}
                    </div>
                </div>
            </div>
        );
    }

    const n = habit.every_n_days || 1;
    const cadence = n === 1 ? 'Daily' : `Every ${n} days`;
    const sortedLogs = [...logs].sort((a, b) => b.log_date.localeCompare(a.log_date));

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back */}
                <Link
                    href="/habits"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to habits
                </Link>

                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{habit.name}</h1>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                            <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300">{cadence}</span>
                            {habit.period && <span>{PERIOD_LABELS[habit.period] || habit.period}</span>}
                            {habit.category && <span className="text-gray-500">{habit.category}</span>}
                            {!habit.is_active && (
                                <span className="px-2 py-0.5 bg-gray-700 text-gray-400 rounded text-xs">
                                    Inactive
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setLogModalDate(today);
                                setShowLogModal(true);
                            }}
                            className="px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium flex items-center gap-1.5"
                        >
                            <Calendar className="w-4 h-4" />
                            Log today
                        </button>
                        <button
                            onClick={() => setShowEditModal(true)}
                            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg"
                            title="Edit"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Stats grid */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Current Streak</p>
                            <p className="text-2xl font-bold mt-1 flex items-center gap-1">
                                {stats.currentStreak}
                                {stats.currentStreak > 0 && <Flame className="w-5 h-5 text-orange-400" />}
                            </p>
                        </div>
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Longest (90d)</p>
                            <p className="text-2xl font-bold mt-1">{stats.longestStreak}</p>
                        </div>
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Completion (90d)</p>
                            <p className="text-2xl font-bold mt-1">{stats.completionRate}%</p>
                            <p className="text-xs text-gray-500 mt-1">
                                {stats.doneInWindow} / {stats.scheduledInWindow}
                            </p>
                        </div>
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Total Logs</p>
                            <p className="text-2xl font-bold mt-1">{stats.totalCompletions}</p>
                        </div>
                    </div>
                )}

                {/* Heatmap */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-8">
                    <h2 className="text-lg font-bold mb-4">Last {HEATMAP_DAYS} days</h2>
                    <div className="flex gap-1 overflow-x-auto pb-2">
                        {/* Row labels (M/W/F) */}
                        <div className="flex flex-col gap-1 mr-1 text-xs text-gray-600 pt-0">
                            {['Mon', '', 'Wed', '', 'Fri', '', ''].map((label, idx) => (
                                <div key={idx} className="h-4 flex items-center">{label}</div>
                            ))}
                        </div>
                        {heatmapWeeks.map((week, weekIdx) => (
                            <div key={weekIdx} className="flex flex-col gap-1">
                                {Array.from({ length: 7 }).map((_, dayIdx) => {
                                    const date = week[dayIdx];
                                    if (!date) {
                                        return <div key={dayIdx} className="w-4 h-4" />;
                                    }
                                    const scheduled = isHabitScheduledOn(habit, date);
                                    const done = isCompleted(date);
                                    const isToday = date === today;
                                    return (
                                        <button
                                            key={dayIdx}
                                            onClick={() => scheduled && toggleDay(date)}
                                            disabled={!scheduled}
                                            title={`${new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric',
                                            })}${isToday ? ' (today)' : ''}${done ? ' · done' : scheduled ? '' : ' · not scheduled'}`}
                                            className={`w-4 h-4 rounded-sm transition-colors ${
                                                isToday ? 'ring-2 ring-blue-400 ring-offset-1 ring-offset-gray-900' : ''
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

                {/* Recent logs */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                    <h2 className="text-lg font-bold mb-4">Recent Logs ({sortedLogs.length})</h2>
                    {sortedLogs.length === 0 ? (
                        <p className="text-gray-500 text-sm">No logs yet for this habit.</p>
                    ) : (
                        <div className="divide-y divide-gray-800">
                            {sortedLogs.slice(0, 30).map((log) => (
                                <div key={log.id} className="py-3 flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">
                                                {new Date(log.log_date + 'T00:00:00').toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </span>
                                            {log.time_of_day && (
                                                <span className="text-xs text-gray-500">
                                                    {log.time_of_day.slice(0, 5)}
                                                </span>
                                            )}
                                            {log.mood && <span title="Mood">{MOOD_LABELS[log.mood]}</span>}
                                        </div>
                                        {log.note && (
                                            <p className="text-sm text-gray-400 mt-1">{log.note}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-gray-400">
                                            {log.value} {habit.unit || ''}
                                        </span>
                                        <button
                                            onClick={() => {
                                                setLogModalDate(log.log_date);
                                                setShowLogModal(true);
                                            }}
                                            className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded"
                                            title="Edit log"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <EditHabitModal
                isOpen={showEditModal}
                habit={habit}
                onClose={() => setShowEditModal(false)}
                onSuccess={(updated) => setHabit(updated)}
            />

            <HabitLogModal
                isOpen={showLogModal}
                habit={habit}
                existingLog={findLog(logModalDate) || null}
                selectedDate={logModalDate}
                onClose={() => setShowLogModal(false)}
                onSuccess={fetchLogs}
            />

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                itemName={habit.name}
            />
        </div>
    );
}
