import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import authRoutes from './src/modules/auth/auth.routes.js';
import clientsRoutes from './src/modules/clients/clients.routes.js';
import petsRoutes from './src/modules/pets/pets.routes.js';
import appointmentsRoutes from './src/modules/appointments/appointments.routes.js';
import consultationsRoutes from './src/modules/consultations/consultations.routes.js';
import pharmacyRoutes from './src/modules/pharmacy/pharmacy.routes.js';
import groomingRoutes from './src/modules/grooming/grooming.routes.js';
import billingRoutes from './src/modules/billing/billing.routes.js';
import dashboardRoutes from './src/modules/dashboard/dashboard.routes.js';
import notificationsRoutes from './src/modules/notifications/notifications.routes.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(morgan('dev'));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/pets', petsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/consultations', consultationsRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/grooming', groomingRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationsRoutes);

export default app;
