export const GET_CITAS_HOY = `
  SELECT COUNT(*) FROM appointments 
  WHERE scheduled_date = now()::date 
    AND status != 'cancelada'
`;

export const GET_CITAS_HOY_ASSIGNED = `
  SELECT COUNT(*) FROM appointments 
  WHERE scheduled_date = now()::date 
    AND status != 'cancelada'
    AND assigned_to = $1
`;

export const GET_NUEVOS_CLIENTES_MES = `
  SELECT COUNT(*) FROM clients 
  WHERE created_at >= date_trunc('month', now())
`;

export const GET_INGRESOS_MES = `
  SELECT COALESCE(SUM(amount), 0) AS total_ingresos FROM payments
  WHERE payment_date >= date_trunc('month', now())
`;

export const GET_ALERTAS_STOCK_ACTIVAS = `
  SELECT COUNT(*) FROM stock_alerts WHERE is_resolved = false
`;

export const GET_UPCOMING_APPOINTMENTS = `
  SELECT 
    a.*, 
    p.name AS pet_name, 
    c.full_name AS client_name, 
    u.full_name AS assigned_to_name
  FROM appointments a
  JOIN pets p ON a.pet_id = p.id
  JOIN clients c ON a.client_id = c.id
  LEFT JOIN users u ON a.assigned_to = u.id
  WHERE a.scheduled_date = now()::date
    AND a.status != 'cancelada'
  ORDER BY a.scheduled_time ASC
`;

export const GET_UPCOMING_APPOINTMENTS_ASSIGNED = `
  SELECT 
    a.*, 
    p.name AS pet_name, 
    c.full_name AS client_name, 
    u.full_name AS assigned_to_name
  FROM appointments a
  JOIN pets p ON a.pet_id = p.id
  JOIN clients c ON a.client_id = c.id
  LEFT JOIN users u ON a.assigned_to = u.id
  WHERE a.scheduled_date = now()::date
    AND a.status != 'cancelada'
    AND a.assigned_to = $1
  ORDER BY a.scheduled_time ASC
`;

export const GET_RECENT_STOCK_ALERTS = `
  SELECT 
    sa.*, 
    p.name AS product_name
  FROM stock_alerts sa
  JOIN products p ON sa.product_id = p.id
  WHERE sa.is_resolved = false
  ORDER BY sa.created_at DESC
  LIMIT 5
`;

export const GET_VACCINATION_REMINDERS = `
  SELECT 
    vr.*, 
    p.name AS pet_name, 
    v.name AS vaccine_name,
    c.full_name AS client_name,
    c.email AS client_email
  FROM vaccination_reminders vr
  JOIN pets p ON vr.pet_id = p.id
  JOIN vaccines v ON vr.vaccine_id = v.id
  JOIN clients c ON p.client_id = c.id
  WHERE vr.due_date <= now()::date + interval '7 days'
    AND vr.status = 'pendiente'
  ORDER BY vr.due_date ASC
`;
