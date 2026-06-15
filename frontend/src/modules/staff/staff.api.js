import client from '../../api/client';

export const getStaff = async ({ search, page, limit } = {}) => {
  const { data } = await client.get('/staff', { params: { search, page, limit } });
  return data;
};

export const getStaffDetail = async (id) => {
  const { data } = await client.get(`/staff/${id}`);
  return data;
};

export const createStaff = async (staffData) => {
  const { data } = await client.post('/staff', staffData);
  return data;
};

export const updateStaff = async (id, staffData) => {
  const { data } = await client.put(`/staff/${id}`, staffData);
  return data;
};

export const toggleStaff = async (id) => {
  const { data } = await client.patch(`/staff/${id}/toggle`);
  return data;
};

export const resetPassword = async (id, passwordData) => {
  const { data } = await client.patch(`/staff/${id}/password`, passwordData);
  return data;
};
