import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from './pharmacy.api';

export const useProducts = (filters) => {
  return useQuery({
    queryKey: ['pharmacy_products', filters],
    queryFn: () => api.getProducts(filters)
  });
};

export const useProduct = (id) => {
  return useQuery({
    queryKey: ['pharmacy_product', id],
    queryFn: () => api.getProductById(id),
    enabled: !!id
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacy_products'] });
    }
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.updateProduct(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pharmacy_products'] });
      queryClient.invalidateQueries({ queryKey: ['pharmacy_product', variables.id] });
    }
  });
};

export const useRegisterLot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.registerLotEntry(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pharmacy_products'] });
      queryClient.invalidateQueries({ queryKey: ['pharmacy_product', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['pharmacy_movements'] });
    }
  });
};

export const useMovements = (filters) => {
  return useQuery({
    queryKey: ['pharmacy_movements', filters],
    queryFn: () => api.getMovements(filters)
  });
};

export const useAlerts = () => {
  return useQuery({
    queryKey: ['pharmacy_alerts'],
    queryFn: api.getAlerts
  });
};

export const useResolveAlert = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.resolveAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacy_alerts'] });
    }
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['pharmacy_categories'],
    queryFn: api.getCategories,
    staleTime: 5 * 60 * 1000
  });
};
