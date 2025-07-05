import api from './axiosConfig';

export interface AssignedUser {
    id: string;
    name: string;
    email: string;
    role: string;
    assignmentTimestamp: string;
}

export interface Project {
    id: string;
    name: string;
    description: string;
    status: string;
    ownerId?: string;
    ownerName?: string;
    creationTimestamp: string;
    modificationTimestamp: string;
    assignedUsers: AssignedUser[];
    memberCount: number;
}

export interface ProjectRequest {
    name: string;
    description: string;
    status?: string;
}

export const projectService = {
    async getAllProjects(): Promise<Project[]> {
        const response = await api.get<Project[]>('/projects/active');
        return response.data;
    },

    async getInactiveProjects(): Promise<Project[]> {
        const response = await api.get<Project[]>('/projects/inactive');
        return response.data;
    },

    async getUserProjects(userId: string): Promise<Project[]> {
        const response = await api.get<Project[]>(`/projects/user/${userId}`);
        return response.data;
    },

    async getProjectById(id: string): Promise<Project> {
        const response = await api.get<Project>(`/projects/${id}`);
        return response.data;
    },

    async createProject(project: ProjectRequest): Promise<Project> {
        const response = await api.post<Project>('/projects', project);
        return response.data;
    },

    async updateProject(id: string, project: ProjectRequest): Promise<Project> {
        const response = await api.put<Project>(`/projects/${id}`, project);
        return response.data;
    },

    async deleteProject(id: string): Promise<void> {
        await api.delete(`/projects/${id}`);
    },

    async assignUserToProject(projectId: string, userId: string): Promise<void> {
        await api.post(`/projects/${projectId}/assign/${userId}`);
    },

    async removeUserFromProject(projectId: string, userId: string): Promise<void> {
        await api.delete(`/projects/${projectId}/assign/${userId}`);
    },


    async setProjectStatus(id: string, status: string): Promise<void> {
        await api.put(`/projects/${id}/status/${status}`);
    },

    async getAssignedUsers(id: string): Promise<AssignedUser[]> {
        const response = await api.get<AssignedUser[]>(`/projects/${id}/assigned-users`);
        return response.data;
    },

    async getProjectsByStatus(status: string): Promise<Project[]> {
        const response = await api.get<Project[]>(`/projects/status/${status}`);
        return response.data;
    },

    async removeUserFromProject(projectId: string, userId: string): Promise<void> {
        await api.delete(`/projects/${projectId}/assign/${userId}`);
    }
};