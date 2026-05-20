import { Router } from 'express';
import * as notificationsController from './notifications.controller.js';
import { verifyToken } from '../../middlewares/auth.js';

const router = Router();

router.use(verifyToken);

router.get('/unread', notificationsController.getUnreadNotifications);
router.patch('/read-all', notificationsController.markAllAsRead);
router.patch('/:id/read', notificationsController.markAsRead);

export default router;
