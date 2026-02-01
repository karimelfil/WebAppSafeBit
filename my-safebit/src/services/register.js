import axios from "axios";

const API_BASE = "http://192.168.18.10:5000/api";

export const getAllAllergies = async () => {
  const res = await axios.get(`${API_BASE}/user/allergies`);
  return res.data; // ✅ array
};

export const getAllDiseases = async () => {
  const res = await axios.get(`${API_BASE}/user/diseases`);
  return res.data; // ✅ array
};

export const registerApi = async (payload) => {
  const res = await axios.post(`${API_BASE}/auth/register`, payload);
  return res.data;
};
