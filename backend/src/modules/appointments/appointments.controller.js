import * as appointmentsService from './appointments.service.js';

export const listAppointments = async (req, res) => {
  try {
    const { date_from, date_to, assigned_to, status, category } = req.query;
    const result = await appointmentsService.listAppointments({ date_from, date_to, assigned_to, status, category });
    res.json(result);
  } catch (error) {
    console.error('Error listAppointments:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getAppointment = async (req, res) => {
  try {
    const appt = await appointmentsService.getAppointment(req.params.id);
    res.json(appt);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createAppointment = async (req, res) => {
  try {
    const { pet_id, client_id, appointment_type_id, scheduled_date, scheduled_time } = req.body;

    if (!pet_id || !client_id || !appointment_type_id || !scheduled_date || !scheduled_time) {
      return res.status(400).json({ message: 'Todos los campos requeridos deben completarse' });
    }

    // Validar fecha futura/hoy
    const schedule = new Date(`${scheduled_date}T${scheduled_time}`);
    const now = new Date();
    // Permitir agendar para el día de hoy aunque la hora ya haya pasado un poco por si se registra retroactivo
    if (scheduled_date < now.toISOString().split('T')[0]) {
      return res.status(400).json({ message: 'No se puede agendar una cita en una fecha pasada' });
    }

    const appt = await appointmentsService.createAppointment(req.body, req.user?.id);
    res.status(201).json(appt);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const appt = await appointmentsService.updateAppointment(req.params.id, req.body);
    res.json(appt);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const cancelAppointment = async (req, res) => {
  try {
    const { reason } = req.body;
    const appt = await appointmentsService.cancelAppointment(req.params.id, reason, req.user?.id);
    res.json(appt);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const listTypes = async (_req, res) => {
  try {
    const types = await appointmentsService.listTypes();
    res.json(types);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listStaff = async (_req, res) => {
  try {
    const staff = await appointmentsService.listStaff();
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
