import axios from "axios";
import { API_BASE } from "../config/apiBase";

export const http = axios.create({
  baseURL: API_BASE,
  timeout: 90000, 
});

http.interceptors.request.use((config) => {


  if (config.data instanceof FormData) {

    if (typeof config.headers?.delete === "function") {
      config.headers.delete("Content-Type");
    } else if (config.headers) {
      delete config.headers["Content-Type"];
    }
  }

  const token = localStorage.getItem("sb_token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

http.interceptors.response.use(
  (res) => res,
  (error) => {

    if (error?.code === "ECONNABORTED" || String(error?.message || "").toLowerCase().includes("timeout")) {
      return Promise.reject(error);
    }

    if (error?.response?.status === 401 && error.config?.url !== "/auth/login") {
      localStorage.clear();
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);