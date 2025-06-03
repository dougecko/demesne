import express, {type Router} from 'express';
import { getExampleData, createExampleData } from '../controllers/exampleController.mts';

const router: Router = express.Router();

// Example endpoints
router.get('/examples', getExampleData);
router.post('/examples', createExampleData);

export default router;