import { query, getClient } from '../../config/db.js';
import * as Q from './consultations.queries.js';

export const getHistoryByPet = async (petId) => {
  const result = await query(Q.GET_CONSULTATIONS_BY_PET, [petId]);
  return result.rows;
};

export const getConsultationDetail = async (id) => {
  const basicResult = await query(Q.GET_CONSULTATION_BASIC, [id]);
  if (basicResult.rowCount === 0) throw new Error('Consulta no encontrada');
  const consultation = basicResult.rows[0];

  const [treatmentsRes, vaccinesRes, labsRes] = await Promise.all([
    query(Q.GET_TREATMENTS, [id]),
    query(Q.GET_VACCINES, [id]),
    query(Q.GET_LAB_RESULTS, [id])
  ]);

  consultation.treatments = treatmentsRes.rows;
  consultation.vaccination_records = vaccinesRes.rows;
  consultation.lab_results = labsRes.rows;

  return consultation;
};

export const createConsultation = async (data, userId) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const res = await client.query(Q.CREATE_CONSULTATION, [
      data.appointment_id || null,
      data.pet_id,
      data.veterinarian_id || userId,
      data.consultation_date || null,
      data.weight_kg || null,
      data.temperature_c || null,
      data.heart_rate_bpm || null,
      data.respiratory_rate || null,
      data.mucosal_color || null,
      data.chief_complaint || null,
      data.anamnesis || null,
      data.physical_exam || null,
      data.diagnosis || null,
      data.treatment_plan || null,
      data.follow_up_date || null,
      data.is_emergency || false,
      userId
    ]);

    const consultationId = res.rows[0].id;

    if (data.appointment_id) {
      await client.query(Q.UPDATE_APPOINTMENT_STATUS, [data.appointment_id]);
    }

    await client.query('COMMIT');
    return { id: consultationId };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const updateConsultation = async (id, data) => {
  const fields = [];
  const values = [];
  let index = 1;
  values.push(id);
  
  const allowedFields = [
    'weight_kg', 'temperature_c', 'heart_rate_bpm', 'respiratory_rate', 
    'mucosal_color', 'chief_complaint', 'anamnesis', 'physical_exam', 
    'diagnosis', 'treatment_plan', 'follow_up_date', 'is_emergency'
  ];
  
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      index++;
      fields.push(`${field} = $${index}`);
      values.push(data[field]);
    }
  }

  if (fields.length === 0) return { id };

  const queryStr = `UPDATE consultations SET ${fields.join(', ')} WHERE id = $1 RETURNING id`;
  const res = await query(queryStr, values);
  if (res.rowCount === 0) throw new Error('Consulta no encontrada');
  return res.rows[0];
};

export const addTreatment = async (consultationId, data) => {
  const res = await query(Q.INSERT_TREATMENT, [
    consultationId,
    data.product_id || null,
    data.treatment_type,
    data.description || null,
    data.dose || null,
    data.frequency || null,
    data.duration || null,
    data.quantity_used || 0,
    data.unit || null,
    data.instructions || null
  ]);
  return res.rows[0];
};

export const registerVaccine = async (consultationId, data, userId) => {
  // Check if consultation exists to get pet_id
  const consultRes = await query('SELECT pet_id FROM consultations WHERE id = $1', [consultationId]);
  if (consultRes.rowCount === 0) throw new Error('Consulta no encontrada');
  const petId = consultRes.rows[0].pet_id;

  const res = await query(Q.INSERT_VACCINE, [
    petId,
    data.vaccine_id,
    consultationId,
    data.administered_date || null,
    data.batch_number || null,
    data.next_dose_date || null,
    data.dosage || null,
    userId,
    data.notes || null
  ]);
  return res.rows[0];
};

export const getVaccinesByConsultation = async (consultationId) => {
  const res = await query(Q.GET_VACCINES, [consultationId]);
  return res.rows;
};

export const addLabResult = async (consultationId, data) => {
  const res = await query(Q.INSERT_LAB_RESULT, [
    consultationId,
    data.exam_type,
    data.description || null,
    data.result || null,
    data.exam_date || null
  ]);
  return res.rows[0];
};

export const getProductsCatalog = async () => {
  const res = await query(Q.GET_PRODUCTS_CATALOG);
  return res.rows;
};

export const getVaccinesCatalog = async () => {
  const res = await query(Q.GET_VACCINES_CATALOG);
  return res.rows;
};

export const getAllConsultations = async () => {
  const res = await query(Q.GET_ALL_CONSULTATIONS);
  return res.rows;
};

export const getFollowups = async (consultationId) => {
  const res = await query(Q.GET_FOLLOWUPS, [consultationId]);
  return res.rows;
};

export const createFollowup = async (consultationId, data, userId) => {
  const res = await query(Q.INSERT_FOLLOWUP, [
    consultationId,
    data.followup_date || null,
    data.weight_kg !== undefined && data.weight_kg !== '' ? data.weight_kg : null,
    data.temperature_c !== undefined && data.temperature_c !== '' ? data.temperature_c : null,
    data.evolution,
    data.indications || null,
    data.next_followup_date || null,
    data.requires_attention || false,
    userId
  ]);
  return res.rows[0];
};

export const updateFollowup = async (followupId, data) => {
  const res = await query(Q.UPDATE_FOLLOWUP, [
    followupId,
    data.followup_date || null,
    data.weight_kg !== undefined && data.weight_kg !== '' ? data.weight_kg : null,
    data.temperature_c !== undefined && data.temperature_c !== '' ? data.temperature_c : null,
    data.evolution,
    data.indications || null,
    data.next_followup_date || null,
    data.requires_attention || false
  ]);
  if (res.rowCount === 0) throw new Error('Seguimiento no encontrado');
  return res.rows[0];
};

export const deleteFollowup = async (followupId) => {
  const res = await query(Q.DELETE_FOLLOWUP, [followupId]);
  if (res.rowCount === 0) throw new Error('Seguimiento no encontrado');
  return res.rows[0];
};
