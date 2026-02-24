import { http } from "./http";

const STATUS_MAP = {
  pending: 0,
  reviewed: 1,
  resolved: 2,
};

const STATUS_REVERSE_MAP = {
  0: "pending",
  1: "reviewed",
  2: "resolved",
};

const extractNumericId = (value) => {
  const text = String(value ?? "");
  const match = text.match(/\d+/);
  return match ? Number(match[0]) : null;
};

const normalizeStatus = (value) => {
  if (typeof value === "number") return STATUS_REVERSE_MAP[value] || "pending";
  const s = String(value ?? "").toLowerCase();
  if (s === "pending" || s === "reviewed" || s === "resolved") return s;
  return "pending";
};

const toIso = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

const normalizeListItem = (item) => {
  const reportID = String(item?.reportID ?? item?.reportId ?? item?.id ?? "");
  return {
    reportID,
    reportRouteId: extractNumericId(reportID) ?? reportID,
    dishName: String(item?.dishName ?? "-"),
    userEmail: String(item?.userEmail ?? "-"),
    status: normalizeStatus(item?.status),
    submittedAt: toIso(item?.submittedAt),
  };
};

const normalizeDetailItem = (item, fallbackReportID) => {
  const reportID = String(item?.reportID ?? item?.reportId ?? fallbackReportID ?? "");
  return {
    reportID,
    reportRouteId: extractNumericId(reportID) ?? reportID,
    status: normalizeStatus(item?.status),
    userEmail: String(item?.userEmail ?? "-"),
    userID: String(item?.userID ?? item?.userId ?? "-"),
    dishName: String(item?.dishName ?? "-"),
    dishID: String(item?.dishID ?? item?.dishId ?? "-"),
    submittedAt: toIso(item?.submittedAt),
    reportMessage: String(item?.reportMessage ?? item?.message ?? ""),
  };
};

export async function getFeedbackReports() {
  const res = await http.get("/feedback");
  const rows = Array.isArray(res?.data) ? res.data : [];
  return rows.map(normalizeListItem);
}

export async function getFeedbackReportDetails(reportId) {
  const routeId = extractNumericId(reportId) ?? reportId;
  const res = await http.get(`/feedback/${encodeURIComponent(routeId)}`);
  return normalizeDetailItem(res?.data ?? {}, reportId);
}

export async function updateFeedbackStatus({ reportId, status, updatedBy }) {
  const routeId = extractNumericId(reportId) ?? reportId;
  const statusEnum = STATUS_MAP[String(status ?? "").toLowerCase()];
  const payload = {
    status: typeof statusEnum === "number" ? statusEnum : 0,
    updatedBy: String(updatedBy || "admin"),
  };

  try {
    await http.put(`/feedback/${encodeURIComponent(routeId)}/status`, payload);
  } catch (err) {
    const statusCode = err?.response?.status;
    if (statusCode === 404 || statusCode === 405) {
      await http.patch(`/feedback/${encodeURIComponent(routeId)}/status`, payload);
    } else {
      throw err;
    }
  }

  return normalizeStatus(status);
}

