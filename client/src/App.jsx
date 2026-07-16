import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Layout from './layout/Layout';
import PrivateRoute from './routes/PrivateRoute';
import RoleRoute from './routes/RoleRoute';
import LoadingSkeleton from './common/LoadingSkeleton';

// Auth pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

// Employee pages
import EmployeeDashboard from './pages/employee/Dashboard';
import DocumentsPage from './pages/employee/DocumentsPage';
import ChecklistPage from './pages/employee/ChecklistPage';
import SetupPage from './pages/employee/SetupPage';
import AccessPage from './pages/employee/AccessPage';
import LearningPage from './pages/employee/LearningPage';
import ChatPage from './pages/employee/ChatPage';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminEmployeesPage from './pages/admin/EmployeesPage';
import AdminTasksPage from './pages/admin/TasksPage';
import AdminDocumentsPage from './pages/admin/DocumentsPage';
import AdminReportsPage from './pages/admin/ReportsPage';

import './index.css';

const RootRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'admin'
    ? <Navigate to="/admin" replace />
    : <Navigate to="/dashboard" replace />;
};

const LayoutWrapper = ({ children }) => <Layout>{children}</Layout>;

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected */}
            <Route element={<PrivateRoute />}>
              {/* Employee routes */}
              <Route element={<RoleRoute allowedRoles={['employee']} />}>
                <Route path="/dashboard" element={<LayoutWrapper><EmployeeDashboard /></LayoutWrapper>} />
                <Route path="/documents" element={<LayoutWrapper><DocumentsPage /></LayoutWrapper>} />
                <Route path="/checklist" element={<LayoutWrapper><ChecklistPage /></LayoutWrapper>} />
                <Route path="/setup" element={<LayoutWrapper><SetupPage /></LayoutWrapper>} />
                <Route path="/access" element={<LayoutWrapper><AccessPage /></LayoutWrapper>} />
                <Route path="/learning" element={<LayoutWrapper><LearningPage /></LayoutWrapper>} />
                <Route path="/chat" element={<LayoutWrapper><ChatPage /></LayoutWrapper>} />
              </Route>

              {/* Admin routes */}
              <Route element={<RoleRoute allowedRoles={['admin']} />}>
                <Route path="/admin" element={<LayoutWrapper><AdminDashboard /></LayoutWrapper>} />
                <Route path="/admin/employees" element={<LayoutWrapper><AdminEmployeesPage /></LayoutWrapper>} />
                <Route path="/admin/tasks" element={<LayoutWrapper><AdminTasksPage /></LayoutWrapper>} />
                <Route path="/admin/documents" element={<LayoutWrapper><AdminDocumentsPage /></LayoutWrapper>} />
                <Route path="/admin/reports" element={<LayoutWrapper><AdminReportsPage /></LayoutWrapper>} />
              </Route>
            </Route>

            {/* Default */}
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
