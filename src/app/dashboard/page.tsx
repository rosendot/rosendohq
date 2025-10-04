// frontend/src/app/dashboard/page.tsx

import { Suspense } from 'react';
import { modules } from '@/lib/dashboard-utils';
import DashboardCard from '@/components/dashboard/DashboardCard';
import QuickStats from '@/components/dashboard/QuickStats';
import RecentActivity from '@/components/dashboard/RecentActivity';
import UpcomingItems from '@/components/dashboard/UpcomingItems';

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Welcome back! Here's your overview
                </p>
            </div>

            {/* Quick Stats */}
            <div className="mb-8">
                <Suspense fallback={<div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />}>
                    <QuickStats />
                </Suspense>
            </div>

            {/* Recent Activity & Upcoming Items */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Suspense fallback={<div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />}>
                    <RecentActivity />
                </Suspense>
                <Suspense fallback={<div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />}>
                    <UpcomingItems />
                </Suspense>
            </div>

            {/* Module Grid */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    All Modules
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {modules.map((module) => (
                        <DashboardCard key={module.id} module={module} />
                    ))}
                </div>
            </div>

            {/* Footer Stats */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    <div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">12</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Active Modules</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">100%</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Completion</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">∞</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Possibilities</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">🎉</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">All Done!</div>
                    </div>
                </div>
            </div>
        </div>
    );
}