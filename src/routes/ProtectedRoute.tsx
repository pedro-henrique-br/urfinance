import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/user/useAuth";
import type { JSX } from "react";

interface Props {
  children: JSX.Element;
}

export function ProtectedRoute({ children }: Props) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.email_confirmed_at) {
    return <Navigate to="/login" replace />;
  }

  // if (user.role !== "admin") {
  //   return <Navigate to="/forbidden" replace />;
  // }

  return children;
}
