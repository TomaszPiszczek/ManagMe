import React, { useState, useEffect } from 'react';
import { projectService, Project, ProjectRequest, AssignedUser } from '../../services/projectService';
import { userService, User } from '../../services/userService';
import { toast } from 'react-toastify';
import ProjectTimeline from './ProjectTimeline';
import { useUser } from '../../context/UserContext';

const ProjectsView = () => {
    const { user } = useUser();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [formData, setFormData] = useState<ProjectRequest>({ name: '', description: '', status: 'ACTIVE' });
    const [filter, setFilter] = useState<'ACTIVE' | 'INACTIVE' | 'FINISHED'>('ACTIVE');
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [showTimeline, setShowTimeline] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [assigningProject, setAssigningProject] = useState<Project | null>(null);
    const [availableUsers, setAvailableUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string>('');

    useEffect(() => {
        fetchProjects();
        fetchAvailableUsers();
    }, []);


    // Prevent timeline state from being lost on resize
    useEffect(() => {
        const handleResize = () => {
            // Prevent any state reset on resize
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [showTimeline, selectedProject]);

    const fetchAvailableUsers = async () => {
        try {
            const users = await userService.getAllUsers();
            console.log('Fetched users:', users);
            // Filter for developers and devops only
            const developersAndDevops = users.filter(user => 
                user.role.name === 'DEVELOPER' || user.role.name === 'DEVOPS'
            );
            console.log('Filtered developers and devops:', developersAndDevops);
            setAvailableUsers(developersAndDevops);
        } catch (error) {
            console.error('Error loading users:', error);
            toast.error('Failed to load users');
        }
    };

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const [active, inactive, finished] = await Promise.all([
                projectService.getProjectsByStatus('ACTIVE'),
                projectService.getProjectsByStatus('INACTIVE'),
                projectService.getProjectsByStatus('FINISHED')
            ]);
            
            setProjects([...active, ...inactive, ...finished]);
        } catch (error) {
            toast.error('Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingProject) {
                await projectService.updateProject(editingProject.id, formData);
                toast.success('Project updated successfully');
            } else {
                await projectService.createProject(formData);
                toast.success('Project created successfully');
            }
            setShowAddModal(false);
            setEditingProject(null);
            setFormData({ name: '', description: '', status: 'ACTIVE' });
            fetchProjects();
        } catch (error) {
            toast.error('Failed to save project');
        }
    };

    const handleEdit = (project: Project) => {
        setEditingProject(project);
        setFormData({ name: project.name, description: project.description, status: project.status });
        setShowAddModal(true);
    };

    const handleDelete = async (projectId: string) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            try {
                await projectService.deleteProject(projectId);
                toast.success('Project deleted successfully');
                fetchProjects();
            } catch (error) {
                toast.error('Failed to delete project');
            }
        }
    };

    const handleViewProject = (project: Project) => {
        setSelectedProject(project);
        setShowTimeline(true);
    };

    const handleBackToProjects = () => {
        setShowTimeline(false);
        setSelectedProject(null);
    };

    const handleAssignUser = (project: Project) => {
        console.log('Opening assign modal with available users:', availableUsers);
        console.log('Project to assign to:', project);
        setAssigningProject(project);
        setShowAssignModal(true);
    };

    const handleAssignSubmit = async () => {
        if (!assigningProject || !selectedUserId) return;
        
        try {
            await projectService.assignUserToProject(assigningProject.id, selectedUserId);
            toast.success('User assigned to project successfully');
            setShowAssignModal(false);
            setAssigningProject(null);
            setSelectedUserId('');
            fetchProjects();
        } catch (error) {
            toast.error('Failed to assign user to project');
        }
    };

    const handleRemoveUser = async (projectId: string, userId: string) => {
        if (window.confirm('Are you sure you want to remove this user from the project?')) {
            try {
                await projectService.removeUserFromProject(projectId, userId);
                toast.success('User removed from project successfully');
                fetchProjects();
            } catch (error) {
                toast.error('Failed to remove user from project');
            }
        }
    };

    const handleStatusChange = async (projectId: string, status: string) => {
        try {
            await projectService.setProjectStatus(projectId, status);
            toast.success('Project status updated successfully');
            fetchProjects();
        } catch (error) {
            toast.error('Failed to update project status');
        }
    };

    const getDisplayedProjects = () => {
        let filteredProjects = projects.filter(project => project.status === filter);
        
        // For developers, only show projects they are assigned to
        if (user?.role === 'DEVELOPER' || user?.role === 'DEVOPS') {
            filteredProjects = filteredProjects.filter(project => 
                project.assignedUsers && project.assignedUsers.some(assignedUser => 
                    String(assignedUser.id) === String(user.id)
                )
            );
        }
        
        return filteredProjects;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (showTimeline && selectedProject) {
        return (
            <ProjectTimeline 
                project={selectedProject} 
                onBack={handleBackToProjects}
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Projects Management
                    </h1>
                    {user?.role === 'ADMIN' && (
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center space-x-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Add Project</span>
                        </button>
                    )}
                </div>

                <div className="flex space-x-2 mb-6">
                    <button
                        onClick={() => setFilter('ACTIVE')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            filter === 'ACTIVE'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                    >
                        Active ({projects.filter(p => p.status === 'ACTIVE').length})
                    </button>
                    <button
                        onClick={() => setFilter('INACTIVE')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            filter === 'INACTIVE'
                                ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                    >
                        Inactive ({projects.filter(p => p.status === 'INACTIVE').length})
                    </button>
                    <button
                        onClick={() => setFilter('FINISHED')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            filter === 'FINISHED'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                    >
                        Finished ({projects.filter(p => p.status === 'FINISHED').length})
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getDisplayedProjects().map((project) => {
                        return (
                            <div
                                key={project.id}
                                className={`bg-white dark:bg-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 ${
                                    project.status === 'ACTIVE' 
                                        ? 'border-green-500' 
                                        : project.status === 'INACTIVE'
                                            ? 'border-red-500'
                                            : 'border-blue-500'
                                }`}
                            >
                                <div className="p-6">
                                    <div className="mb-4">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                            {project.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                                            {project.description}
                                        </p>
                                    </div>
                                    
                                    <div className="mb-4">
                                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                            <div className="flex items-center space-x-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                                </svg>
                                                <span>{project.memberCount} members</span>
                                            </div>
                                        </div>
                                        
                                        {project.assignedUsers && project.assignedUsers.length > 0 && (
                                            <div className="mt-3">
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Assigned Members:</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {project.assignedUsers.slice(0, 3).map((assignedUser) => (
                                                        <div key={assignedUser.id} className="relative group">
                                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center space-x-1">
                                                                <span>{assignedUser.name} ({assignedUser.role})</span>
                                                                {user?.role === 'ADMIN' && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleRemoveUser(project.id, assignedUser.id);
                                                                        }}
                                                                        className="ml-1 hover:bg-red-500 hover:text-white rounded-full w-4 h-4 flex items-center justify-center transition-colors duration-200"
                                                                        title={`Remove ${assignedUser.name} from project`}
                                                                    >
                                                                        <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                                                        </svg>
                                                                    </button>
                                                                )}
                                                            </span>
                                                        </div>
                                                    ))}
                                                    {project.assignedUsers.length > 3 && (
                                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                                            +{project.assignedUsers.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-4 border-t pt-3">
                                        <p>Created: {new Date(project.creationTimestamp).toLocaleDateString()}</p>
                                        <p>Updated: {new Date(project.modificationTimestamp).toLocaleDateString()}</p>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        {user?.role === 'ADMIN' ? (
                                            <>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleViewProject(project)}
                                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        <span>View</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(project)}
                                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        <span>Edit</span>
                                                    </button>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleAssignUser(project)}
                                                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                        </svg>
                                                        <span>Assign</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(project.id)}
                                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                        <span>Delete</span>
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => handleViewProject(project)}
                                                className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                <span>View Project</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {getDisplayedProjects().length === 0 && (
                    <div className="text-center py-12">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <p className="text-gray-500 dark:text-gray-400 text-lg">
                            No projects found
                        </p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                            {getDisplayedProjects().length === 0 && projects.length === 0 ? 'Create your first project to get started.' : `No ${filter.toLowerCase()} projects found.`}
                        </p>
                    </div>
                )}
            </div>

            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            {editingProject ? 'Edit Project' : 'Add New Project'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Project Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    rows={3}
                                    required
                                />
                            </div>
                            {editingProject && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="ACTIVE">Active</option>
                                        <option value="INACTIVE">Inactive</option>
                                        <option value="FINISHED">Finished</option>
                                    </select>
                                </div>
                            )}
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setEditingProject(null);
                                        setFormData({ name: '', description: '', status: 'ACTIVE' });
                                    }}
                                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                                >
                                    {editingProject ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showAssignModal && assigningProject && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            Assign User to {assigningProject.name}
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Select Developer/DevOps
                                </label>
                                <select
                                    value={selectedUserId}
                                    onChange={(e) => setSelectedUserId(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="">Select a user...</option>
                                    {availableUsers
                                        .filter(user => !assigningProject.assignedUsers.some(au => au.id === user.id))
                                        .map(user => {
                                            console.log('Rendering user option:', user);
                                            return (
                                                <option key={user.id} value={user.id}>
                                                    {user.name} ({user.role.name})
                                                </option>
                                            );
                                        })
                                    }
                                </select>
                            </div>
                            
                            {assigningProject.assignedUsers.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Currently Assigned:
                                    </label>
                                    <div className="space-y-2 max-h-32 overflow-y-auto">
                                        {assigningProject.assignedUsers.map(user => (
                                            <div key={user.id} className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded">
                                                <span className="text-sm">{user.name} ({user.role})</span>
                                                <button
                                                    onClick={() => handleRemoveUser(assigningProject.id, user.id)}
                                                    className="text-red-600 hover:text-red-800 text-sm"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAssignModal(false);
                                        setAssigningProject(null);
                                        setSelectedUserId('');
                                    }}
                                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAssignSubmit}
                                    disabled={!selectedUserId}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md transition-colors"
                                >
                                    Assign
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectsView;