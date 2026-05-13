import { query } from '../../config/db.js';
import * as queries from './clients.queries.js';

export const listClients = async (search, page, limit) => {
  const offset = (page - 1) * limit;
  const searchParam = search || null;
  
  const [clientsRes, countRes] = await Promise.all([
    query(queries.LIST_CLIENTS, [searchParam, limit, offset]),
    query(queries.COUNT_CLIENTS, [searchParam])
  ]);
  
  return {
    data: clientsRes.rows,
    total: parseInt(countRes.rows[0].total, 10),
    page,
    limit,
    totalPages: Math.ceil(parseInt(countRes.rows[0].total, 10) / limit)
  };
};

export const getClientDetails = async (id) => {
  const clientRes = await query(queries.GET_CLIENT_DETAILS, [id]);
  if (clientRes.rows.length === 0) {
    throw new Error('Cliente no encontrado');
  }
  
  const petsRes = await query(queries.GET_CLIENT_PETS, [id]);
  
  const client = clientRes.rows[0];
  client.pets = petsRes.rows;
  
  return client;
};

export const createClient = async (clientData, registeredBy) => {
  const { full_name, dni, email, phone, phone_alt, address, district, notes } = clientData;
  
  // Dummy UUID for "not equal" condition during insert
  const dummyId = '00000000-0000-0000-0000-000000000000';
  const conflictRes = await query(queries.CHECK_DNI_EMAIL_EXISTS, [dummyId, dni || null, email || null]);
  if (conflictRes.rows.length > 0) {
    const error = new Error('DNI o Email ya está registrado en otro cliente activo');
    error.status = 409;
    throw error;
  }
  
  const res = await query(queries.INSERT_CLIENT, [
    full_name, dni, email, phone, phone_alt, address, district, notes, registeredBy
  ]);
  return res.rows[0];
};

export const updateClient = async (id, clientData) => {
  const { full_name, dni, email, phone, phone_alt, address, district, notes, is_active } = clientData;
  
  const conflictRes = await query(queries.CHECK_DNI_EMAIL_EXISTS, [id, dni || null, email || null]);
  if (conflictRes.rows.length > 0) {
    const error = new Error('DNI o Email ya está registrado en otro cliente activo');
    error.status = 409;
    throw error;
  }
  
  const res = await query(queries.UPDATE_CLIENT, [
    id, full_name, dni, email, phone, phone_alt, address, district, notes, is_active !== undefined ? is_active : null
  ]);
  
  if (res.rows.length === 0) {
    throw new Error('Cliente no encontrado');
  }
  return res.rows[0];
};

export const deleteClient = async (id) => {
  const res = await query(queries.SOFT_DELETE_CLIENT, [id]);
  if (res.rows.length === 0) {
    throw new Error('Cliente no encontrado o ya eliminado');
  }
  return res.rows[0];
};
