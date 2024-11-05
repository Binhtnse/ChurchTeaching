import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthState } from '../hooks/useAuthState'

interface ProtectedRouteProps {
  allowedRoles?: string[];
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { isLoggedInRef, roleRef } = useAuthState();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoggedInRef.current && !allowedRoles?.includes("GUEST")) {
        navigate("/login", { replace: true });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [isLoggedInRef, navigate, allowedRoles]);

  if (!isLoggedInRef.current && !allowedRoles?.includes("GUEST")) {
    return null; // Return null to prevent flash of content
  }

  if (allowedRoles && !allowedRoles.includes(roleRef.current)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;