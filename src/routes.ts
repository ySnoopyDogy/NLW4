import { Router } from 'express';
import UserController from './controllers/UserController';
import SurveysController from './controllers/SurveysController';

const router = Router();

router.post('/users', UserController.create);

router.post('/surveys', SurveysController.create);
router.get('/surveys', SurveysController.show);

export default router;
