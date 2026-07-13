import client from '../../api/client';

export const getFeedbackList = async (params = {}) => {
  const { data } = await client.get('/feedback', { params });
  return data;
};

export const getFeedbackStats = async () => {
  const { data } = await client.get('/feedback/stats');
  return data;
};

export const getFeedbackById = async (id) => {
  const { data } = await client.get(`/feedback/${id}`);
  return data;
};

export const createFeedback = async (body) => {
  const { data } = await client.post('/feedback', body);
  return data;
};

export const updateFeedback = async (id, body) => {
  const { data } = await client.patch(`/feedback/${id}`, body);
  return data;
};
