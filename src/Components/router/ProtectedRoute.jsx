import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/Stores/authStore.js';

/**
 * ProtectedRoute
 * - allowRoles: array of roles to allow (e.g. ['patient'] or ['provider'])
 * - children: element to render when authorized
 */
export default function ProtectedRoute({ allowRoles, children }) {
  const { user, role, loading } = useAuthStore((s) => ({
    user: s.user,
    role: s.role,
    loading: s.loading,
  }));

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-slate-600">
        Checking authentication...
      </div>
    );
  }

  if (!user) {
    // Not logged in, send to patient login by default
    return <Navigate to="/login" replace />;
  }

  if (allowRoles && allowRoles.length > 0 && !allowRoles.includes(role)) {
    // Logged in but role mismatch
    return <Navigate to="/" replace />;
  }

  return children;
}
