import { Router } from 'express';
import * as authController from './auth.controller.js';
import { verifyToken } from '../../middlewares/auth.js';

const router = Router();

router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', verifyToken, authController.me);

export default router;
