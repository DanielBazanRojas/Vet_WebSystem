import { Router } from 'express';
import * as dashboardController from './dashboard.controller.js';
import { verifyToken } from '../../middlewares/auth.js';

const router = Router();

router.use(verifyToken);
router.get('/stats', dashboardController.getStats);

export default router;
