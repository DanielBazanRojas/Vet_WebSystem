import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import LoginPage from './modules/auth/LoginPage';
import PrivateRoute from './components/PrivateRoute';
import PanelLayout from './components/PanelLayout';
import ClientsPage from './modules/clients/ClientsPage';
import ClientDetail from './modules/clients/ClientDetail';
import PetsPage from './modules/pets/PetsPage';
import PetDetail from './modules/pets/PetDetail';
import AppointmentsPage from './modules/appointments/AppointmentsPage';
import ConsultationForm from './modules/consultations/ConsultationForm';
import ConsultationDetail from './modules/consultations/ConsultationDetail';
import ConsultationsPage from './modules/consultations/ConsultationsPage';
import PharmacyPage from './modules/pharmacy/PharmacyPage';
import GroomingPage from './modules/grooming/GroomingPage';
import GroomingSessionDetail from './modules/grooming/GroomingSessionDetail';
import BillingPage from './modules/billing/BillingPage';
import InvoiceDetail from './modules/billing/InvoiceDetail';
import DashboardPage from './modules/dashboard/DashboardPage';
import StaffPage from './modules/staff/StaffPage';

const queryClient = new QueryClient();

function App() {
  const refreshToken = useAuthStore(state => state.refreshToken);
  const isInitialized = useAuthStore(state => state.isInitialized);

  useEffect(() => {
    if (!isInitialized) {
      refreshToken().catch(() => {
        // Ignorar si falla, el store ya lo maneja
      });
    }
  }, [refreshToken, isInitialized]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route element={<PrivateRoute />}>
            <Route element={<PanelLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/clientes" element={<ClientsPage />} />
              <Route path="/clientes/:id" element={<ClientDetail />} />
              <Route path="/mascotas" element={<PetsPage />} />
              <Route path="/mascotas/:id" element={<PetDetail />} />
              <Route path="/citas" element={<AppointmentsPage />} />
              <Route path="/consultas" element={<ConsultationsPage />} />
              <Route path="/consultas/new" element={<ConsultationForm />} />
              <Route path="/consultas/:id" element={<ConsultationDetail />} />
              <Route path="/farmacia" element={<PharmacyPage />} />
              <Route path="/estetica" element={<GroomingPage />} />
              <Route path="/estetica/:id" element={<GroomingSessionDetail />} />
              <Route path="/facturacion" element={<BillingPage />} />
              <Route path="/facturacion/:id" element={<InvoiceDetail />} />
              <Route path="/personal" element={<StaffPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
