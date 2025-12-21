/**
 * App Root Component
 * Clean routing with AuthProvider
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/ui/toast';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/projects/ProjectsPage';
import CreateProjectPage from './pages/projects/CreateProjectPage';
import ProjectDetailPage from './pages/projects/ProjectDetailPage';
import EditProjectPage from './pages/projects/EditProjectPage';
import CleanupPage from './pages/cleanup/CleanupPage';
import UnitsPage from './pages/units/UnitsPage';
import CreateUnitPage from './pages/units/CreateUnitPage';
import UnitDetailPage from './pages/units/UnitDetailPage';
import EditUnitPage from './pages/units/EditUnitPage';
import BulkImportPage from './pages/units/BulkImportPage';
import BookingsApprovalPage from './pages/bookings/BookingsApprovalPage';
import DepositsApprovalPage from './pages/deposits/DepositsApprovalPage';
import ReservationsPage from './pages/reservations/ReservationsPage';
import TransactionsPage from './pages/transactions/TransactionsPage';
import PaymentRequestsPage from './pages/payment-requests/PaymentRequestsPage';
import SystemConfigPage from './pages/system-config/SystemConfigPage';
import UsersPage from './pages/users/UsersPage';
import AuditLogsPage from './pages/audit-logs/AuditLogsPage';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
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
            <Route path="projects/:projectId" element={<ProjectDetailPage />} />
            <Route path="projects/:projectId/edit" element={<EditProjectPage />} />
            <Route path="projects/:projectId/bulk-import" element={<BulkImportPage />} />
            
            {/* Units */}
            <Route path="units" element={<UnitsPage />} />
            <Route path="units/create" element={<CreateUnitPage />} />
            <Route path="units/:id" element={<UnitDetailPage />} />
            <Route path="units/:id/edit" element={<EditUnitPage />} />
            
            {/* Approvals */}
            <Route path="reservations" element={<ReservationsPage />} />
            <Route path="bookings" element={<BookingsApprovalPage />} />
            <Route path="deposits" element={<DepositsApprovalPage />} />
            <Route path="cleanup" element={<CleanupPage />} />
            
            {/* Financial */}
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="payment-requests" element={<PaymentRequestsPage />} />
            
            {/* System */}
            <Route path="system-config" element={<SystemConfigPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="audit-logs" element={<AuditLogsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
