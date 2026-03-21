'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit2, ChevronDown, ChevronRight, CheckCircle } from 'lucide-react';
import ProjectModal from '../modals/ProjectModal';
import ProjectTaskModal from '../modals/ProjectTaskModal';
import type {
    HomeProject,
    HomeProjectTask,
    HomeProjectStatus,
    HomeProjectTaskStatus,
    HomeArea,
    HomeContractor,
} from '@/types/house.types';

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

    const handleTaskCreated = async (projectId: string) => {
        const tasksResponse = await fetch(`/api/house/projects/${projectId}/tasks`);
        if (tasksResponse.ok) {
            const tasks = await tasksResponse.json();
            setProjectTasks((prev) => ({ ...prev, [projectId]: tasks }));
        }
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
                    onClick={() => { setEditingProject(null); setShowProjectModal(true); }}
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
                                                onClick={() => { setEditingProject(project); setShowProjectModal(true); }}
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
                                                onClick={() => { setSelectedProject(project); setShowTaskModal(true); }}
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

            <ProjectModal
                isOpen={showProjectModal}
                onClose={() => setShowProjectModal(false)}
                editingProject={editingProject}
                areas={areas}
                contractors={contractors}
                propertyId={propertyId}
                onSuccess={onRefresh}
            />

            <ProjectTaskModal
                isOpen={showTaskModal}
                onClose={() => setShowTaskModal(false)}
                project={selectedProject}
                onSuccess={handleTaskCreated}
            />
        </div>
    );
}
