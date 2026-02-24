import { http } from "./http";

const pick = (obj, keys) => {
  for (const key of keys) {
    if (obj && obj[key] !== undefined && obj[key] !== null) return obj[key];
  }
  return undefined;
};

const normalizeItem = (item) => ({
  category: String(pick(item, ["category", "Category"]) ?? "-"),
  count: Number(pick(item, ["count", "Count"]) ?? 0),
  percentage: Number(pick(item, ["percentage", "Percentage"]) ?? 0),
});

export async function generateAnalyticsReport(payload) {
  const res = await http.post("/admin/generate-analytics-report", {
    reportType: payload.reportType,
    dateRange: payload.dateRange,
  });

  const data = res?.data ?? {};
  const rows = Array.isArray(pick(data, ["data", "Data"]))
    ? pick(data, ["data", "Data"])
    : [];

  return {
    reportType: String(pick(data, ["reportType", "ReportType"]) ?? payload.reportType),
    dateRange: String(pick(data, ["dateRange", "DateRange"]) ?? payload.dateRange),
    generatedAt: pick(data, ["generatedAt", "GeneratedAt"]) ?? null,
    totalRecords: Number(pick(data, ["totalRecords", "TotalRecords"]) ?? rows.length),
    data: rows.map(normalizeItem),
  };
}

const parseFilename = (contentDisposition) => {
  if (!contentDisposition) return null;

  const utfMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utfMatch?.[1]) return decodeURIComponent(utfMatch[1]);

  const plainMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  if (plainMatch?.[1]) return plainMatch[1];

  return null;
};

export async function exportReport(payload) {
  const res = await http.post(
    "/admin/export-report",
    {
      reportType: payload.reportType,
      dateRange: payload.dateRange,
      format: payload.format,
    },
    { responseType: "blob" }
  );

  const contentDisposition = res?.headers?.["content-disposition"];
  const fallbackExt = String(payload.format || "pdf").toLowerCase();
  const fallbackName = `analytics-report-${Date.now()}.${fallbackExt}`;

  return {
    blob: res.data,
    filename: parseFilename(contentDisposition) || fallbackName,
  };
}
