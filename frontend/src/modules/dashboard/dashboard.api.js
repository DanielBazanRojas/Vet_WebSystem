import client from '../../api/client';

export const getStats = async () => {
  const { data } = await client.get('/dashboard/stats');
  return data;
};
