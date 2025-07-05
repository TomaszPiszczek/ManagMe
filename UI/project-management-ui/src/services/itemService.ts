import api from './axiosConfig';

export interface Item {
    id: string;
    name: string;
    description: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    state: 'TODO' | 'DOING' | 'DONE';
    projectId: string;
    ownerId?: string;
    ownerName?: string;
    creationTimestamp: string;
}

export interface ItemRequest {
    name: string;
    description: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    projectId: string;
    ownerId?: string;
}

export const itemService = {
    async getAllItems(): Promise<Item[]> {
        const response = await api.get<Item[]>('/items');
        return response.data;
    },

    async getItemById(id: string): Promise<Item> {
        const response = await api.get<Item>(`/items/${id}`);
        return response.data;
    },

    async getItemsByProject(projectId: string): Promise<Item[]> {
        const response = await api.get<Item[]>(`/items/project/${projectId}`);
        return response.data;
    },

    async createItem(item: ItemRequest): Promise<Item> {
        const response = await api.post<Item>('/items', item);
        return response.data;
    },

    async updateItem(id: string, item: Partial<ItemRequest>): Promise<Item> {
        const response = await api.put<Item>(`/items/${id}`, item);
        return response.data;
    },

    async deleteItem(id: string): Promise<void> {
        await api.delete(`/items/${id}`);
    }
};