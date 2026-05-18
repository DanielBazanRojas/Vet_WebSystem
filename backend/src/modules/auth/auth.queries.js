export const GET_USER_BY_EMAIL = `
  SELECT id, email, password_hash, full_name, user_type, is_active, failed_login_attempts, locked_until 
  FROM users 
  WHERE email = $1 AND deleted_at IS NULL AND is_active = true
`;

export const RECORD_LOGIN_ATTEMPT = `
  INSERT INTO login_attempts (email, ip_address, success, failure_reason)
  VALUES ($1, $2, $3, $4)
`;

export const UPDATE_FAILED_LOGIN = `
  UPDATE users 
  SET failed_login_attempts = failed_login_attempts + 1,
      locked_until = CASE WHEN failed_login_attempts + 1 >= 5 THEN now() + interval '30 minutes' ELSE locked_until END
  WHERE id = $1
`;

export const RESET_FAILED_LOGIN = `
  UPDATE users 
  SET failed_login_attempts = 0, locked_until = NULL, last_login_at = now()
  WHERE id = $1
`;

export const GET_USER_PERMISSIONS = `
  SELECT p.module, p.action, p.name
  FROM user_roles ur
  JOIN role_permissions rp ON ur.role_id = rp.role_id
  JOIN permissions p ON rp.permission_id = p.id
  WHERE ur.user_id = $1 AND ur.is_active = true
`;

export const INSERT_SESSION = `
  INSERT INTO sessions (user_id, refresh_token_hash, ip_address, user_agent, expires_at)
  VALUES ($1, $2, $3, $4, now() + interval '20 minutes')
`;

export const EXTEND_SESSION = `
  UPDATE sessions 
  SET expires_at = now() + interval '20 minutes' 
  WHERE refresh_token_hash = $1 AND revoked_at IS NULL AND expires_at > now()
`;

export const GET_VALID_SESSION = `
  SELECT user_id FROM sessions 
  WHERE refresh_token_hash = $1 AND revoked_at IS NULL AND expires_at > now()
`;

export const REVOKE_SESSION = `
  UPDATE sessions SET revoked_at = now() WHERE refresh_token_hash = $1
`;

export const GET_USER_BY_ID = `
  SELECT id, email, full_name, user_type FROM users WHERE id = $1 AND deleted_at IS NULL AND is_active = true
`;
