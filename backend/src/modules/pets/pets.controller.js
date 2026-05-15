import * as petsService from './pets.service.js';

export const listPets = async (req, res) => {
  try {
    const { client_id, search, species_id } = req.query;
    const page  = parseInt(req.query.page, 10)  || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const result = await petsService.listPets({ client_id, search, species_id, page, limit });
    res.json(result);
  } catch (error) {
    console.error('Error listPets:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getPetDetail = async (req, res) => {
  try {
    const pet = await petsService.getPetDetail(req.params.id);
    res.json(pet);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createPet = async (req, res) => {
  try {
    const { name, species_id, client_id, weight_kg } = req.body;

    if (!name)       return res.status(400).json({ message: 'El nombre es requerido' });
    if (!species_id) return res.status(400).json({ message: 'La especie es requerida' });
    if (!client_id)  return res.status(400).json({ message: 'El cliente (dueño) es requerido' });
    if (weight_kg !== undefined && weight_kg !== null && (isNaN(weight_kg) || Number(weight_kg) <= 0)) {
      return res.status(400).json({ message: 'El peso debe ser un número positivo' });
    }

    const pet = await petsService.createPet(req.body, req.user?.id);
    res.status(201).json(pet);
  } catch (error) {
    console.error('Error createPet:', error);
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const updatePet = async (req, res) => {
  try {
    const { weight_kg } = req.body;
    if (weight_kg !== undefined && weight_kg !== null && (isNaN(weight_kg) || Number(weight_kg) <= 0)) {
      return res.status(400).json({ message: 'El peso debe ser un número positivo' });
    }

    const pet = await petsService.updatePet(req.params.id, req.body);
    res.json(pet);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const deletePet = async (req, res) => {
  try {
    await petsService.deletePet(req.params.id);
    res.json({ message: 'Mascota eliminada correctamente' });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const listSpecies = async (_req, res) => {
  try {
    const species = await petsService.listSpecies();
    res.json(species);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listBreeds = async (req, res) => {
  try {
    const breeds = await petsService.listBreeds(req.params.speciesId);
    res.json(breeds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
