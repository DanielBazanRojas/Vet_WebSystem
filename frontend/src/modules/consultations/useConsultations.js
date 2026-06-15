import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from './consultations.api';
import toast from 'react-hot-toast';

export const usePetHistory = (petId) => {
  return useQuery({
    queryKey: ['pet_history', petId],
    queryFn: () => api.getPetHistory(petId),
    enabled: !!petId
  });
};

export const useAllConsultations = () => {
  return useQuery({
    queryKey: ['all_consultations'],
    queryFn: api.getAllConsultations
  });
};

export const useConsultation = (id) => {
  return useQuery({
    queryKey: ['consultations', id],
    queryFn: () => api.getConsultation(id),
    enabled: !!id
  });
};

export const useCreateConsultation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createConsultation,
    onSuccess: (data, variables) => {
      toast.success('Consulta creada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['pet_history', variables.pet_id] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al crear la consulta');
    }
  });
};

export const useUpdateConsultation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.updateConsultation,
    onSuccess: (_, variables) => {
      toast.success('Consulta actualizada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['consultations', variables.id] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al actualizar la consulta');
    }
  });
};

export const useAddTreatment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.addTreatment,
    onSuccess: (_, variables) => {
      toast.success('Tratamiento agregado');
      queryClient.invalidateQueries({ queryKey: ['consultations', variables.consultationId] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al agregar tratamiento');
    }
  });
};

export const useRegisterVaccine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.registerVaccine,
    onSuccess: (_, variables) => {
      toast.success('Vacuna registrada');
      queryClient.invalidateQueries({ queryKey: ['consultations', variables.consultationId] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al registrar vacuna');
    }
  });
};

export const useAddLabResult = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.addLabResult,
    onSuccess: (_, variables) => {
      toast.success('Resultado de laboratorio agregado');
      queryClient.invalidateQueries({ queryKey: ['consultations', variables.consultationId] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al agregar resultado de laboratorio');
    }
  });
};

export const useProductsCatalog = () => {
  return useQuery({
    queryKey: ['products_catalog'],
    queryFn: api.getProductsCatalog,
    staleTime: 1000 * 60 * 60
  });
};

export const useVaccinesCatalog = () => {
  return useQuery({
    queryKey: ['vaccines_catalog'],
    queryFn: api.getVaccinesCatalog,
    staleTime: 1000 * 60 * 60
  });
};
