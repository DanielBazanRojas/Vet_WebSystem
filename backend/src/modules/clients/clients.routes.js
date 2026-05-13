import { Router } from 'express';
import { verifyToken } from '../../middlewares/auth.js';
import { checkPermission } from '../../middlewares/rbac.js';
import { auditLog } from '../../middlewares/audit.js';
import * as clientsController from './clients.controller.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(verifyToken);

// Listar clientes con búsqueda y paginación
router.get('/', checkPermission('clients', 'read'), clientsController.listClients);

// Detalle del cliente y sus mascotas
router.get('/:id', checkPermission('clients', 'read'), clientsController.getClientDetails);

// Crear cliente
router.post('/', checkPermission('clients', 'write'), auditLog, clientsController.createClient);

// Editar cliente
router.put('/:id', checkPermission('clients', 'write'), auditLog, clientsController.updateClient);

// Eliminar (soft-delete) cliente
router.delete('/:id', checkPermission('clients', 'delete'), auditLog, clientsController.deleteClient);

export default router;
