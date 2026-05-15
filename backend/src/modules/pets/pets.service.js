import { query } from '../../config/db.js';
import * as Q from './pets.queries.js';

// ── Listar con filtros y paginación ──
export const listPets = async ({ client_id, search, species_id, page = 1, limit = 10 }) => {
  const offset = (page - 1) * limit;

  const [petsRes, countRes] = await Promise.all([
    query(Q.LIST_PETS, [client_id || null, search || null, species_id || null, limit, offset]),
    query(Q.COUNT_PETS, [client_id || null, search || null, species_id || null]),
  ]);

  const total = parseInt(countRes.rows[0].total, 10);

  return {
    data: petsRes.rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

// ── Detalle con última consulta y vacunas ──
export const getPetDetail = async (id) => {
  const petRes = await query(Q.GET_PET_DETAIL, [id]);
  if (petRes.rows.length === 0) throw new Error('Mascota no encontrada');

  const pet = petRes.rows[0];

  const [lastConsultation, lastVaccinations] = await Promise.all([
    query(Q.GET_LAST_CONSULTATION, [id]),
    query(Q.GET_LAST_VACCINATIONS, [id]),
  ]);

  pet.last_consultation = lastConsultation.rows[0] || null;
  pet.last_vaccinations = lastVaccinations.rows;

  return pet;
};

// ── Crear ──
export const createPet = async (data, registeredBy) => {
  const {
    client_id, name, species_id, breed_id,
    gender, birth_date, approximate_age, weight_kg,
    color, microchip_number, is_neutered, allergies,
  } = data;

  const res = await query(Q.INSERT_PET, [
    client_id, name, species_id, breed_id || null,
    gender || 'desconocido', birth_date || null, approximate_age || null,
    weight_kg || null, color || null, microchip_number || null,
    is_neutered ?? false, allergies || null, registeredBy,
  ]);
  return res.rows[0];
};

// ── Editar ──
export const updatePet = async (id, data) => {
  const {
    name, species_id, breed_id,
    gender, birth_date, approximate_age, weight_kg,
    color, microchip_number, is_neutered, allergies, is_active,
  } = data;

  const res = await query(Q.UPDATE_PET, [
    id, name, species_id, breed_id !== undefined ? breed_id : null,
    gender, birth_date !== undefined ? birth_date : null,
    approximate_age !== undefined ? approximate_age : null,
    weight_kg !== undefined ? weight_kg : null,
    color !== undefined ? color : null,
    microchip_number !== undefined ? microchip_number : null,
    is_neutered, allergies !== undefined ? allergies : null,
    is_active !== undefined ? is_active : null,
  ]);

  if (res.rows.length === 0) throw new Error('Mascota no encontrada');
  return res.rows[0];
};

// ── Soft-delete ──
export const deletePet = async (id) => {
  const res = await query(Q.SOFT_DELETE_PET, [id]);
  if (res.rows.length === 0) throw new Error('Mascota no encontrada o ya eliminada');
  return res.rows[0];
};

// ── Catálogos ──
export const listSpecies = async () => {
  const res = await query(Q.LIST_SPECIES);
  return res.rows;
};

export const listBreeds = async (speciesId) => {
  const res = await query(Q.LIST_BREEDS, [speciesId]);
  return res.rows;
};
