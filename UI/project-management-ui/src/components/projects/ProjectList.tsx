import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { projectService } from '../../services/projectService';
import ProjectForm from './ProjectForm';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Project {
    id: string;
    name: string;
    description: string;
    creationTimestamp: string;
    modificationTimestamp: string;
}

const ProjectList: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const { activeProject, setActiveProject } = useUser();

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const data = await projectService.getAllProjects();
            setProjects(data);
        } catch (error) {
            console.error('Failed to load projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingProject(null);
        setShowForm(true);
    };

    const handleEdit = (project: Project) => {
        setEditingProject(project);
        setShowForm(true);
    };

    const handleDelete = async (projectId: string) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            try {
                await projectService.deleteProject(projectId);
                await loadProjects();
                if (activeProject === projectId) {
                    setActiveProject(null);
                }
            } catch (error) {
                console.error('Failed to delete project:', error);
            }
        }
    };

    const handleFormSubmit = async (projectData: { name: string; description: string }) => {
        try {
            if (editingProject) {
                await projectService.updateProject(editingProject.id, projectData);
            } else {
                await projectService.createProject(projectData);
            }
            await loadProjects();
            setShowForm(false);
            setEditingProject(null);
        } catch (error) {
            console.error('Failed to save project:', error);
        }
    };

    const handleSetActive = async (projectId: string) => {
        setActiveProject(projectId);
    };

    if (loading) {
        return <div className="flex justify-center p-8">Loading projects...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h2>
                <button
                    onClick={handleCreate}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    New Project
                </button>
            </div>

            {projects.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">No projects found. Create your first project!</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-2 transition-colors ${
                                activeProject === project.id
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {project.name}
                                </h3>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEdit(project)}
                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    >
                                        <PencilIcon className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(project.id)}
                                        className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                                {project.description || 'No description'}
                            </p>
                            
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Created: {new Date(project.creationTimestamp).toLocaleDateString()}
                                </span>
                                <button
                                    onClick={() => handleSetActive(project.id)}
                                    disabled={activeProject === project.id}
                                    className={`px-3 py-1 rounded text-sm font-medium ${
                                        activeProject === project.id
                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200 cursor-not-allowed'
                                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    {activeProject === project.id ? 'Active' : 'Set Active'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showForm && (
                <ProjectForm
                    project={editingProject}
                    onSubmit={handleFormSubmit}
                    onCancel={() => {
                        setShowForm(false);
                        setEditingProject(null);
                    }}
                />
            )}
        </div>
    );
};

export default ProjectList;