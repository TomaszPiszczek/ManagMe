import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

interface Project {
    id: string;
    name: string;
    description: string;
    creationTimestamp: string;
    modificationTimestamp: string;
}

interface ProjectFormValues {
    name: string;
    description: string;
}

const Dashboard = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'update'>('create');
    const navigate = useNavigate();

    // Setup axios interceptor for JWT
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        axios.interceptors.request.use(
            (config) => {
                config.headers.Authorization = `Bearer ${token}`;
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        fetchProjects();
    }, [navigate]);

    const fetchProjects = async () => {
        try {
            const response = await axios.get('/api/projects');
            setProjects(response.data);
        } catch (error) {
            console.error('Error fetching projects:', error);
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                // Token expired or invalid
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/');
            }
        }
    };

    const openCreateModal = () => {
        setModalMode('create');
        setSelectedProject(null);
        setIsModalOpen(true);
    };

    const openUpdateModal = (project: Project) => {
        setModalMode('update');
        setSelectedProject(project);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const deleteProject = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            try {
                await axios.delete(`/api/projects/${id}`);
                setProjects(projects.filter(project => project.id !== id));
            } catch (error) {
                console.error('Error deleting project:', error);
            }
        }
    };

    const projectSchema = Yup.object().shape({
        name: Yup.string().required('Project name is required'),
        description: Yup.string(),
    });

    const handleSubmitProject = async (values: ProjectFormValues) => {
        try {
            if (modalMode === 'create') {
                const response = await axios.post('/api/projects', values);
                setProjects([...projects, response.data]);
            } else if (modalMode === 'update' && selectedProject) {
                const response = await axios.put(`/api/projects/${selectedProject.id}`, values);
                setProjects(projects.map(p => p.id === selectedProject.id ? response.data : p));
            }
            closeModal();
        } catch (error) {
            console.error('Error submitting project:', error);
        }
    };

    const initialValues: ProjectFormValues = {
        name: selectedProject?.name || '',
        description: selectedProject?.description || '',
    };

    // Get user info from localStorage
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : { name: 'User' };

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-md">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold">Project Management</h2>
                    <p className="text-gray-600">Welcome, {user.name}</p>
                </div>
                <div className="p-4">
                    <button
                        onClick={openCreateModal}
                        className="w-full mb-4 flex items-center justify-center p-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                    >
                        Create Project
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center p-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 p-8">
                <h1 className="text-2xl font-semibold mb-6">My Projects</h1>

                {projects.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <p className="text-gray-600">You don't have any projects yet.</p>
                        <button
                            onClick={openCreateModal}
                            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                        >
                            Create your first project
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <div key={project.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
                                    <p className="text-gray-600 mb-4">{project.description}</p>
                                    <div className="text-sm text-gray-500">
                                        <p>Created: {new Date(project.creationTimestamp).toLocaleDateString()}</p>
                                        <p>Last modified: {new Date(project.modificationTimestamp).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-2">
                                    <button
                                        onClick={() => openUpdateModal(project)}
                                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => deleteProject(project.id)}
                                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal for Create/Update */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
                        <div className="p-6">
                            <h2 className="text-2xl font-semibold mb-4">
                                {modalMode === 'create' ? 'Create New Project' : 'Update Project'}
                            </h2>
                            <Formik
                                initialValues={initialValues}
                                validationSchema={projectSchema}
                                onSubmit={handleSubmitProject}
                                enableReinitialize
                            >
                                {({ isSubmitting }) => (
                                    <Form>
                                        <div className="mb-4">
                                            <label className="block text-gray-700 mb-2">Project Name</label>
                                            <Field
                                                type="text"
                                                name="name"
                                                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                                            />
                                            <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
                                        </div>
                                        <div className="mb-6">
                                            <label className="block text-gray-700 mb-2">Description</label>
                                            <Field
                                                as="textarea"
                                                name="description"
                                                rows={4}
                                                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                                            />
                                            <ErrorMessage name="description" component="div" className="text-red-500 text-sm mt-1" />
                                        </div>
                                        <div className="flex justify-end space-x-3">
                                            <button
                                                type="button"
                                                onClick={closeModal}
                                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                                            >
                                                {modalMode === 'create' ? 'Create' : 'Update'}
                                            </button>
                                        </div>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;