// this file handles authentication-related API calls
import { http } from "./http";

// LOGIN
export async function loginApi(payload) {
  const res = await http.post("/auth/login", payload);
  return res.data;
}

// FORGOT PASSWORD
export async function forgotPasswordApi(email) {
  const res = await http.post("/auth/forgot-password", { email });
  return res.data;
}

// RESET PASSWORD
export async function resetPasswordApi(payload) {
  const res = await http.post("/auth/reset-password", payload);
  return res.data;
}

export const logout = () => {
  localStorage.removeItem("sb_token");
  localStorage.removeItem("sb_role");
  localStorage.removeItem("sb_userId");
};
