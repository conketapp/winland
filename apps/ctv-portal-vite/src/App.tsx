import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UnitsPage from './pages/UnitsPage';
import CommissionsPage from './pages/CommissionsPage';
import TransactionsPage from './pages/TransactionsPage';
import ProfilePage from './pages/ProfilePage';
import BottomNav from './components/BottomNav';

// Protected Route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('ctv_token');
  return token ? <>{children}</> : <Navigate to="/" replace />;
}

// Layout component with bottom nav
function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LoginPage />} />
        
        {/* Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/units" element={
          <ProtectedRoute>
            <Layout>
              <UnitsPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/commissions" element={
          <ProtectedRoute>
            <Layout>
              <CommissionsPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/my-transactions" element={
          <ProtectedRoute>
            <Layout>
              <TransactionsPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;