import express, {type Router} from 'express';
import {createCreatureData, getCreatureData} from "../controllers/creatureController.mts";
import {createSpellData, getSpellData} from '../controllers/spellController.mts';

const router: Router = express.Router();

// Creature endpoints
router.get('/creatures', getCreatureData);
router.post('/creatures', createCreatureData);

// Spell endpoints
router.get('/spells', getSpellData);
router.post('/spells', createSpellData);

export default router;