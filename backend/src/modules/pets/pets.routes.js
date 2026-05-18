import { Router } from 'express';
import { verifyToken } from '../../middlewares/auth.js';
import { checkPermission } from '../../middlewares/rbac.js';
import { auditLog } from '../../middlewares/audit.js';
import * as petsController from './pets.controller.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(verifyToken);

// ── Catálogos (sin permiso especial, disponibles para todo el panel) ──
router.get('/catalogs/species', petsController.listSpecies);
router.get('/catalogs/breeds/:speciesId', petsController.listBreeds);

// ── CRUD de mascotas ──
router.get('/',    checkPermission('pets', 'read'),   petsController.listPets);
router.get('/:id', checkPermission('pets', 'read'),   petsController.getPetDetail);
router.post('/',   checkPermission('pets', 'write'),  auditLog, petsController.createPet);
router.put('/:id', checkPermission('pets', 'write'),  auditLog, petsController.updatePet);
router.delete('/:id', checkPermission('pets', 'delete'), auditLog, petsController.deletePet);

export default router;
