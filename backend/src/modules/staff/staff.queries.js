export const LIST_STAFF = `
  SELECT u.id, u.email, u.full_name, u.phone, u.is_active, u.created_at, r.name as role_name, r.display_name as role_display_name
  FROM users u
  LEFT JOIN user_roles ur ON u.id = ur.user_id AND ur.is_active = true
  LEFT JOIN roles r ON ur.role_id = r.id
  WHERE u.user_type = 'staff'
    AND u.deleted_at IS NULL
    AND ($1::text IS NULL OR immutable_unaccent(u.full_name) ILIKE immutable_unaccent('%' || $1 || '%') 
                          OR u.email ILIKE '%' || $1 || '%' 
                          OR u.phone ILIKE '%' || $1 || '%')
  ORDER BY u.created_at DESC
  LIMIT $2 OFFSET $3;
`;

export const COUNT_STAFF = `
  SELECT COUNT(*) as total
  FROM users u
  WHERE u.user_type = 'staff'
    AND u.deleted_at IS NULL
    AND ($1::text IS NULL OR immutable_unaccent(u.full_name) ILIKE immutable_unaccent('%' || $1 || '%') 
                          OR u.email ILIKE '%' || $1 || '%' 
                          OR u.phone ILIKE '%' || $1 || '%');
`;

export const GET_STAFF_BY_ID = `
  SELECT u.id, u.email, u.full_name, u.phone, u.is_active, u.created_at, r.name as role_name, r.display_name as role_display_name
  FROM users u
  LEFT JOIN user_roles ur ON u.id = ur.user_id AND ur.is_active = true
  LEFT JOIN roles r ON ur.role_id = r.id
  WHERE u.id = $1 AND u.user_type = 'staff' AND u.deleted_at IS NULL;
`;

export const CHECK_EMAIL_EXISTS = `
  SELECT id FROM users 
  WHERE email = $1 AND id != $2 AND deleted_at IS NULL;
`;

export const INSERT_USER = `
  INSERT INTO users (email, password_hash, full_name, phone, user_type, is_active)
  VALUES ($1, $2, $3, $4, 'staff', true)
  RETURNING id, email, full_name, phone, user_type, is_active, created_at;
`;

export const GET_ROLE_ID_BY_NAME = `
  SELECT id FROM roles WHERE name = $1;
`;

export const INSERT_USER_ROLE = `
  INSERT INTO user_roles (user_id, role_id, assigned_by)
  VALUES ($1, $2, $3);
`;

export const UPDATE_USER = `
  UPDATE users
  SET full_name = COALESCE($2, full_name),
      email = COALESCE($3, email),
      phone = COALESCE($4, phone)
  WHERE id = $1 AND deleted_at IS NULL
  RETURNING id, email, full_name, phone, user_type, is_active, created_at;
`;

export const DELETE_USER_ROLES = `
  DELETE FROM user_roles WHERE user_id = $1;
`;

export const UPDATE_PASSWORD = `
  UPDATE users
  SET password_hash = $2
  WHERE id = $1 AND deleted_at IS NULL;
`;

export const TOGGLE_ACTIVE = `
  UPDATE users
  SET is_active = NOT is_active
  WHERE id = $1 AND deleted_at IS NULL
  RETURNING id, is_active;
`;

export const REVOKE_SESSIONS = `
  UPDATE sessions
  SET revoked_at = now()
  WHERE user_id = $1 AND revoked_at IS NULL;
`;
