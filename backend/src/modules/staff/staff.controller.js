import * as staffService from './staff.service.js';

export const listStaff = async (req, res) => {
  try {
    const search = req.query.search || '';
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    const result = await staffService.listStaff(search, page, limit);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message, message: error.message });
  }
};

export const getStaffDetails = async (req, res) => {
  try {
    const staff = await staffService.getStaffDetails(req.params.id);
    res.json(staff);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message, message: error.message });
  }
};

export const createStaff = async (req, res) => {
  try {
    const assignedBy = req.user?.id;
    const newStaff = await staffService.createStaff(req.body, assignedBy);
    res.status(201).json(newStaff);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message, message: error.message });
  }
};

export const updateStaff = async (req, res) => {
  try {
    const assignedBy = req.user?.id;
    const updatedStaff = await staffService.updateStaff(req.params.id, req.body, assignedBy);
    res.json(updatedStaff);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { new_password } = req.body;
    const result = await staffService.resetPassword(req.params.id, new_password);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message, message: error.message });
  }
};

export const toggleStaff = async (req, res) => {
  try {
    const toggledStaff = await staffService.toggleStaff(req.params.id);
    res.json(toggledStaff);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message, message: error.message });
  }
};
