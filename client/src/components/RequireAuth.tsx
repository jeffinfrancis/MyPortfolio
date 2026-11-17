import type { ReactNode } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';

// Route guard (UX only; the server enforces the real rules).
export default function RequireAuth({ children, role }: { children: ReactNode; role?: Role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <p role="status" aria-live="polite">
        Checking your session…
      </p>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  }

  if (role && user.role !== role) {
    return (
      <section className="max-w-2xl">
        <h1 className="section-title">Not allowed</h1>
        <p className="lead">This page is only available to an {role}.</p>
        <Link className="btn" to="/">
          Back to home
        </Link>
      </section>
    );
  }

  return <>{children}</>;
}