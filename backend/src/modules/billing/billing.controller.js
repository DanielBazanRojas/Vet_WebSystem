import * as billingService from './billing.service.js';

export const getInvoices = async (req, res) => {
  try {
    const invoices = await billingService.getInvoices();
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await billingService.getInvoiceById(req.params.id);
    res.json(invoice);
  } catch (error) {
    if (error.message === 'Factura no encontrada') return res.status(404).json({ message: error.message });
    res.status(500).json({ message: error.message });
  }
};

export const createInvoice = async (req, res) => {
  try {
    const invoice = await billingService.createInvoice(req.body, req.user.id);
    res.status(201).json(invoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const addInvoiceItem = async (req, res) => {
  try {
    const item = await billingService.addInvoiceItem(req.params.id, req.body);
    res.status(201).json(item);
  } catch (error) {
    if (error.message === 'Factura no encontrada') return res.status(404).json({ message: error.message });
    res.status(400).json({ message: error.message });
  }
};

export const removeInvoiceItem = async (req, res) => {
  try {
    await billingService.removeInvoiceItem(req.params.id, req.params.itemId);
    res.status(204).send();
  } catch (error) {
    if (error.message === 'Factura no encontrada' || error.message === 'Ítem no encontrado') {
      return res.status(404).json({ message: error.message });
    }
    res.status(400).json({ message: error.message });
  }
};

export const registerPayment = async (req, res) => {
  try {
    const payment = await billingService.registerPayment(req.params.id, req.body, req.user.id);
    res.status(201).json(payment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const emitInvoice = async (req, res) => {
  try {
    const invoice = await billingService.emitInvoice(req.params.id);
    res.json(invoice);
  } catch (error) {
    if (error.message === 'Factura no encontrada') return res.status(404).json({ message: error.message });
    res.status(400).json({ message: error.message });
  }
};

export const cancelInvoice = async (req, res) => {
  try {
    const invoice = await billingService.cancelInvoice(req.params.id);
    res.json(invoice);
  } catch (error) {
    if (error.message === 'Factura no encontrada') return res.status(404).json({ message: error.message });
    res.status(400).json({ message: error.message });
  }
};

export const getPaymentMethods = async (req, res) => {
  try {
    const methods = await billingService.getPaymentMethods();
    res.json(methods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getIncomeReport = async (req, res) => {
  try {
    const { date_from, date_to, group_by } = req.query;
    if (!date_from || !date_to) {
      return res.status(400).json({ message: 'Faltan parámetros date_from y date_to' });
    }
    const report = await billingService.getIncomeReport(date_from, date_to, group_by);
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
