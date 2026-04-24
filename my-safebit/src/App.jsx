import { useEffect, useState } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { LoginPage } from "./components/LoginPage/LoginPage";
import AdminDashboard from "./admin/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { RegisterPage } from "./pages/RegisterPage";

//check if the session auth is active by checking sessionStorage
function hasActiveAuthSession() {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem("sb_session_active") === "1";
}

// if the user is not authenticated or does not have the required role  redirect to login page
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
  // Prevents the app from rendering routes before checking authentication.
  const [bootstrapped, setBootstrapped] = useState(false);

  // On app load  check if there is  an active session and navigate 
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

