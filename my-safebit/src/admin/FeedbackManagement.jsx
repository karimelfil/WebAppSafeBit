import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Search, Eye, AlertCircle, CheckCircle, Clock, Loader2 } from "lucide-react";
import {
  getFeedbackReports,
  getFeedbackReportDetails,
  updateFeedbackStatus,
} from "../services/adminFeedbackService";

const formatDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
};

const getErrorMessage = (err) => {
  const msg =
    (axios.isAxiosError(err) &&
      (err.response?.data?.message || err.response?.data || err.message)) ||
    "Request failed.";
  return typeof msg === "string" ? msg : "Request failed.";
};

export function FeedbackManagement() {
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [activeStatus, setActiveStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setErrorMessage("");
      try {
        const data = await getFeedbackReports();
        if (mounted) setReports(data);
      } catch (err) {
        if (mounted) setErrorMessage(getErrorMessage(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredReports = useMemo(() => {
    return reports.filter((item) => {
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.userEmail.toLowerCase().includes(q) ||
        item.dishName.toLowerCase().includes(q) ||
        item.reportID.toLowerCase().includes(q);

      const matchesStatus = activeStatus === "all" || item.status === activeStatus;
      return matchesSearch && matchesStatus;
    });
  }, [reports, searchTerm, activeStatus]);

  const pendingReports = useMemo(
    () => reports.filter((f) => f.status === "pending").length,
    [reports]
  );
  const reviewedReports = useMemo(
    () => reports.filter((f) => f.status === "reviewed").length,
    [reports]
  );
  const resolvedReports = useMemo(
    () => reports.filter((f) => f.status === "resolved").length,
    [reports]
  );

  const handleViewReport = async (item) => {
    setShowDetailsDialog(true);
    setSelectedReport(null);
    setDetailsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const details = await getFeedbackReportDetails(item.reportRouteId || item.reportID);
      setSelectedReport(details);
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
      setSelectedReport({
        reportID: item.reportID,
        reportRouteId: item.reportRouteId,
        status: item.status,
        userEmail: item.userEmail,
        userID: "-",
        dishName: item.dishName,
        dishID: "-",
        submittedAt: item.submittedAt,
        reportMessage: "",
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedReport) return;

    setUpdatingStatus(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const normalized = await updateFeedbackStatus({
        reportId: selectedReport.reportRouteId || selectedReport.reportID,
        status: newStatus,
        updatedBy: "admin",
      });

      setReports((prev) =>
        prev.map((report) =>
          report.reportID === selectedReport.reportID
            ? { ...report, status: normalized }
            : report
        )
      );
      setSelectedReport((prev) => (prev ? { ...prev, status: normalized } : prev));
      setSuccessMessage("Feedback status updated successfully.");
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "reviewed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "reviewed":
        return <Eye className="h-4 w-4" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const statusTabs = [
    { key: "all", label: "All Reports", count: reports.length },
    { key: "pending", label: "Pending", count: pendingReports },
    { key: "reviewed", label: "Under Review", count: reviewedReports },
    { key: "resolved", label: "Resolved", count: resolvedReports },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Issue Reports</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage user-submitted reports about dish detection issues
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {!!errorMessage && (
        <Alert className="flex items-center gap-2 bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="m-0 text-red-800">{errorMessage}</AlertDescription>
        </Alert>
      )}
      {!!successMessage && (
        <Alert className="flex items-center gap-2 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="m-0 text-green-800">{successMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 mb-1">Total Reports</p>
              <p className="text-2xl font-bold text-blue-900">{reports.length}</p>
            </div>
            <div className="p-3 bg-blue-600 rounded-xl">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-700 mb-1">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-900">{pendingReports}</p>
            </div>
            <div className="p-3 bg-yellow-600 rounded-xl">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 mb-1">Under Review</p>
              <p className="text-2xl font-bold text-blue-900">{reviewedReports}</p>
            </div>
            <div className="p-3 bg-blue-600 rounded-xl">
              <Eye className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 mb-1">Resolved</p>
              <p className="text-2xl font-bold text-green-900">{resolvedReports}</p>
            </div>
            <div className="p-3 bg-green-600 rounded-xl">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-1.5 shadow-sm">
        <div className="flex flex-wrap gap-1">
          {statusTabs.map((tab) => {
            const isActive = activeStatus === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveStatus(tab.key)}
                className={[
                  "inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all",
                  isActive
                    ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200"
                    : "text-gray-600 hover:bg-white/70 hover:text-gray-900",
                ].join(" ")}
              >
                <span>{tab.label}</span>
                <span
                  className={[
                    "inline-flex min-w-6 items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold",
                    isActive ? "bg-gray-100 text-gray-700" : "bg-gray-200 text-gray-600",
                  ].join(" ")}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="font-semibold text-gray-900">Report ID</TableHead>
                <TableHead className="font-semibold text-gray-900">Dish Name</TableHead>
                <TableHead className="font-semibold text-gray-900">User Email</TableHead>
                <TableHead className="font-semibold text-gray-900">Status</TableHead>
                <TableHead className="font-semibold text-gray-900">Submitted</TableHead>
                <TableHead className="text-right font-semibold text-gray-900">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-gray-500">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading feedback reports...
                    </span>
                  </TableCell>
                </TableRow>
              ) : filteredReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-gray-500">
                    No reports found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredReports.map((report) => (
                  <TableRow key={report.reportID} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium text-gray-900">{report.reportID}</TableCell>
                    <TableCell className="font-medium text-gray-900">{report.dishName}</TableCell>
                    <TableCell className="text-sm text-gray-600">{report.userEmail}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(report.status)}
                        <span
                          className={`px-2 py-1 rounded text-xs border ${getStatusColor(report.status)}`}
                        >
                          {report.status}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDate(report.submittedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewReport(report)}
                        className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl border border-gray-200 bg-white text-gray-900 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <div className="font-bold text-gray-900">Issue Report</div>
                <div className="text-sm font-normal text-gray-600">ID: {selectedReport?.reportID || "-"}</div>
              </div>
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Detailed information about the reported issue
            </DialogDescription>
          </DialogHeader>

          {detailsLoading && (
            <div className="py-8 text-center text-gray-600">
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading report details...
              </span>
            </div>
          )}

          {!detailsLoading && selectedReport && (
            <div className="space-y-6 py-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Status</p>
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedReport.status)}
                  <span
                    className={`px-3 py-2 rounded text-sm border ${getStatusColor(selectedReport.status)}`}
                  >
                    {selectedReport.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">User Email</p>
                  <p className="text-sm text-gray-900">{selectedReport.userEmail}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">User ID</p>
                  <p className="text-sm text-gray-900">{selectedReport.userID}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Dish Name</p>
                  <p className="text-sm text-gray-900">{selectedReport.dishName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Dish ID</p>
                  <p className="text-sm text-gray-900">{selectedReport.dishID}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-700 mb-1">Submitted At</p>
                  <p className="text-sm text-gray-900">{formatDate(selectedReport.submittedAt)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Report Message</p>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-900 leading-relaxed">
                    {selectedReport.reportMessage || "No detailed message provided."}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleUpdateStatus("reviewed")}
                  disabled={
                    updatingStatus ||
                    selectedReport.status === "reviewed" ||
                    selectedReport.status === "resolved"
                  }
                >
                  {updatingStatus ? "Updating..." : "Mark as Reviewed"}
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => handleUpdateStatus("resolved")}
                  disabled={updatingStatus || selectedReport.status === "resolved"}
                >
                  {updatingStatus ? "Updating..." : "Mark as Resolved"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default FeedbackManagement;
