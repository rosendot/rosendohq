'use client';

import { Home, Wrench, Package, AlertCircle, DollarSign, FolderKanban } from 'lucide-react';
import type {
    HomeArea,
    HomeMaintenanceRecord,
    HomeSupplyStockWithItem,
    HomeProject,
    HomeUtilityBill,
} from '@/types/house.types';

interface DashboardTabProps {
    areas: HomeArea[];
    maintenanceRecords: HomeMaintenanceRecord[];
    supplyStock: HomeSupplyStockWithItem[];
    projects: HomeProject[];
    utilityBills: HomeUtilityBill[];
}

export default function DashboardTab({
    areas,
    maintenanceRecords,
    supplyStock,
    projects,
    utilityBills,
}: DashboardTabProps) {
    // Computed stats
    const pendingTasks = maintenanceRecords.filter(
        (r) => r.status === 'pending' || r.status === 'scheduled'
    );
    const overdueTasks = maintenanceRecords.filter(
        (r) =>
            (r.status === 'pending' || r.status === 'scheduled') &&
            r.service_date &&
            new Date(r.service_date) < new Date()
    );
    const lowStockItems = supplyStock.filter(
        (s) => s.quantity <= (s.min_quantity || 0)
    );
    const activeProjects = projects.filter(
        (p) => p.status === 'in_progress' || p.status === 'planning'
    );
    const unpaidBills = utilityBills.filter((b) => !b.is_paid);

    const totalUnpaidAmount = unpaidBills.reduce(
        (sum, b) => sum + (b.amount_cents || 0),
        0
    );

    const formatCurrency = (cents: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(cents / 100);
    };

    return (
        <div className="space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Areas</span>
                        <Home className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">{areas.length}</div>
                </div>

                <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Pending Tasks</span>
                        <Wrench className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">{pendingTasks.length}</div>
                </div>

                <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Overdue</span>
                        <AlertCircle className="w-5 h-5 text-red-400" />
                    </div>
                    <div className="text-2xl font-bold text-red-400">{overdueTasks.length}</div>
                </div>

                <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Low Stock</span>
                        <Package className="w-5 h-5 text-orange-400" />
                    </div>
                    <div className="text-2xl font-bold text-orange-400">{lowStockItems.length}</div>
                </div>

                <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Active Projects</span>
                        <FolderKanban className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="text-2xl font-bold text-purple-400">{activeProjects.length}</div>
                </div>

                <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Unpaid Bills</span>
                        <DollarSign className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="text-2xl font-bold text-green-400">
                        {formatCurrency(totalUnpaidAmount)}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upcoming Maintenance */}
                <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Upcoming Maintenance</h3>
                    <div className="space-y-3">
                        {pendingTasks.slice(0, 5).map((task) => (
                            <div
                                key={task.id}
                                className="p-3 bg-gray-800 rounded-lg border border-gray-700"
                            >
                                <div className="font-medium text-white text-sm mb-1">
                                    {task.item || 'Maintenance Task'}
                                </div>
                                <div className="text-xs text-gray-400">
                                    {task.service_date
                                        ? new Date(task.service_date).toLocaleDateString()
                                        : 'No date set'}
                                </div>
                            </div>
                        ))}
                        {pendingTasks.length === 0 && (
                            <p className="text-gray-500 text-sm text-center py-4">
                                No upcoming tasks
                            </p>
                        )}
                    </div>
                </div>

                {/* Low Stock Alerts */}
                <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-orange-400" />
                        Low Stock Alerts
                    </h3>
                    <div className="space-y-3">
                        {lowStockItems.slice(0, 5).map((stock) => (
                            <div
                                key={stock.id}
                                className="p-3 bg-gray-800 rounded-lg border border-orange-500/30"
                            >
                                <div className="font-medium text-white text-sm mb-1">
                                    {stock.home_supply_item?.name || 'Unknown Item'}
                                </div>
                                <div className="text-xs text-gray-400">
                                    {stock.quantity} left - Min: {stock.min_quantity || 0}
                                </div>
                            </div>
                        ))}
                        {lowStockItems.length === 0 && (
                            <p className="text-gray-500 text-sm text-center py-4">
                                All supplies well stocked
                            </p>
                        )}
                    </div>
                </div>

                {/* Unpaid Bills */}
                <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-400" />
                        Unpaid Bills
                    </h3>
                    <div className="space-y-3">
                        {unpaidBills.slice(0, 5).map((bill) => (
                            <div
                                key={bill.id}
                                className="p-3 bg-gray-800 rounded-lg border border-gray-700"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-medium text-white text-sm mb-1 capitalize">
                                            {bill.utility_type}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            Due: {bill.due_date ? new Date(bill.due_date).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </div>
                                    <div className="text-sm font-semibold text-white">
                                        {formatCurrency(bill.amount_cents || 0)}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {unpaidBills.length === 0 && (
                            <p className="text-gray-500 text-sm text-center py-4">
                                All bills paid
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Active Projects */}
            {activeProjects.length > 0 && (
                <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Active Projects</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeProjects.slice(0, 6).map((project) => (
                            <div
                                key={project.id}
                                className="p-4 bg-gray-800 rounded-lg border border-gray-700"
                            >
                                <div className="font-medium text-white mb-2">{project.name}</div>
                                <div className="flex items-center justify-between text-sm">
                                    <span
                                        className={`px-2 py-1 rounded text-xs font-medium ${
                                            project.status === 'in_progress'
                                                ? 'bg-blue-500/10 text-blue-400'
                                                : 'bg-gray-500/10 text-gray-400'
                                        }`}
                                    >
                                        {project.status?.replace('_', ' ')}
                                    </span>
                                    {project.budget_cents && (
                                        <span className="text-gray-400">
                                            Budget: {formatCurrency(project.budget_cents)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
