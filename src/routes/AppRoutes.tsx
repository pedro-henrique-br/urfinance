import { Routes, Route } from "react-router-dom";

import Auth from "@/pages/auth/Auth";
import Dashboard from "../pages/dashboard/Dashboard";
import {Page as Configurations} from "../pages/configurations/Page";
import { ProtectedRoute } from "./ProtectedRoute";
import NotFound from "../pages/errors/NotFound";
import Forbidden from "../pages/errors/Forbidden";
import ResetPassword from "@/pages/auth/ResetPassword";
import {Page as Receives} from "@/pages/incomes/Page";
import { Page as Expenses} from "@/pages/expenses/Page";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Auth />} />
      <Route path="/entrar" element={<Auth />} />
      <Route path="/register" element={<Auth />} />
      <Route path="/registrar" element={<Auth />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/" element={<Auth />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/entradas"
        element={
          <ProtectedRoute>
            <Receives />
          </ProtectedRoute>
        }
      />
      <Route
        path="/saidas"
        element={
          <ProtectedRoute>
            <Expenses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/poupancas"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/financiamentos"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/espacos"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    
      <Route
        path="/configuracoes"
        element={
          <ProtectedRoute>
            <Configurations />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route path="/forbidden" element={<Forbidden />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
