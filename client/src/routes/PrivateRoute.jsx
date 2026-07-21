import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSkeleton from '../common/LoadingSkeleton';

const PrivateRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <h2 className="text-lg font-semibold text-gray-700 animate-pulse">Loading secure session...</h2>
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
