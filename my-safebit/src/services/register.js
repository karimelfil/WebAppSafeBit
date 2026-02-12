import { http } from "./http";

export const getAllAllergies = async () => {
  const res = await http.get("/user/allergies");
  return res.data;
};

export const getAllDiseases = async () => {
  const res = await http.get("/user/diseases");
  return res.data;
};

export const registerApi = async (payload) => {
  const res = await http.post("/auth/register", payload);
  return res.data;
};
