import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as appointmentsApi from './appointments.api';

export const useAppointments = (filters) => {
  return useQuery({
    queryKey: ['appointments', filters],
    queryFn: () => appointmentsApi.getAppointments(filters),
    keepPreviousData: true,
  });
};

export const useAppointment = (id) => {
  return useQuery({
    queryKey: ['appointment', id],
    queryFn: () => appointmentsApi.getAppointment(id),
    enabled: !!id,
  });
};

export const useCreateAppointment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: appointmentsApi.createAppointment,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  });
};

export const useUpdateAppointment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => appointmentsApi.updateAppointment(id, data),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      qc.invalidateQueries({ queryKey: ['appointment', v.id] });
    },
  });
};

export const useCancelAppointment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => appointmentsApi.cancelAppointment(id, reason),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      qc.invalidateQueries({ queryKey: ['appointment', v.id] });
    },
  });
};

export const useAppointmentTypes = () => {
  return useQuery({
    queryKey: ['appointment_types'],
    queryFn: appointmentsApi.getAppointmentTypes,
    staleTime: 1000 * 60 * 60, // 1 hr
  });
};

export const useStaff = () => {
  return useQuery({
    queryKey: ['staff'],
    queryFn: appointmentsApi.getStaff,
    staleTime: 1000 * 60 * 60, // 1 hr
  });
};
