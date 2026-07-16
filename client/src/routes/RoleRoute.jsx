import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleRoute = ({ allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isAuthorized = allowedRoles.includes(user.role);

  return isAuthorized ? (
    <Outlet />
  ) : (
    <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
  );
};

export default RoleRoute;
