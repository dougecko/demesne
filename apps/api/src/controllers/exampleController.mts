import type {Request, Response, NextFunction} from 'express';
import {getExamples, createExample} from '../services/exampleService.mts';
import logger from '../config/logger.mts';

export const getExampleData = async (req: Request, res: Response, next: NextFunction) => {
    logger.debug("example request: " + req.baseUrl)
    try {
        const examples = await getExamples();
        res.json(examples);
    } catch (error) {
        next(error);
    }
};

export const createExampleData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const newExample = await createExample(req.body);
        res.status(201).json(newExample);
    } catch (error) {
        next(error);
    }
};