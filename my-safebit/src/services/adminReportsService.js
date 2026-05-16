import { http } from "./http";

// Utility function to pick the first non-empty string from a list of candidates
const pick = (obj, keys) => {
  for (const key of keys) {
    if (obj && obj[key] !== undefined && obj[key] !== null) return obj[key];
  }
  return undefined;
};

// Utility function to convert a value to a number with a fallback
const normalizeItem = (item) => ({
  category: String(pick(item, ["category", "Category"]) ?? "-"),
  count: Number(pick(item, ["count", "Count"]) ?? 0),
  percentage: Number(pick(item, ["percentage", "Percentage"]) ?? 0),
});

// Service function to generate an analytics report based on the specified type and date range
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
// Utility function to extract ingredient name from various possible field names in the API response
const parseFilename = (contentDisposition) => {
  if (!contentDisposition) return null;

  const utfMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utfMatch?.[1]) return decodeURIComponent(utfMatch[1]);

  const plainMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  if (plainMatch?.[1]) return plainMatch[1];

  return null;
};

// Utility function to determine the appropriate file extension based on the export format
const getExportExtension = (format) => {
  const normalizedFormat = String(format || "pdf").toLowerCase();

  if (normalizedFormat === "excel") {
    return "xlsx";
  }

  return normalizedFormat;
};

// Utility function to extract ingredient name from various possible field names in the API response
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
  const fallbackExt = getExportExtension(payload.format);
  const fallbackName = `analytics-report-${Date.now()}.${fallbackExt}`;

  return {
    blob: res.data,
    filename: parseFilename(contentDisposition) || fallbackName,
  };
}
