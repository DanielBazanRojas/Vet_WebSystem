import { Router } from 'express';
import { verifyToken } from '../../middlewares/auth.js';
import { checkPermission } from '../../middlewares/rbac.js';
import { auditLog } from '../../middlewares/audit.js';
import * as staffController from './staff.controller.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(verifyToken);

// Listar usuarios staff
router.get('/', checkPermission('usuarios', 'ver'), staffController.listStaff);

// Detalle de usuario staff
router.get('/:id', checkPermission('usuarios', 'ver'), staffController.getStaffDetails);

// Crear usuario staff
router.post('/', checkPermission('usuarios', 'crear'), auditLog, staffController.createStaff);

// Editar datos del usuario staff
router.put('/:id', checkPermission('usuarios', 'editar'), auditLog, staffController.updateStaff);

// Activar o desactivar cuenta (toggle)
router.patch('/:id/toggle', checkPermission('usuarios', 'eliminar'), auditLog, staffController.toggleStaff);

// Restablecer contraseña manualmente
router.patch('/:id/password', checkPermission('usuarios', 'editar'), auditLog, staffController.resetPassword);

export default router;
