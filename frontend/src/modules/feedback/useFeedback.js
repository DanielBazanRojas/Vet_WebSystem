import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from './feedback.api';

export const useFeedbackList = (filters) => {
  return useQuery({
    queryKey: ['feedback', filters],
    queryFn: () => api.getFeedbackList(filters),
    retry: false,
  });
};

export const useFeedbackStats = () => {
  return useQuery({
    queryKey: ['feedback-stats'],
    queryFn: api.getFeedbackStats,
    retry: false,
  });
};

export const useFeedbackById = (id) => {
  return useQuery({
    queryKey: ['feedback', id],
    queryFn: () => api.getFeedbackById(id),
    enabled: !!id,
  });
};

export const useCreateFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createFeedback,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      queryClient.invalidateQueries({ queryKey: ['feedback-stats'] });
    },
  });
};

export const useUpdateFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.updateFeedback(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      queryClient.invalidateQueries({ queryKey: ['feedback-stats'] });
    },
  });
};
