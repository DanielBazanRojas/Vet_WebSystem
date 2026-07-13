import { query } from '../../config/db.js';
import * as queries from './feedback.queries.js';

export const listFeedback = async (user, filters) => {
  const { status, type, date_from, date_to, page = 1, limit = 20 } = filters;
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 20;
  const offset = (pageNum - 1) * limitNum;

  const hasAdminPermission = user.permissions?.some(
    p => p.module === 'config' && p.action === 'ver'
  );

  if (hasAdminPermission) {
    const [dataRes, countRes] = await Promise.all([
      query(queries.LIST_ALL, [
        status || null,
        type || null,
        date_from || null,
        date_to || null,
        limitNum,
        offset
      ]),
      query(queries.COUNT_ALL, [
        status || null,
        type || null,
        date_from || null,
        date_to || null
      ])
    ]);
    const total = parseInt(countRes.rows[0].total, 10);
    return {
      data: dataRes.rows,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    };
  }

  const [dataRes, countRes] = await Promise.all([
    query(queries.LIST_MY, [user.id, limitNum, offset]),
    query(queries.COUNT_MY, [user.id])
  ]);
  const total = parseInt(countRes.rows[0].total, 10);
  return {
    data: dataRes.rows,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum)
  };
};

export const getFeedbackById = async (id) => {
  const res = await query(queries.GET_BY_ID, [id]);
  if (res.rowCount === 0) {
    const error = new Error('Feedback no encontrado');
    error.status = 404;
    throw error;
  }
  return res.rows[0];
};

export const createFeedback = async (userId, data) => {
  const { type, title, description } = data;
  const res = await query(queries.INSERT, [userId, type, title, description]);
  return res.rows[0];
};

export const updateFeedback = async (id, data, userId) => {
  const existing = await query(queries.GET_BY_ID, [id]);
  if (existing.rowCount === 0) {
    const error = new Error('Feedback no encontrado');
    error.status = 404;
    throw error;
  }

  const { status, admin_note } = data;
  let reviewedBy = existing.rows[0].reviewed_by;
  let reviewedAt = existing.rows[0].reviewed_at;

  if (status && status !== 'pendiente') {
    reviewedBy = userId;
    reviewedAt = new Date().toISOString();
  } else if (status === 'pendiente') {
    reviewedBy = null;
    reviewedAt = null;
  }

  const res = await query(queries.UPDATE, [
    id,
    status || existing.rows[0].status,
    admin_note !== undefined ? admin_note : existing.rows[0].admin_note,
    reviewedBy,
    reviewedAt
  ]);
  return res.rows[0];
};

export const getFeedbackStats = async () => {
  const res = await query(queries.GET_STATS);
  return res.rows[0];
};
