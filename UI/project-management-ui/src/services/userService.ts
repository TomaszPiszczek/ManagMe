import api from './axiosConfig';

export interface User {
    id: string;
    email: string;
    name: string;
    role: {
        id: string;
        name: string;
    };
    activated: boolean;
    creationTimestamp: string;
    modificationTimestamp: string;
}

export interface UserRequest {
    email: string;
    name: string;
    password: string;
    roleId: string;
}

export const userService = {
    async getAllUsers(): Promise<User[]> {
        const response = await api.get<User[]>('/users');
        return response.data;
    },

    async getUserById(id: string): Promise<User> {
        const response = await api.get<User>(`/users/${id}`);
        return response.data;
    },

    async createUser(user: UserRequest): Promise<User> {
        const response = await api.post<User>('/users', user);
        return response.data;
    },

    async updateUser(id: string, user: UserRequest): Promise<User> {
        const response = await api.put<User>(`/users/${id}`, user);
        return response.data;
    },

    async deleteUser(id: string): Promise<void> {
        await api.delete(`/users/${id}`);
    },

    async softDeleteUser(id: string): Promise<void> {
        await api.patch(`/users/${id}/soft-delete`);
    },

    async getUserActiveProject(userId: string): Promise<any> {
        const response = await api.get(`/users/${userId}/active-project`);
        return response.data;
    },

    async setUserActiveProject(userId: string, projectId: string): Promise<void> {
        await api.put(`/users/${userId}/active-project/${projectId}`);
    }
};