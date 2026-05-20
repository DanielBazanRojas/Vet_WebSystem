export const LIST_APPOINTMENTS = `
  SELECT a.id, a.scheduled_date, a.scheduled_time, a.duration_min, a.status, a.notes, a.origin,
         p.id AS pet_id, p.name AS pet_name,
         c.id AS client_id, c.full_name AS client_name, c.phone AS client_phone,
         t.id AS type_id, t.name AS type_name, t.category AS type_category, t.color_hex,
         u.id AS assigned_to_id, u.full_name AS assigned_to_name
  FROM appointments a
  JOIN pets p ON a.pet_id = p.id
  JOIN clients c ON a.client_id = c.id
  JOIN appointment_types t ON a.appointment_type_id = t.id
  LEFT JOIN users u ON a.assigned_to = u.id
  WHERE a.deleted_at IS NULL
    AND ($1::date IS NULL OR a.scheduled_date = $1)
    AND ($2::uuid IS NULL OR a.assigned_to = $2)
    AND ($3::text IS NULL OR a.status = $3::appointment_status)
    AND ($4::text IS NULL OR t.category = $4)
  ORDER BY a.scheduled_date ASC, a.scheduled_time ASC;
`;

export const GET_APPOINTMENT = `
  SELECT a.id, a.scheduled_date, a.scheduled_time, a.duration_min, a.status, a.notes, a.cancellation_reason, a.origin, a.created_at,
         p.id AS pet_id, p.name AS pet_name, p.species_id, p.breed_id, p.weight_kg,
         c.id AS client_id, c.full_name AS client_name, c.phone AS client_phone, c.email AS client_email,
         t.id AS type_id, t.name AS type_name, t.category AS type_category, t.color_hex,
         u.id AS assigned_to_id, u.full_name AS assigned_to_name
  FROM appointments a
  JOIN pets p ON a.pet_id = p.id
  JOIN clients c ON a.client_id = c.id
  JOIN appointment_types t ON a.appointment_type_id = t.id
  LEFT JOIN users u ON a.assigned_to = u.id
  WHERE a.id = $1 AND a.deleted_at IS NULL;
`;

export const CHECK_CONFLICT = `
  SELECT id FROM appointments
  WHERE deleted_at IS NULL
    AND status NOT IN ('cancelada', 'atendida')
    AND assigned_to = $1
    AND scheduled_date = $2
    AND scheduled_time = $3
    AND id != $4
  LIMIT 1;
`;

export const INSERT_APPOINTMENT = `
  INSERT INTO appointments (pet_id, client_id, appointment_type_id, assigned_to, scheduled_date, scheduled_time, duration_min, notes, created_by)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  RETURNING *;
`;

export const UPDATE_APPOINTMENT = `
  UPDATE appointments
  SET pet_id = COALESCE($2, pet_id),
      client_id = COALESCE($3, client_id),
      appointment_type_id = COALESCE($4, appointment_type_id),
      assigned_to = $5,
      scheduled_date = COALESCE($6, scheduled_date),
      scheduled_time = COALESCE($7, scheduled_time),
      duration_min = COALESCE($8, duration_min),
      notes = $9,
      status = COALESCE($10, status)
  WHERE id = $1 AND deleted_at IS NULL
  RETURNING *;
`;

export const CANCEL_APPOINTMENT = `
  UPDATE appointments
  SET status = 'cancelada',
      cancellation_reason = $2,
      cancelled_by = $3,
      updated_at = now()
  WHERE id = $1 AND deleted_at IS NULL
  RETURNING id, status;
`;

export const LIST_TYPES = `
  SELECT id, name, category, default_duration_min, color_hex
  FROM appointment_types
  WHERE is_active = true
  ORDER BY category, name;
`;

export const LIST_STAFF = `
  SELECT DISTINCT u.id, u.full_name, u.email, string_agg(CASE WHEN r.name = 'groomer' THEN 'Estética' WHEN r.name = 'veterinario' THEN 'Veterinario' ELSE r.name END, ', ') AS roles
  FROM users u
  JOIN user_roles ur ON u.id = ur.user_id AND ur.is_active = true
  JOIN roles r ON ur.role_id = r.id
  WHERE u.is_active = true
    AND u.user_type = 'staff'
    AND r.name IN ('veterinario', 'groomer')
  GROUP BY u.id
  ORDER BY u.full_name;
`;
