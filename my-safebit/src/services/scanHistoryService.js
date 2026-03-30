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

const extractHistoryList = (payload) => {
  if (Array.isArray(payload)) return payload;

  const nested = pickFirst(payload, ["history", "scanHistory", "data", "items", "results"], []);
  if (Array.isArray(nested)) return nested;

  return [];
};

async function tryFetch(url) {
  const res = await http.get(url);
  return extractHistoryList(res.data);
}

export async function getScanHistory() {
  const userId = localStorage.getItem("sb_userId");
  const candidateUrls = userId
    ? [`/user/${userId}/history`, `/history/${userId}`, `/user/history/${userId}`, "/history"]
    : ["/history"];

  let lastError = null;

  for (const url of candidateUrls) {
    try {
      const records = await tryFetch(url);
      return records.map(normalizeHistoryRecord);
    } catch (error) {
      lastError = error;

      const status = error?.response?.status;
      if (status && ![404, 500].includes(status)) {
        break;
      }
    }
  }

  const apiMessage =
    lastError?.response?.data?.message ||
    (typeof lastError?.response?.data === "string" ? lastError.response.data : "") ||
    (axios.isAxiosError(lastError) ? lastError.message : "") ||
    "Failed to load scan history.";

  throw new Error(apiMessage);
}
