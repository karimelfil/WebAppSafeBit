import { http } from "./http";

const normalizeHealthItem = (x) => ({
  id: x.id,
  name: x.name,
  category: x.category || "",
  addedAt: x.created_At,
});

export async function getAllAllergens() {
  const res = await http.get("/admin/allergens");
  return (res.data.allergens || []).map(normalizeHealthItem);
}

export async function createAllergen(payload) {
  const res = await http.post("/admin/allergens", {
    name: payload.name,
    category: payload.category || "",
  });
  return res.data?.allergen ? normalizeHealthItem(res.data.allergen) : null;
}

export async function updateAllergen(id, payload) {
  await http.put(`/admin/allergens/${id}`, {
    name: payload.name,
    category: payload.category || "",
  });
}

export async function deleteAllergen(id) {
  await http.delete(`/admin/allergens/${id}`);
}

// Diseases
export async function getAllDiseases() {
  const res = await http.get("/admin/diseases");
  return (res.data.diseases || []).map(normalizeHealthItem);
}

export async function createDisease(payload) {
  const res = await http.post("/admin/diseases", {
    name: payload.name,
    category: payload.category || "",
  });
  return res.data?.disease ? normalizeHealthItem(res.data.disease) : null;
}

export async function updateDisease(id, payload) {
  await http.put(`/admin/diseases/${id}`, {
    name: payload.name,
    category: payload.category || "",
  });
}

export async function deleteDisease(id) {
  await http.delete(`/admin/diseases/${id}`);
}
