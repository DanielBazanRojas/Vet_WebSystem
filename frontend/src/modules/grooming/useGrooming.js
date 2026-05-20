import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from './grooming.api';

export const useSessions = () => {
  return useQuery({
    queryKey: ['grooming_sessions'],
    queryFn: api.getSessions
  });
};

export const useSession = (id) => {
  return useQuery({
    queryKey: ['grooming_session', id],
    queryFn: () => api.getSessionById(id),
    enabled: !!id
  });
};

export const useCreateSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grooming_sessions'] });
    }
  });
};

export const useUpdateSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.updateSession(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['grooming_sessions'] });
      queryClient.invalidateQueries({ queryKey: ['grooming_session', variables.id] });
    }
  });
};

export const useAddService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, data }) => api.addServiceToSession(sessionId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['grooming_session', variables.sessionId] });
    }
  });
};

export const useRemoveService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, serviceId }) => api.removeServiceFromSession(sessionId, serviceId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['grooming_session', variables.sessionId] });
    }
  });
};

export const useGroomingCatalog = () => {
  return useQuery({
    queryKey: ['grooming_catalog'],
    queryFn: api.getCatalog,
    staleTime: 5 * 60 * 1000
  });
};
