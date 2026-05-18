import { Router } from 'express';
import { verifyToken } from '../../middlewares/auth.js';
import { checkPermission } from '../../middlewares/rbac.js';
import { auditLog } from '../../middlewares/audit.js';
import * as apptController from './appointments.controller.js';

const router = Router();

router.use(verifyToken);

// Catálogos auxiliares (usualmente todos los staff logueados pueden verlos)
router.get('/types', apptController.listTypes);
router.get('/staff', apptController.listStaff);

// CRUD
router.get('/',      checkPermission('appointments', 'read'), apptController.listAppointments);
router.get('/:id',   checkPermission('appointments', 'read'), apptController.getAppointment);

router.post('/',     checkPermission('appointments', 'write'), auditLog, apptController.createAppointment);
router.put('/:id',   checkPermission('appointments', 'write'), auditLog, apptController.updateAppointment);

router.patch('/:id/cancel', checkPermission('appointments', 'delete'), auditLog, apptController.cancelAppointment);

export default router;
