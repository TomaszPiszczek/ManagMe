import api from './axiosConfig';

export interface Task {
    id: string;
    name: string;
    description: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    state: 'NOT_STARTED' | 'IN_PROGRESS' | 'FINISHED' | 'NEEDS_ADJUSTMENT' | 'WAITING_FOR_APPROVAL' | 'APPROVED' | 'REJECTED';
    project: {
        id: string;
        name: string;
    };
    assignedUser?: {
        id: string;
        name: string;
        email: string;
    };
    estimatedTime?: number;
    creationTimestamp: string;
    startTimestamp?: string;
    completionTimestamp?: string;
    assignmentTimestamp?: string;
    hasUnreadNotes?: boolean;
    noteCount?: number;
}

export interface TaskRequest {
    name: string;
    description: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    projectId: string;
    assignedUserId?: string;
    estimatedTime?: number;
    assignmentTimestamp?: string;
}

export const taskService = {
    async getAllTasks(): Promise<Task[]> {
        const response = await api.get<Task[]>('/tasks');
        return response.data;
    },

    async getTaskById(id: string): Promise<Task> {
        const response = await api.get<Task>(`/tasks/${id}`);
        return response.data;
    },

    async getTasksByProject(projectId: string): Promise<Task[]> {
        const response = await api.get<Task[]>(`/tasks/project/${projectId}`);
        return response.data;
    },

    async getTasksByAssignedUser(assignedUserId: string): Promise<Task[]> {
        const response = await api.get<Task[]>(`/tasks/assigned/${assignedUserId}`);
        return response.data;
    },

    async createTask(task: TaskRequest): Promise<Task> {
        const response = await api.post<Task>('/tasks', task);
        return response.data;
    },

    async updateTask(id: string, task: Partial<TaskRequest>): Promise<Task> {
        const response = await api.put<Task>(`/tasks/${id}`, task);
        return response.data;
    },

    async deleteTask(id: string): Promise<void> {
        await api.delete(`/tasks/${id}`);
    },

    async assignTaskToUser(taskId: string, userId: string): Promise<void> {
        await api.put(`/tasks/${taskId}/assign/${userId}`);
    },

    async updateTaskStatus(taskId: string, status: 'NOT_STARTED' | 'IN_PROGRESS' | 'FINISHED' | 'NEEDS_ADJUSTMENT' | 'WAITING_FOR_APPROVAL' | 'APPROVED' | 'REJECTED'): Promise<void> {
        await api.put(`/tasks/${taskId}/status/${status}`);
    },


    async startTask(taskId: string): Promise<Task> {
        const response = await api.put<Task>(`/tasks/${taskId}/start`);
        return response.data;
    },

    async finishTask(taskId: string): Promise<Task> {
        const response = await api.put<Task>(`/tasks/${taskId}/finish`);
        return response.data;
    },

    async approveTask(taskId: string): Promise<Task> {
        const response = await api.put<Task>(`/tasks/${taskId}/approve`);
        return response.data;
    },

    async rejectTask(taskId: string): Promise<Task> {
        const response = await api.put<Task>(`/tasks/${taskId}/reject`);
        return response.data;
    },

    async markNotesAsRead(taskId: string): Promise<Task> {
        const response = await api.put<Task>(`/tasks/${taskId}/mark-notes-read`);
        return response.data;
    }
};