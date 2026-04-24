import axios from "axios";
import { API_BASE } from "../config/apiBase";

const AUTH_STORAGE_KEYS = ["sb_token", "sb_role", "sb_userId"];

function clearAuthStorage() {
  for (const key of AUTH_STORAGE_KEYS) {
    localStorage.removeItem(key);
  }
  sessionStorage.removeItem("sb_session_active");
  sessionStorage.removeItem("sb_active_section");
}

// Create an Axios instance with the base URL and timeout
export const http = axios.create({
  baseURL: API_BASE,
  timeout: 90000,
});

// Add a request interceptor to include the token in the Authorization header
http.interceptors.request.use((config) => {


  if (config.data instanceof FormData) {
    if (typeof config.headers?.delete === "function") {
      config.headers.delete("Content-Type");
    } else if (config.headers) {
      delete config.headers["Content-Type"];
    }
  }

  // Get the token from localStorage and set it in the Authorization header if it exists
  const token = localStorage.getItem("sb_token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Add a response interceptor to handle 401 errors and other response errors
http.interceptors.response.use(
  (res) => res,
  
  (error) => {
// If the error is a timeout, reject it without further processing
    if (error?.code === "ECONNABORTED" || String(error?.message || "").toLowerCase().includes("timeout")) {
      return Promise.reject(error);
    }
// If the error response status is 401 and the request URL is not the login endpoint, clear localStorage and redirect to the login page
    if (error?.response?.status === 401 && error.config?.url !== "/auth/login") {
      clearAuthStorage();
      window.dispatchEvent(new Event("safebite:auth-expired"));
    }
    return Promise.reject(error);
  }
);
