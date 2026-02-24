import { http } from "./http";

export async function loginApi(payload) {
  const res = await http.post("/auth/login", payload);
  return res.data;
}

export async function forgotPasswordApi(email) {
  const res = await http.post("/auth/forgot-password", { email });
  return res.data;
}

export async function resetPasswordApi(payload) {
  const res = await http.post("/auth/reset-password", payload);
  return res.data;
}

export async function logout() {
  try {
    await http.post("/auth/logout");
  } catch {
    // Clear local session even if server logout fails.
  } finally {
    localStorage.removeItem("sb_token");
    localStorage.removeItem("sb_role");
    localStorage.removeItem("sb_userId");
  }
}

