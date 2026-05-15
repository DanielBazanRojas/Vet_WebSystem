import client from '../../api/client';

export const getPets = async (params) => {
  const { data } = await client.get('/pets', { params });
  return data;
};

export const getPet = async (id) => {
  const { data } = await client.get(`/pets/${id}`);
  return data;
};

export const createPet = async (petData) => {
  const { data } = await client.post('/pets', petData);
  return data;
};

export const updatePet = async (id, petData) => {
  const { data } = await client.put(`/pets/${id}`, petData);
  return data;
};

export const deletePet = async (id) => {
  const { data } = await client.delete(`/pets/${id}`);
  return data;
};

export const getSpecies = async () => {
  const { data } = await client.get('/pets/catalogs/species');
  return data;
};

export const getBreeds = async (speciesId) => {
  const { data } = await client.get(`/pets/catalogs/breeds/${speciesId}`);
  return data;
};
