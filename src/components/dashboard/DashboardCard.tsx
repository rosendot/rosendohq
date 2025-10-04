// frontend/src/components/dashboard/DashboardCard.tsx

import Link from 'next/link';
import { ModuleCard } from '@/lib/dashboard-utils';

interface DashboardCardProps {
    module: ModuleCard;
    stats?: {
        count?: number;
        label?: string;
    };
}

export default function DashboardCard({ module, stats }: DashboardCardProps) {
    return (
        <Link href={module.href}>
            <div className="group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 hover:shadow-lg transition-all duration-200 hover:scale-105">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`${module.color} rounded-lg p-2 text-2xl`}>
                                {module.icon}
                            </div>
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                {module.name}
                            </h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            {module.description}
                        </p>
                        {stats && (
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats.count}
                                </span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {stats.label}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>
            </div>
        </Link>
    );
}