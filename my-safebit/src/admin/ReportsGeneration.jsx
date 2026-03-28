import { useMemo, useState } from "react";
import axios from "axios";
import { styles } from '../styles/admin/ReportsGeneration.styles.js';
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
    <div className={styles.cls001}>
      <div>
        <h2 className={styles.cls002}>Generate Reports</h2>
        <p className={styles.cls003}>
          Generate analytics reports and export them .
        </p>
      </div>

      {!!errorMessage && (
        <Alert className={styles.cls004}>
          <AlertTriangle className={styles.cls005} />
          <AlertDescription className={styles.cls006}>{errorMessage}</AlertDescription>
        </Alert>
      )}
      {!!successMessage && (
        <Alert className={styles.cls007}>
          <Check className={styles.cls008} />
          <AlertDescription className={styles.cls009}>{successMessage}</AlertDescription>
        </Alert>
      )}

      <Card className={styles.cls010}>
        <CardHeader>
          <CardTitle className={styles.cls011}>
            <Filter className={styles.cls012} />
            Report Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className={styles.cls013}>
          <div className={styles.cls014}>
            <div className={styles.cls015}>
              <Label className={styles.cls016}>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className={styles.cls017}>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent className={styles.cls018}>
                  {REPORT_TYPES.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className={styles.cls019}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className={styles.cls015}>
              <Label className={styles.cls016}>Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className={styles.cls017}>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent className={styles.cls018}>
                  {DATE_RANGES.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className={styles.cls019}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className={styles.cls015}>
              <Label className={styles.cls016}>Export Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger className={styles.cls017}>
                  <SelectValue placeholder="Select export format" />
                </SelectTrigger>
                <SelectContent className={styles.cls018}>
                  {EXPORT_FORMATS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className={styles.cls019}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className={styles.cls020}>
            <div className={styles.cls021}>
              <p className={styles.cls022}>Selected Report</p>
              <p className={styles.cls023}>{reportTypeLabel}</p>
            </div>
            <div className={styles.cls024}>
              <CalendarDays className={styles.cls008} />
              <div>
                <p className={styles.cls022}>Date Range</p>
                <p className={styles.cls025}>{selectedDateRangeLabel}</p>
              </div>
            </div>
            <div className={styles.cls024}>
              <Layers className={styles.cls008} />
              <div>
                <p className={styles.cls022}>Export As</p>
                <p className={styles.cls025}>{exportFormat}</p>
              </div>
            </div>
          </div>

          <div className={styles.cls026}>
            <Button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className={styles.cls027}
            >
              <FileText className={styles.cls028} />
              {isGenerating ? "Generating..." : "Generate Report"}
            </Button>

            <Button
              onClick={handleExportReport}
              disabled={isExporting}
              variant="outline"
              className={styles.cls029}
            >
              <Download className={styles.cls028} />
              {isExporting ? "Exporting..." : "Export Report"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {generatedReport && (
        <Card className={styles.cls010}>
          <CardHeader>
            <div className={styles.cls030}>
              <div>
                <CardTitle className={styles.cls031}>{reportTypeLabel}</CardTitle>
                <CardDescription>
                  Generated at{" "}
                  {generatedReport.generatedAt
                    ? new Date(generatedReport.generatedAt).toLocaleString()
                    : "-"}
                </CardDescription>
              </div>
              <div className={styles.cls032}>
                <span className={styles.cls033}>
                  Total records: {generatedReport.totalRecords}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className={styles.cls034}>
              <Table className={styles.cls035}>
                <TableHeader className={styles.cls036}>
                  <TableRow className={styles.cls037}>
                    <TableHead className={styles.cls038}>Category</TableHead>
                    <TableHead className={styles.cls038}>Count</TableHead>
                    <TableHead className={styles.cls038}>Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {generatedReport.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className={styles.cls039}>
                        No records found for the selected filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    generatedReport.data.map((item, idx) => (
                      <TableRow
                        key={`${item.category}-${idx}`}
                        className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                      >
                        <TableCell className={styles.cls040}>
                          {item.category}
                        </TableCell>
                        <TableCell>
                          <span className={styles.cls041}>
                            {item.count}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className={styles.cls042}>
                            <div className={styles.cls043}>
                              <div
                                className={styles.cls044}
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.max(0, Number(item.percentage) || 0)
                                  )}%`,
                                }}
                              />
                            </div>
                            <span className={styles.cls045}>
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


