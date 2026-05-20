import { query, getClient } from '../../config/db.js';
import * as Q from './pharmacy.queries.js';

export const getProducts = async (filters = {}) => {
  let queryStr = Q.GET_PRODUCTS;
  const values = [];
  let index = 1;

  if (filters.search) {
    queryStr += ` AND (p.name ILIKE $${index} OR p.sku ILIKE $${index})`;
    values.push(`%${filters.search}%`);
    index++;
  }
  if (filters.category_id) {
    queryStr += ` AND p.category_id = $${index}`;
    values.push(filters.category_id);
    index++;
  }
  if (filters.is_medicine !== undefined) {
    queryStr += ` AND p.is_medicine = $${index}`;
    values.push(filters.is_medicine === 'true');
    index++;
  }
  if (filters.is_for_sale !== undefined) {
    queryStr += ` AND p.is_for_sale = $${index}`;
    values.push(filters.is_for_sale === 'true');
    index++;
  }
  if (filters.stock_bajo === 'true') {
    queryStr += ` AND p.current_stock <= p.min_stock_alert`;
  }

  queryStr += ` ORDER BY p.name ASC`;

  const result = await query(queryStr, values);
  return result.rows;
};

export const getProductById = async (id) => {
  const result = await query(Q.GET_PRODUCT_BY_ID, [id]);
  if (result.rowCount === 0) throw new Error('Producto no encontrado');
  const product = result.rows[0];

  const [lotsRes, movementsRes] = await Promise.all([
    query(Q.GET_PRODUCT_LOTS, [id]),
    query(Q.GET_RECENT_MOVEMENTS, [id])
  ]);

  product.lots = lotsRes.rows;
  product.recent_movements = movementsRes.rows;

  return product;
};

export const createProduct = async (data) => {
  const res = await query(Q.CREATE_PRODUCT, [
    data.category_id || null,
    data.name,
    data.description || null,
    data.sku || null,
    data.barcode || null,
    data.unit_of_measure || 'unidad',
    data.sale_price || 0,
    data.cost_price || 0,
    data.min_stock_alert || 5,
    data.requires_prescription || false,
    data.is_medicine || false,
    data.is_for_sale || true
  ]);
  return res.rows[0];
};

export const updateProduct = async (id, data) => {
  const res = await query(Q.UPDATE_PRODUCT, [
    data.category_id !== undefined ? data.category_id : null,
    data.name !== undefined ? data.name : null,
    data.description !== undefined ? data.description : null,
    data.sku !== undefined ? data.sku : null,
    data.barcode !== undefined ? data.barcode : null,
    data.unit_of_measure !== undefined ? data.unit_of_measure : null,
    data.sale_price !== undefined ? data.sale_price : null,
    data.cost_price !== undefined ? data.cost_price : null,
    data.min_stock_alert !== undefined ? data.min_stock_alert : null,
    data.requires_prescription !== undefined ? data.requires_prescription : null,
    data.is_medicine !== undefined ? data.is_medicine : null,
    data.is_for_sale !== undefined ? data.is_for_sale : null,
    data.is_active !== undefined ? data.is_active : null,
    id
  ]);
  if (res.rowCount === 0) throw new Error('Producto no encontrado');
  return res.rows[0];
};

export const registerLotEntry = async (productId, data, userId) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    // Select product current stock
    const stockRes = await client.query(Q.GET_PRODUCT_STOCK, [productId]);
    if (stockRes.rowCount === 0) throw new Error('Producto no encontrado');
    const stockBefore = parseFloat(stockRes.rows[0].current_stock);
    const quantity = parseFloat(data.quantity_received);
    const stockAfter = stockBefore + quantity;

    // Update product stock
    await client.query(Q.UPDATE_PRODUCT_STOCK, [quantity, productId]);

    // Insert lot
    const lotRes = await client.query(Q.INSERT_PRODUCT_LOT, [
      productId,
      data.lot_number,
      data.expiry_date || null,
      quantity,
      data.unit_cost || 0,
      data.supplier || null
    ]);
    const lotId = lotRes.rows[0].id;

    // Insert movement
    await client.query(Q.INSERT_INVENTORY_MOVEMENT, [
      productId,
      lotId,
      'entrada',
      quantity,
      data.unit_cost || 0,
      stockBefore,
      stockAfter,
      'lot_entry',
      data.notes || 'Entrada de lote inicial',
      userId
    ]);

    await client.query('COMMIT');
    return lotRes.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const getMovements = async (filters = {}) => {
  let queryStr = Q.GET_MOVEMENTS;
  const values = [];
  let index = 1;

  if (filters.product_id) {
    queryStr += ` AND im.product_id = $${index}`;
    values.push(filters.product_id);
    index++;
  }
  if (filters.movement_type) {
    queryStr += ` AND im.movement_type = $${index}`;
    values.push(filters.movement_type);
    index++;
  }
  if (filters.date_from) {
    queryStr += ` AND im.created_at >= $${index}`;
    values.push(filters.date_from);
    index++;
  }
  if (filters.date_to) {
    queryStr += ` AND im.created_at <= $${index}`;
    values.push(filters.date_to);
    index++;
  }

  queryStr += ` ORDER BY im.created_at DESC`;
  const res = await query(queryStr, values);
  return res.rows;
};

export const getAlerts = async () => {
  const res = await query(Q.GET_ALERTS);
  return res.rows;
};

export const resolveAlert = async (id, userId) => {
  const res = await query(Q.RESOLVE_ALERT, [userId, id]);
  if (res.rowCount === 0) throw new Error('Alerta no encontrada');
  return res.rows[0];
};

export const getCategories = async () => {
  const res = await query(Q.GET_CATEGORIES);
  return res.rows;
};
