import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { taskService, Task } from '../../services/taskService';
import { itemService, Item } from '../../services/itemService';
import TaskForm from './TaskForm';
import TaskCard from './TaskCard';
import { PlusIcon } from '@heroicons/react/24/outline';

const TaskBoard: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [stories, setStories] = useState<Item[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);
    const { activeProject } = useUser();

    useEffect(() => {
        if (activeProject) {
            loadData();
        }
    }, [activeProject]);

    const loadData = async () => {
        if (!activeProject) return;
        
        try {
            const [storiesData, tasksData] = await Promise.all([
                itemService.getItemsByProject(activeProject),
                taskService.getAllTasks()
            ]);
            setStories(storiesData);
            setTasks(tasksData.filter(task => 
                task.project.id === activeProject
            ));
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingTask(null);
        setShowForm(true);
    };

    const handleEdit = (task: Task) => {
        setEditingTask(task);
        setShowForm(true);
    };

    const handleDelete = async (taskId: string) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await taskService.deleteTask(taskId);
                await loadData();
            } catch (error) {
                console.error('Failed to delete task:', error);
            }
        }
    };

    const handleFormSubmit = async (taskData: any) => {
        try {
            if (editingTask) {
                await taskService.updateTask(editingTask.id, taskData);
            } else {
                await taskService.createTask(taskData);
            }
            await loadData();
            setShowForm(false);
            setEditingTask(null);
        } catch (error) {
            console.error('Failed to save task:', error);
        }
    };

    const handleStatusChange = async (taskId: string, newStatus: string) => {
        try {
            await taskService.updateTaskStatus(taskId, newStatus as any);
            await loadData();
        } catch (error) {
            console.error('Failed to change task status:', error);
        }
    };

    const handleAssignTask = async (taskId: string, userId: string) => {
        try {
            await taskService.assignTaskToUser(taskId, userId);
            await loadData();
        } catch (error) {
            console.error('Failed to assign task:', error);
        }
    };

    const getTasksByStatus = (status: string) => {
        const statusMapping: Record<string, string[]> = {
            'TODO': ['NOT_STARTED', 'NEEDS_ADJUSTMENT', 'REJECTED'],
            'DOING': ['IN_PROGRESS'],
            'DONE': ['FINISHED', 'WAITING_FOR_APPROVAL', 'APPROVED']
        };
        return tasks.filter(task => statusMapping[status]?.includes(task.state));
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'TODO': return 'bg-gray-100 border-gray-300';
            case 'DOING': return 'bg-blue-50 border-blue-300';
            case 'DONE': return 'bg-green-50 border-green-300';
            default: return 'bg-gray-100 border-gray-300';
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8">Loading tasks...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Task Board</h2>
                <button
                    onClick={handleCreate}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    New Task
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['TODO', 'DOING', 'DONE'].map((status) => (
                    <div key={status} className={`rounded-lg border-2 p-4 ${getStatusColor(status)}`}>
                        <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">
                            {status === 'TODO' ? 'To Do' : status === 'DOING' ? 'In Progress' : 'Completed'}
                            <span className="ml-2 text-sm font-normal text-gray-500">
                                ({getTasksByStatus(status).length})
                            </span>
                        </h3>
                        
                        <div className="space-y-3">
                            {getTasksByStatus(status).map((task) => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onStatusChange={handleStatusChange}
                                    onAssign={handleAssignTask}
                                    onTaskUpdate={loadData}
                                />
                            ))}
                            
                            {getTasksByStatus(status).length === 0 && (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    No tasks in {status.toLowerCase()}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {showForm && (
                <TaskForm
                    task={editingTask}
                    stories={stories}
                    onSubmit={handleFormSubmit}
                    onCancel={() => {
                        setShowForm(false);
                        setEditingTask(null);
                    }}
                />
            )}
        </div>
    );
};

export default TaskBoard;