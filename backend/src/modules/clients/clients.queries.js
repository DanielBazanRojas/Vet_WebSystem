export const LIST_CLIENTS = `
  SELECT id, full_name, dni, email, phone, phone_alt, address, district, notes, is_active, created_at
  FROM clients
  WHERE deleted_at IS NULL
    AND ($1::text IS NULL OR immutable_unaccent(full_name) ILIKE immutable_unaccent('%' || $1 || '%') 
                          OR dni ILIKE '%' || $1 || '%' 
                          OR phone ILIKE '%' || $1 || '%')
  ORDER BY created_at DESC
  LIMIT $2 OFFSET $3;
`;

export const COUNT_CLIENTS = `
  SELECT COUNT(*) as total
  FROM clients
  WHERE deleted_at IS NULL
    AND ($1::text IS NULL OR immutable_unaccent(full_name) ILIKE immutable_unaccent('%' || $1 || '%') 
                          OR dni ILIKE '%' || $1 || '%' 
                          OR phone ILIKE '%' || $1 || '%');
`;

export const GET_CLIENT_DETAILS = `
  SELECT id, full_name, dni, email, phone, phone_alt, address, district, notes, is_active, created_at
  FROM clients
  WHERE id = $1 AND deleted_at IS NULL;
`;

export const GET_CLIENT_PETS = `
  SELECT p.id, p.name, p.gender, p.birth_date, p.approximate_age, p.weight_kg, p.color, p.microchip_number, p.is_neutered, p.allergies, p.is_active,
         s.name as species_name, b.name as breed_name
  FROM pets p
  JOIN species s ON p.species_id = s.id
  LEFT JOIN breeds b ON p.breed_id = b.id
  WHERE p.client_id = $1 AND p.deleted_at IS NULL;
`;

export const INSERT_CLIENT = `
  INSERT INTO clients (full_name, dni, email, phone, phone_alt, address, district, notes, registered_by)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  RETURNING *;
`;

export const UPDATE_CLIENT = `
  UPDATE clients
  SET full_name = COALESCE($2, full_name),
      dni = COALESCE($3, dni),
      email = COALESCE($4, email),
      phone = COALESCE($5, phone),
      phone_alt = COALESCE($6, phone_alt),
      address = COALESCE($7, address),
      district = COALESCE($8, district),
      notes = COALESCE($9, notes),
      is_active = COALESCE($10, is_active)
  WHERE id = $1 AND deleted_at IS NULL
  RETURNING *;
`;

export const SOFT_DELETE_CLIENT = `
  UPDATE clients
  SET deleted_at = now()
  WHERE id = $1 AND deleted_at IS NULL
  RETURNING id;
`;

export const CHECK_DNI_EMAIL_EXISTS = `
  SELECT id FROM clients 
  WHERE deleted_at IS NULL 
    AND id != $1
    AND ((dni IS NOT NULL AND dni = $2) OR (email IS NOT NULL AND email = $3))
  LIMIT 1;
`;
