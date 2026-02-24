import axios from "axios";
import { API_BASE } from "../config/apiBase";

export const http = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("sb_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401 && error.config?.url !== "/auth/login") {
      localStorage.clear();
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

