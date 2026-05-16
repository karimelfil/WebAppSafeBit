import { http } from "./http";

// Normalizes health-related items (allergens/diseases) from the API to a consistent format for the frontend
const normalizeHealthItem = (x) => ({
  id: x.id,
  name: x.name,
  category: x.category || "",
  addedAt: x.created_At,
});

// Service functions to interact with the backend API for admin health management
export async function getAllAllergens() {
  const res = await http.get("/admin/allergens");
  return (res.data.allergens || []).map(normalizeHealthItem);
}
// Creates a new allergen and returns the created allergen details
export async function createAllergen(payload) {
  const res = await http.post("/admin/allergens", {
    name: payload.name,
    category: payload.category || "",
  });
  return res.data?.allergen ? normalizeHealthItem(res.data.allergen) : null;
}
// Updates an existing allergen by ID and returns the updated allergen details
export async function updateAllergen(id, payload) {
  await http.put(`/admin/allergens/${id}`, {
    name: payload.name,
    category: payload.category || "",
  });
}
// Deletes an allergen by ID
export async function deleteAllergen(id) {
  await http.delete(`/admin/allergens/${id}`);
}

// Normalizes health-related items (allergens/diseases) from the API to a consistent format for the frontend
export async function getAllDiseases() {
  const res = await http.get("/admin/diseases");
  return (res.data.diseases || []).map(normalizeHealthItem);
}
// Creates a new disease and returns the created disease details
export async function createDisease(payload) {
  const res = await http.post("/admin/diseases", {
    name: payload.name,
    category: payload.category || "",
  });
  return res.data?.disease ? normalizeHealthItem(res.data.disease) : null;
}

// Updates an existing disease by ID and returns the updated disease details
export async function updateDisease(id, payload) {
  await http.put(`/admin/diseases/${id}`, {
    name: payload.name,
    category: payload.category || "",
  });
}
// Deletes a disease by ID
export async function deleteDisease(id) {
  await http.delete(`/admin/diseases/${id}`);
}

