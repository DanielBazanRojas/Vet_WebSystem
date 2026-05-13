import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query } from '../../config/db.js';
import * as queries from './auth.queries.js';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';

export const login = async (email, password, ip, userAgent) => {
  const userResult = await query(queries.GET_USER_BY_EMAIL, [email]);
  const user = userResult.rows[0];

  if (!user) {
    await query(queries.RECORD_LOGIN_ATTEMPT, [email, ip, false, 'USER_NOT_FOUND']);
    throw new Error('Credenciales inválidas');
  }

  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    await query(queries.RECORD_LOGIN_ATTEMPT, [email, ip, false, 'ACCOUNT_LOCKED']);
    throw new Error('Cuenta bloqueada. Intente más tarde.');
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    await query(queries.RECORD_LOGIN_ATTEMPT, [email, ip, false, 'INVALID_PASSWORD']);
    await query(queries.UPDATE_FAILED_LOGIN, [user.id]);
    throw new Error('Credenciales inválidas');
  }

  // Login exitoso
  await query(queries.RECORD_LOGIN_ATTEMPT, [email, ip, true, null]);
  await query(queries.RESET_FAILED_LOGIN, [user.id]);

  // Consultar permisos
  const permissionsResult = await query(queries.GET_USER_PERMISSIONS, [user.id]);
  const permissions = permissionsResult.rows;

  // Generar tokens
  const payload = {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    user_type: user.user_type,
    permissions
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  const refreshToken = crypto.randomBytes(32).toString('hex');
  const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

  await query(queries.INSERT_SESSION, [user.id, refreshTokenHash, ip, userAgent]);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      user_type: user.user_type
    }
  };
};

export const refresh = async (refreshToken) => {
  const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const sessionResult = await query(queries.GET_VALID_SESSION, [hash]);
  const session = sessionResult.rows[0];

  if (!session) {
    throw new Error('Refresh token inválido o expirado');
  }

  const userResult = await query(queries.GET_USER_BY_ID, [session.user_id]);
  const user = userResult.rows[0];

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  const permissionsResult = await query(queries.GET_USER_PERMISSIONS, [user.id]);
  
  const payload = {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    user_type: user.user_type,
    permissions: permissionsResult.rows
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  return { accessToken };
};

export const logout = async (refreshToken) => {
  const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  await query(queries.REVOKE_SESSION, [hash]);
};
