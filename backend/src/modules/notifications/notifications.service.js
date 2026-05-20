import { query } from '../../config/db.js';
import * as Q from './notifications.queries.js';

export const getUnreadNotifications = async (userId) => {
  const res = await query(Q.GET_UNREAD_NOTIFICATIONS, [userId]);
  return res.rows;
};

export const markAsRead = async (id, userId) => {
  const res = await query(Q.MARK_AS_READ, [id, userId]);
  return res.rows[0];
};

export const markAllAsRead = async (userId) => {
  const res = await query(Q.MARK_ALL_AS_READ, [userId]);
  return res.rows;
};
