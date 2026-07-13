import { Router } from 'express';
import { verifyToken } from '../../middlewares/auth.js';
import { checkPermission } from '../../middlewares/rbac.js';
import * as feedbackController from './feedback.controller.js';

const router = Router();

router.use(verifyToken);

router.get('/', feedbackController.listFeedback);
router.get('/stats', checkPermission('config', 'ver'), feedbackController.getFeedbackStats);
router.get('/:id', feedbackController.getFeedbackById);
router.post('/', feedbackController.createFeedback);
router.patch('/:id', checkPermission('config', 'ver'), feedbackController.updateFeedback);

export default router;
