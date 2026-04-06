import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import Login from './features/auth/Login';
import Layout from './components/layout/Layout';

import KioskWizard from './features/registrations/KioskWizard';
import NewRegistration from './features/registrations/NewRegistration';
import EditRegistration from './features/registrations/EditRegistration';
import RegistrationTray from './features/registrations/RegistrationTray';
import RegistrationDetail from './features/registrations/RegistrationDetail';
import Dashboard from './features/dashboard/Dashboard';

// Protected Route Guard
function ProtectedRoute({ children, allowedRoles, noLayout = false }: { children: React.ReactNode, allowedRoles?: string[], noLayout?: boolean }) {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  
  const currentRole = user.role;
  const isAuthorized = !allowedRoles || allowedRoles.some(r => r.toLowerCase() === currentRole.toLowerCase());

  if (!isAuthorized) {
    // Redirect to default page based on role if unauthorized access is attempted
    return <Navigate to={currentRole.toLowerCase() === 'supervisor' ? '/' : '/registrations'} replace />;
  }
  
  return noLayout ? <>{children}</> : <Layout>{children}</Layout>;
}

// Router config
function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'Supervisor' ? '/' : '/registrations'} /> : <Login />} />
      
      {/* Kiosk Route (Protected but No Layout wrapper) */}
      <Route path="/kiosko" element={
        <ProtectedRoute allowedRoles={['Operador', 'Supervisor']} noLayout>
          <KioskWizard />
        </ProtectedRoute>
      } />
      
      {/* Operador routes */}
      <Route path="/registrations" element={
        <ProtectedRoute allowedRoles={['Operador', 'Supervisor']}>
          <RegistrationTray />
        </ProtectedRoute>
      } />
      <Route path="/registrations/new" element={
        <ProtectedRoute allowedRoles={['Operador']}>
          <NewRegistration />
        </ProtectedRoute>
      } />
      <Route path="/registrations/:id" element={
        <ProtectedRoute allowedRoles={['Operador', 'Supervisor']}>
          <RegistrationDetail />
        </ProtectedRoute>
      } />
      <Route path="/registrations/edit/:id" element={
        <ProtectedRoute allowedRoles={['Operador', 'Supervisor']}>
          <EditRegistration />
        </ProtectedRoute>
      } />

      {/* Supervisor routes */}
      <Route path="/" element={
        <ProtectedRoute allowedRoles={['Supervisor']}>
          <Dashboard />
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
