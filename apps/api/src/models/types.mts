export interface Example {
    id: string;
    name: string;
    description: string;
}

export interface ApiError extends Error {
    statusCode?: number;
}