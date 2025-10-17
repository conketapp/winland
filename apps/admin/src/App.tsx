/**
 * App Root Component
 * Clean routing with AuthProvider
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/projects/ProjectsPage';
import CreateProjectPage from './pages/projects/CreateProjectPage';
import UnitsPage from './pages/units/UnitsPage';
import CreateUnitPage from './pages/units/CreateUnitPage';
import UnitDetailPage from './pages/units/UnitDetailPage';
import EditUnitPage from './pages/units/EditUnitPage';
import BulkImportPage from './pages/units/BulkImportPage';
import BookingsApprovalPage from './pages/bookings/BookingsApprovalPage';
import DepositsApprovalPage from './pages/deposits/DepositsApprovalPage';
import TransactionsPage from './pages/transactions/TransactionsPage';
import PaymentRequestsPage from './pages/payment-requests/PaymentRequestsPage';
import SystemConfigPage from './pages/system-config/SystemConfigPage';
import UsersPage from './pages/users/UsersPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          
          {/* Projects */}
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/create" element={<CreateProjectPage />} />
          <Route path="projects/:projectId/bulk-import" element={<BulkImportPage />} />
          
          {/* Units */}
          <Route path="units" element={<UnitsPage />} />
          <Route path="units/create" element={<CreateUnitPage />} />
          <Route path="units/:id" element={<UnitDetailPage />} />
          <Route path="units/:id/edit" element={<EditUnitPage />} />
          
          {/* Approvals */}
          <Route path="bookings" element={<BookingsApprovalPage />} />
          <Route path="deposits" element={<DepositsApprovalPage />} />
          
          {/* Financial */}
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="payment-requests" element={<PaymentRequestsPage />} />
          
          {/* System */}
          <Route path="system-config" element={<SystemConfigPage />} />
          <Route path="users" element={<UsersPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
