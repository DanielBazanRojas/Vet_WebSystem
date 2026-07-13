export const LIST_ALL = `
  SELECT f.id, f.user_id, f.type, f.title, f.description, f.status,
         f.admin_note, f.reviewed_by, f.reviewed_at, f.created_at, f.updated_at,
         u.full_name as user_name
  FROM feedback f
  JOIN users u ON u.id = f.user_id
  WHERE ($1::text IS NULL OR f.status = $1)
    AND ($2::text IS NULL OR f.type = $2)
    AND ($3::timestamptz IS NULL OR f.created_at >= $3)
    AND ($4::timestamptz IS NULL OR f.created_at <= $4)
  ORDER BY f.created_at DESC
  LIMIT $5 OFFSET $6;
`;

export const COUNT_ALL = `
  SELECT COUNT(*) as total
  FROM feedback f
  WHERE ($1::text IS NULL OR f.status = $1)
    AND ($2::text IS NULL OR f.type = $2)
    AND ($3::timestamptz IS NULL OR f.created_at >= $3)
    AND ($4::timestamptz IS NULL OR f.created_at <= $4);
`;

export const LIST_MY = `
  SELECT id, user_id, type, title, description, status,
         admin_note, reviewed_by, reviewed_at, created_at, updated_at
  FROM feedback
  WHERE user_id = $1
  ORDER BY created_at DESC
  LIMIT $2 OFFSET $3;
`;

export const COUNT_MY = `
  SELECT COUNT(*) as total
  FROM feedback
  WHERE user_id = $1;
`;

export const GET_BY_ID = `
  SELECT f.id, f.user_id, f.type, f.title, f.description, f.status,
         f.admin_note, f.reviewed_by, f.reviewed_at, f.created_at, f.updated_at,
         u.full_name as user_name
  FROM feedback f
  JOIN users u ON u.id = f.user_id
  WHERE f.id = $1;
`;

export const INSERT = `
  INSERT INTO feedback (user_id, type, title, description)
  VALUES ($1, $2, $3, $4)
  RETURNING *;
`;

export const UPDATE = `
  UPDATE feedback
  SET status = $2,
      admin_note = $3,
      reviewed_by = $4,
      reviewed_at = $5,
      updated_at = now()
  WHERE id = $1
  RETURNING *;
`;

export const GET_STATS = `
  SELECT
    COUNT(*) FILTER (WHERE status = 'pendiente') as pendientes,
    COUNT(*) FILTER (WHERE status = 'en_revision') as en_revision,
    COUNT(*) FILTER (WHERE status = 'resuelto') as resueltos,
    COUNT(*) FILTER (WHERE status = 'descartado') as descartados
  FROM feedback;
`;
