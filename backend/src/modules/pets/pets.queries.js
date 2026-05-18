// ── Listar mascotas con filtros ──
export const LIST_PETS = `
  SELECT p.id, p.name, p.gender, p.birth_date, p.approximate_age, p.weight_kg,
         p.color, p.microchip_number, p.is_neutered, p.is_active, p.created_at,
         s.name  AS species_name,
         b.name  AS breed_name,
         c.full_name AS client_name,
         c.id    AS client_id
  FROM pets p
  JOIN species s ON p.species_id = s.id
  LEFT JOIN breeds  b ON p.breed_id  = b.id
  JOIN clients c ON p.client_id = c.id
  WHERE p.deleted_at IS NULL
    AND ($1::uuid IS NULL   OR p.client_id  = $1)
    AND ($2::text IS NULL   OR immutable_unaccent(p.name) ILIKE immutable_unaccent('%' || $2 || '%'))
    AND ($3::uuid IS NULL   OR p.species_id = $3)
  ORDER BY p.created_at DESC
  LIMIT $4 OFFSET $5;
`;

export const COUNT_PETS = `
  SELECT COUNT(*) AS total
  FROM pets p
  WHERE p.deleted_at IS NULL
    AND ($1::uuid IS NULL   OR p.client_id  = $1)
    AND ($2::text IS NULL   OR immutable_unaccent(p.name) ILIKE immutable_unaccent('%' || $2 || '%'))
    AND ($3::uuid IS NULL   OR p.species_id = $3);
`;

// ── Detalle de mascota ──
export const GET_PET_DETAIL = `
  SELECT p.*,
         s.name  AS species_name,
         b.name  AS breed_name,
         c.full_name AS client_name,
         c.phone     AS client_phone,
         c.email     AS client_email
  FROM pets p
  JOIN species s ON p.species_id = s.id
  LEFT JOIN breeds  b ON p.breed_id  = b.id
  JOIN clients c ON p.client_id = c.id
  WHERE p.id = $1 AND p.deleted_at IS NULL;
`;

// ── Última consulta de la mascota ──
export const GET_LAST_CONSULTATION = `
  SELECT c.id, c.consultation_date, c.diagnosis, c.treatment_plan,
         c.weight_kg, c.temperature_c, c.is_emergency,
         u.full_name AS veterinarian_name
  FROM consultations c
  JOIN users u ON c.veterinarian_id = u.id
  WHERE c.pet_id = $1
  ORDER BY c.consultation_date DESC
  LIMIT 1;
`;

// ── Últimas 3 vacunas aplicadas ──
export const GET_LAST_VACCINATIONS = `
  SELECT vr.id, vr.administered_date, vr.next_dose_date, vr.batch_number, vr.dosage, vr.notes,
         v.name AS vaccine_name, v.disease_protected
  FROM vaccination_records vr
  JOIN vaccines v ON vr.vaccine_id = v.id
  WHERE vr.pet_id = $1
  ORDER BY vr.administered_date DESC
  LIMIT 3;
`;

// ── CRUD ──
export const INSERT_PET = `
  INSERT INTO pets (client_id, name, species_id, breed_id, gender, birth_date,
                    approximate_age, weight_kg, color, microchip_number,
                    is_neutered, allergies, registered_by)
  VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
  RETURNING *;
`;

export const UPDATE_PET = `
  UPDATE pets
  SET name             = COALESCE($2, name),
      species_id       = COALESCE($3, species_id),
      breed_id         = $4,
      gender           = COALESCE($5, gender),
      birth_date       = $6,
      approximate_age  = $7,
      weight_kg        = $8,
      color            = $9,
      microchip_number = $10,
      is_neutered      = COALESCE($11, is_neutered),
      allergies        = $12,
      is_active        = COALESCE($13, is_active)
  WHERE id = $1 AND deleted_at IS NULL
  RETURNING *;
`;

export const SOFT_DELETE_PET = `
  UPDATE pets SET deleted_at = now()
  WHERE id = $1 AND deleted_at IS NULL
  RETURNING id;
`;

// ── Catálogos ──
export const LIST_SPECIES = `
  SELECT id, name, icon FROM species WHERE is_active = true ORDER BY name;
`;

export const LIST_BREEDS = `
  SELECT id, name FROM breeds WHERE species_id = $1 AND is_active = true ORDER BY name;
`;
