export const CREATE_CONSULTATION = `
  INSERT INTO consultations (
    appointment_id, pet_id, veterinarian_id, consultation_date, weight_kg, temperature_c, 
    heart_rate_bpm, respiratory_rate, mucosal_color, chief_complaint, anamnesis, physical_exam, 
    diagnosis, treatment_plan, follow_up_date, is_emergency, created_by
  ) VALUES (
    $1, $2, $3, COALESCE($4, now()), $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
  ) RETURNING id;
`;

export const UPDATE_APPOINTMENT_STATUS = `
  UPDATE appointments SET status = 'atendida' WHERE id = $1
`;

export const GET_CONSULTATION_BASIC = `
  SELECT c.*, 
         p.name AS pet_name, 
         s.name AS pet_species, 
         b.name AS pet_breed,
         cl.id AS client_id, cl.full_name AS client_name,
         u.full_name AS veterinarian_name
  FROM consultations c
  JOIN pets p ON c.pet_id = p.id
  JOIN clients cl ON p.client_id = cl.id
  JOIN users u ON c.veterinarian_id = u.id
  LEFT JOIN species s ON p.species_id = s.id
  LEFT JOIN breeds b ON p.breed_id = b.id
  WHERE c.id = $1
`;

export const GET_TREATMENTS = `
  SELECT t.*, pr.name AS product_name
  FROM treatments t
  LEFT JOIN products pr ON t.product_id = pr.id
  WHERE t.consultation_id = $1
  ORDER BY t.created_at ASC
`;

export const GET_VACCINES = `
  SELECT vr.*, v.name AS vaccine_name, v.disease_protected AS disease_target
  FROM vaccination_records vr
  JOIN vaccines v ON vr.vaccine_id = v.id
  WHERE vr.consultation_id = $1
  ORDER BY vr.administered_date ASC
`;

export const GET_LAB_RESULTS = `
  SELECT * FROM lab_results
  WHERE consultation_id = $1
  ORDER BY created_at ASC
`;

export const INSERT_LAB_RESULT = `
  INSERT INTO lab_results (consultation_id, exam_type, description, result, exam_date)
  VALUES ($1, $2, $3, $4, $5)
  RETURNING id;
`;

export const GET_CONSULTATIONS_BY_PET = `
  SELECT c.id, c.consultation_date, c.chief_complaint, c.diagnosis, u.full_name AS veterinarian_name, c.is_emergency
  FROM consultations c
  JOIN users u ON c.veterinarian_id = u.id
  WHERE c.pet_id = $1
  ORDER BY c.consultation_date DESC
`;

export const INSERT_TREATMENT = `
  INSERT INTO treatments (
    consultation_id, product_id, treatment_type, description, dose, frequency, duration, quantity_used, unit, instructions
  ) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
  ) RETURNING id;
`;

export const INSERT_VACCINE = `
  INSERT INTO vaccination_records (
    pet_id, vaccine_id, consultation_id, administered_date, batch_number, next_dose_date, dosage, administered_by, notes
  ) VALUES (
    $1, $2, $3, COALESCE($4, CURRENT_DATE), $5, $6, $7, $8, $9
  ) RETURNING id;
`;

export const GET_PRODUCTS_CATALOG = `
  SELECT id, name, current_stock, unit_of_measure, is_medicine 
  FROM products 
  WHERE is_active = true AND deleted_at IS NULL
  ORDER BY name ASC
`;

export const GET_VACCINES_CATALOG = `
  SELECT id, name, disease_protected AS disease_target, frequency_months 
  FROM vaccines 
  WHERE is_active = true
  ORDER BY name ASC
`;

export const GET_ALL_CONSULTATIONS = `
  SELECT c.id, c.consultation_date, c.chief_complaint, c.diagnosis, c.is_emergency,
         p.id AS pet_id, p.name AS pet_name, 
         u.full_name AS veterinarian_name
  FROM consultations c
  JOIN pets p ON c.pet_id = p.id
  JOIN users u ON c.veterinarian_id = u.id
  ORDER BY c.consultation_date DESC
`;
