import { Router } from 'express';
import * as groomingController from './grooming.controller.js';
import { verifyToken } from '../../middlewares/auth.js';
import { checkPermission } from '../../middlewares/rbac.js';
import { auditLog } from '../../middlewares/audit.js';

const router = Router();

router.use(verifyToken);

router.get('/sessions', checkPermission('estetica', 'ver'), groomingController.getSessions);
router.get('/sessions/:id', checkPermission('estetica', 'ver'), groomingController.getSessionById);
router.post('/sessions', checkPermission('estetica', 'crear'), auditLog, groomingController.createSession);
router.put('/sessions/:id', checkPermission('estetica', 'editar'), auditLog, groomingController.updateSession);
router.post('/sessions/:id/services', checkPermission('estetica', 'crear'), auditLog, groomingController.addServiceToSession);
router.delete('/sessions/:id/services/:serviceId', checkPermission('estetica', 'editar'), auditLog, groomingController.removeServiceFromSession);

router.get('/catalog', checkPermission('estetica', 'ver'), groomingController.getCatalog);
router.get('/catalog/:serviceId/price/:speciesId', checkPermission('estetica', 'ver'), groomingController.getServicePriceForSpecies);

export default router;
