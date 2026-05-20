import { query } from '../../config/db.js';
import * as Q from './dashboard.queries.js';

export const getStats = async (user) => {
  // Query user roles to determine if they are a specialist
  const rolesRes = await query(
    `SELECT r.name FROM user_roles ur 
     JOIN roles r ON ur.role_id = r.id 
     WHERE ur.user_id = $1 AND ur.is_active = true`, 
    [user.id]
  );
  const roles = rolesRes.rows.map(row => row.name);
  const isSpecialist = roles.includes('veterinario') || roles.includes('groomer');

  // Stats queries
  const countCitasPromise = isSpecialist
    ? query(Q.GET_CITAS_HOY_ASSIGNED, [user.id])
    : query(Q.GET_CITAS_HOY);

  const countClientesPromise = query(Q.GET_NUEVOS_CLIENTES_MES);
  const sumIngresosPromise = query(Q.GET_INGRESOS_MES);
  const countAlertasPromise = query(Q.GET_ALERTAS_STOCK_ACTIVAS);

  // List queries
  const appointmentsPromise = isSpecialist
    ? query(Q.GET_UPCOMING_APPOINTMENTS_ASSIGNED, [user.id])
    : query(Q.GET_UPCOMING_APPOINTMENTS);

  const stockAlertsPromise = query(Q.GET_RECENT_STOCK_ALERTS);
  const vaccinationRemindersPromise = query(Q.GET_VACCINATION_REMINDERS);

  const [
    countCitasRes,
    countClientesRes,
    sumIngresosRes,
    countAlertasRes,
    appointmentsRes,
    stockAlertsRes,
    vaccinationRemindersRes
  ] = await Promise.all([
    countCitasPromise,
    countClientesPromise,
    sumIngresosPromise,
    countAlertasPromise,
    appointmentsPromise,
    stockAlertsPromise,
    vaccinationRemindersPromise
  ]);

  return {
    stats: {
      citas_hoy: parseInt(countCitasRes.rows[0].count),
      nuevos_clientes_mes: parseInt(countClientesRes.rows[0].count),
      ingresos_mes: parseFloat(sumIngresosRes.rows[0].total_ingresos),
      alertas_stock_activas: parseInt(countAlertasRes.rows[0].count)
    },
    citas: appointmentsRes.rows,
    alertas: stockAlertsRes.rows,
    reminders: vaccinationRemindersRes.rows
  };
};
