import * as notificationsService from './notifications.service.js';

export const getUnreadNotifications = async (req, res) => {
  try {
    const notifs = await notificationsService.getUnreadNotifications(req.user.id);
    res.json(notifs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const notif = await notificationsService.markAsRead(req.params.id, req.user.id);
    if (!notif) return res.status(404).json({ message: 'Notificación no encontrada' });
    res.json(notif);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const notifs = await notificationsService.markAllAsRead(req.user.id);
    res.json(notifs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
