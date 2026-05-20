export const GET_UNREAD_NOTIFICATIONS = `
  SELECT * FROM notifications 
  WHERE user_id = $1 
    AND read_at IS NULL 
  ORDER BY created_at DESC 
  LIMIT 10
`;

export const MARK_AS_READ = `
  UPDATE notifications 
  SET read_at = now(), status = 'enviado'
  WHERE id = $1 AND user_id = $2
  RETURNING *
`;

export const MARK_ALL_AS_READ = `
  UPDATE notifications 
  SET read_at = now(), status = 'enviado'
  WHERE user_id = $1 AND read_at IS NULL
  RETURNING *
`;
