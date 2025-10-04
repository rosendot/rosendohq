// frontend/src/components/dashboard/UpcomingItems.tsx

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface UpcomingItem {
    id: string;
    type: string;
    title: string;
    dueDate: string;
    icon: string;
    href: string;
    priority?: 'high' | 'medium' | 'low';
}

export default function UpcomingItems() {
    const [items, setItems] = useState<UpcomingItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUpcoming() {
            try {
                // Fetch upcoming items from various modules
                const responses = await Promise.allSettled([
                    fetch('/api/car/maintenance').then(r => r.json()),
                    fetch('/api/house/tasks').then(r => r.json()),
                    fetch('/api/travel/trips').then(r => r.json()),
                ]);

                const allItems: UpcomingItem[] = [];

                // Car maintenance
                if (responses[0].status === 'fulfilled') {
                    const maintenance = responses[0].value;
                    if (Array.isArray(maintenance)) {
                        maintenance.forEach((m: any) => {
                            if (m.next_due_date) {
                                allItems.push({
                                    id: `car-${m.id}`,
                                    type: 'car',
                                    title: `Car: ${m.service_type}`,
                                    dueDate: m.next_due_date,
                                    icon: '🚗',
                                    href: '/car',
                                    priority: 'medium'
                                });
                            }
                        });
                    }
                }

                // House tasks
                if (responses[1].status === 'fulfilled') {
                    const tasks = responses[1].value;
                    if (Array.isArray(tasks)) {
                        tasks.forEach((t: any) => {
                            if (t.due_date && t.status !== 'completed') {
                                allItems.push({
                                    id: `house-${t.id}`,
                                    type: 'house',
                                    title: `Home: ${t.title}`,
                                    dueDate: t.due_date,
                                    icon: '🏠',
                                    href: '/house',
                                    priority: t.priority || 'medium'
                                });
                            }
                        });
                    }
                }

                // Travel trips
                if (responses[2].status === 'fulfilled') {
                    const trips = responses[2].value;
                    if (Array.isArray(trips)) {
                        trips.forEach((t: any) => {
                            if (t.start_date && new Date(t.start_date) > new Date()) {
                                allItems.push({
                                    id: `travel-${t.id}`,
                                    type: 'travel',
                                    title: `Trip: ${t.destination}`,
                                    dueDate: t.start_date,
                                    icon: '✈️',
                                    href: '/travel',
                                    priority: 'high'
                                });
                            }
                        });
                    }
                }

                // Sort by date
                allItems.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
                setItems(allItems.slice(0, 5)); // Top 5 upcoming items
            } catch (error) {
                console.error('Error fetching upcoming items:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchUpcoming();
    }, []);

    const getPriorityColor = (priority?: string) => {
        switch (priority) {
            case 'high': return 'text-red-600 dark:text-red-400';
            case 'medium': return 'text-yellow-600 dark:text-yellow-400';
            case 'low': return 'text-green-600 dark:text-green-400';
            default: return 'text-gray-600 dark:text-gray-400';
        }
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Upcoming</h2>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse flex gap-4">
                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Upcoming</h2>
            <div className="space-y-4">
                {items.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                        No upcoming items
                    </p>
                ) : (
                    items.map((item) => (
                        <Link
                            key={item.id}
                            href={item.href}
                            className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            <div className="text-2xl">{item.icon}</div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 dark:text-white truncate">
                                    {item.title}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {new Date(item.dueDate).toLocaleDateString()}
                                    </p>
                                    {item.priority && (
                                        <span className={`text-xs font-medium ${getPriorityColor(item.priority)}`}>
                                            {item.priority}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}