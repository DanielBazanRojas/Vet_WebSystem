import * as consultationsService from './consultations.service.js';

export const getPetHistory = async (req, res) => {
  try {
    const history = await consultationsService.getHistoryByPet(req.params.petId);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getConsultation = async (req, res) => {
  try {
    const consultation = await consultationsService.getConsultationDetail(req.params.id);
    res.json(consultation);
  } catch (error) {
    if (error.message === 'Consulta no encontrada') return res.status(404).json({ message: error.message });
    res.status(500).json({ message: error.message });
  }
};

export const createConsultation = async (req, res) => {
  try {
    const result = await consultationsService.createConsultation(req.body, req.user.id);
    res.status(201).json({ message: 'Consulta creada exitosamente', id: result.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateConsultation = async (req, res) => {
  try {
    await consultationsService.updateConsultation(req.params.id, req.body);
    res.json({ message: 'Consulta actualizada exitosamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addTreatment = async (req, res) => {
  try {
    const result = await consultationsService.addTreatment(req.params.id, req.body);
    res.status(201).json({ message: 'Tratamiento agregado exitosamente', id: result.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const registerVaccine = async (req, res) => {
  try {
    const result = await consultationsService.registerVaccine(req.params.id, req.body, req.user.id);
    res.status(201).json({ message: 'Vacuna registrada exitosamente', id: result.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addLabResult = async (req, res) => {
  try {
    const result = await consultationsService.addLabResult(req.params.id, req.body);
    res.status(201).json({ message: 'Resultado de laboratorio agregado', id: result.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getConsultationVaccines = async (req, res) => {
  try {
    const vaccines = await consultationsService.getVaccinesByConsultation(req.params.id);
    res.json(vaccines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductsCatalog = async (req, res) => {
  try {
    const products = await consultationsService.getProductsCatalog();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getVaccinesCatalog = async (req, res) => {
  try {
    const vaccines = await consultationsService.getVaccinesCatalog();
    res.json(vaccines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllConsultations = async (req, res) => {
  try {
    const consultations = await consultationsService.getAllConsultations();
    res.json(consultations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFollowups = async (req, res) => {
  try {
    const followups = await consultationsService.getFollowups(req.params.id);
    res.json(followups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createFollowup = async (req, res) => {
  try {
    const followup = await consultationsService.createFollowup(req.params.id, req.body, req.user.id);
    res.status(201).json(followup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateFollowup = async (req, res) => {
  try {
    const followup = await consultationsService.updateFollowup(req.params.fid, req.body);
    res.json(followup);
  } catch (error) {
    if (error.message === 'Seguimiento no encontrado') return res.status(404).json({ message: error.message });
    res.status(500).json({ message: error.message });
  }
};

export const deleteFollowup = async (req, res) => {
  try {
    await consultationsService.deleteFollowup(req.params.fid);
    res.json({ message: 'Seguimiento eliminado exitosamente' });
  } catch (error) {
    if (error.message === 'Seguimiento no encontrado') return res.status(404).json({ message: error.message });
    res.status(500).json({ message: error.message });
  }
};
