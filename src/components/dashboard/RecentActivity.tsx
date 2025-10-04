// frontend/src/components/dashboard/RecentActivity.tsx

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Activity {
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: string;
    icon: string;
    href: string;
}

export default function RecentActivity() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchActivity() {
            try {
                // This would ideally come from a unified activity log API
                // For now, we'll create sample data
                setActivities([
                    {
                        id: '1',
                        type: 'shopping',
                        title: 'Added to grocery list',
                        description: 'Milk, Bread, Eggs',
                        timestamp: new Date().toISOString(),
                        icon: '🛒',
                        href: '/shopping'
                    },
                    {
                        id: '2',
                        type: 'habits',
                        title: 'Completed habit',
                        description: 'Morning exercise - 7 day streak!',
                        timestamp: new Date(Date.now() - 3600000).toISOString(),
                        icon: '🎯',
                        href: '/habits'
                    },
                    {
                        id: '3',
                        type: 'reading',
                        title: 'Started reading',
                        description: 'Atomic Habits by James Clear',
                        timestamp: new Date(Date.now() - 7200000).toISOString(),
                        icon: '📚',
                        href: '/reading'
                    },
                ]);
            } catch (error) {
                console.error('Error fetching activity:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchActivity();
    }, []);

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
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
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
                <Link href="/activity" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
                    View all
                </Link>
            </div>
            <div className="space-y-4">
                {activities.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                        No recent activity
                    </p>
                ) : (
                    activities.map((activity) => (
                        <Link
                            key={activity.id}
                            href={activity.href}
                            className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            <div className="text-2xl">{activity.icon}</div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 dark:text-white truncate">
                                    {activity.title}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                    {activity.description}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    {new Date(activity.timestamp).toLocaleString()}
                                </p>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}