import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as staffApi from './staff.api';

export const useStaffList = (filters) => {
  return useQuery({
    queryKey: ['staff', filters],
    queryFn: () => staffApi.getStaff(filters),
    keepPreviousData: true,
  });
};

export const useCreateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: staffApi.createStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
};

export const useUpdateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => staffApi.updateStaff(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      queryClient.invalidateQueries({ queryKey: ['staffDetail', variables.id] });
    },
  });
};

export const useToggleStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: staffApi.toggleStaff,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      queryClient.invalidateQueries({ queryKey: ['staffDetail', id] });
    },
  });
};

export const useResetPassword = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => staffApi.resetPassword(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      queryClient.invalidateQueries({ queryKey: ['staffDetail', variables.id] });
    },
  });
};
