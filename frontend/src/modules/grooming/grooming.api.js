import client from '../../api/client';

export const getSessions = async () => {
  const { data } = await client.get('/grooming/sessions');
  return data;
};

export const getSessionById = async (id) => {
  const { data } = await client.get(`/grooming/sessions/${id}`);
  return data;
};

export const createSession = async (sessionData) => {
  const { data } = await client.post('/grooming/sessions', sessionData);
  return data;
};

export const updateSession = async (id, sessionData) => {
  const { data } = await client.put(`/grooming/sessions/${id}`, sessionData);
  return data;
};

export const addServiceToSession = async (sessionId, serviceData) => {
  const { data } = await client.post(`/grooming/sessions/${sessionId}/services`, serviceData);
  return data;
};

export const removeServiceFromSession = async (sessionId, serviceId) => {
  const { data } = await client.delete(`/grooming/sessions/${sessionId}/services/${serviceId}`);
  return data;
};

export const getCatalog = async () => {
  const { data } = await client.get('/grooming/catalog');
  return data;
};
