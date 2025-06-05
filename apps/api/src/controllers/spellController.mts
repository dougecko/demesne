import type { Request, Response, NextFunction } from 'express';
import { getSpells, createSpell } from '../services/spellService.mts';
import logger from '../config/logger.mts';

export const getSpellData = async (req: Request, res: Response, next: NextFunction) => {
    logger.debug("spell request: " + req.baseUrl);

    try {
        const spells = await getSpells();
        res.json(spells);
    } catch (error) {
        next(error);
    }
};

export const createSpellData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const newSpell = await createSpell(req.body);
        res.status(201).json(newSpell);
    } catch (error) {
        next(error);
    }
}; 