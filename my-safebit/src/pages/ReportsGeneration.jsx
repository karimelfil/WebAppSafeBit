import { useMemo, useState } from "react";
import axios from "axios";

import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Download,
  FileText,
  Filter,
  Check,
  AlertTriangle,
  CalendarDays,
  Layers,
} from "lucide-react";

import {
  exportReport,
  generateAnalyticsReport,
} from "../services/adminReportsService";

const REPORT_TYPES = [
  { value: "UserDemographics", label: "User Demographics" },
  { value: "AllergyStatistics", label: "Allergy Statistics" },
  { value: "DiseaseStatistics", label: "Disease Statistics" },
  {
    value: "MostCommonAllergensInDishes",
    label: "Most Common Allergens In Dishes",
  },
  { value: "RestaurantSafetyRatios", label: "Restaurant Safety Ratios" },
  { value: "AppUsageAnalytics", label: "App Usage Analytics" },
  { value: "ScanActivityTrends", label: "Scan Activity Trends" },
];

const DATE_RANGES = [
  { value: "Last7Days", label: "Last 7 Days" },
  { value: "Last30Days", label: "Last 30 Days" },
  { value: "Last90Days", label: "Last 90 Days" },
  { value: "LastYear", label: "Last Year" },
  { value: "AllTime", label: "All Time" },
];

const EXPORT_FORMATS = [
  { value: "PDF", label: "PDF" },
  { value: "CSV", label: "CSV" },
  { value: "Excel", label: "Excel" },
];

const getErrorMessage = (err) => {
  const msg =
    (axios.isAxiosError(err) &&
      (err.response?.data?.message || err.response?.data || err.message)) ||
    "Request failed.";
  return typeof msg === "string" ? msg : "Request failed.";
};

export function ReportsGeneration() {
  const [reportType, setReportType] = useState("AllergyStatistics");
  const [dateRange, setDateRange] = useState("Last30Days");
  const [exportFormat, setExportFormat] = useState("PDF");

  const [generatedReport, setGeneratedReport] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const reportTypeLabel = useMemo(
    () => REPORT_TYPES.find((x) => x.value === reportType)?.label || reportType,
    [reportType]
  );
  const selectedDateRangeLabel = useMemo(
    () => DATE_RANGES.find((x) => x.value === dateRange)?.label || dateRange,
    [dateRange]
  );

  const handleGenerateReport = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setIsGenerating(true);
    try {
      const report = await generateAnalyticsReport({ reportType, dateRange });
      setGeneratedReport(report);
      setSuccessMessage("Report generated successfully.");
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
      setGeneratedReport(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportReport = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setIsExporting(true);
    try {
      const { blob, filename } = await exportReport({
        reportType,
        dateRange,
        format: exportFormat,
      });

      const fileUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(fileUrl);

      setSuccessMessage(`Report exported successfully as ${filename}.`);
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Generate Reports</h2>
        <p className="text-sm text-gray-600">
          Generate analytics reports and export them .
        </p>
      </div>

      {!!errorMessage && (
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{errorMessage}</AlertDescription>
        </Alert>
      )}
      {!!successMessage && (
        <Alert className="bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
        </Alert>
      )}

      <Card className="border-gray-200 shadow-sm overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 bg-gradient-to-b from-white to-emerald-50/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-800">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="h-11 bg-white border-gray-300 focus:ring-green-600">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent className="z-[120] bg-white border-gray-300 shadow-2xl backdrop-blur-none">
                  {REPORT_TYPES.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="py-2.5 focus:bg-green-50"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-800">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="h-11 bg-white border-gray-300 focus:ring-green-600">
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent className="z-[120] bg-white border-gray-300 shadow-2xl backdrop-blur-none">
                  {DATE_RANGES.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="py-2.5 focus:bg-green-50"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-800">Export Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger className="h-11 bg-white border-gray-300 focus:ring-green-600">
                  <SelectValue placeholder="Select export format" />
                </SelectTrigger>
                <SelectContent className="z-[120] bg-white border-gray-300 shadow-2xl backdrop-blur-none">
                  {EXPORT_FORMATS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="py-2.5 focus:bg-green-50"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
              <p className="text-xs text-gray-500">Selected Report</p>
              <p className="mt-1 text-sm font-medium text-gray-900">{reportTypeLabel}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs text-gray-500">Date Range</p>
                <p className="text-sm font-medium text-gray-900">{selectedDateRangeLabel}</p>
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 flex items-center gap-2">
              <Layers className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs text-gray-500">Export As</p>
                <p className="text-sm font-medium text-gray-900">{exportFormat}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="h-11 w-full bg-green-600 hover:bg-green-700 shadow-sm"
            >
              <FileText className="h-4 w-4 mr-2" />
              {isGenerating ? "Generating..." : "Generate Report"}
            </Button>

            <Button
              onClick={handleExportReport}
              disabled={isExporting}
              variant="outline"
              className="h-11 w-full border-gray-300 bg-white hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? "Exporting..." : "Export Report"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {generatedReport && (
        <Card className="border-gray-200 shadow-sm overflow-hidden">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <CardTitle className="text-xl">{reportTypeLabel}</CardTitle>
                <CardDescription>
                  Generated at{" "}
                  {generatedReport.generatedAt
                    ? new Date(generatedReport.generatedAt).toLocaleString()
                    : "-"}
                </CardDescription>
              </div>
              <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1">
                <span className="text-sm font-medium text-blue-800">
                  Total records: {generatedReport.totalRecords}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <Table className="min-w-full">
                <TableHeader className="bg-gray-50/90">
                  <TableRow className="border-b border-gray-200">
                    <TableHead className="text-gray-700">Category</TableHead>
                    <TableHead className="text-gray-700">Count</TableHead>
                    <TableHead className="text-gray-700">Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {generatedReport.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="py-8 text-center text-gray-500">
                        No records found for the selected filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    generatedReport.data.map((item, idx) => (
                      <TableRow
                        key={`${item.category}-${idx}`}
                        className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                      >
                        <TableCell className="font-medium text-gray-900">
                          {item.category}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex min-w-10 justify-center rounded-full bg-emerald-50 px-2 py-0.5 text-sm font-medium text-emerald-700">
                            {item.count}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-2.5 w-40 rounded-full bg-gray-100 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.max(0, Number(item.percentage) || 0)
                                  )}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              {Number(item.percentage).toFixed(2)}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ReportsGeneration;
