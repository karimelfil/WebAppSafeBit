import { useMemo, useState } from "react";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Download,
  FileText,
  Filter,
  Check,
  AlertTriangle,
  CalendarDays,
  Layers,
  X,
  Loader2,
  BarChart3,
} from "lucide-react";
import { exportReport, generateAnalyticsReport } from "../services/adminReportsService";
import {
  styles,
  getNoticeClass,
  getNoticeIconClass,
  getNoticeTextClass,
  getSummaryChipClass,
  getTableRowClass,
  getPercentWidthStyle,
} from "../styles/admin/ReportsGeneration.styles";

// Constants for report types
const REPORT_TYPES = [
  { value: "UserDemographics", label: "User Demographics" },
  { value: "AllergyStatistics", label: "Allergy Statistics" },
  { value: "DiseaseStatistics", label: "Disease Statistics" },
  { value: "MostCommonAllergensInDishes", label: "Most Common Allergens In Dishes" },
  { value: "RestaurantSafetyRatios", label: "Restaurant Safety Ratios" },
  { value: "AppUsageAnalytics", label: "App Usage Analytics" },
  { value: "ScanActivityTrends", label: "Scan Activity Trends" },
];

// Constants for date range options
const DATE_RANGES = [
  { value: "Last7Days", label: "Last 7 Days" },
  { value: "Last30Days", label: "Last 30 Days" },
  { value: "Last90Days", label: "Last 90 Days" },
  { value: "LastYear", label: "Last Year" },
  { value: "AllTime", label: "All Time" },
];

// Constants for export format options
const EXPORT_FORMATS = [
  { value: "PDF", label: "PDF Document" },
  { value: "CSV", label: "CSV Spreadsheet" },
  { value: "Excel", label: "Excel Workbook" },
];

//get error message from the api
const getErrorMessage = (err) => {
  const msg =
    (axios.isAxiosError(err) &&
      (err.response?.data?.message || err.response?.data || err.message)) ||
    "Request failed.";
  return typeof msg === "string" ? msg : "Request failed.";
};

// Notice component to display success or error messages
function Notice({ type, text, onDismiss }) {
  if (!text) return null;

  return (
    <div className={getNoticeClass(type)}>
      <span className={getNoticeIconClass(type)}>
        {type === "error" ? (
          <AlertTriangle className={styles.noticeAlertIcon} />
        ) : (
          <Check className={styles.noticeAlertIcon} />
        )}
      </span>
      <p className={getNoticeTextClass(type)}>{text}</p>
      <button onClick={onDismiss} className={styles.noticeClose}>
        <X className={styles.noticeCloseIcon} />
      </button>
    </div>
  );
}

