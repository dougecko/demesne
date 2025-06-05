import type { Request, Response } from 'express';
import type { ApiError } from '@demesne/types';
import logger from '../config/logger.mts';

export const errorHandler = (
    err: ApiError,
    _req: Request,
    res: Response
) => {
    const statusCode = err.statusCode || 500;
    logger.error(`[Error] ${err.message}`);

    res.status(statusCode).json({
        status: 'error',
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};