import { http } from "./http";
// API function to get all allergies 
export const getAllAllergies = async () => {
  const res = await http.get("/user/allergies");
  return res.data;
};

// API function to get all diseases
export const getAllDiseases = async () => {
  const res = await http.get("/user/diseases");
  return res.data;
};

// API function to call the register endpoint
export const registerApi = async (payload) => {
  const res = await http.post("/auth/register", payload);
  return res.data;
};
