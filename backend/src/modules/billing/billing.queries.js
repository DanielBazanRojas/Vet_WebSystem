export const GET_INVOICES = `
  SELECT 
    i.*,
    c.full_name AS client_name,
    p.name AS pet_name
  FROM invoices i
  JOIN clients c ON i.client_id = c.id
  LEFT JOIN pets p ON i.pet_id = p.id
  ORDER BY i.issue_date DESC
`;

export const GET_INVOICE_BY_ID = `
  SELECT 
    i.*,
    c.full_name AS client_name,
    c.email AS client_email,
    c.dni AS client_dni,
    c.address AS client_address,
    p.name AS pet_name
  FROM invoices i
  JOIN clients c ON i.client_id = c.id
  LEFT JOIN pets p ON i.pet_id = p.id
  WHERE i.id = $1
`;

export const GET_INVOICE_ITEMS = `
  SELECT * FROM invoice_items WHERE invoice_id = $1 ORDER BY created_at ASC
`;

export const GET_INVOICE_PAYMENTS = `
  SELECT p.*, pm.name AS payment_method_name, u.full_name AS received_by_name
  FROM payments p
  JOIN payment_methods pm ON p.payment_method_id = pm.id
  LEFT JOIN users u ON p.received_by = u.id
  WHERE p.invoice_id = $1
  ORDER BY p.payment_date DESC
`;

export const CREATE_INVOICE = `
  INSERT INTO invoices (
    client_id, pet_id, consultation_id, grooming_session_id, issue_date, notes, created_by
  ) VALUES (
    $1, $2, $3, $4, COALESCE($5, now()), $6, $7
  ) RETURNING *
`;

export const ADD_INVOICE_ITEM = `
  INSERT INTO invoice_items (
    invoice_id, item_type, product_id, grooming_service_id, description, quantity, unit_price, discount, subtotal
  ) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9
  ) RETURNING *
`;

export const REMOVE_INVOICE_ITEM = `
  DELETE FROM invoice_items WHERE id = $1 AND invoice_id = $2 RETURNING *
`;

export const RECALCULATE_INVOICE_TOTALS = `
  WITH item_totals AS (
    SELECT COALESCE(SUM(subtotal), 0) AS sub
    FROM invoice_items
    WHERE invoice_id = $1
  )
  UPDATE invoices
  SET subtotal = item_totals.sub,
      total = item_totals.sub + tax_amount - discount_amount
  FROM item_totals
  WHERE invoices.id = $1
  RETURNING invoices.*
`;

export const ADD_PAYMENT = `
  INSERT INTO payments (
    invoice_id, payment_method_id, amount, reference_number, notes, received_by
  ) VALUES (
    $1, $2, $3, $4, $5, $6
  ) RETURNING *
`;

export const GET_INVOICE_TOTAL_AND_PAID = `
  SELECT 
    i.total,
    COALESCE(SUM(p.amount), 0) AS total_paid
  FROM invoices i
  LEFT JOIN payments p ON i.id = p.invoice_id
  WHERE i.id = $1
  GROUP BY i.id
`;

export const UPDATE_INVOICE_STATUS = `
  UPDATE invoices SET status = $1 WHERE id = $2 RETURNING *
`;

export const GET_PAYMENT_METHODS = `
  SELECT * FROM payment_methods WHERE is_active = true ORDER BY name ASC
`;

export const GET_INCOME_REPORT_DYNAMIC = (groupBy) => {
  const trunc = groupBy === 'mes' ? 'month' : groupBy === 'semana' ? 'week' : 'day';
  return `
    SELECT 
      date_trunc('${trunc}', p.payment_date) AS date,
      SUM(p.amount) AS total_amount
    FROM payments p
    JOIN invoices i ON p.invoice_id = i.id
    WHERE i.status IN ('pagada', 'pagada_parcial')
      AND p.payment_date >= $1 AND p.payment_date <= $2
    GROUP BY date_trunc('${trunc}', p.payment_date)
    ORDER BY date ASC
  `;
};

export const GET_INCOME_REPORT_BREAKDOWN = `
  SELECT 
    ii.item_type,
    SUM(ii.subtotal) AS total_amount
  FROM invoice_items ii
  JOIN invoices i ON ii.invoice_id = i.id
  WHERE i.status IN ('pagada', 'pagada_parcial')
    AND i.issue_date >= $1 AND i.issue_date <= $2
  GROUP BY ii.item_type
`;
