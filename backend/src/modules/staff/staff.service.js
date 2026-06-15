import bcrypt from 'bcryptjs';
import { query, getClient } from '../../config/db.js';
import * as queries from './staff.queries.js';

const VALID_ROLES = ['veterinario', 'groomer', 'recepcionista'];

export const listStaff = async (search, page, limit) => {
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 20;
  const offset = (pageNum - 1) * limitNum;
  const searchParam = search || null;

  const [staffRes, countRes] = await Promise.all([
    query(queries.LIST_STAFF, [searchParam, limitNum, offset]),
    query(queries.COUNT_STAFF, [searchParam])
  ]);

  const total = parseInt(countRes.rows[0].total, 10);

  return {
    data: staffRes.rows,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum)
  };
};

export const getStaffDetails = async (id) => {
  const res = await query(queries.GET_STAFF_BY_ID, [id]);
  if (res.rowCount === 0) {
    const error = new Error('Usuario de personal no encontrado');
    error.status = 404;
    throw error;
  }
  return res.rows[0];
};

export const createStaff = async (staffData, assignedBy) => {
  const { full_name, email, phone, role_name, password } = staffData;

  if (!full_name || !email || !role_name || !password) {
    const error = new Error('Todos los campos obligatorios (nombre, email, rol, contraseña) son requeridos');
    error.status = 400;
    throw error;
  }

  if (!VALID_ROLES.includes(role_name)) {
    const error = new Error('Rol no válido. Los roles permitidos son: veterinario, groomer, recepcionista');
    error.status = 400;
    throw error;
  }

  if (password.length < 8) {
    const error = new Error('La contraseña debe tener al menos 8 caracteres');
    error.status = 400;
    throw error;
  }

  // Verificar si el email ya existe
  const dummyId = '00000000-0000-0000-0000-000000000000';
  const conflictRes = await query(queries.CHECK_EMAIL_EXISTS, [email, dummyId]);
  if (conflictRes.rows.length > 0) {
    const error = new Error('El correo electrónico ya está registrado');
    error.status = 409;
    throw error;
  }

  const client = await getClient();
  try {
    await client.query('BEGIN');

    // 1. Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Insertar usuario
    const userRes = await client.query(queries.INSERT_USER, [
      email,
      hashedPassword,
      full_name,
      phone || null
    ]);
    const newUserId = userRes.rows[0].id;

    // 3. Buscar el role_id por nombre
    const roleRes = await client.query(queries.GET_ROLE_ID_BY_NAME, [role_name]);
    if (roleRes.rows.length === 0) {
      throw new Error(`Rol '${role_name}' no encontrado en el sistema`);
    }
    const roleId = roleRes.rows[0].id;

    // 4. Insertar en user_roles
    await client.query(queries.INSERT_USER_ROLE, [
      newUserId,
      roleId,
      assignedBy
    ]);

    await client.query('COMMIT');

    // Obtener los detalles completos del usuario recién creado
    const details = await query(queries.GET_STAFF_BY_ID, [newUserId]);
    return details.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const updateStaff = async (id, staffData, assignedBy) => {
  const { full_name, email, phone, role_name } = staffData;

  if (role_name && !VALID_ROLES.includes(role_name)) {
    const error = new Error('Rol no válido. Los roles permitidos son: veterinario, groomer, recepcionista');
    error.status = 400;
    throw error;
  }

  if (email) {
    // Verificar si el correo ya pertenece a otro usuario activo
    const conflictRes = await query(queries.CHECK_EMAIL_EXISTS, [email, id]);
    if (conflictRes.rows.length > 0) {
      const error = new Error('El correo electrónico ya está registrado por otro usuario');
      error.status = 409;
      throw error;
    }
  }

  // Verificar que el usuario exista
  const checkUser = await query(queries.GET_STAFF_BY_ID, [id]);
  if (checkUser.rows.length === 0) {
    const error = new Error('Usuario de personal no encontrado');
    error.status = 404;
    throw error;
  }

  const client = await getClient();
  try {
    await client.query('BEGIN');

    // 1. Actualizar datos de usuario
    await client.query(queries.UPDATE_USER, [
      id,
      full_name || null,
      email || null,
      phone || null
    ]);

    // 2. Si se especifica un rol, eliminar el actual e insertar el nuevo
    if (role_name) {
      const roleRes = await client.query(queries.GET_ROLE_ID_BY_NAME, [role_name]);
      if (roleRes.rows.length === 0) {
        throw new Error(`Rol '${role_name}' no encontrado en el sistema`);
      }
      const roleId = roleRes.rows[0].id;

      // Eliminar el rol existente
      await client.query(queries.DELETE_USER_ROLES, [id]);

      // Insertar el nuevo rol
      await client.query(queries.INSERT_USER_ROLE, [
        id,
        roleId,
        assignedBy
      ]);
    }

    await client.query('COMMIT');

    // Obtener detalles actualizados
    const details = await query(queries.GET_STAFF_BY_ID, [id]);
    return details.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const resetPassword = async (id, newPassword) => {
  if (!newPassword || newPassword.length < 8) {
    const error = new Error('La contraseña debe tener al menos 8 caracteres');
    error.status = 400;
    throw error;
  }

  const checkUser = await query(queries.GET_STAFF_BY_ID, [id]);
  if (checkUser.rows.length === 0) {
    const error = new Error('Usuario de personal no encontrado');
    error.status = 404;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await query(queries.UPDATE_PASSWORD, [id, hashedPassword]);
  return { message: 'Contraseña restablecida correctamente' };
};

export const toggleStaff = async (id) => {
  const checkUser = await query(queries.GET_STAFF_BY_ID, [id]);
  if (checkUser.rows.length === 0) {
    const error = new Error('Usuario de personal no encontrado');
    error.status = 404;
    throw error;
  }

  const res = await query(queries.TOGGLE_ACTIVE, [id]);
  const updatedStaff = res.rows[0];

  // Si se desactiva, cerrar todas sus sesiones activas
  if (!updatedStaff.is_active) {
    await query(queries.REVOKE_SESSIONS, [id]);
  }

  // Devolver el staff actualizado
  const details = await query(queries.GET_STAFF_BY_ID, [id]);
  return details.rows[0];
};
