'use client';

import { useState } from 'react';
import { Plus, X, Trash2, Edit2, ChevronDown, ChevronRight, CheckCircle } from 'lucide-react';
import type {
    HomeProject,
    HomeProjectInsert,
    HomeProjectTask,
    HomeProjectTaskInsert,
    HomeProjectStatus,
    HomeProjectTaskStatus,
    HomeArea,
    HomeContractor,
} from '@/types/database.types';

interface ProjectsTabProps {
    projects: HomeProject[];
    areas: HomeArea[];
    contractors: HomeContractor[];
    propertyId: string | null;
    onRefresh: () => void;
}

export default function ProjectsTab({
    projects,
    areas,
    contractors,
    propertyId,
    onRefresh,
}: ProjectsTabProps) {
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [editingProject, setEditingProject] = useState<HomeProject | null>(null);
    const [selectedProject, setSelectedProject] = useState<HomeProject | null>(null);
    const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
    const [projectTasks, setProjectTasks] = useState<Record<string, HomeProjectTask[]>>({});
    const [loading, setLoading] = useState(false);

    const [projectFormData, setProjectFormData] = useState<HomeProjectInsert>({
        property_id: propertyId || '',
        name: '',
        description: null,
        status: 'planning',
        priority: null,
        category: null,
        estimated_cost_cents: null,
        area_id: null,
        contractor_id: null,
        budget_cents: null,
        actual_cost_cents: null,
        start_date: null,
        target_end_date: null,
        actual_end_date: null,
        notes: null,
    });

    const [taskFormData, setTaskFormData] = useState<HomeProjectTaskInsert>({
        project_id: '',
        name: '',
        description: null,
        status: 'pending',
        sort_order: 0,
        estimated_cost_cents: null,
        actual_cost_cents: null,
        due_date: null,
        completed_date: null,
        assigned_to: null,
        notes: null,
    });

    const resetProjectForm = () => {
        setProjectFormData({
            property_id: propertyId || '',
            name: '',
            description: null,
            status: 'planning',
            priority: null,
            category: null,
            estimated_cost_cents: null,
            area_id: null,
            contractor_id: null,
            budget_cents: null,
            actual_cost_cents: null,
            start_date: null,
            target_end_date: null,
            actual_end_date: null,
            notes: null,
        });
        setEditingProject(null);
    };

    const resetTaskForm = () => {
        setTaskFormData({
            project_id: selectedProject?.id || '',
            name: '',
            description: null,
            status: 'pending',
            sort_order: 0,
            estimated_cost_cents: null,
            actual_cost_cents: null,
            due_date: null,
            completed_date: null,
            assigned_to: null,
            notes: null,
        });
    };

    const openProjectModal = (project?: HomeProject) => {
        if (project) {
            setEditingProject(project);
            setProjectFormData({
                property_id: project.property_id,
                name: project.name,
                description: project.description,
                status: project.status,
                priority: project.priority,
                category: project.category,
                estimated_cost_cents: project.estimated_cost_cents,
                area_id: project.area_id,
                contractor_id: project.contractor_id,
                budget_cents: project.budget_cents,
                actual_cost_cents: project.actual_cost_cents,
                start_date: project.start_date,
                target_end_date: project.target_end_date,
                actual_end_date: project.actual_end_date,
                notes: project.notes,
            });
        } else {
            resetProjectForm();
        }
        setShowProjectModal(true);
    };

    const openTaskModal = (project: HomeProject) => {
        setSelectedProject(project);
        setTaskFormData({
            ...taskFormData,
            project_id: project.id,
        });
        setShowTaskModal(true);
    };

    const toggleProjectExpanded = async (projectId: string) => {
        const newExpanded = new Set(expandedProjects);
        if (newExpanded.has(projectId)) {
            newExpanded.delete(projectId);
        } else {
            newExpanded.add(projectId);
            // Fetch tasks if not already loaded
            if (!projectTasks[projectId]) {
                try {
                    const response = await fetch(`/api/house/projects/${projectId}/tasks`);
                    if (response.ok) {
                        const tasks = await response.json();
                        setProjectTasks((prev) => ({ ...prev, [projectId]: tasks }));
                    }
                } catch (error) {
                    console.error('Error fetching tasks:', error);
                }
            }
        }
        setExpandedProjects(newExpanded);
    };

    const handleProjectSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectFormData.name.trim()) return;
        setLoading(true);

        try {
            const url = editingProject
                ? `/api/house/projects/${editingProject.id}`
                : '/api/house/projects';
            const method = editingProject ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projectFormData),
            });

            if (!response.ok) throw new Error('Failed to save project');

            setShowProjectModal(false);
            resetProjectForm();
            onRefresh();
        } catch (error) {
            console.error('Error saving project:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTaskSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!taskFormData.name.trim() || !selectedProject) return;
        setLoading(true);

        try {
            const response = await fetch(`/api/house/projects/${selectedProject.id}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskFormData),
            });

            if (!response.ok) throw new Error('Failed to create task');

            // Refresh tasks for this project
            const tasksResponse = await fetch(`/api/house/projects/${selectedProject.id}/tasks`);
            if (tasksResponse.ok) {
                const tasks = await tasksResponse.json();
                setProjectTasks((prev) => ({ ...prev, [selectedProject.id]: tasks }));
            }

            setShowTaskModal(false);
            resetTaskForm();
        } catch (error) {
            console.error('Error creating task:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProject = async (id: string) => {
        if (!confirm('Are you sure you want to delete this project and all its tasks?')) return;

        try {
            const response = await fetch(`/api/house/projects/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete');
            onRefresh();
        } catch (error) {
            console.error('Error deleting project:', error);
        }
    };

    const handleTaskStatusChange = async (
        projectId: string,
        taskId: string,
        status: HomeProjectTaskStatus
    ) => {
        try {
            const response = await fetch(`/api/house/projects/${projectId}/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            if (!response.ok) throw new Error('Failed to update task');

            // Refresh tasks
            const tasksResponse = await fetch(`/api/house/projects/${projectId}/tasks`);
            if (tasksResponse.ok) {
                const tasks = await tasksResponse.json();
                setProjectTasks((prev) => ({ ...prev, [projectId]: tasks }));
            }
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const handleDeleteTask = async (projectId: string, taskId: string) => {
        if (!confirm('Delete this task?')) return;

        try {
            const response = await fetch(`/api/house/projects/${projectId}/tasks/${taskId}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete');

            // Refresh tasks
            const tasksResponse = await fetch(`/api/house/projects/${projectId}/tasks`);
            if (tasksResponse.ok) {
                const tasks = await tasksResponse.json();
                setProjectTasks((prev) => ({ ...prev, [projectId]: tasks }));
            }
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const getStatusColor = (status: HomeProjectStatus | HomeProjectTaskStatus) => {
        switch (status) {
            case 'completed':
                return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'in_progress':
                return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'on_hold':
            case 'blocked':
                return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
            case 'cancelled':
            case 'skipped':
                return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
            default:
                return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
        }
    };

    const getPriorityColor = (priority: number | null) => {
        if (!priority) return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        if (priority >= 5) return 'bg-red-500/10 text-red-400 border-red-500/20';
        if (priority >= 4) return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
        if (priority >= 3) return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
        return 'bg-green-500/10 text-green-400 border-green-500/20';
    };

    const getPriorityLabel = (priority: number | null) => {
        if (!priority) return 'None';
        if (priority >= 5) return 'High';
        if (priority >= 4) return 'Medium-High';
        if (priority >= 3) return 'Medium';
        if (priority >= 2) return 'Low-Medium';
        return 'Low';
    };

    const formatCurrency = (cents: number | null) => {
        if (!cents) return null;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(cents / 100);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Projects</h2>
                <button
                    onClick={() => openProjectModal()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    New Project
                </button>
            </div>

            {projects.length === 0 ? (
                <div className="bg-gray-900 rounded-lg border border-gray-800 p-12 text-center">
                    <p className="text-gray-500">No projects yet</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {projects.map((project) => {
                        const isExpanded = expandedProjects.has(project.id);
                        const tasks = projectTasks[project.id] || [];
                        const completedTasks = tasks.filter((t) => t.status === 'completed').length;
                        const area = areas.find((a) => a.id === project.area_id);

                        return (
                            <div
                                key={project.id}
                                className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden"
                            >
                                <div className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-start gap-3 flex-1">
                                            <button
                                                onClick={() => toggleProjectExpanded(project.id)}
                                                className="mt-1 text-gray-400 hover:text-white transition-colors"
                                            >
                                                {isExpanded ? (
                                                    <ChevronDown className="w-5 h-5" />
                                                ) : (
                                                    <ChevronRight className="w-5 h-5" />
                                                )}
                                            </button>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-white mb-1">
                                                    {project.name}
                                                </h3>
                                                {project.description && (
                                                    <p className="text-sm text-gray-400">
                                                        {project.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(
                                                    project.priority
                                                )}`}
                                            >
                                                {getPriorityLabel(project.priority)}
                                            </span>
                                            <span
                                                className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(
                                                    project.status
                                                )}`}
                                            >
                                                {project.status?.replace('_', ' ')}
                                            </span>
                                            <button
                                                onClick={() => openProjectModal(project)}
                                                className="p-1 text-gray-400 hover:text-white transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProject(project.id)}
                                                className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 ml-8">
                                        {area && <span>Area: {area.name}</span>}
                                        {project.budget_cents && (
                                            <span>Budget: {formatCurrency(project.budget_cents)}</span>
                                        )}
                                        {project.target_end_date && (
                                            <span>
                                                Target:{' '}
                                                {new Date(project.target_end_date).toLocaleDateString()}
                                            </span>
                                        )}
                                        {tasks.length > 0 && (
                                            <span>
                                                Tasks: {completedTasks}/{tasks.length}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Expanded Tasks */}
                                {isExpanded && (
                                    <div className="border-t border-gray-800 p-4 bg-gray-800/50">
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="text-sm font-medium text-gray-300">Tasks</h4>
                                            <button
                                                onClick={() => openTaskModal(project)}
                                                className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                            >
                                                <Plus className="w-3 h-3" />
                                                Add Task
                                            </button>
                                        </div>

                                        {tasks.length === 0 ? (
                                            <p className="text-gray-500 text-sm text-center py-4">
                                                No tasks yet
                                            </p>
                                        ) : (
                                            <div className="space-y-2">
                                                {tasks.map((task) => (
                                                    <div
                                                        key={task.id}
                                                        className="flex items-center justify-between p-3 bg-gray-900 rounded-lg"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <button
                                                                onClick={() =>
                                                                    handleTaskStatusChange(
                                                                        project.id,
                                                                        task.id,
                                                                        task.status === 'completed'
                                                                            ? 'pending'
                                                                            : 'completed'
                                                                    )
                                                                }
                                                                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                                                                    task.status === 'completed'
                                                                        ? 'bg-green-500/20 border-green-500 text-green-400'
                                                                        : 'border-gray-600 hover:border-gray-500'
                                                                }`}
                                                            >
                                                                {task.status === 'completed' && (
                                                                    <CheckCircle className="w-3 h-3" />
                                                                )}
                                                            </button>
                                                            <span
                                                                className={`text-sm ${
                                                                    task.status === 'completed'
                                                                        ? 'text-gray-500 line-through'
                                                                        : 'text-white'
                                                                }`}
                                                            >
                                                                {task.name}
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={() =>
                                                                handleDeleteTask(project.id, task.id)
                                                            }
                                                            className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Project Modal */}
            {showProjectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-white">
                                {editingProject ? 'Edit Project' : 'New Project'}
                            </h2>
                            <button
                                onClick={() => setShowProjectModal(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleProjectSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    value={projectFormData.name}
                                    onChange={(e) =>
                                        setProjectFormData({ ...projectFormData, name: e.target.value })
                                    }
                                    required
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    placeholder="Project name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={projectFormData.description || ''}
                                    onChange={(e) =>
                                        setProjectFormData({
                                            ...projectFormData,
                                            description: e.target.value || null,
                                        })
                                    }
                                    rows={2}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={projectFormData.status || 'planning'}
                                        onChange={(e) =>
                                            setProjectFormData({
                                                ...projectFormData,
                                                status: e.target.value as HomeProjectStatus,
                                            })
                                        }
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="planning">Planning</option>
                                        <option value="budgeting">Budgeting</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="on_hold">On Hold</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Priority (1-5)
                                    </label>
                                    <select
                                        value={projectFormData.priority || ''}
                                        onChange={(e) =>
                                            setProjectFormData({
                                                ...projectFormData,
                                                priority: e.target.value ? parseInt(e.target.value) : null,
                                            })
                                        }
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="">None</option>
                                        <option value="1">1 - Low</option>
                                        <option value="2">2</option>
                                        <option value="3">3 - Medium</option>
                                        <option value="4">4</option>
                                        <option value="5">5 - High</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Area
                                    </label>
                                    <select
                                        value={projectFormData.area_id || ''}
                                        onChange={(e) =>
                                            setProjectFormData({
                                                ...projectFormData,
                                                area_id: e.target.value || null,
                                            })
                                        }
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="">Select area...</option>
                                        {areas.map((a) => (
                                            <option key={a.id} value={a.id}>
                                                {a.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Contractor
                                    </label>
                                    <select
                                        value={projectFormData.contractor_id || ''}
                                        onChange={(e) =>
                                            setProjectFormData({
                                                ...projectFormData,
                                                contractor_id: e.target.value || null,
                                            })
                                        }
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="">Select contractor...</option>
                                        {contractors.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Budget ($)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={
                                        projectFormData.budget_cents
                                            ? projectFormData.budget_cents / 100
                                            : ''
                                    }
                                    onChange={(e) =>
                                        setProjectFormData({
                                            ...projectFormData,
                                            budget_cents: e.target.value
                                                ? Math.round(parseFloat(e.target.value) * 100)
                                                : null,
                                        })
                                    }
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={projectFormData.start_date || ''}
                                        onChange={(e) =>
                                            setProjectFormData({
                                                ...projectFormData,
                                                start_date: e.target.value || null,
                                            })
                                        }
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Target End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={projectFormData.target_end_date || ''}
                                        onChange={(e) =>
                                            setProjectFormData({
                                                ...projectFormData,
                                                target_end_date: e.target.value || null,
                                            })
                                        }
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowProjectModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !projectFormData.name.trim()}
                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : editingProject ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Task Modal */}
            {showTaskModal && selectedProject && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-white">
                                Add Task to {selectedProject.name}
                            </h2>
                            <button
                                onClick={() => setShowTaskModal(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleTaskSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Task Name *
                                </label>
                                <input
                                    type="text"
                                    value={taskFormData.name}
                                    onChange={(e) =>
                                        setTaskFormData({ ...taskFormData, name: e.target.value })
                                    }
                                    required
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    placeholder="Task name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={taskFormData.description || ''}
                                    onChange={(e) =>
                                        setTaskFormData({
                                            ...taskFormData,
                                            description: e.target.value || null,
                                        })
                                    }
                                    rows={2}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Due Date
                                </label>
                                <input
                                    type="date"
                                    value={taskFormData.due_date || ''}
                                    onChange={(e) =>
                                        setTaskFormData({
                                            ...taskFormData,
                                            due_date: e.target.value || null,
                                        })
                                    }
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowTaskModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !taskFormData.name.trim()}
                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Adding...' : 'Add Task'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
