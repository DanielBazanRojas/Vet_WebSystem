import { Router } from 'express';
import * as pharmacyController from './pharmacy.controller.js';
import { verifyToken } from '../../middlewares/auth.js';
import { checkPermission } from '../../middlewares/rbac.js';
import { auditLog } from '../../middlewares/audit.js';

const router = Router();

router.use(verifyToken);

router.get('/products', checkPermission('farmacia', 'ver'), pharmacyController.getProducts);
router.get('/products/:id', checkPermission('farmacia', 'ver'), pharmacyController.getProductById);
router.post('/products', checkPermission('farmacia', 'crear'), auditLog, pharmacyController.createProduct);
router.put('/products/:id', checkPermission('farmacia', 'editar'), auditLog, pharmacyController.updateProduct);
router.post('/products/:id/lots', checkPermission('farmacia', 'crear'), auditLog, pharmacyController.registerLotEntry);

router.get('/movements', checkPermission('farmacia', 'ver'), pharmacyController.getMovements);

router.get('/alerts', checkPermission('farmacia', 'alertas'), pharmacyController.getAlerts);
router.patch('/alerts/:id/resolve', checkPermission('farmacia', 'alertas'), auditLog, pharmacyController.resolveAlert);

router.get('/categories', checkPermission('farmacia', 'ver'), pharmacyController.getCategories);

export default router;
