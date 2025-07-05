import React, { useState } from 'react';
import { Task, taskService } from '../../services/taskService';
import { PencilIcon, TrashIcon, UserIcon, ChatBubbleLeftIcon, BellIcon } from '@heroicons/react/24/outline';
import TaskNotes from './TaskNotes';
import { toast } from 'react-toastify';
import { useUser } from '../../context/UserContext';

interface TaskCardProps {
    task: Task;
    onEdit: (task: Task) => void;
    onDelete: (taskId: string) => void;
    onStatusChange: (taskId: string, status: string) => void;
    onAssign: (taskId: string, userId: string) => void;
    onTaskUpdate?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onTaskUpdate }) => {
    const { user } = useUser();
    const [showNotes, setShowNotes] = useState(false);
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'HIGH': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'LOW': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    const getStatusColor = (state: string) => {
        switch (state) {
            case 'NOT_STARTED': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'FINISHED': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'NEEDS_ADJUSTMENT': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
            case 'WAITING_FOR_APPROVAL': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'APPROVED': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'REJECTED': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    const handleTaskAction = async (action: string) => {
        try {
            switch (action) {
                case 'start':
                    await taskService.startTask(task.id);
                    toast.success('Task started');
                    break;
                case 'finish':
                    await taskService.finishTask(task.id);
                    toast.success('Task marked as finished and waiting for approval');
                    break;
                case 'approve':
                    await taskService.approveTask(task.id);
                    toast.success('Task approved');
                    break;
                case 'reject':
                    await taskService.rejectTask(task.id);
                    toast.success('Task rejected');
                    break;
            }
            onTaskUpdate?.();
        } catch (error: any) {
            toast.error(error.response?.data?.message || `Failed to ${action} task`);
        }
    };

    const handleNotesOpen = async () => {
        setShowNotes(true);
        if (task.hasUnreadNotes) {
            try {
                await taskService.markNotesAsRead(task.id);
                onTaskUpdate?.();
            } catch (error) {
                // Ignore error for marking as read
            }
        }
    };

    const canStart = () => {
        return (task.state === 'NOT_STARTED' || task.state === 'REJECTED') && task.assignedUser &&
               (user?.id === task.assignedUser.id || user?.role === 'ADMIN' || user?.role === 'DEVELOPER');
    };

    const canFinish = () => {
        return task.state === 'IN_PROGRESS' && task.assignedUser &&
               (user?.id === task.assignedUser.id || user?.role === 'ADMIN' || user?.role === 'DEVELOPER');
    };

    const canApprove = () => {
        return task.state === 'WAITING_FOR_APPROVAL' && user?.role === 'ADMIN';
    };

    const canReject = () => {
        return task.state === 'WAITING_FOR_APPROVAL' && user?.role === 'ADMIN';
    };

    const canDelete = () => {
        return user?.role === 'ADMIN';
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">{task.name}</h4>
                        <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.state)}`}>
                                {task.state.replace('_', ' ')}
                            </span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                            </span>
                        </div>
                    </div>
                    <div className="flex space-x-1">
                        <button
                            onClick={handleNotesOpen}
                            className="relative text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                            <ChatBubbleLeftIcon className="h-4 w-4" />
                            {task.noteCount && task.noteCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                    {task.noteCount > 9 ? '9+' : task.noteCount}
                                </span>
                            )}
                            {task.hasUnreadNotes && (
                                <BellIcon className="absolute -top-1 -right-1 h-3 w-3 text-red-500 animate-pulse" />
                            )}
                        </button>
                        <button
                            onClick={() => onEdit(task)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <PencilIcon className="h-4 w-4" />
                        </button>
                        {canDelete() && (
                            <button
                                onClick={() => onDelete(task.id)}
                                className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                            >
                                <TrashIcon className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                {task.description && (
                    <p className="text-gray-600 dark:text-gray-300 text-xs mb-3">{task.description}</p>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                    {task.estimatedTime && (
                        <div>Time: {task.estimatedTime}h</div>
                    )}
                    <div>Created: {formatDate(task.creationTimestamp)}</div>
                    {task.assignmentTimestamp && (
                        <div>Assigned: {formatDate(task.assignmentTimestamp)}</div>
                    )}
                    {task.startTimestamp && (
                        <div>Started: {formatDate(task.startTimestamp)}</div>
                    )}
                </div>

                {task.assignedUser && (
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <UserIcon className="h-3 w-3 mr-1" />
                        {task.assignedUser.name}
                    </div>
                )}

                <div className="flex flex-wrap gap-1">
                    {canStart() && (
                        <button
                            onClick={() => handleTaskAction('start')}
                            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
                        >
                            Start Task
                        </button>
                    )}

                    {canFinish() && (
                        <button
                            onClick={() => handleTaskAction('finish')}
                            className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800"
                        >
                            Finish Task
                        </button>
                    )}

                    {canApprove() && (
                        <button
                            onClick={() => handleTaskAction('approve')}
                            className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800"
                        >
                            Approve
                        </button>
                    )}

                    {canReject() && (
                        <button
                            onClick={() => handleTaskAction('reject')}
                            className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                        >
                            Reject
                        </button>
                    )}
                </div>
            </div>

            {showNotes && (
                <TaskNotes
                    taskId={task.id}
                    taskName={task.name}
                    onClose={() => setShowNotes(false)}
                    onNotesUpdate={onTaskUpdate}
                />
            )}
        </>
    );
};

export default TaskCard;