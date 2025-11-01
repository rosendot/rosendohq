// frontend/src/components/dashboard/QuickStats.tsx

'use client';

import { useEffect, useState } from 'react';

interface Stat {
    label: string;
    value: number;
    icon: string;
    color: string;
    change?: string;
}

export default function QuickStats() {
    const [stats, setStats] = useState<Stat[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                // Fetch stats from all modules
                const responses = await Promise.allSettled([
                    fetch('/api/shopping/lists').then(r => r.json()),
                    fetch('/api/wishlist').then(r => r.json()),
                    fetch('/api/habits').then(r => r.json()),
                    fetch('/api/finance/accounts').then(r => r.json()),
                ]);

                const shoppingLists = responses[0].status === 'fulfilled' ? responses[0].value : [];
                const wishlistItems = responses[1].status === 'fulfilled' ? responses[1].value : [];
                const habits = responses[2].status === 'fulfilled' ? responses[2].value : [];
                const accounts = responses[3].status === 'fulfilled' ? responses[3].value : [];

                setStats([
                    {
                        label: 'Active Shopping Lists',
                        value: Array.isArray(shoppingLists) ? shoppingLists.filter((l: { completed?: boolean }) => !l.completed).length : 0,
                        icon: '🛒',
                        color: 'bg-blue-500',
                    },
                    {
                        label: 'Wishlist Items',
                        value: Array.isArray(wishlistItems) ? wishlistItems.length : 0,
                        icon: '⭐',
                        color: 'bg-purple-500',
                    },
                    {
                        label: 'Active Habits',
                        value: Array.isArray(habits) ? habits.filter((h: { active?: boolean }) => h.active).length : 0,
                        icon: '🎯',
                        color: 'bg-teal-500',
                    },
                    {
                        label: 'Financial Accounts',
                        value: Array.isArray(accounts) ? accounts.length : 0,
                        icon: '💰',
                        color: 'bg-emerald-500',
                    },
                ]);
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-800 rounded-xl h-32" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
                <div
                    key={index}
                    className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className={`${stat.color} rounded-lg p-3 text-2xl`}>
                            {stat.icon}
                        </div>
                        {stat.change && (
                            <span className="text-xs font-medium text-green-600 dark:text-green-400">
                                {stat.change}
                            </span>
                        )}
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                        {stat.value}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        {stat.label}
                    </div>
                </div>
            ))}
        </div>
    );
}