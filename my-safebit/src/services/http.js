import axios from "axios";

export const http = axios.create({
  baseURL: "http://192.168.18.10:5000/api",
  headers: { "Content-Type": "application/json" },
});

// Attach token automatically
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("sb_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error?.response?.status === 401 &&
      error.config.url !== "/auth/login"
    ) {
      localStorage.clear();
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);
