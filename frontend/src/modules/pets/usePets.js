import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as petsApi from './pets.api';

export const usePets = (filters) => {
  return useQuery({
    queryKey: ['pets', filters],
    queryFn: () => petsApi.getPets(filters),
    keepPreviousData: true,
  });
};

export const usePet = (id) => {
  return useQuery({
    queryKey: ['pet', id],
    queryFn: () => petsApi.getPet(id),
    enabled: !!id,
  });
};

export const useCreatePet = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: petsApi.createPet,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pets'] }),
  });
};

export const useUpdatePet = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => petsApi.updatePet(id, data),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['pets'] });
      qc.invalidateQueries({ queryKey: ['pet', v.id] });
    },
  });
};

export const useDeletePet = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: petsApi.deletePet,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pets'] }),
  });
};

export const useSpecies = () => {
  return useQuery({
    queryKey: ['species'],
    queryFn: petsApi.getSpecies,
    staleTime: 1000 * 60 * 30, // 30 min
  });
};

export const useBreeds = (speciesId) => {
  return useQuery({
    queryKey: ['breeds', speciesId],
    queryFn: () => petsApi.getBreeds(speciesId),
    enabled: !!speciesId,
    staleTime: 1000 * 60 * 30,
  });
};
