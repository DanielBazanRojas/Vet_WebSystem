import * as clientsService from './clients.service.js';

export const listClients = async (req, res) => {
  try {
    const search = req.query.search || '';
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    
    const result = await clientsService.listClients(search, page, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getClientDetails = async (req, res) => {
  try {
    const client = await clientsService.getClientDetails(req.params.id);
    res.json(client);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createClient = async (req, res) => {
  try {
    const { full_name, phone, email } = req.body;
    
    if (!full_name || !phone) {
      return res.status(400).json({ message: 'El nombre completo y el teléfono son requeridos' });
    }
    
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Formato de email inválido' });
      }
    }
    
    const registeredBy = req.user?.id;
    const newClient = await clientsService.createClient(req.body, registeredBy);
    
    res.status(201).json(newClient);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const updateClient = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Formato de email inválido' });
      }
    }
    
    const updatedClient = await clientsService.updateClient(req.params.id, req.body);
    res.json(updatedClient);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const deleteClient = async (req, res) => {
  try {
    await clientsService.deleteClient(req.params.id);
    res.json({ message: 'Cliente eliminado correctamente' });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
