import { useEffect, useState } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { LoginPage } from "./components/LoginPage/LoginPage";
import AdminDashboard from "./admin/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { RegisterPage } from "./pages/RegisterPage";

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("sb_token");
  const role = (localStorage.getItem("sb_role") || "").toLowerCase();

  if (!token) return <Navigate to="/" replace />;

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  const navigate = useNavigate();
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("sb_token");
    const role = (localStorage.getItem("sb_role") || "").toLowerCase();

    if (window.location.pathname === "/") {
      if (token && role) {
        if (role === "admin") navigate("/admin", { replace: true });
        else navigate("/dashboard", { replace: true });
      }
    }

    setBootstrapped(true);
  }, [navigate]);

  if (!bootstrapped) return null;

  return (
   <Routes>
  <Route
    path="/"
    element={
      <LoginPage
        onLogin={(role) =>
          role === "admin" ? navigate("/admin") : navigate("/dashboard")
        }
      />
    }
  />

  <Route
    path="/register"
    element={
      <RegisterPage
        onNavigateToLogin={() => navigate("/", { replace: true })}
      />
    }
  />

  <Route
    path="/forgot-password"
    element={<ForgotPasswordPage onBack={() => navigate("/")} />}
  />

  <Route path="/reset-password" element={<ResetPasswordPage />} />

  <Route
    path="/admin"
    element={
      <ProtectedRoute allowedRoles={["admin"]}>
        <AdminDashboard />
      </ProtectedRoute>
    }
  />

  <Route
    path="/dashboard"
    element={
      <ProtectedRoute allowedRoles={["user", "admin"]}>
        <UserDashboard />
      </ProtectedRoute>
    }
  />

  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>

  );
}

