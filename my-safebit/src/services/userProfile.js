import { http } from "./http";

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const pickFirst = (obj, keys, fallback = null) => {
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== undefined && value !== null) return value;
  }
  return fallback;
};

const normalizeGender = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") return value === 1 ? "male" : value === 2 ? "female" : "other";

  const raw = String(value).trim().toLowerCase();
  if (raw === "1" || raw === "male") return "male";
  if (raw === "2" || raw === "female") return "female";
  if (!raw) return "";
  return raw;
};

const normalizeCatalogItem = (x, fallbackId) => {
  const id =
    toNumber(
      pickFirst(x, [
        "id",
        "Id",
        "allergyID",
        "allergyId",
        "AllergyID",
        "AllergyId",
        "allergenID",
        "allergenId",
        "AllergenID",
        "AllergenId",
        "diseaseID",
        "diseaseId",
        "DiseaseID",
        "DiseaseId",
      ])
    ) ?? fallbackId;

  const name = String(
    pickFirst(
      x,
      ["name", "Name", "allergyName", "allergenName", "diseaseName", "AllergyName", "DiseaseName", "title", "Title"],
      ""
    )
  ).trim();

  return { id, name: name || `Item ${id}` };
};

const normalizeSelectedItem = (x, fallbackId) => {
  if (typeof x === "number" || typeof x === "string") {
    const id = toNumber(x);
    if (id === null) return null;
    return { id, name: "" };
  }

  if (!x || typeof x !== "object") return null;

  return normalizeCatalogItem(x, fallbackId);
};

const normalizeProfileResponse = (data) => {
  const profile = data?.profile || data?.user || data || {};
  return {
    firstName: String(
      pickFirst(profile, ["firstName", "first_Name", "firstname", "FirstName", "First_Name"], "") || ""
    ),
    lastName: String(
      pickFirst(profile, ["lastName", "last_Name", "lastname", "LastName", "Last_Name"], "") || ""
    ),
    email: String(pickFirst(profile, ["email", "Email"], "") || ""),
    phone: String(pickFirst(profile, ["phone", "Phone"], "") || ""),
    dateOfBirth: String(
      pickFirst(profile, ["dateOfBirth", "date_Of_Birth", "dob", "DateOfBirth", "Date_Of_Birth"], "") || ""
    ).slice(0, 10),
    gender: normalizeGender(pickFirst(profile, ["gender", "Gender"], "")),
  };
};

const normalizeHealthResponse = (data) => {
  const health = data?.health || data || {};

  const rawAllergies = pickFirst(health, ["allergies", "Allergies", "allergyIds", "allergyIDs", "AllergyIds"], []);
  const rawDiseases = pickFirst(health, ["diseases", "Diseases", "diseaseIds", "diseaseIDs", "DiseaseIds"], []);

  const allergies = Array.isArray(rawAllergies)
    ? rawAllergies
        .map((x, idx) => normalizeSelectedItem(x, idx + 1))
        .filter(Boolean)
    : [];

  const diseases = Array.isArray(rawDiseases)
    ? rawDiseases
        .map((x, idx) => normalizeSelectedItem(x, idx + 1))
        .filter(Boolean)
    : [];

  return {
    isPregnant: Boolean(pickFirst(health, ["isPregnant", "is_Pregnant", "IsPregnant", "Is_Pregnant"], false)),
    allergies,
    diseases,
  };
};

const toProfilePatchBody = (payload) => ({
  userId: Number(payload.userId),
  UserId: Number(payload.userId),
  firstName: payload.firstName ?? null,
  FirstName: payload.firstName ?? null,
  lastName: payload.lastName ?? null,
  LastName: payload.lastName ?? null,
  phone: payload.phone ?? null,
  Phone: payload.phone ?? null,
  dateOfBirth: payload.dateOfBirth ?? null,
  DateOfBirth: payload.dateOfBirth ?? null,
  gender:
    payload.gender === "male"
      ? 1
      : payload.gender === "female"
      ? 2
      : payload.gender || null,
  Gender:
    payload.gender === "male"
      ? 1
      : payload.gender === "female"
      ? 2
      : payload.gender || null,

  // Compatibility for APIs expecting snake_case.
  first_Name: payload.firstName ?? null,
  last_Name: payload.lastName ?? null,
  date_Of_Birth: payload.dateOfBirth ?? null,
});

const toHealthPutBody = (payload) => ({
  userId: Number(payload.userId),
  UserId: Number(payload.userId),
  allergyIds: Array.isArray(payload.allergyIds) ? payload.allergyIds.map(Number) : [],
  AllergyIds: Array.isArray(payload.allergyIds) ? payload.allergyIds.map(Number) : [],
  diseaseIds: Array.isArray(payload.diseaseIds) ? payload.diseaseIds.map(Number) : [],
  DiseaseIds: Array.isArray(payload.diseaseIds) ? payload.diseaseIds.map(Number) : [],
  isPregnant: Boolean(payload.isPregnant),
  IsPregnant: Boolean(payload.isPregnant),
});

export async function getUserProfile(userId) {
  const res = await http.get(`/user/profile/${userId}`);
  return normalizeProfileResponse(res.data);
}

export async function patchUserProfile(userId, payload) {
  await http.patch(`/user/profile/${userId}`, toProfilePatchBody({ ...payload, userId }));
  return getUserProfile(userId);
}

export async function getUserHealth(userId) {
  const res = await http.get(`/user/${userId}/health`);
  return normalizeHealthResponse(res.data);
}

export async function putUserHealth(userId, payload) {
  await http.put(`/user/${userId}/health`, toHealthPutBody({ ...payload, userId }));
  const refreshed = await getUserHealth(userId);
  return {
    ...refreshed,
    // Keep the explicit UI state even if backend response omits this field.
    isPregnant: Boolean(payload.isPregnant),
  };
}

export async function getUserAllergiesCatalog() {
  const res = await http.get("/user/allergies");
  const list = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.allergies) ? res.data.allergies : [];
  return list.map((x, idx) => normalizeCatalogItem(x, idx + 1));
}

export async function getUserDiseasesCatalog() {
  const res = await http.get("/user/diseases");
  const list = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.diseases) ? res.data.diseases : [];
  return list.map((x, idx) => normalizeCatalogItem(x, idx + 1));
}

export async function addUserAllergy(userId, allergyId) {
  await http.post(`/user/${userId}/health/allergies`, {
    userId: Number(userId),
    UserId: Number(userId),
    allergyIds: [Number(allergyId)],
    AllergyIds: [Number(allergyId)],
  });
}

export async function removeUserAllergy(userId, allergyId) {
  await http.delete(`/user/${userId}/health/allergies/${allergyId}`);
}

export async function addUserDisease(userId, diseaseId) {
  await http.post(`/user/${userId}/health/diseases`, {
    userId: Number(userId),
    UserId: Number(userId),
    diseaseIds: [Number(diseaseId)],
    DiseaseIds: [Number(diseaseId)],
  });
}

export async function removeUserDisease(userId, diseaseId) {
  await http.delete(`/user/${userId}/health/diseases/${diseaseId}`);
}

export async function getUserHealthSummary(userId) {
  const res = await http.get(`/user/${userId}/health/summary`);
  return res.data || {};
}
