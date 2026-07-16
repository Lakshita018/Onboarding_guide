import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Layout from './layout/Layout';
import PrivateRoute from './routes/PrivateRoute';
import RoleRoute from './routes/RoleRoute';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import EmployeeDashboard from './pages/employee/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import './index.css';

// Redirect route selector based on authenticated user role
const RootRedirect = () => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return user.role === 'admin' ? (
    <Navigate to="/admin" replace />
  ) : (
    <Navigate to="/dashboard" replace />
  );
};

// Layout wrapper for routes inside dashboard sessions
const LayoutWrapper = ({ children }) => {
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected Core Routes */}
            <Route element={<PrivateRoute />}>
              {/* Employee Routes */}
              <Route element={<RoleRoute allowedRoles={['employee']} />}>
                <Route
                  path="/dashboard"
                  element={
                    <LayoutWrapper>
                      <EmployeeDashboard />
                    </LayoutWrapper>
                  }
                />
              </Route>

              {/* Admin Routes */}
              <Route element={<RoleRoute allowedRoles={['admin']} />}>
                <Route
                  path="/admin"
                  element={
                    <LayoutWrapper>
                      <AdminDashboard />
                    </LayoutWrapper>
                  }
                />
              </Route>
            </Route>

            {/* Root/Default Redirect */}
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
