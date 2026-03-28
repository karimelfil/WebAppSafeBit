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
import { styles } from '../styles/admin/FeedbackManagement.styles.js';
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
        return <Clock className={styles.cls001} />;
      case "reviewed":
        return <Eye className={styles.cls001} />;
      case "resolved":
        return <CheckCircle className={styles.cls001} />;
      default:
        return <AlertCircle className={styles.cls001} />;
    }
  };

  const statusTabs = [
    { key: "all", label: "All Reports", count: reports.length },
    { key: "pending", label: "Pending", count: pendingReports },
    { key: "reviewed", label: "Under Review", count: reviewedReports },
    { key: "resolved", label: "Resolved", count: resolvedReports },
  ];

  return (
    <div className={styles.cls002}>
      <div className={styles.cls003}>
        <div>
          <h2 className={styles.cls004}>Issue Reports</h2>
          <p className={styles.cls005}>
            Manage user-submitted reports about dish detection issues
          </p>
        </div>
        <div className={styles.cls006}>
          <Search className={styles.cls007} />
          <Input
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.cls008}
          />
        </div>
      </div>

      {!!errorMessage && (
        <Alert className={styles.cls009}>
          <AlertCircle className={styles.cls010} />
          <AlertDescription className={styles.cls011}>{errorMessage}</AlertDescription>
        </Alert>
      )}
      {!!successMessage && (
        <Alert className={styles.cls012}>
          <CheckCircle className={styles.cls013} />
          <AlertDescription className={styles.cls014}>{successMessage}</AlertDescription>
        </Alert>
      )}

      <div className={styles.cls015}>
        <div className={styles.cls016}>
          <div className={styles.cls017}>
            <div>
              <p className={styles.cls018}>Total Reports</p>
              <p className={styles.cls019}>{reports.length}</p>
            </div>
            <div className={styles.cls020}>
              <AlertCircle className={styles.cls021} />
            </div>
          </div>
        </div>

        <div className={styles.cls022}>
          <div className={styles.cls017}>
            <div>
              <p className={styles.cls023}>Pending Review</p>
              <p className={styles.cls024}>{pendingReports}</p>
            </div>
            <div className={styles.cls025}>
              <Clock className={styles.cls021} />
            </div>
          </div>
        </div>

        <div className={styles.cls016}>
          <div className={styles.cls017}>
            <div>
              <p className={styles.cls018}>Under Review</p>
              <p className={styles.cls019}>{reviewedReports}</p>
            </div>
            <div className={styles.cls020}>
              <Eye className={styles.cls021} />
            </div>
          </div>
        </div>

        <div className={styles.cls026}>
          <div className={styles.cls017}>
            <div>
              <p className={styles.cls027}>Resolved</p>
              <p className={styles.cls028}>{resolvedReports}</p>
            </div>
            <div className={styles.cls029}>
              <CheckCircle className={styles.cls021} />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.cls030}>
        <div className={styles.cls031}>
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

      <div className={styles.cls032}>
        <div className={styles.cls033}>
          <Table>
            <TableHeader className={styles.cls034}>
              <TableRow>
                <TableHead className={styles.cls035}>Report ID</TableHead>
                <TableHead className={styles.cls035}>Dish Name</TableHead>
                <TableHead className={styles.cls035}>User Email</TableHead>
                <TableHead className={styles.cls035}>Status</TableHead>
                <TableHead className={styles.cls035}>Submitted</TableHead>
                <TableHead className={styles.cls036}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className={styles.cls037}>
                    <span className={styles.cls038}>
                      <Loader2 className={styles.cls039} />
                      Loading feedback reports...
                    </span>
                  </TableCell>
                </TableRow>
              ) : filteredReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className={styles.cls037}>
                    No reports found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredReports.map((report) => (
                  <TableRow key={report.reportID} className={styles.cls040}>
                    <TableCell className={styles.cls041}>{report.reportID}</TableCell>
                    <TableCell className={styles.cls041}>{report.dishName}</TableCell>
                    <TableCell className={styles.cls042}>{report.userEmail}</TableCell>
                    <TableCell>
                      <div className={styles.cls043}>
                        {getStatusIcon(report.status)}
                        <span
                          className={`px-2 py-1 rounded text-xs border ${getStatusColor(report.status)}`}
                        >
                          {report.status}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className={styles.cls042}>
                      {formatDate(report.submittedAt)}
                    </TableCell>
                    <TableCell className={styles.cls044}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewReport(report)}
                        className={styles.cls045}
                      >
                        <Eye className={styles.cls046} />
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
        <DialogContent className={styles.cls047}>
          <DialogHeader>
            <DialogTitle className={styles.cls048}>
              <div className={styles.cls049}>
                <AlertCircle className={styles.cls050} />
              </div>
              <div>
                <div className={styles.cls051}>Issue Report</div>
                <div className={styles.cls052}>ID: {selectedReport?.reportID || "-"}</div>
              </div>
            </DialogTitle>
            <DialogDescription className={styles.cls053}>
              Detailed information about the reported issue
            </DialogDescription>
          </DialogHeader>

          {detailsLoading && (
            <div className={styles.cls054}>
              <span className={styles.cls038}>
                <Loader2 className={styles.cls039} />
                Loading report details...
              </span>
            </div>
          )}

          {!detailsLoading && selectedReport && (
            <div className={styles.cls055}>
              <div>
                <p className={styles.cls056}>Status</p>
                <div className={styles.cls043}>
                  {getStatusIcon(selectedReport.status)}
                  <span
                    className={`px-3 py-2 rounded text-sm border ${getStatusColor(selectedReport.status)}`}
                  >
                    {selectedReport.status}
                  </span>
                </div>
              </div>

              <div className={styles.cls057}>
                <div>
                  <p className={styles.cls058}>User Email</p>
                  <p className={styles.cls059}>{selectedReport.userEmail}</p>
                </div>
                <div>
                  <p className={styles.cls058}>User ID</p>
                  <p className={styles.cls059}>{selectedReport.userID}</p>
                </div>
                <div>
                  <p className={styles.cls058}>Dish Name</p>
                  <p className={styles.cls059}>{selectedReport.dishName}</p>
                </div>
                <div>
                  <p className={styles.cls058}>Dish ID</p>
                  <p className={styles.cls059}>{selectedReport.dishID}</p>
                </div>
                <div className={styles.cls060}>
                  <p className={styles.cls058}>Submitted At</p>
                  <p className={styles.cls059}>{formatDate(selectedReport.submittedAt)}</p>
                </div>
              </div>

              <div>
                <p className={styles.cls056}>Report Message</p>
                <div className={styles.cls061}>
                  <p className={styles.cls062}>
                    {selectedReport.reportMessage || "No detailed message provided."}
                  </p>
                </div>
              </div>

              <div className={styles.cls063}>
                <Button
                  variant="outline"
                  className={styles.cls064}
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
                  className={styles.cls065}
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


