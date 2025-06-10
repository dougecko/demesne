export interface Example {
    id: string;
    name: string;
    description: string;
}

export interface ApiError extends Error {
    statusCode?: number;
}

export * from './creature';
export * from './spell';
