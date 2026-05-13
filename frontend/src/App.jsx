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
              <Route path="/" element={<div>Bienvenido al sistema. Seleccione un módulo en el menú lateral.</div>} />
              <Route path="/clientes" element={<ClientsPage />} />
              <Route path="/clientes/:id" element={<ClientDetail />} />
              <Route path="/mascotas" element={<div>Módulo Mascotas</div>} />
              <Route path="/citas" element={<div>Módulo Citas</div>} />
              <Route path="/consultas" element={<div>Módulo Consultas</div>} />
              <Route path="/farmacia" element={<div>Módulo Farmacia</div>} />
              <Route path="/estetica" element={<div>Módulo Estética</div>} />
              <Route path="/facturacion" element={<div>Módulo Facturación</div>} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
