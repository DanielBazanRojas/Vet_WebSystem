import { query, getClient } from '../../config/db.js';
import * as Q from './billing.queries.js';

export const getInvoices = async () => {
  const result = await query(Q.GET_INVOICES);
  return result.rows;
};

export const getInvoiceById = async (id) => {
  const invoiceRes = await query(Q.GET_INVOICE_BY_ID, [id]);
  if (invoiceRes.rowCount === 0) throw new Error('Factura no encontrada');
  const invoice = invoiceRes.rows[0];

  const itemsRes = await query(Q.GET_INVOICE_ITEMS, [id]);
  invoice.items = itemsRes.rows;

  const paymentsRes = await query(Q.GET_INVOICE_PAYMENTS, [id]);
  invoice.payments = paymentsRes.rows;

  return invoice;
};

export const createInvoice = async (data, userId) => {
  const res = await query(Q.CREATE_INVOICE, [
    data.client_id,
    data.pet_id || null,
    data.consultation_id || null,
    data.grooming_session_id || null,
    data.issue_date || null,
    data.notes || null,
    userId
  ]);
  return res.rows[0];
};

export const addInvoiceItem = async (invoiceId, data) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const invoiceRes = await client.query('SELECT status FROM invoices WHERE id = $1', [invoiceId]);
    if (invoiceRes.rowCount === 0) throw new Error('Factura no encontrada');
    if (invoiceRes.rows[0].status !== 'borrador') throw new Error('Solo se pueden agregar ítems a borradores');

    const subtotal = (data.quantity * data.unit_price) - (data.discount || 0);

    const itemRes = await client.query(Q.ADD_INVOICE_ITEM, [
      invoiceId,
      data.item_type,
      data.product_id || null,
      data.grooming_service_id || null,
      data.description,
      data.quantity || 1,
      data.unit_price,
      data.discount || 0,
      subtotal
    ]);

    await client.query(Q.RECALCULATE_INVOICE_TOTALS, [invoiceId]);

    await client.query('COMMIT');
    return itemRes.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const removeInvoiceItem = async (invoiceId, itemId) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const invoiceRes = await client.query('SELECT status FROM invoices WHERE id = $1', [invoiceId]);
    if (invoiceRes.rowCount === 0) throw new Error('Factura no encontrada');
    if (invoiceRes.rows[0].status !== 'borrador') throw new Error('Solo se pueden quitar ítems de borradores');

    const res = await client.query(Q.REMOVE_INVOICE_ITEM, [itemId, invoiceId]);
    if (res.rowCount === 0) throw new Error('Ítem no encontrado');

    await client.query(Q.RECALCULATE_INVOICE_TOTALS, [invoiceId]);

    await client.query('COMMIT');
    return res.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const registerPayment = async (invoiceId, data, userId) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const paymentRes = await client.query(Q.ADD_PAYMENT, [
      invoiceId,
      data.payment_method_id,
      data.amount,
      data.reference_number || null,
      data.notes || null,
      userId
    ]);

    const totalsRes = await client.query(Q.GET_INVOICE_TOTAL_AND_PAID, [invoiceId]);
    const { total, total_paid } = totalsRes.rows[0];

    let newStatus = 'emitida';
    if (parseFloat(total_paid) >= parseFloat(total)) {
      newStatus = 'pagada';
    } else if (parseFloat(total_paid) > 0) {
      newStatus = 'pagada_parcial';
    }

    await client.query(Q.UPDATE_INVOICE_STATUS, [newStatus, invoiceId]);

    await client.query('COMMIT');
    return paymentRes.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const emitInvoice = async (invoiceId) => {
  const res = await query(Q.UPDATE_INVOICE_STATUS, ['emitida', invoiceId]);
  if (res.rowCount === 0) throw new Error('Factura no encontrada');
  return res.rows[0];
};

export const cancelInvoice = async (invoiceId) => {
  const res = await query(Q.UPDATE_INVOICE_STATUS, ['anulada', invoiceId]);
  if (res.rowCount === 0) throw new Error('Factura no encontrada');
  return res.rows[0];
};

export const getPaymentMethods = async () => {
  const res = await query(Q.GET_PAYMENT_METHODS);
  return res.rows;
};

export const getIncomeReport = async (dateFrom, dateTo, groupBy = 'dia') => {
  const queryStr = Q.GET_INCOME_REPORT_DYNAMIC(groupBy);
  const totalRes = await query(queryStr, [dateFrom, dateTo]);
  const breakdownRes = await query(Q.GET_INCOME_REPORT_BREAKDOWN, [dateFrom, dateTo]);

  return {
    timeline: totalRes.rows,
    breakdown: breakdownRes.rows
  };
};

export const getInvoiceForPdf = async (id) => {
  const invoiceRes = await query(Q.GET_INVOICE_FOR_PDF, [id]);
  if (invoiceRes.rowCount === 0) throw new Error('Factura no encontrada');
  const invoice = invoiceRes.rows[0];

  const [itemsRes, paymentsRes, settingsRes] = await Promise.all([
    query(Q.GET_INVOICE_ITEMS, [id]),
    query(Q.GET_INVOICE_PAYMENTS, [id]),
    query(Q.GET_CLINIC_SETTINGS)
  ]);

  invoice.items = itemsRes.rows;
  invoice.payments = paymentsRes.rows;

  // Convert settings array to object
  const clinic = {};
  for (const row of settingsRes.rows) {
    clinic[row.key] = row.value;
  }
  invoice.clinic = clinic;

  return invoice;
};
