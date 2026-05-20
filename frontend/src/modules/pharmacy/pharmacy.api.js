import client from '../../api/client';

export const getProducts = async (filters) => {
  const { data } = await client.get('/pharmacy/products', { params: filters });
  return data;
};

export const getProductById = async (id) => {
  const { data } = await client.get(`/pharmacy/products/${id}`);
  return data;
};

export const createProduct = async (productData) => {
  const { data } = await client.post('/pharmacy/products', productData);
  return data;
};

export const updateProduct = async (id, productData) => {
  const { data } = await client.put(`/pharmacy/products/${id}`, productData);
  return data;
};

export const registerLotEntry = async (id, lotData) => {
  const { data } = await client.post(`/pharmacy/products/${id}/lots`, lotData);
  return data;
};

export const getMovements = async (filters) => {
  const { data } = await client.get('/pharmacy/movements', { params: filters });
  return data;
};

export const getAlerts = async () => {
  const { data } = await client.get('/pharmacy/alerts');
  return data;
};

export const resolveAlert = async (id) => {
  const { data } = await client.patch(`/pharmacy/alerts/${id}/resolve`);
  return data;
};

export const getCategories = async () => {
  const { data } = await client.get('/pharmacy/categories');
  return data;
};
