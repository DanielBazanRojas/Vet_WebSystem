export const GET_SESSIONS = `
  SELECT 
    gs.*,
    p.name AS pet_name,
    p.species_id,
    c.id AS client_id,
    c.full_name AS client_name,
    u.full_name AS groomer_name
  FROM grooming_sessions gs
  JOIN pets p ON gs.pet_id = p.id
  JOIN clients c ON p.client_id = c.id
  LEFT JOIN users u ON gs.groomer_id = u.id
  ORDER BY gs.session_date DESC
`;

export const GET_SESSION_BY_ID = `
  SELECT 
    gs.*,
    p.name AS pet_name,
    p.species_id,
    c.id AS client_id,
    c.full_name AS client_name,
    u.full_name AS groomer_name
  FROM grooming_sessions gs
  JOIN pets p ON gs.pet_id = p.id
  JOIN clients c ON p.client_id = c.id
  LEFT JOIN users u ON gs.groomer_id = u.id
  WHERE gs.id = $1
`;

export const CREATE_SESSION = `
  INSERT INTO grooming_sessions (
    appointment_id, pet_id, groomer_id, session_date, status, special_care_notes, notes, created_by
  ) VALUES (
    $1, $2, $3, COALESCE($4, now()), 'pendiente', $5, $6, $7
  ) RETURNING *
`;

export const UPDATE_SESSION = `
  UPDATE grooming_sessions SET
    groomer_id = COALESCE($1, groomer_id),
    session_date = COALESCE($2, session_date),
    status = COALESCE($3, status),
    special_care_notes = COALESCE($4, special_care_notes),
    notes = COALESCE($5, notes),
    total_amount = COALESCE($6, total_amount)
  WHERE id = $7
  RETURNING *
`;

export const GET_SESSION_SERVICES = `
  SELECT gss.*, gc.name AS service_name
  FROM grooming_session_services gss
  JOIN grooming_service_catalog gc ON gss.grooming_service_id = gc.id
  WHERE gss.grooming_session_id = $1
`;

export const ADD_SERVICE_TO_SESSION = `
  INSERT INTO grooming_session_services (
    grooming_session_id, grooming_service_id, price_charged, notes
  ) VALUES (
    $1, $2, $3, $4
  ) RETURNING *
`;

export const REMOVE_SERVICE_FROM_SESSION = `
  DELETE FROM grooming_session_services
  WHERE id = $1 AND grooming_session_id = $2
  RETURNING *
`;

export const GET_CATALOG = `
  SELECT * FROM grooming_service_catalog WHERE is_active = true ORDER BY name ASC
`;

export const GET_SERVICE_PRICE_FOR_SPECIES = `
  SELECT price_override 
  FROM grooming_service_species 
  WHERE grooming_service_id = $1 AND species_id = $2
`;

export const GET_CATALOG_SERVICE = `
  SELECT base_price FROM grooming_service_catalog WHERE id = $1
`;

export const GET_PET_SPECIES = `
  SELECT species_id FROM pets WHERE id = $1
`;

export const CALCULATE_SESSION_TOTAL = `
  SELECT SUM(price_charged) AS total
  FROM grooming_session_services
  WHERE grooming_session_id = $1
`;
