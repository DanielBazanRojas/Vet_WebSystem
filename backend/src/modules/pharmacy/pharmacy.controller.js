import * as pharmacyService from './pharmacy.service.js';

export const getProducts = async (req, res) => {
  try {
    const products = await pharmacyService.getProducts(req.query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await pharmacyService.getProductById(req.params.id);
    res.json(product);
  } catch (error) {
    if (error.message === 'Producto no encontrado') return res.status(404).json({ message: error.message });
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const product = await pharmacyService.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await pharmacyService.updateProduct(req.params.id, req.body);
    res.json(product);
  } catch (error) {
    if (error.message === 'Producto no encontrado') return res.status(404).json({ message: error.message });
    res.status(400).json({ message: error.message });
  }
};

export const registerLotEntry = async (req, res) => {
  try {
    const lot = await pharmacyService.registerLotEntry(req.params.id, req.body, req.user.id);
    res.status(201).json(lot);
  } catch (error) {
    if (error.message === 'Producto no encontrado') return res.status(404).json({ message: error.message });
    res.status(400).json({ message: error.message });
  }
};

export const getMovements = async (req, res) => {
  try {
    const movements = await pharmacyService.getMovements(req.query);
    res.json(movements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAlerts = async (req, res) => {
  try {
    const alerts = await pharmacyService.getAlerts();
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resolveAlert = async (req, res) => {
  try {
    const alert = await pharmacyService.resolveAlert(req.params.id, req.user.id);
    res.json(alert);
  } catch (error) {
    if (error.message === 'Alerta no encontrada') return res.status(404).json({ message: error.message });
    res.status(400).json({ message: error.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await pharmacyService.getCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
