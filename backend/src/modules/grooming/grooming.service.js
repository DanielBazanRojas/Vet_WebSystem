import { query, getClient } from '../../config/db.js';
import * as Q from './grooming.queries.js';

export const getSessions = async () => {
  const result = await query(Q.GET_SESSIONS);
  return result.rows;
};

export const getSessionById = async (id) => {
  const sessionRes = await query(Q.GET_SESSION_BY_ID, [id]);
  if (sessionRes.rowCount === 0) throw new Error('Sesión no encontrada');
  const session = sessionRes.rows[0];

  const servicesRes = await query(Q.GET_SESSION_SERVICES, [id]);
  session.services = servicesRes.rows;

  return session;
};

export const createSession = async (data, userId) => {
  const res = await query(Q.CREATE_SESSION, [
    data.appointment_id || null,
    data.pet_id,
    data.groomer_id || userId,
    data.session_date || null,
    data.special_care_notes || null,
    data.notes || null,
    userId
  ]);
  return res.rows[0];
};

export const updateSession = async (id, data) => {
  let total_amount = null;
  if (data.status === 'completada') {
    const totalRes = await query(Q.CALCULATE_SESSION_TOTAL, [id]);
    total_amount = totalRes.rows[0].total || 0;
  }

  const res = await query(Q.UPDATE_SESSION, [
    data.groomer_id !== undefined ? data.groomer_id : null,
    data.session_date !== undefined ? data.session_date : null,
    data.status !== undefined ? data.status : null,
    data.special_care_notes !== undefined ? data.special_care_notes : null,
    data.notes !== undefined ? data.notes : null,
    total_amount,
    id
  ]);
  
  if (res.rowCount === 0) throw new Error('Sesión no encontrada');
  return res.rows[0];
};

export const addServiceToSession = async (sessionId, data) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const sessionRes = await client.query('SELECT pet_id FROM grooming_sessions WHERE id = $1', [sessionId]);
    if (sessionRes.rowCount === 0) throw new Error('Sesión no encontrada');
    const petId = sessionRes.rows[0].pet_id;

    const petRes = await client.query(Q.GET_PET_SPECIES, [petId]);
    const speciesId = petRes.rows[0].species_id;

    let priceCharged = 0;
    if (data.price_override !== undefined) {
      priceCharged = data.price_override;
    } else {
      const priceRes = await client.query(Q.GET_SERVICE_PRICE_FOR_SPECIES, [data.grooming_service_id, speciesId]);
      if (priceRes.rowCount > 0) {
        priceCharged = priceRes.rows[0].price_override;
      } else {
        const catalogRes = await client.query(Q.GET_CATALOG_SERVICE, [data.grooming_service_id]);
        if (catalogRes.rowCount === 0) throw new Error('Servicio no encontrado en el catálogo');
        priceCharged = catalogRes.rows[0].base_price;
      }
    }

    const serviceRes = await client.query(Q.ADD_SERVICE_TO_SESSION, [
      sessionId,
      data.grooming_service_id,
      priceCharged,
      data.notes || null
    ]);

    await client.query('COMMIT');
    return serviceRes.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const removeServiceFromSession = async (sessionId, serviceId) => {
  const res = await query(Q.REMOVE_SERVICE_FROM_SESSION, [serviceId, sessionId]);
  if (res.rowCount === 0) throw new Error('Servicio no encontrado en esta sesión');
  return res.rows[0];
};

export const getCatalog = async () => {
  const res = await query(Q.GET_CATALOG);
  return res.rows;
};

export const getServicePriceForSpecies = async (serviceId, speciesId) => {
  const priceRes = await query(Q.GET_SERVICE_PRICE_FOR_SPECIES, [serviceId, speciesId]);
  if (priceRes.rowCount > 0) {
    return { price: priceRes.rows[0].price_override };
  } else {
    const catalogRes = await query(Q.GET_CATALOG_SERVICE, [serviceId]);
    if (catalogRes.rowCount === 0) throw new Error('Servicio no encontrado');
    return { price: catalogRes.rows[0].base_price };
  }
};