// SelectField component for dropdown selections in the report configuration
function SelectField({ label, icon: Icon, value, onValueChange, options }) {
  return (
    <div className={styles.fieldWrap}>
      <label className={styles.fieldLabel}>
        {Icon && <Icon className={styles.fieldLabelIcon} />}
        {label}
      </label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={styles.selectTrigger}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className={styles.selectContent}>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className={styles.selectItem}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// SummaryChip component to display a summary of the selected report configuration
function SummaryChip({ icon: Icon, label, value, color }) {
  return (
    <div className={getSummaryChipClass(color)}>
      <Icon className={styles.summaryIcon} />
      <div>
        <p className={styles.summaryLabel}>{label}</p>
        <p className={styles.summaryValue}>{value}</p>
      </div>
    </div>
  );
}

export function ReportsGeneration() {
  const [reportType, setReportType] = useState("AllergyStatistics");
  const [dateRange, setDateRange] = useState("Last30Days");
  const [exportFormat, setExportFormat] = useState("PDF");
  const [generatedReport, setGeneratedReport] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Memoized labels for the selected report type, date range, and export format
  const reportTypeLabel = useMemo(
    () => REPORT_TYPES.find((item) => item.value === reportType)?.label || reportType,
    [reportType]
  );
  const selectedDateRangeLabel = useMemo(
    () => DATE_RANGES.find((item) => item.value === dateRange)?.label || dateRange,
    [dateRange]
  );
  const exportFormatLabel = useMemo(
    () => EXPORT_FORMATS.find((item) => item.value === exportFormat)?.label || exportFormat,
    [exportFormat]
  );

  // Function to clear success and error messages
  const clearNotices = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  // Handler for generating the report based on the selected type and date range
  const handleGenerateReport = async () => {
    clearNotices();
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

  // Handler for exporting the generated report in the selected format
  const handleExportReport = async () => {
    clearNotices();
    setIsExporting(true);
    try {
      const { blob, filename } = await exportReport({
        reportType,
        dateRange,
        format: exportFormat,
      });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(url);
      setSuccessMessage(`Report exported as ${filename}.`);
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div>
        <h2 className={styles.title}>Generate Reports</h2>
        <p className={styles.subtitle}>
          Build analytics reports and export them in your preferred format.
        </p>
      </div>

      <Notice type="error" text={errorMessage} onDismiss={() => setErrorMessage("")} />
      <Notice
        type="success"
        text={successMessage}
        onDismiss={() => setSuccessMessage("")}
      />

      <div className={styles.configCard}>
        <div className={styles.configStrip} />
        <div className={styles.configHeader}>
          <div className={styles.configHeaderRow}>
            <span className={styles.configHeaderIconWrap}>
              <Filter className={styles.configHeaderIcon} />
            </span>
            <div>
              <p className={styles.configHeaderTitle}>Report Configuration</p>
              <p className={styles.configHeaderBody}>Select type, date range, and format</p>
            </div>
          </div>
        </div>

        <div className={styles.configBody}>
          <div className={styles.selectGrid}>
            <SelectField
              label="Report Type"
              icon={BarChart3}
              value={reportType}
              onValueChange={setReportType}
              options={REPORT_TYPES}
            />
            <SelectField
              label="Date Range"
              icon={CalendarDays}
              value={dateRange}
              onValueChange={setDateRange}
              options={DATE_RANGES}
            />
            <SelectField
              label="Export Format"
              icon={Layers}
              value={exportFormat}
              onValueChange={setExportFormat}
              options={EXPORT_FORMATS}
            />
          </div>

          <div className={styles.summaryGrid}>
            <SummaryChip
              icon={BarChart3}
              label="Report"
              value={reportTypeLabel}
              color="emerald"
            />
            <SummaryChip
              icon={CalendarDays}
              label="Period"
              value={selectedDateRangeLabel}
              color="blue"
            />
            <SummaryChip
              icon={Layers}
              label="Format"
              value={exportFormatLabel}
              color="amber"
            />
          </div>

          <div className={styles.actionsGrid}>
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className={styles.primaryButton}
            >
              {isGenerating ? (
                <>
                  <Loader2 className={styles.loadingIcon} />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className={styles.actionIcon} />
                  Generate Report
                </>
              )}
            </button>
            <button
              onClick={handleExportReport}
              disabled={isExporting}
              className={styles.secondaryButton}
            >
              {isExporting ? (
                <>
                  <Loader2 className={styles.loadingIcon} />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className={styles.actionIcon} />
                  Export Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {generatedReport && (
        <div className={styles.resultsCard}>
          <div className={styles.resultsHeader}>
            <div>
              <p className={styles.resultsTitle}>{reportTypeLabel}</p>
              <p className={styles.resultsSub}>
                Generated{" "}
                {generatedReport.generatedAt
                  ? new Date(generatedReport.generatedAt).toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-"}
              </p>
            </div>
            <div className={styles.recordsBadge}>
              {generatedReport.totalRecords.toLocaleString()} records
            </div>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr className={styles.tableHeadRow}>
                  <th className={styles.tableHead}>Category</th>
                  <th className={styles.tableHead}>Count</th>
                  <th className={`${styles.tableHead} ${styles.tableHeadWide}`}>
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody>
                {generatedReport.data.length === 0 ? (
                  <tr>
                    <td colSpan={3}>
                      <div className={styles.emptyState}>
                        <FileText className={styles.emptyIcon} />
                        <p className={styles.emptyText}>No records found for the selected filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  generatedReport.data.map((item, index) => {
                    const pct = Math.min(100, Math.max(0, Number(item.percentage) || 0));

                    return (
                      <tr key={`${item.category}-${index}`} className={getTableRowClass(index)}>
                        <td className={styles.categoryCell}>{item.category}</td>
                        <td className={styles.countCell}>
                          <span className={styles.countBadge}>
                            {item.count.toLocaleString()}
                          </span>
                        </td>
                        <td className={styles.percentCell}>
                          <div className={styles.percentRow}>
                            <div className={styles.percentTrack}>
                              <div
                                className={styles.percentFill}
                                style={getPercentWidthStyle(pct)}
                              />
                            </div>
                            <span className={styles.percentValue}>{pct.toFixed(2)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className={styles.footer}>
            <p className={styles.footerText}>
              {generatedReport.data.length} categories displayed
            </p>
            <button
              onClick={handleExportReport}
              disabled={isExporting}
              className={styles.footerButton}
            >
              <Download className={styles.footerIcon} />
              {isExporting ? "Exporting..." : `Export as ${exportFormat}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportsGeneration;
