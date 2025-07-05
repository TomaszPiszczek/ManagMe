import api from './axiosConfig';

export interface TaskNote {
    id: string;
    taskId: string;
    userId: string;
    userName: string;
    noteText: string;
    isAdminNote: boolean;
    creationTimestamp: string;
    modificationTimestamp: string;
}

export interface TaskNoteRequest {
    noteText: string;
    isAdminNote?: boolean;
}

export interface TaskNoteUpdateRequest {
    noteText: string;
}

export const taskNoteService = {
    async createTaskNote(taskId: string, request: TaskNoteRequest): Promise<TaskNote> {
        const response = await api.post<TaskNote>(`/task-notes/task/${taskId}`, request);
        return response.data;
    },

    async getTaskNotes(taskId: string): Promise<TaskNote[]> {
        const response = await api.get<TaskNote[]>(`/task-notes/task/${taskId}`);
        return response.data;
    },

    async updateTaskNote(id: string, request: TaskNoteUpdateRequest): Promise<TaskNote> {
        const response = await api.put<TaskNote>(`/task-notes/${id}`, request);
        return response.data;
    },

    async deleteTaskNote(id: string): Promise<void> {
        await api.delete(`/task-notes/${id}`);
    },

    async getTaskNoteCount(taskId: string): Promise<number> {
        const response = await api.get<number>(`/task-notes/task/${taskId}/count`);
        return response.data;
    }
};