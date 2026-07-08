import { Router } from 'express';
import * as billingController from './billing.controller.js';
import { verifyToken } from '../../middlewares/auth.js';
import { checkPermission } from '../../middlewares/rbac.js';
import { auditLog } from '../../middlewares/audit.js';

const router = Router();

router.use(verifyToken);

router.get('/invoices', checkPermission('facturacion', 'ver'), billingController.getInvoices);
router.get('/invoices/:id', checkPermission('facturacion', 'ver'), billingController.getInvoiceById);
router.post('/invoices', checkPermission('facturacion', 'crear'), auditLog, billingController.createInvoice);
router.post('/invoices/:id/items', checkPermission('facturacion', 'crear'), auditLog, billingController.addInvoiceItem);
router.delete('/invoices/:id/items/:itemId', checkPermission('facturacion', 'crear'), auditLog, billingController.removeInvoiceItem);

router.post('/invoices/:id/payments', checkPermission('facturacion', 'crear'), auditLog, billingController.registerPayment);
router.patch('/invoices/:id/emit', checkPermission('facturacion', 'crear'), auditLog, billingController.emitInvoice);
router.patch('/invoices/:id/cancel', checkPermission('facturacion', 'anular'), auditLog, billingController.cancelInvoice);

router.get('/reports/income', checkPermission('facturacion', 'reportes'), billingController.getIncomeReport);
router.get('/payment-methods', checkPermission('facturacion', 'ver'), billingController.getPaymentMethods);
router.get('/invoices/:id/pdf', checkPermission('facturacion', 'ver'), billingController.downloadInvoicePdf);

export default router;
