import client from '../../api/client';

export const getClients = async ({ search, page, limit }) => {
  const { data } = await client.get('/clients', { params: { search, page, limit } });
  return data;
};

export const getClient = async (id) => {
  const { data } = await client.get(`/clients/${id}`);
  return data;
};

export const createClient = async (clientData) => {
  const { data } = await client.post('/clients', clientData);
  return data;
};

export const updateClient = async (id, clientData) => {
  const { data } = await client.put(`/clients/${id}`, clientData);
  return data;
};

export const deleteClient = async (id) => {
  const { data } = await client.delete(`/clients/${id}`);
  return data;
};
