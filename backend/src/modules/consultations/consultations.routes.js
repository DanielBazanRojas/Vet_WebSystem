import { Router } from 'express';
import * as consultationsController from './consultations.controller.js';
import { verifyToken } from '../../middlewares/auth.js';
import { checkPermission } from '../../middlewares/rbac.js';
import { auditLog } from '../../middlewares/audit.js';

const router = Router();

// Todos los endpoints de consultas requieren autenticación
router.use(verifyToken);

router.get('/catalog/products', consultationsController.getProductsCatalog);
router.get('/catalog/vaccines', consultationsController.getVaccinesCatalog);

router.get('/', checkPermission('clinica', 'ver'), consultationsController.getAllConsultations);
router.get('/pet/:petId', checkPermission('clinica', 'ver'), consultationsController.getPetHistory);
router.get('/:id', checkPermission('clinica', 'ver'), consultationsController.getConsultation);
router.post('/', checkPermission('clinica', 'crear'), auditLog, consultationsController.createConsultation);
router.put('/:id', checkPermission('clinica', 'editar'), auditLog, consultationsController.updateConsultation);
router.post('/:id/treatments', checkPermission('clinica', 'crear'), auditLog, consultationsController.addTreatment);
router.post('/:id/vaccines', checkPermission('clinica', 'crear'), auditLog, consultationsController.registerVaccine);
router.get('/:id/vaccines', checkPermission('clinica', 'ver'), consultationsController.getConsultationVaccines);
router.post('/:id/lab-results', checkPermission('clinica', 'crear'), auditLog, consultationsController.addLabResult);

export default router;
