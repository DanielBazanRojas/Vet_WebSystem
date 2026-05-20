import client from '../../api/client';

export const getInvoices = async () => {
  const { data } = await client.get('/billing/invoices');
  return data;
};

export const getInvoiceById = async (id) => {
  const { data } = await client.get(`/billing/invoices/${id}`);
  return data;
};

export const createInvoice = async (invoiceData) => {
  const { data } = await client.post('/billing/invoices', invoiceData);
  return data;
};

export const addInvoiceItem = async (invoiceId, itemData) => {
  const { data } = await client.post(`/billing/invoices/${invoiceId}/items`, itemData);
  return data;
};

export const removeInvoiceItem = async (invoiceId, itemId) => {
  const { data } = await client.delete(`/billing/invoices/${invoiceId}/items/${itemId}`);
  return data;
};

export const registerPayment = async (invoiceId, paymentData) => {
  const { data } = await client.post(`/billing/invoices/${invoiceId}/payments`, paymentData);
  return data;
};

export const emitInvoice = async (invoiceId) => {
  const { data } = await client.patch(`/billing/invoices/${invoiceId}/emit`);
  return data;
};

export const cancelInvoice = async (invoiceId) => {
  const { data } = await client.patch(`/billing/invoices/${invoiceId}/cancel`);
  return data;
};

export const getIncomeReport = async (dateFrom, dateTo, groupBy) => {
  const { data } = await client.get(`/billing/reports/income?date_from=${dateFrom}&date_to=${dateTo}&group_by=${groupBy}`);
  return data;
};

export const getPaymentMethods = async () => {
  const { data } = await client.get('/billing/payment-methods');
  return data;
};
