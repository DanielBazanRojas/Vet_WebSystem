export const GET_PRODUCTS = `
  SELECT 
    p.*,
    pc.name AS category_name,
    EXISTS(
      SELECT 1 FROM stock_alerts sa 
      WHERE sa.product_id = p.id AND sa.is_resolved = false
    ) AS has_active_alert
  FROM products p
  LEFT JOIN product_categories pc ON p.category_id = pc.id
  WHERE 1=1
`;

export const GET_PRODUCT_BY_ID = `
  SELECT p.*, pc.name AS category_name
  FROM products p
  LEFT JOIN product_categories pc ON p.category_id = pc.id
  WHERE p.id = $1
`;

export const GET_PRODUCT_LOTS = `
  SELECT * FROM product_lots
  WHERE product_id = $1
  ORDER BY expiry_date ASC
`;

export const GET_RECENT_MOVEMENTS = `
  SELECT im.*, u.full_name AS performed_by_name
  FROM inventory_movements im
  LEFT JOIN users u ON im.performed_by = u.id
  WHERE im.product_id = $1
  ORDER BY im.created_at DESC
  LIMIT 10
`;

export const CREATE_PRODUCT = `
  INSERT INTO products (
    category_id, name, description, sku, barcode, unit_of_measure, 
    sale_price, cost_price, min_stock_alert, requires_prescription, 
    is_medicine, is_for_sale
  ) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
  ) RETURNING *
`;

export const UPDATE_PRODUCT = `
  UPDATE products SET
    category_id = COALESCE($1, category_id),
    name = COALESCE($2, name),
    description = COALESCE($3, description),
    sku = COALESCE($4, sku),
    barcode = COALESCE($5, barcode),
    unit_of_measure = COALESCE($6, unit_of_measure),
    sale_price = COALESCE($7, sale_price),
    cost_price = COALESCE($8, cost_price),
    min_stock_alert = COALESCE($9, min_stock_alert),
    requires_prescription = COALESCE($10, requires_prescription),
    is_medicine = COALESCE($11, is_medicine),
    is_for_sale = COALESCE($12, is_for_sale),
    is_active = COALESCE($13, is_active)
  WHERE id = $14
  RETURNING *
`;

export const GET_PRODUCT_STOCK = `
  SELECT current_stock FROM products WHERE id = $1 FOR UPDATE
`;

export const UPDATE_PRODUCT_STOCK = `
  UPDATE products SET current_stock = current_stock + $1 WHERE id = $2 RETURNING current_stock
`;

export const INSERT_PRODUCT_LOT = `
  INSERT INTO product_lots (
    product_id, lot_number, expiry_date, quantity_received, quantity_remaining, unit_cost, supplier
  ) VALUES (
    $1, $2, $3, $4, $4, $5, $6
  ) RETURNING *
`;

export const INSERT_INVENTORY_MOVEMENT = `
  INSERT INTO inventory_movements (
    product_id, lot_id, movement_type, quantity, unit_price, stock_before, stock_after, reference_type, notes, performed_by
  ) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
  ) RETURNING *
`;

export const GET_MOVEMENTS = `
  SELECT im.*, p.name AS product_name, u.full_name AS performed_by_name
  FROM inventory_movements im
  JOIN products p ON im.product_id = p.id
  LEFT JOIN users u ON im.performed_by = u.id
  WHERE 1=1
`;

export const GET_ALERTS = `
  SELECT sa.*, p.name AS product_name, p.sku, p.current_stock, p.min_stock_alert
  FROM stock_alerts sa
  JOIN products p ON sa.product_id = p.id
  WHERE sa.is_resolved = false
  ORDER BY sa.created_at DESC
`;

export const RESOLVE_ALERT = `
  UPDATE stock_alerts 
  SET is_resolved = true, resolved_at = now(), resolved_by = $1
  WHERE id = $2
  RETURNING *
`;

export const GET_CATEGORIES = `
  SELECT * FROM product_categories WHERE is_active = true ORDER BY name ASC
`;
