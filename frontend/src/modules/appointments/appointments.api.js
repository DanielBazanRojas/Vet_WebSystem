import client from '../../api/client';

export const getAppointments = async (params) => {
  const { data } = await client.get('/appointments', { params });
  return data;
};

export const getAppointment = async (id) => {
  const { data } = await client.get(`/appointments/${id}`);
  return data;
};

export const createAppointment = async (appointmentData) => {
  const { data } = await client.post('/appointments', appointmentData);
  return data;
};

export const updateAppointment = async (id, appointmentData) => {
  const { data } = await client.put(`/appointments/${id}`, appointmentData);
  return data;
};

export const cancelAppointment = async (id, reason) => {
  const { data } = await client.patch(`/appointments/${id}/cancel`, { reason });
  return data;
};

export const getAppointmentTypes = async () => {
  const { data } = await client.get('/appointments/types');
  return data;
};

export const getStaff = async () => {
  const { data } = await client.get('/appointments/staff');
  return data;
};
