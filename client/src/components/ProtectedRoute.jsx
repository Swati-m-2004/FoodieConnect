import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
        <p>Loading session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="container page-wrapper">
        <div className="card" style={{ maxWidth: '500px', margin: '40px auto', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--danger)', marginBottom: '12px' }}>Access Restricted</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
            Your account role ({user.role}) does not have permission to view this section.
          </p>
          <a href="/" className="btn btn-primary">Return Home</a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
