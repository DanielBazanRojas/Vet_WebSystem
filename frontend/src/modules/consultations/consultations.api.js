import client from '../../api/client';

export const getPetHistory = async (petId) => {
  const response = await client.get(`/consultations/pet/${petId}`);
  return response.data;
};

export const getAllConsultations = async () => {
  const response = await client.get('/consultations');
  return response.data;
};

export const getConsultation = async (id) => {
  const response = await client.get(`/consultations/${id}`);
  return response.data;
};

export const createConsultation = async (data) => {
  const response = await client.post('/consultations', data);
  return response.data;
};

export const updateConsultation = async ({ id, ...data }) => {
  const response = await client.put(`/consultations/${id}`, data);
  return response.data;
};

export const addTreatment = async ({ consultationId, data }) => {
  const response = await client.post(`/consultations/${consultationId}/treatments`, data);
  return response.data;
};

export const registerVaccine = async ({ consultationId, data }) => {
  const response = await client.post(`/consultations/${consultationId}/vaccines`, data);
  return response.data;
};

export const addLabResult = async ({ consultationId, data }) => {
  const response = await client.post(`/consultations/${consultationId}/lab-results`, data);
  return response.data;
};

export const getConsultationVaccines = async (consultationId) => {
  const response = await client.get(`/consultations/${consultationId}/vaccines`);
  return response.data;
};

export const getProductsCatalog = async () => {
  const response = await client.get('/consultations/catalog/products');
  return response.data;
};

export const getVaccinesCatalog = async () => {
  const response = await client.get('/consultations/catalog/vaccines');
  return response.data;
};

export const getFollowups = async (consultationId) => {
  const response = await client.get(`/consultations/${consultationId}/followups`);
  return response.data;
};

export const createFollowup = async ({ consultationId, data }) => {
  const response = await client.post(`/consultations/${consultationId}/followups`, data);
  return response.data;
};

export const updateFollowup = async ({ consultationId, followupId, data }) => {
  const response = await client.put(`/consultations/${consultationId}/followups/${followupId}`, data);
  return response.data;
};

export const deleteFollowup = async ({ consultationId, followupId }) => {
  const response = await client.delete(`/consultations/${consultationId}/followups/${followupId}`);
  return response.data;
};
