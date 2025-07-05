import React, { useState, useEffect } from 'react';
import { taskService, Task, TaskRequest } from '../../services/taskService';
import { User } from '../../services/userService';
import { Project } from '../../services/projectService';
import { toast } from 'react-toastify';
import { taskNoteService, TaskNote, TaskNoteRequest } from '../../services/taskNoteService';
import { useUser } from '../../context/UserContext';

interface ProjectTimelineProps {
    project: Project;
    onBack: () => void;
}

interface WeekTask extends Task {
    dayOfWeek: number;
    weekDate: string;
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ project, onBack }) => {
    const { user } = useUser();
    const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getWeekStart(new Date()));
    const [tasks, setTasks] = useState<WeekTask[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [selectedDay, setSelectedDay] = useState<number>(0);
    const [selectedUser, setSelectedUser] = useState<string>('');
    const [taskForm, setTaskForm] = useState<Partial<TaskRequest>>({
        name: '',
        description: '',
        priority: 'MEDIUM',
        projectId: project.id
    });
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [showTaskDetailModal, setShowTaskDetailModal] = useState(false);
    const [taskNotes, setTaskNotes] = useState<TaskNote[]>([]);
    const [newNote, setNewNote] = useState('');
    const [notesLoading, setNotesLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [currentWeekStart, project.id]);

    function getWeekStart(date: Date): Date {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    }

    const fetchData = async () => {
        try {
            setLoading(true);
            const projectTasks = await taskService.getTasksByProject(project.id);

            const weekEnd = new Date(currentWeekStart);
            weekEnd.setDate(currentWeekStart.getDate() + 6);

            const weekTasks: WeekTask[] = projectTasks
                .filter(task => {
                    const isDeveloper = user?.role === 'DEVELOPER' || user?.role === 'DEVOPS';
                    if (isDeveloper) {
                        const isAssignedToCurrentUser = task.assignedUser && user?.id && 
                            String(task.assignedUser.id) === String(user.id);
                        return isAssignedToCurrentUser;
                    }
                    return true;
                })
                .map(task => {
                    const taskDate = new Date(task.assignmentTimestamp || task.creationTimestamp);
                    const dayOfWeek = (taskDate.getDay() + 6) % 7;
                    
                    return {
                        ...task,
                        dayOfWeek,
                        weekDate: taskDate.toISOString().split('T')[0]
                    };
                })
                .filter(task => {
                    const taskDate = new Date(task.assignmentTimestamp || task.creationTimestamp);
                    return taskDate >= currentWeekStart && taskDate <= weekEnd;
                });

            setTasks(weekTasks);
            const assignedUsers: User[] = project.assignedUsers.map(user => ({
                id: user.id,
                name: user.name,
                email: user.email,
                role: { id: '', name: user.role },
                activated: true,
                hidden: false,
                organizationId: '',
                creationTimestamp: user.assignmentTimestamp,
                modificationTimestamp: user.assignmentTimestamp
            }));
            setUsers(assignedUsers);
        } catch (error) {
            toast.error('Failed to load project timeline');
        } finally {
            setLoading(false);
        }
    };

    const navigateWeek = (direction: 'prev' | 'next') => {
        const newWeek = new Date(currentWeekStart);
        newWeek.setDate(currentWeekStart.getDate() + (direction === 'next' ? 7 : -7));
        setCurrentWeekStart(newWeek);
    };

    const getWeekDays = () => {
        const days = [];
        const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        
        for (let i = 0; i < 5; i++) {
            const date = new Date(currentWeekStart.getTime());
            date.setDate(date.getDate() + i);
            days.push({
                name: weekDays[i],
                date: date,
                dateString: date.toLocaleDateString(),
                dayIndex: i
            });
        }
        return days;
    };

    const getTasksForDay = (dayIndex: number) => {
        return tasks.filter(task => task.dayOfWeek === dayIndex);
    };

    const handleAddTask = (dayIndex: number) => {
        setSelectedDay(dayIndex);
        setShowTaskModal(true);
    };

    const handleSubmitTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const selectedDate = new Date(currentWeekStart.getTime());
            selectedDate.setDate(selectedDate.getDate() + selectedDay);
            selectedDate.setHours(12, 0, 0, 0);
            
            const taskData: TaskRequest = {
                ...taskForm as TaskRequest,
                assignedUserId: selectedUser || undefined,
                assignmentTimestamp: selectedDate.toISOString()
            };
            
            await taskService.createTask(taskData);
            toast.success('Task created successfully');
            setShowTaskModal(false);
            setTaskForm({
                name: '',
                description: '',
                priority: 'MEDIUM',
                projectId: project.id
            });
            setSelectedUser('');
            fetchData();
        } catch (error) {
            toast.error('Failed to create task');
        }
    };

    const fetchTaskNotes = async (taskId: string) => {
        try {
            setNotesLoading(true);
            const notes = await taskNoteService.getTaskNotes(taskId);
            setTaskNotes(notes);
        } catch (error) {
            toast.error('Failed to load task notes');
        } finally {
            setNotesLoading(false);
        }
    };

    const handleSendNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.trim() || !selectedTask || !user) return;

        try {
            const noteRequest: TaskNoteRequest = {
                noteText: newNote.trim(),
                isAdminNote: user.role === 'ADMIN'
            };

            await taskNoteService.createTaskNote(selectedTask.id, noteRequest);
            setNewNote('');
            fetchTaskNotes(selectedTask.id);
            toast.success('Note added successfully');
        } catch (error) {
            toast.error('Failed to add note');
        }
    };

    const handleTaskClick = (task: Task) => {
        setSelectedTask(task);
        setShowTaskDetailModal(true);
        fetchTaskNotes(task.id);
    };

    const canStart = (task: Task) => {
        return (task.state === 'NOT_STARTED' || task.state === 'REJECTED') && task.assignedUser && 
               (user?.id === task.assignedUser.id || user?.role === 'ADMIN' || user?.role === 'DEVELOPER');
    };

    const canFinish = (task: Task) => {
        return task.state === 'IN_PROGRESS' && task.assignedUser && 
               (user?.id === task.assignedUser.id || user?.role === 'ADMIN' || user?.role === 'DEVELOPER');
    };

    const canApprove = (task: Task) => {
        return task.state === 'WAITING_FOR_APPROVAL' && user?.role === 'ADMIN';
    };

    const canReject = (task: Task) => {
        return task.state === 'WAITING_FOR_APPROVAL' && user?.role === 'ADMIN';
    };

    const handleTaskAction = async (action: string, task: Task) => {
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
            fetchData();
            const updatedTask = await taskService.getTaskById(task.id);
            setSelectedTask(updatedTask);
        } catch (error: any) {
            toast.error(error.response?.data?.message || `Failed to ${action} task`);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await taskService.deleteTask(taskId);
                toast.success('Task deleted successfully');
                fetchData();
            } catch (error: any) {
                toast.error(error.response?.data?.message || 'Failed to delete task');
            }
        }
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        
        if (isToday) {
            return date.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
            });
        } else {
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
            });
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusColor = (state: string) => {
        switch (state) {
            case 'NOT_STARTED': return 'bg-gray-100 text-gray-800';
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
            case 'FINISHED': return 'bg-green-100 text-green-800';
            case 'WAITING_FOR_APPROVAL': return 'bg-yellow-100 text-yellow-800';
            case 'APPROVED': return 'bg-emerald-100 text-emerald-800';
            case 'REJECTED': return 'bg-red-100 text-red-800';
            case 'NEEDS_ADJUSTMENT': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTaskCardBackground = () => {
        return 'bg-gradient-to-b from-gray-600 to-gray-700 ';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {project.name}
                    </h1>
                    
                    <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                            project.status === 'ACTIVE' 
                                ? 'bg-green-100 text-green-800' 
                                : project.status === 'INACTIVE'
                                    ? 'bg-red-100 text-red-800'
                                    : project.status === 'FINISHED'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-gray-100 text-gray-800'
                        }`}>
                            {project.status.charAt(0).toUpperCase() + project.status.slice(1).toLowerCase()}
                        </span>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {project.assignedUsers.length} team members
                        </div>
                    </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300">
                    {project.description}
                </p>
            </div>

            {/* Week Navigation & Timeline Grid */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigateWeek('prev')}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>Previous Week</span>
                    </button>
                    
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Week of {currentWeekStart.toLocaleDateString()} - {new Date(currentWeekStart.getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </h2>
                    
                    <button
                        onClick={() => navigateWeek('next')}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
                    >
                        <span>Next Week</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto">
                    {getWeekDays().map((day) => (
                        <div key={day.dayIndex} className="space-y-4 flex flex-col">
                            <div className="text-center border-b pb-2">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    {day.name}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {day.dateString}
                                </p>
                            </div>
                            
                            {user?.role === 'ADMIN' && (
                                <button
                                    onClick={() => handleAddTask(day.dayIndex)}
                                    className="w-full p-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                    <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    <span className="text-sm">Add Task</span>
                                </button>
                            )}
                            
                            <div className="space-y-2">
                                {getTasksForDay(day.dayIndex).map((task) => (
                                    <div
                                        key={task.id}
                                        className={`p-3 rounded-lg  ${getTaskCardBackground()} cursor-pointer relative group`}
                                        onClick={() => handleTaskClick(task)}
                                    >
                                        {user?.role === 'ADMIN' && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteTask(task.id);
                                                }}
                                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-all duration-200 z-10"
                                                title="Delete Task"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                        <h4 className="font-medium text-sm mb-2 pr-6">
                                            {task.name}
                                        </h4>
                                        <div className="space-y-1">
                                            <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${getStatusColor(task.state)}`}>
                                                {task.state.replace('_', ' ')}
                                            </span>
                                            <div className="flex items-center space-x-1 text-xs">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                <span className={`font-medium ${task.assignedUser ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 italic'}`}>
                                                    {task.assignedUser ? task.assignedUser.name : 'Unassigned'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {showTaskModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            Add Task for {getWeekDays()[selectedDay]?.name}
                        </h2>
                        <form onSubmit={handleSubmitTask} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Task Name
                                </label>
                                <input
                                    type="text"
                                    value={taskForm.name || ''}
                                    onChange={(e) => setTaskForm({ ...taskForm, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={taskForm.description || ''}
                                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    rows={3}
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Priority
                                </label>
                                <select
                                    value={taskForm.priority || 'MEDIUM'}
                                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as 'LOW' | 'MEDIUM' | 'HIGH' })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Assign to
                                </label>
                                <select
                                    value={selectedUser}
                                    onChange={(e) => setSelectedUser(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="">Unassigned</option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name} ({user.role?.name})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowTaskModal(false);
                                        setTaskForm({
                                            name: '',
                                            description: '',
                                            priority: 'MEDIUM',
                                            projectId: project.id
                                        });
                                        setSelectedUser('');
                                    }}
                                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                                >
                                    Create Task
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showTaskDetailModal && selectedTask && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    {selectedTask.name}
                                </h2>
                                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(selectedTask.priority)}`}>
                                        {selectedTask.priority}
                                    </span>
                                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedTask.state)}`}>
                                        {selectedTask.state.replace('_', ' ')}
                                    </span>
                                    {selectedTask.assignedUser && (
                                        <span className="flex items-center space-x-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <span>Assigned to: {selectedTask.assignedUser.name}</span>
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setShowTaskDetailModal(false);
                                    setSelectedTask(null);
                                    setTaskNotes([]);
                                    setNewNote('');
                                }}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                                    <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                                        {selectedTask.description}
                                    </p>
                                </div>

                                {selectedTask.estimatedTime && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Estimated Time</h3>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            {selectedTask.estimatedTime} hours
                                        </p>
                                    </div>
                                )}


                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Timeline</h3>
                                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                        <p>Created: {new Date(selectedTask.creationTimestamp).toLocaleString()}</p>
                                        {selectedTask.assignmentTimestamp && (
                                            <p>Assigned: {new Date(selectedTask.assignmentTimestamp).toLocaleString()}</p>
                                        )}
                                        {selectedTask.startTimestamp && (
                                            <p>Started: {new Date(selectedTask.startTimestamp).toLocaleString()}</p>
                                        )}
                                        {selectedTask.completionTimestamp && (
                                            <p>Completed: {new Date(selectedTask.completionTimestamp).toLocaleString()}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Actions</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {canStart(selectedTask) && (
                                            <button
                                                onClick={() => handleTaskAction('start', selectedTask)}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors"
                                            >
                                                Start Task
                                            </button>
                                        )}
                                        
                                        {canFinish(selectedTask) && (
                                            <button
                                                onClick={() => handleTaskAction('finish', selectedTask)}
                                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm transition-colors"
                                            >
                                                Finish Task
                                            </button>
                                        )}
                                        
                                        {canApprove(selectedTask) && (
                                            <button
                                                onClick={() => handleTaskAction('approve', selectedTask)}
                                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm transition-colors"
                                            >
                                                Approve
                                            </button>
                                        )}
                                        
                                        {canReject(selectedTask) && (
                                            <button
                                                onClick={() => handleTaskAction('reject', selectedTask)}
                                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm transition-colors"
                                            >
                                                Reject
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Task Notes</h3>
                                <div className="h-96 border border-gray-200 dark:border-gray-600 rounded-lg flex flex-col">
                                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                        {notesLoading ? (
                                            <div className="flex justify-center items-center h-full">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                            </div>
                                        ) : taskNotes.length === 0 ? (
                                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                                <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                                <p>No notes yet. Start a conversation!</p>
                                            </div>
                                        ) : (
                                            taskNotes.map((note) => (
                                                <div
                                                    key={note.id}
                                                    className={`flex ${note.userId === user?.id ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div
                                                        className={`max-w-xs px-3 py-2 rounded-lg ${
                                                            note.userId === user?.id
                                                                ? 'bg-blue-600 text-white'
                                                                : note.isAdminNote
                                                                ? 'bg-red-100 text-red-900 border border-red-300'
                                                                : 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100'
                                                        }`}
                                                    >
                                                        <div className="flex items-center space-x-2 mb-1">
                                                            <span className="text-xs font-medium">
                                                                {note.userName}
                                                                {note.isAdminNote && ' (Admin)'}
                                                            </span>
                                                            <span className="text-xs opacity-75">
                                                                {formatTimestamp(note.creationTimestamp)}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm whitespace-pre-wrap">{note.noteText}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    
                                    <div className="p-4 border-t border-gray-200 dark:border-gray-600">
                                        <form onSubmit={handleSendNote} className="flex space-x-2">
                                            <input
                                                type="text"
                                                value={newNote}
                                                onChange={(e) => setNewNote(e.target.value)}
                                                placeholder="Add a note..."
                                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                                            />
                                            <button
                                                type="submit"
                                                disabled={!newNote.trim()}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md text-sm transition-colors"
                                            >
                                                Send
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectTimeline;