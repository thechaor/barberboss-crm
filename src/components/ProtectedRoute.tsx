import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requireBarber?: boolean;
}

export const ProtectedRoute = ({ children, requireAdmin = false, requireBarber = false }: ProtectedRouteProps) => {
  const { user, isAdmin, isBarber, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/minha-conta" replace />;
  }

  if (requireBarber && !isBarber) {
    return <Navigate to="/minha-conta" replace />;
  }

  return <>{children}</>;
};