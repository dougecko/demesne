const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export async function fetchFromApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
        },
        ...options,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }

    return response.json();
}

export const api = {
    get: <T>(endpoint: string) => fetchFromApi<T>(endpoint),

    post: <T>(endpoint: string, data: any) =>
        fetchFromApi<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    put: <T>(endpoint: string, data: any) =>
        fetchFromApi<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    delete: <T>(endpoint: string) =>
        fetchFromApi<T>(endpoint, {
            method: 'DELETE',
        }),
};