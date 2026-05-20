import client from '../../api/client';

export const getUnread = async () => {
  const { data } = await client.get('/notifications/unread');
  return data;
};

export const markAsRead = async (id) => {
  const { data } = await client.patch(`/notifications/${id}/read`);
  return data;
};

export const markAllAsRead = async () => {
  const { data } = await client.patch('/notifications/read-all');
  return data;
};
