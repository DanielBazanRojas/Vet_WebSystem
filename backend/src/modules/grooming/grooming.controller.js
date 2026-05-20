import * as groomingService from './grooming.service.js';

export const getSessions = async (req, res) => {
  try {
    const sessions = await groomingService.getSessions();
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSessionById = async (req, res) => {
  try {
    const session = await groomingService.getSessionById(req.params.id);
    res.json(session);
  } catch (error) {
    if (error.message === 'Sesión no encontrada') return res.status(404).json({ message: error.message });
    res.status(500).json({ message: error.message });
  }
};

export const createSession = async (req, res) => {
  try {
    const session = await groomingService.createSession(req.body, req.user.id);
    res.status(201).json(session);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateSession = async (req, res) => {
  try {
    const session = await groomingService.updateSession(req.params.id, req.body);
    res.json(session);
  } catch (error) {
    if (error.message === 'Sesión no encontrada') return res.status(404).json({ message: error.message });
    res.status(400).json({ message: error.message });
  }
};

export const addServiceToSession = async (req, res) => {
  try {
    const service = await groomingService.addServiceToSession(req.params.id, req.body);
    res.status(201).json(service);
  } catch (error) {
    if (error.message === 'Sesión no encontrada' || error.message === 'Servicio no encontrado en el catálogo') {
      return res.status(404).json({ message: error.message });
    }
    res.status(400).json({ message: error.message });
  }
};

export const removeServiceFromSession = async (req, res) => {
  try {
    await groomingService.removeServiceFromSession(req.params.id, req.params.serviceId);
    res.status(204).send();
  } catch (error) {
    if (error.message === 'Servicio no encontrado en esta sesión') return res.status(404).json({ message: error.message });
    res.status(400).json({ message: error.message });
  }
};

export const getCatalog = async (req, res) => {
  try {
    const catalog = await groomingService.getCatalog();
    res.json(catalog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getServicePriceForSpecies = async (req, res) => {
  try {
    const result = await groomingService.getServicePriceForSpecies(req.params.serviceId, req.params.speciesId);
    res.json(result);
  } catch (error) {
    if (error.message === 'Servicio no encontrado') return res.status(404).json({ message: error.message });
    res.status(500).json({ message: error.message });
  }
};
