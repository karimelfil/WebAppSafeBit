import { useEffect, useState } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { LoginPage } from "./auth/LoginPage";
import AdminDashboard from "./admin/AdminDashboard";
import UserDashboard from "./user/UserDashboard";
import { ForgotPasswordPage } from "./auth/ForgotPasswordPage";
import { ResetPasswordPage } from "./auth/ResetPasswordPage";
import { RegisterPage } from "./auth/RegisterPage";

//check if session is still active stored in sessionStorage 
function hasActiveAuthSession() {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem("sb_session_active") === "1";
}

// if user is not authenticated or role is not allowed, redirect to login page otherwise render the children components
function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("sb_token");
  const role = (localStorage.getItem("sb_role") || "").toLowerCase();
  const isSessionActive = hasActiveAuthSession();

  if (!token || !role || !isSessionActive) return <Navigate to="/" replace />;

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  const navigate = useNavigate();
  //prevent rendering until auth is done
  const [bootstrapped, setBootstrapped] = useState(false);

  // on load check active session and redirect based on the role
  useEffect(() => {
    const token = localStorage.getItem("sb_token");
    const role = (localStorage.getItem("sb_role") || "").toLowerCase();
    const isSessionActive = hasActiveAuthSession();

    if (window.location.pathname === "/") {
      if (token && role && isSessionActive) {
        if (role === "admin") navigate("/admin", { replace: true });
        else navigate("/dashboard", { replace: true });
      }
    }

    setBootstrapped(true);
  }, [navigate]);

  // session expired event listener to handle session expiration and redirect to login page
  useEffect(() => {
    const handleAuthExpired = () => {
      navigate("/", { replace: true });
    };

    window.addEventListener("safebite:auth-expired", handleAuthExpired);
    return () => {
      window.removeEventListener("safebite:auth-expired", handleAuthExpired);
    };
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

