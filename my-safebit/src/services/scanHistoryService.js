import axios from "axios";
import { http } from "./http";

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const pickFirst = (obj, keys, fallback = null) => {
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== undefined && value !== null) return value;
  }
  return fallback;
};

const toText = (value) => {
  if (typeof value !== "string") return "";
  return value.trim();
};

const toTokenLabel = (value) =>
  toText(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const normalizeStringList = (value) =>
  Array.isArray(value) ? value.map(toText).filter(Boolean) : [];

const extractDishAnalysis = (dish) => {
  const directAnalysis = [
    "Analysis",
    "analysis",
    "AiAnalysis",
    "aiAnalysis",
    "AIAnalysis",
    "Explanation",
    "explanation",
    "Reason",
    "reason",
    "Description",
    "description",
    "Summary",
    "summary",
  ]
    .map((key) => toText(dish?.[key]))
    .find(Boolean);

  if (directAnalysis) return directAnalysis;

  const conflicts = pickFirst(dish, ["Conflicts", "conflicts"], []);
  if (Array.isArray(conflicts)) {
    const conflictExplanations = conflicts
      .map((conflict) =>
        toText(
          conflict?.Explanation ??
            conflict?.explanation ??
            conflict?.Reason ??
            conflict?.reason ??
            conflict?.Description ??
            conflict?.description
        )
      )
      .filter(Boolean);

    if (conflictExplanations.length > 0) return conflictExplanations.join(" ");
  }

  const notes = normalizeStringList(pickFirst(dish, ["Notes", "notes"], []));
  if (notes.length > 0) {
    return notes.join(" ");
  }

  const shortSummary = toText(pickFirst(dish, ["ShortSummary", "shortSummary"], ""));
  if (shortSummary) return shortSummary;

  const detectedTriggers = normalizeStringList(
    pickFirst(dish, ["DetectedTriggers", "detectedTriggers"], [])
  ).map(toTokenLabel);
  if (detectedTriggers.length > 0) {
    return `Detected triggers: ${detectedTriggers.join(", ")}.`;
  }

  return "";
};

const extractList = (payload) => {
  if (Array.isArray(payload)) return payload;
  const nested = pickFirst(payload, ["history", "scanHistory", "data", "items", "results"], []);
  return Array.isArray(nested) ? nested : [];
};

const normalizeHistoryRecord = (record, index) => ({
  ScanID: pickFirst(record, ["ScanID", "scanID", "scanId", "id", "Id"], index + 1),
  RestaurantName: String(
    pickFirst(record, ["RestaurantName", "restaurantName", "name", "Name"], "Unknown restaurant")
  ),
  ScanDate: String(
    pickFirst(record, ["ScanDate", "scanDate", "createdAt", "CreatedAt", "date", "Date"], new Date().toISOString())
  ),
  SafeCount: toNumber(pickFirst(record, ["SafeCount", "safeCount", "safe", "Safe"])),
  UnsafeCount: toNumber(pickFirst(record, ["UnsafeCount", "unsafeCount", "unsafe", "Unsafe"])),
  RiskyCount: toNumber(pickFirst(record, ["RiskyCount", "riskyCount", "warningCount", "warnings", "Warnings"])),
});

const normalizeDish = (dish, index) => ({
  DishID: pickFirst(dish, ["DishID", "dishID", "dishId", "id", "Id"], index + 1),
  DishName: String(pickFirst(dish, ["DishName", "dishName", "name", "Name"], `Dish ${index + 1}`)),
  SafetyStatus: String(
    pickFirst(dish, ["SafetyStatus", "safetyStatus", "status", "Status"], "UNKNOWN")
  ).toUpperCase(),
  Ingredients: Array.isArray(pickFirst(dish, ["Ingredients", "ingredients"], []))
    ? pickFirst(dish, ["Ingredients", "ingredients"], [])
    : [],
  DetectedTriggers: normalizeStringList(
    pickFirst(dish, ["DetectedTriggers", "detectedTriggers"], [])
  ).map(toTokenLabel),
  Notes: normalizeStringList(pickFirst(dish, ["Notes", "notes"], [])),
  Confidence: Number(pickFirst(dish, ["Confidence", "confidence"], 0)) || 0,
  Analysis: extractDishAnalysis(dish),
});

const normalizeDetails = (payload) => ({
  ScanID: pickFirst(payload, ["ScanID", "scanID", "scanId", "id", "Id"], null),
  RestaurantName: String(
    pickFirst(payload, ["RestaurantName", "restaurantName", "name", "Name"], "Unknown restaurant")
  ),
  ScanDate: String(
    pickFirst(payload, ["ScanDate", "scanDate", "createdAt", "CreatedAt", "date", "Date"], new Date().toISOString())
  ),
  FilePath: String(pickFirst(payload, ["FilePath", "filePath"], "") || ""),
  Summary: toText(
    pickFirst(payload, ["Summary", "summary"], {})?.short_summary ??
      pickFirst(payload, ["Summary", "summary"], {})?.shortSummary
  ),
  Dishes: Array.isArray(pickFirst(payload, ["Dishes", "dishes"], []))
    ? pickFirst(payload, ["Dishes", "dishes"], []).map(normalizeDish)
    : [],
});

const toApiError = (error, fallbackMessage) => {
  const apiMessage =
    error?.response?.data?.message ||
    (typeof error?.response?.data === "string" ? error.response.data : "") ||
    (axios.isAxiosError(error) ? error.message : "") ||
    fallbackMessage;

  return new Error(apiMessage);
};

export async function getScanHistory() {
  try {
    const res = await http.get("/scan/history");
    return extractList(res.data).map(normalizeHistoryRecord);
  } catch (error) {
    throw toApiError(error, "Failed to load scan history.");
  }
}

export async function getScanDetails(scanId) {
  try {
    const res = await http.get(`/scan/${scanId}`);
    return normalizeDetails(res.data || {});
  } catch (error) {
    throw toApiError(error, "Failed to load scan details.");
  }
}
