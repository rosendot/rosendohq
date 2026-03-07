'use client';

import { AlertCircle, Gauge, DollarSign, Wrench, Calendar, Shield, FileText, Fuel } from 'lucide-react';
import type { Vehicle, MaintenanceRecord, FuelLog, TireSet, OdometerLog } from '@/types/database.types';

interface DashboardTabProps {
    vehicle: Vehicle;
    maintenanceRecords: MaintenanceRecord[];
    fuelLogs: FuelLog[];
    tireSets: TireSet[];
    odometerLogs: OdometerLog[];
}

interface Alert {
    type: 'warning' | 'danger' | 'info';
    title: string;
    message: string;
    daysUntil: number;
}

export default function DashboardTab({
    vehicle,
    maintenanceRecords,
    fuelLogs,
    tireSets,
    odometerLogs,
}: DashboardTabProps) {
    const currentMileage = odometerLogs[0]?.mileage || vehicle.purchase_mileage || 0;
    const currentYear = new Date().getFullYear();

    // Calculate alerts
    const alerts: Alert[] = [];
    const today = new Date();

    // Insurance renewal alert
    if (vehicle.insurance_renewal_date) {
        const renewalDate = new Date(vehicle.insurance_renewal_date);
        const daysUntil = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntil <= 30 && daysUntil > 0) {
            alerts.push({
                type: daysUntil <= 7 ? 'danger' : 'warning',
                title: 'Insurance Renewal',
                message: `Due in ${daysUntil} days`,
                daysUntil,
            });
        } else if (daysUntil <= 0) {
            alerts.push({
                type: 'danger',
                title: 'Insurance Expired',
                message: `Expired ${Math.abs(daysUntil)} days ago`,
                daysUntil,
            });
        }
    }

    // Registration expiration alert
    if (vehicle.registration_expiration_date) {
        const regDate = new Date(vehicle.registration_expiration_date);
        const daysUntil = Math.ceil((regDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntil <= 30 && daysUntil > 0) {
            alerts.push({
                type: daysUntil <= 7 ? 'danger' : 'warning',
                title: 'Registration Expiring',
                message: `Due in ${daysUntil} days`,
                daysUntil,
            });
        } else if (daysUntil <= 0) {
            alerts.push({
                type: 'danger',
                title: 'Registration Expired',
                message: `Expired ${Math.abs(daysUntil)} days ago`,
                daysUntil,
            });
        }
    }

    // Inspection expiration alert
    if (vehicle.inspection_expiration_date) {
        const inspDate = new Date(vehicle.inspection_expiration_date);
        const daysUntil = Math.ceil((inspDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntil <= 30 && daysUntil > 0) {
            alerts.push({
                type: daysUntil <= 7 ? 'danger' : 'warning',
                title: 'Inspection Due',
                message: `Due in ${daysUntil} days`,
                daysUntil,
            });
        } else if (daysUntil <= 0) {
            alerts.push({
                type: 'danger',
                title: 'Inspection Overdue',
                message: `Overdue by ${Math.abs(daysUntil)} days`,
                daysUntil,
            });
        }
    }

    // Emissions expiration alert
    if (vehicle.emissions_expiration_date) {
        const emissionsDate = new Date(vehicle.emissions_expiration_date);
        const daysUntil = Math.ceil((emissionsDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntil <= 30 && daysUntil > 0) {
            alerts.push({
                type: daysUntil <= 7 ? 'danger' : 'warning',
                title: 'Emissions Test Due',
                message: `Due in ${daysUntil} days`,
                daysUntil,
            });
        } else if (daysUntil <= 0) {
            alerts.push({
                type: 'danger',
                title: 'Emissions Test Overdue',
                message: `Overdue by ${Math.abs(daysUntil)} days`,
                daysUntil,
            });
        }
    }

    // Upcoming maintenance alerts
    maintenanceRecords
        .filter(r => r.record_type === 'maintenance' && r.next_due_date)
        .forEach(record => {
            const dueDate = new Date(record.next_due_date!);
            const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            if (daysUntil <= 30 && daysUntil > 0) {
                alerts.push({
                    type: 'info',
                    title: record.item,
                    message: `Due in ${daysUntil} days`,
                    daysUntil,
                });
            }
        });

    // Sort alerts by urgency
    alerts.sort((a, b) => a.daysUntil - b.daysUntil);

    // Calculate stats
    const maintenanceOnlyRecords = maintenanceRecords.filter(r => r.record_type === 'maintenance');
    const thisYearRecords = maintenanceOnlyRecords.filter(r => new Date(r.service_date).getFullYear() === currentYear);
    const totalSpentThisYear = thisYearRecords.reduce((sum, r) => sum + (r.cost_cents || 0), 0);
    const totalSpentAllTime = maintenanceOnlyRecords.reduce((sum, r) => sum + (r.cost_cents || 0), 0);

    // Calculate average MPG from fuel logs
    const fuelLogsWithMpg = fuelLogs.filter(f => f.mpg && f.mpg > 0);
    const avgMpg = fuelLogsWithMpg.length > 0
        ? fuelLogsWithMpg.reduce((sum, f) => sum + (f.mpg || 0), 0) / fuelLogsWithMpg.length
        : null;

    // Recent activity (last 5 maintenance records)
    const recentActivity = maintenanceRecords.slice(0, 5);

    // Active tires
    const activeTires = tireSets.filter(t => t.status === 'active');

    const formatCurrency = (cents: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(cents / 100);
    };

    const getAlertBgColor = (type: string) => {
        switch (type) {
            case 'danger':
                return 'bg-red-500/10 border-red-500/30';
            case 'warning':
                return 'bg-yellow-500/10 border-yellow-500/30';
            default:
                return 'bg-blue-500/10 border-blue-500/30';
        }
    };

    const getAlertTextColor = (type: string) => {
        switch (type) {
            case 'danger':
                return 'text-red-400';
            case 'warning':
                return 'text-yellow-400';
            default:
                return 'text-blue-400';
        }
    };

    return (
        <div className="space-y-6">
            {/* Alerts Section */}
            {alerts.length > 0 && (
                <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-400" />
                        Alerts & Reminders ({alerts.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {alerts.map((alert, index) => (
                            <div
                                key={index}
                                className={`p-4 rounded-lg border ${getAlertBgColor(alert.type)}`}
                            >
                                <div className={`font-medium ${getAlertTextColor(alert.type)}`}>
                                    {alert.title}
                                </div>
                                <div className="text-sm text-gray-400 mt-1">{alert.message}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Current Mileage</span>
                        <Gauge className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="text-xl font-bold text-white">
                        {currentMileage.toLocaleString()}
                    </div>
                </div>

                <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Avg MPG</span>
                        <Fuel className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="text-xl font-bold text-white">
                        {avgMpg ? avgMpg.toFixed(1) : '--'}
                    </div>
                </div>

                <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Service This Year</span>
                        <Wrench className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="text-xl font-bold text-white">
                        {thisYearRecords.length}
                    </div>
                </div>

                <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Spent This Year</span>
                        <DollarSign className="w-4 h-4 text-red-400" />
                    </div>
                    <div className="text-xl font-bold text-white">
                        {formatCurrency(totalSpentThisYear)}
                    </div>
                </div>

                <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Total Spent</span>
                        <DollarSign className="w-4 h-4 text-orange-400" />
                    </div>
                    <div className="text-xl font-bold text-white">
                        {formatCurrency(totalSpentAllTime)}
                    </div>
                </div>

                <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Active Tires</span>
                        <Shield className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="text-xl font-bold text-white">
                        {activeTires.length}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-purple-400" />
                        Recent Activity
                    </h3>
                    <div className="space-y-3">
                        {recentActivity.length > 0 ? (
                            recentActivity.map((record) => (
                                <div
                                    key={record.id}
                                    className="p-3 bg-gray-800 rounded-lg border border-gray-700"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-medium text-white text-sm mb-1">
                                                {record.item}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {new Date(record.service_date).toLocaleDateString()}
                                                {record.mileage && ` • ${record.mileage.toLocaleString()} mi`}
                                            </div>
                                        </div>
                                        {record.cost_cents && (
                                            <div className="text-sm font-semibold text-white">
                                                {formatCurrency(record.cost_cents)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm text-center py-4">
                                No recent activity
                            </p>
                        )}
                    </div>
                </div>

                {/* Upcoming Maintenance */}
                <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-400" />
                        Upcoming Maintenance
                    </h3>
                    <div className="space-y-3">
                        {maintenanceOnlyRecords
                            .filter(r => r.next_due_date || r.next_due_mileage)
                            .slice(0, 5)
                            .map((record) => (
                                <div
                                    key={record.id}
                                    className="p-3 bg-gray-800 rounded-lg border border-gray-700"
                                >
                                    <div className="font-medium text-white text-sm mb-1">
                                        {record.item}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        {record.next_due_date && (
                                            <span>Due: {new Date(record.next_due_date).toLocaleDateString()}</span>
                                        )}
                                        {record.next_due_date && record.next_due_mileage && ' • '}
                                        {record.next_due_mileage && (
                                            <span>At {record.next_due_mileage.toLocaleString()} mi</span>
                                        )}
                                    </div>
                                </div>
                            )) || (
                            <p className="text-gray-500 text-sm text-center py-4">
                                No upcoming maintenance scheduled
                            </p>
                        )}
                        {maintenanceOnlyRecords.filter(r => r.next_due_date || r.next_due_mileage).length === 0 && (
                            <p className="text-gray-500 text-sm text-center py-4">
                                No upcoming maintenance scheduled
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Vehicle Info Summary */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Vehicle Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {vehicle.insurance_provider && (
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Insurance</p>
                            <p className="text-white font-medium">{vehicle.insurance_provider}</p>
                            {vehicle.insurance_renewal_date && (
                                <p className="text-xs text-gray-500">
                                    Renews: {new Date(vehicle.insurance_renewal_date).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    )}
                    {vehicle.registration_state && (
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Registration</p>
                            <p className="text-white font-medium">{vehicle.registration_state}</p>
                            {vehicle.registration_expiration_date && (
                                <p className="text-xs text-gray-500">
                                    Expires: {new Date(vehicle.registration_expiration_date).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    )}
                    {vehicle.inspection_expiration_date && (
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Inspection</p>
                            <p className="text-white font-medium">
                                {new Date(vehicle.inspection_expiration_date).toLocaleDateString()}
                            </p>
                        </div>
                    )}
                    {vehicle.emissions_expiration_date && (
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Emissions</p>
                            <p className="text-white font-medium">
                                {new Date(vehicle.emissions_expiration_date).toLocaleDateString()}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
