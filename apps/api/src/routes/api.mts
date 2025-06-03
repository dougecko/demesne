import express, {type Router} from 'express';
import {createCreatureData, getCreatureData} from "../controllers/creatureController.mjs";
import {createExampleData, getExampleData} from '../controllers/exampleController.mts';

const router: Router = express.Router();

router.get('/creatures', getCreatureData);
router.post('/creatures', createCreatureData);

// Example endpoints
router.get('/examples', getExampleData);
router.post('/examples', createExampleData);

export default router;