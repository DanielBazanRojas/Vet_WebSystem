import { query } from '../../config/db.js';
import * as Q from './appointments.queries.js';

export const listAppointments = async ({ date, assigned_to, status, category }) => {
  const res = await query(Q.LIST_APPOINTMENTS, [
    date || null,
    assigned_to || null,
    status || null,
    category || null
  ]);
  return res.rows;
};

export const getAppointment = async (id) => {
  const res = await query(Q.GET_APPOINTMENT, [id]);
  if (res.rows.length === 0) throw new Error('Cita no encontrada');
  return res.rows[0];
};

export const createAppointment = async (data, createdBy) => {
  const { pet_id, client_id, appointment_type_id, assigned_to, scheduled_date, scheduled_time, duration_min, notes } = data;

  // Verificar conflictos si tiene responsable asignado
  if (assigned_to) {
    const dummyId = '00000000-0000-0000-0000-000000000000';
    const conflict = await query(Q.CHECK_CONFLICT, [assigned_to, scheduled_date, scheduled_time, dummyId]);
    if (conflict.rows.length > 0) {
      const err = new Error('El profesional seleccionado ya tiene una cita activa en ese horario');
      err.status = 409;
      throw err;
    }
  }

  const res = await query(Q.INSERT_APPOINTMENT, [
    pet_id, client_id, appointment_type_id, assigned_to || null,
    scheduled_date, scheduled_time, duration_min || 30, notes || null, createdBy
  ]);
  return res.rows[0];
};

export const updateAppointment = async (id, data) => {
  const { pet_id, client_id, appointment_type_id, assigned_to, scheduled_date, scheduled_time, duration_min, notes, status } = data;

  if (assigned_to) {
    const conflict = await query(Q.CHECK_CONFLICT, [assigned_to, scheduled_date, scheduled_time, id]);
    if (conflict.rows.length > 0) {
      const err = new Error('El profesional seleccionado ya tiene una cita activa en ese horario');
      err.status = 409;
      throw err;
    }
  }

  const res = await query(Q.UPDATE_APPOINTMENT, [
    id, pet_id, client_id, appointment_type_id, assigned_to !== undefined ? assigned_to : null,
    scheduled_date, scheduled_time, duration_min, notes !== undefined ? notes : null, status
  ]);

  if (res.rows.length === 0) throw new Error('Cita no encontrada');
  return res.rows[0];
};

export const cancelAppointment = async (id, reason, cancelledBy) => {
  // Primero ver estado actual
  const current = await query(`SELECT status FROM appointments WHERE id = $1 AND deleted_at IS NULL`, [id]);
  if (current.rows.length === 0) throw new Error('Cita no encontrada');
  if (current.rows[0].status === 'cancelada') {
    const err = new Error('La cita ya se encuentra cancelada');
    err.status = 400;
    throw err;
  }

  const res = await query(Q.CANCEL_APPOINTMENT, [id, reason || null, cancelledBy]);
  return res.rows[0];
};

export const listTypes = async () => {
  const res = await query(Q.LIST_TYPES);
  return res.rows;
};

export const listStaff = async () => {
  const res = await query(Q.LIST_STAFF);
  return res.rows;
};
