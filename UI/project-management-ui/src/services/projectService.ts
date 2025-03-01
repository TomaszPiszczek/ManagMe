import api from './axiosConfig';

export interface Project {
    id: string;
    name: string;
    description: string;
    creationTimestamp: string;
    modificationTimestamp: string;
}

export interface ProjectRequest {
    name: string;
    description: string;
}

export const getAllProjects = async (): Promise<Project[]> => {
    const response = await api.get<Project[]>('/projects');
    return response.data;
};

export const getProjectById = async (id: string): Promise<Project> => {
    const response = await api.get<Project>(`/projects/${id}`);
    return response.data;
};

export const createProject = async (project: ProjectRequest): Promise<Project> => {
    const response = await api.post<Project>('/projects', project);
    return response.data;
};

export const updateProject = async (id: string, project: ProjectRequest): Promise<Project> => {
    const response = await api.put<Project>(`/projects/${id}`, project);
    return response.data;
};

export const deleteProject = async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
};