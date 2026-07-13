import * as feedbackService from './feedback.service.js';

export const listFeedback = async (req, res) => {
  try {
    const result = await feedbackService.listFeedback(req.user, req.query);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message, message: error.message });
  }
};

export const getFeedbackById = async (req, res) => {
  try {
    const feedback = await feedbackService.getFeedbackById(req.params.id);
    res.json(feedback);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message, message: error.message });
  }
};

export const createFeedback = async (req, res) => {
  try {
    const feedback = await feedbackService.createFeedback(req.user.id, req.body);
    res.status(201).json(feedback);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message, message: error.message });
  }
};

export const updateFeedback = async (req, res) => {
  try {
    const feedback = await feedbackService.updateFeedback(req.params.id, req.body, req.user.id);
    res.json(feedback);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message, message: error.message });
  }
};

export const getFeedbackStats = async (req, res) => {
  try {
    const stats = await feedbackService.getFeedbackStats();
    res.json(stats);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message, message: error.message });
  }
};
