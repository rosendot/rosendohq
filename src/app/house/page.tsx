'use client';

import { useState } from 'react';
import { Plus, Home, Wrench, Package, AlertCircle, CheckCircle, Clock } from 'lucide-react';

type MaintenanceStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';
type MaintenancePriority = 'low' | 'medium' | 'high' | 'urgent';
type SupplyCategory = 'cleaning' | 'kitchen' | 'bathroom' | 'tools' | 'other';

interface MaintenanceTask {
    id: string;
    title: string;
    description: string;
    category: string;
    status: MaintenanceStatus;
    priority: MaintenancePriority;
    due_date?: string;
    completed_date?: string;
    cost?: number;
    notes?: string;
}

interface Supply {
    id: string;
    name: string;
    category: SupplyCategory;
    quantity: number;
    min_quantity: number;
    location: string;
    last_purchased?: string;
}

interface Room {
    id: string;
    name: string;
    tasks_count: number;
    supplies_count: number;
}

export default function HousePage() {
    const [activeTab, setActiveTab] = useState<'maintenance' | 'supplies' | 'rooms'>('maintenance');
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showSupplyModal, setShowSupplyModal] = useState(false);
    const [showRoomModal, setShowRoomModal] = useState(false);

    // Minimal mock data
    const [tasks] = useState<MaintenanceTask[]>([
        {
            id: '1',
            title: 'Replace air filter',
            description: 'Change HVAC air filter',
            category: 'HVAC',
            status: 'pending',
            priority: 'medium',
            due_date: '2025-10-15',
        },
        {
            id: '2',
            title: 'Clean gutters',
            description: 'Remove leaves and debris',
            category: 'Exterior',
            status: 'overdue',
            priority: 'high',
            due_date: '2025-09-30',
        },
    ]);

    const [supplies] = useState<Supply[]>([
        {
            id: '1',
            name: 'Dish Soap',
            category: 'kitchen',
            quantity: 2,
            min_quantity: 1,
            location: 'Under Kitchen Sink',
            last_purchased: '2025-09-15',
        },
        {
            id: '2',
            name: 'Paper Towels',
            category: 'cleaning',
            quantity: 3,
            min_quantity: 5,
            location: 'Pantry',
            last_purchased: '2025-09-20',
        },
    ]);

    const [rooms] = useState<Room[]>([
        { id: '1', name: 'Living Room', tasks_count: 2, supplies_count: 3 },
        { id: '2', name: 'Kitchen', tasks_count: 1, supplies_count: 5 },
    ]);

    const getStatusColor = (status: MaintenanceStatus) => {
        switch (status) {
            case 'completed':
                return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'in_progress':
                return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'overdue':
                return 'bg-red-500/10 text-red-400 border-red-500/20';
            default:
                return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        }
    };

    const getPriorityColor = (priority: MaintenancePriority) => {
        switch (priority) {
            case 'urgent':
                return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'high':
                return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
            case 'medium':
                return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            default:
                return 'bg-green-500/10 text-green-400 border-green-500/20';
        }
    };

    const getStatusIcon = (status: MaintenanceStatus) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-4 h-4" />;
            case 'in_progress':
                return <Clock className="w-4 h-4" />;
            case 'overdue':
                return <AlertCircle className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    const lowStockSupplies = supplies.filter((s) => s.quantity <= s.min_quantity);
    const pendingTasks = tasks.filter((t) => t.status === 'pending' || t.status === 'in_progress');
    const overdueTasks = tasks.filter((t) => t.status === 'overdue');

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100">
            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">House Tracker</h1>
                        <p className="text-gray-400">Manage maintenance and household supplies</p>
                    </div>
                    <div className="flex gap-3">
                        {activeTab === 'maintenance' && (
                            <button
                                onClick={() => setShowTaskModal(true)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add Task
                            </button>
                        )}
                        {activeTab === 'supplies' && (
                            <button
                                onClick={() => setShowSupplyModal(true)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add Supply
                            </button>
                        )}
                        {activeTab === 'rooms' && (
                            <button
                                onClick={() => setShowRoomModal(true)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add Room
                            </button>
                        )}
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400 text-sm">Total Rooms</span>
                            <Home className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">{rooms.length}</div>
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
                            <span className="text-gray-400 text-sm">Overdue Tasks</span>
                            <AlertCircle className="w-5 h-5 text-red-400" />
                        </div>
                        <div className="text-2xl font-bold text-red-400">{overdueTasks.length}</div>
                    </div>

                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400 text-sm">Low Stock Items</span>
                            <Package className="w-5 h-5 text-orange-400" />
                        </div>
                        <div className="text-2xl font-bold text-orange-400">{lowStockSupplies.length}</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-gray-800">
                    <button
                        onClick={() => setActiveTab('maintenance')}
                        className={`px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === 'maintenance'
                            ? 'text-blue-400 border-blue-400'
                            : 'text-gray-400 border-transparent hover:text-gray-300'
                            }`}
                    >
                        Maintenance
                    </button>
                    <button
                        onClick={() => setActiveTab('supplies')}
                        className={`px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === 'supplies'
                            ? 'text-blue-400 border-blue-400'
                            : 'text-gray-400 border-transparent hover:text-gray-300'
                            }`}
                    >
                        Supplies
                    </button>
                    <button
                        onClick={() => setActiveTab('rooms')}
                        className={`px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === 'rooms'
                            ? 'text-blue-400 border-blue-400'
                            : 'text-gray-400 border-transparent hover:text-gray-300'
                            }`}
                    >
                        Rooms
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Maintenance Tab */}
                        {activeTab === 'maintenance' && (
                            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                                <h2 className="text-xl font-semibold text-white mb-4">Maintenance Tasks</h2>

                                {tasks.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No maintenance tasks yet</p>
                                ) : (
                                    <div className="space-y-3">
                                        {tasks.map((task) => (
                                            <div
                                                key={task.id}
                                                className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-750 transition-colors"
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-white mb-1">{task.title}</h3>
                                                        <p className="text-sm text-gray-400">{task.description}</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                                                            {task.priority}
                                                        </span>
                                                        <span className={`px-2 py-1 rounded text-xs font-medium border flex items-center gap-1 ${getStatusColor(task.status)}`}>
                                                            {getStatusIcon(task.status)}
                                                            {task.status.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                                    <span className="flex items-center gap-1">
                                                        <span className="font-medium text-gray-300">Category:</span>
                                                        {task.category}
                                                    </span>
                                                    {task.due_date && (
                                                        <span className="flex items-center gap-1">
                                                            <span className="font-medium text-gray-300">Due:</span>
                                                            {new Date(task.due_date).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                    {task.cost && (
                                                        <span className="flex items-center gap-1">
                                                            <span className="font-medium text-gray-300">Cost:</span>
                                                            ${task.cost}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Supplies Tab */}
                        {activeTab === 'supplies' && (
                            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                                <h2 className="text-xl font-semibold text-white mb-4">Household Supplies</h2>

                                {supplies.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No supplies tracked yet</p>
                                ) : (
                                    <div className="space-y-3">
                                        {supplies.map((supply) => {
                                            const isLowStock = supply.quantity <= supply.min_quantity;
                                            return (
                                                <div
                                                    key={supply.id}
                                                    className={`p-4 bg-gray-800 rounded-lg border transition-colors ${isLowStock ? 'border-orange-500/30' : 'border-gray-700'
                                                        }`}
                                                >
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="font-semibold text-white">{supply.name}</h3>
                                                                {isLowStock && (
                                                                    <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 text-xs rounded border border-orange-500/20">
                                                                        Low Stock
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-400 mt-1 capitalize">{supply.category}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className={`text-lg font-bold ${isLowStock ? 'text-orange-400' : 'text-white'}`}>
                                                                {supply.quantity}
                                                            </div>
                                                            <div className="text-xs text-gray-400">Min: {supply.min_quantity}</div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4 text-sm text-gray-400">
                                                        <span className="flex items-center gap-1">
                                                            <span className="font-medium text-gray-300">Location:</span>
                                                            {supply.location}
                                                        </span>
                                                        {supply.last_purchased && (
                                                            <span className="flex items-center gap-1">
                                                                <span className="font-medium text-gray-300">Last Purchased:</span>
                                                                {new Date(supply.last_purchased).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Rooms Tab */}
                        {activeTab === 'rooms' && (
                            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                                <h2 className="text-xl font-semibold text-white mb-4">Rooms</h2>

                                {rooms.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No rooms added yet</p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {rooms.map((room) => (
                                            <div
                                                key={room.id}
                                                className="p-6 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-750 transition-colors cursor-pointer"
                                            >
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="p-2 bg-blue-500/10 rounded-lg">
                                                        <Home className="w-6 h-6 text-blue-400" />
                                                    </div>
                                                    <h3 className="text-lg font-semibold text-white">{room.name}</h3>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3 text-sm">
                                                    <div className="flex items-center gap-2 text-gray-400">
                                                        <Wrench className="w-4 h-4" />
                                                        <span>{room.tasks_count} tasks</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-400">
                                                        <Package className="w-4 h-4" />
                                                        <span>{room.supplies_count} supplies</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Upcoming Tasks */}
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Upcoming Tasks</h3>

                            <div className="space-y-3">
                                {tasks
                                    .filter((t) => t.status !== 'completed')
                                    .slice(0, 3)
                                    .map((task) => (
                                        <div key={task.id} className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                                            <div className="font-medium text-white text-sm mb-1">{task.title}</div>
                                            <div className="text-xs text-gray-400">
                                                {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                                            </div>
                                        </div>
                                    ))}
                                {tasks.filter((t) => t.status !== 'completed').length === 0 && (
                                    <p className="text-gray-500 text-sm text-center py-4">No upcoming tasks</p>
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
                                {lowStockSupplies.length === 0 ? (
                                    <p className="text-gray-500 text-sm text-center py-4">All supplies are well stocked</p>
                                ) : (
                                    lowStockSupplies.map((supply) => (
                                        <div key={supply.id} className="p-3 bg-gray-800 rounded-lg border border-orange-500/30">
                                            <div className="font-medium text-white text-sm mb-1">{supply.name}</div>
                                            <div className="text-xs text-gray-400">
                                                Only {supply.quantity} left • Min: {supply.min_quantity}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Task Summary by Status */}
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Task Summary</h3>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Pending</span>
                                    <span className="text-white font-medium">{tasks.filter((t) => t.status === 'pending').length}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">In Progress</span>
                                    <span className="text-blue-400 font-medium">{tasks.filter((t) => t.status === 'in_progress').length}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Overdue</span>
                                    <span className="text-red-400 font-medium">{tasks.filter((t) => t.status === 'overdue').length}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Completed</span>
                                    <span className="text-green-400 font-medium">{tasks.filter((t) => t.status === 'completed').length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modals */}
                {showTaskModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 max-w-md w-full">
                            <h2 className="text-xl font-semibold text-white mb-4">Add Maintenance Task</h2>
                            <p className="text-gray-400 mb-4">Task form would go here</p>
                            <button
                                onClick={() => setShowTaskModal(false)}
                                className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}

                {showSupplyModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 max-w-md w-full">
                            <h2 className="text-xl font-semibold text-white mb-4">Add Supply</h2>
                            <p className="text-gray-400 mb-4">Supply form would go here</p>
                            <button
                                onClick={() => setShowSupplyModal(false)}
                                className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}

                {showRoomModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 max-w-md w-full">
                            <h2 className="text-xl font-semibold text-white mb-4">Add Room</h2>
                            <p className="text-gray-400 mb-4">Room form would go here</p>
                            <button
                                onClick={() => setShowRoomModal(false)}
                                className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}