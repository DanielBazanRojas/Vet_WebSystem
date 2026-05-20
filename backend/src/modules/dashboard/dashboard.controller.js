import * as dashboardService from './dashboard.service.js';

export const getStats = async (req, res) => {
  try {
    const stats = await dashboardService.getStats(req.user);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
