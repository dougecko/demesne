import type {Request, Response, NextFunction} from 'express';
import {getCreatures, createCreature} from '../services/creatureService.mts';
import logger from '../config/logger.mts';

export const getCreatureData = async (req: Request, res: Response, next: NextFunction) => {
    logger.debug("creature request: " + req.baseUrl)

    // 1s delay to simulate logic
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
        const creatures = await getCreatures();
        res.json(creatures);
    } catch (error) {
        next(error);
    }
};

export const createCreatureData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const newCreature = await createCreature(req.body);
        res.status(201).json(newCreature);
    } catch (error) {
        next(error);
    }
};