// this file contains admin services to manage health-related data like allergens and diseases
import axios from "axios";

const API_BASE =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE) ||
  "http://192.168.18.10:5000/api";

// Create an axios instance for admin APIs
const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token from localStorage for every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("sb_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);
// ---------- Normalizers ----------
const normalizeHealthItem = (x) => ({
  id: x.id,
  name: x.name,
  category: x.category || "",
  addedAt: x.created_At, 
});

// ========== Allergens ==========
export async function getAllAllergens() {
  const res = await api.get("/admin/allergens");
  return (res.data.allergens || []).map(normalizeHealthItem);
}

export async function createAllergen(payload) {
  const res = await api.post("/admin/allergens", {
    name: payload.name,
    category: payload.category || "",
  });
  return res.data?.allergen ? normalizeHealthItem(res.data.allergen) : null;
}

export async function updateAllergen(id, payload) {
  await api.put(`/admin/allergens/${id}`, {
    name: payload.name,
    category: payload.category || "",
  });
}

export async function deleteAllergen(id) {
  await api.delete(`/admin/allergens/${id}`);
}

// ========== Diseases ==========
export async function getAllDiseases() {
  const res = await api.get("/admin/diseases"); 
  return (res.data.diseases || []).map(normalizeHealthItem);
}

export async function createDisease(payload) {
  const res = await api.post("/admin/diseases", {
    name: payload.name,
    category: payload.category || "",
  });
  return res.data?.disease ? normalizeHealthItem(res.data.disease) : null;
}

export async function updateDisease(id, payload) {
  await api.put(`/admin/diseases/${id}`, {
    name: payload.name,
    category: payload.category || "",
  });
}

export async function deleteDisease(id) {
  await api.delete(`/admin/diseases/${id}`);
}

export default {
  getAllAllergens,
  createAllergen,
  updateAllergen,
  deleteAllergen,
  getAllDiseases,
  createDisease,
  updateDisease,
  deleteDisease,
};