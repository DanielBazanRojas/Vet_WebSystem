import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from './billing.api.js';

export const useInvoices = () => {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: api.getInvoices,
  });
};

export const useInvoice = (id) => {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => api.getInvoiceById(id),
    enabled: !!id,
  });
};

export const usePaymentMethods = () => {
  return useQuery({
    queryKey: ['payment-methods'],
    queryFn: api.getPaymentMethods,
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createInvoice,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
  });
};

export const useAddInvoiceItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, data }) => api.addInvoiceItem(invoiceId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useRemoveInvoiceItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, itemId }) => api.removeInvoiceItem(invoiceId, itemId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useRegisterPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, data }) => api.registerPayment(invoiceId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useEmitInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.emitInvoice,
    onSuccess: (_, invoiceId) => {
      queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useCancelInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.cancelInvoice,
    onSuccess: (_, invoiceId) => {
      queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useIncomeReport = (dateFrom, dateTo, groupBy) => {
  return useQuery({
    queryKey: ['income-report', dateFrom, dateTo, groupBy],
    queryFn: () => api.getIncomeReport(dateFrom, dateTo, groupBy),
    enabled: !!dateFrom && !!dateTo,
  });
};
