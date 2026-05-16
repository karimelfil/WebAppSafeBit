import { useEffect, useMemo, useState } from "react";
import axios from "axios";
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
import {
  Search,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  FileText,
} from "lucide-react";
import {
  getFeedbackReports,
  getFeedbackReportDetails,
  updateFeedbackStatus,
} from "../services/adminFeedbackService";
import {
  styles,
  getStatusPillClass,
  getFilterTabClass,
  getFilterTabCountClass,
} from "../styles/admin/FeedbackManagement.styles.js";

//convert data to a visible format 
const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

//get error messages from the api 
const getErrorMessage = (err) => {
  const msg =
    (axios.isAxiosError(err) &&
      (err.response?.data?.message || err.response?.data || err.message)) ||
    "Request failed.";
  return typeof msg === "string" ? msg : "Request failed.";
};

//status mapping for API updates
const STATUS_CONFIG = {
  pending:  { label: "Pending",      pill: "bg-amber-50 text-amber-700 border-amber-200",  dot: "bg-amber-400",   icon: Clock },
  reviewed: { label: "Under Review", pill: "bg-blue-50 text-blue-700 border-blue-200",    dot: "bg-blue-400",    icon: Eye },
  resolved: { label: "Resolved",     pill: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-400", icon: CheckCircle },
};

//list badge status mapping for API updates
function StatusPill({ status, size = "sm" }) {
  const cfg = STATUS_CONFIG[status] || { label: status };
  const classes = getStatusPillClass(status, size);
  return (
    <span className={classes.pill}>
      <span className={classes.dot} />
      {cfg.label}
    </span>
  );
}

//detail field component for report details dialog
function DetailField({ label, value, span }) {
  return (
    <div className={span ? styles.cls060 : ""}>
      <p className={styles.cls058}>{label}</p>
      <p className={styles.cls059}>{value || "—"}</p>
    </div>
  );
}

//stat card component for summary statistics at the top of the page
function StatCard({ label, value, icon: Icon, cardClass, labelClass, valueClass, iconWrapClass, iconClass }) {
  return (
    <div className={cardClass}>
      <div className={styles.cls017}>
        <div>
          <p className={labelClass}>{label}</p>
          <p className={valueClass}>{value}</p>
        </div>
        <div className={iconWrapClass}>
          <Icon className={iconClass} />
        </div>
      </div>
    </div>
  );
}

export function FeedbackManagement() {
  const [reports, setReports]             = useState([]);
  const [searchTerm, setSearchTerm]       = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [activeStatus, setActiveStatus]   = useState("all");
  const [loading, setLoading]             = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [errorMessage, setErrorMessage]   = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch feedback reports on component mount
  useEffect(() => {
    let mounted = true;
    (async () => {
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
    })();
    return () => { mounted = false; };
  }, []);

  // Compute counts for each status category for the summary statistics
  const counts = useMemo(() => ({
    pending:  reports.filter((r) => r.status === "pending").length,
    reviewed: reports.filter((r) => r.status === "reviewed").length,
    resolved: reports.filter((r) => r.status === "resolved").length,
  }), [reports]);

  // Filter reports based on search term and active status tab
  const filteredReports = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return reports.filter((item) => {
      const matchesSearch =
        !q ||
        item.userEmail?.toLowerCase().includes(q) ||
        item.dishName?.toLowerCase().includes(q) ||
        item.reportID?.toLowerCase().includes(q);
      const matchesStatus = activeStatus === "all" || item.status === activeStatus;
      return matchesSearch && matchesStatus;
    });
  }, [reports, searchTerm, activeStatus]);

  // Handle viewing report details when "View" button is clicked
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
        userID: "—",
        dishName: item.dishName,
        dishID: "—",
        submittedAt: item.submittedAt,
        reportMessage: "",
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  //update report status 
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
        prev.map((r) =>
          r.reportID === selectedReport.reportID ? { ...r, status: normalized } : r
        )
      );
      setSelectedReport((prev) => (prev ? { ...prev, status: normalized } : prev));
      setSuccessMessage("Status updated successfully.");
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Define status tabs for filtering reports by status
  const statusTabs = [
    { key: "all",      label: "All",          count: reports.length },
    { key: "pending",  label: "Pending",       count: counts.pending },
    { key: "reviewed", label: "Under Review",  count: counts.reviewed },
    { key: "resolved", label: "Resolved",      count: counts.resolved },
  ];

  return (
    <div className={styles.cls002}>

      <div className={styles.cls003}>
        <div>
          <h2 className={styles.cls004}>Issue Reports</h2>
          <p className={styles.cls005}>Manage user-submitted reports about dish detection issues</p>
        </div>
        <div className={styles.cls006}>
          <Search className={styles.cls007} />
          <input
            type="text"
            placeholder="Search by ID, dish or email…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.cls008}
          />
        </div>
      </div>

      {!!errorMessage && (
        <div className={styles.cls009}>
          <AlertCircle className={styles.cls010} />
          <span className={styles.cls011}>{errorMessage}</span>
        </div>
      )}
      {!!successMessage && (
        <div className={styles.cls012}>
          <CheckCircle className={styles.cls013} />
          <span className={styles.cls014}>{successMessage}</span>
        </div>
      )}

      <div className={styles.cls015}>
        <StatCard
          label="Total Reports"
          value={reports.length}
          icon={FileText}
          cardClass={styles.cls016}
          labelClass={styles.cls018}
          valueClass={styles.cls019}
          iconWrapClass={styles.cls098}
          iconClass={styles.cls066}
        />
        <StatCard
          label="Pending Review"
          value={counts.pending}
          icon={Clock}
          cardClass={styles.cls022}
          labelClass={styles.cls023}
          valueClass={styles.cls024}
          iconWrapClass={styles.cls025}
          iconClass={styles.cls021}
        />
        <StatCard
          label="Under Review"
          value={counts.reviewed}
          icon={Eye}
          cardClass={styles.cls067}
          labelClass={styles.cls068}
          valueClass={styles.cls069}
          iconWrapClass={styles.cls070}
          iconClass={styles.cls021}
        />
        <StatCard
          label="Resolved"
          value={counts.resolved}
          icon={CheckCircle}
          cardClass={styles.cls026}
          labelClass={styles.cls027}
          valueClass={styles.cls028}
          iconWrapClass={styles.cls029}
          iconClass={styles.cls021}
        />
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
                className={getFilterTabClass(isActive)}
              >
                {tab.label}
                <span className={getFilterTabCountClass(isActive)}>
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
              <TableRow className={styles.cls077}>
                <TableHead className={styles.cls035}>Report ID</TableHead>
                <TableHead className={styles.cls035}>Dish</TableHead>
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
                      Loading reports…
                    </span>
                  </TableCell>
                </TableRow>
              ) : filteredReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className={styles.cls037}>
                    <div className={styles.cls078}>
                      <FileText className={styles.cls079} />
                      <span>No reports found</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredReports.map((report) => (
                  <TableRow key={report.reportID} className={styles.cls040}>
                    <TableCell className={styles.cls041}>
                      <span className={styles.cls080}>
                        {report.reportID}
                      </span>
                    </TableCell>
                    <TableCell className={styles.cls041}>{report.dishName}</TableCell>
                    <TableCell className={styles.cls042}>{report.userEmail}</TableCell>
                    <TableCell className={styles.cls081}>
                      <StatusPill status={report.status} />
                    </TableCell>
                    <TableCell className={styles.cls042}>
                      {formatDate(report.submittedAt)}
                    </TableCell>
                    <TableCell className={styles.cls044}>
                      <button
                        type="button"
                        onClick={() => handleViewReport(report)}
                        className={styles.cls045}
                      >
                        <Eye className={styles.cls046} />
                        View
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {!loading && filteredReports.length > 0 && (
          <div className={styles.cls099}>
            <p className={styles.cls100}>
              Showing <span className={styles.cls101}>{filteredReports.length}</span> of{" "}
              <span className={styles.cls101}>{reports.length}</span> reports
            </p>
          </div>
        )}
      </div>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className={styles.cls047}>
          <div className={styles.cls082}>
            <DialogHeader>
              <DialogTitle className={styles.cls048}>
                <div className={styles.cls049}>
                  <AlertCircle className={styles.cls050} />
                </div>
                <div>
                  <div className={styles.cls051}>Issue Report</div>
                  <div className={styles.cls052}>
                    ID: <span className={styles.cls083}>{selectedReport?.reportID || "—"}</span>
                  </div>
                </div>
              </DialogTitle>
              <DialogDescription className={styles.cls053}>
                Detailed information about the reported issue
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className={styles.cls084}>
            {detailsLoading && (
              <div className={styles.cls054}>
                <span className={styles.cls038}>
                  <Loader2 className={styles.cls039} />
                  Loading report details…
                </span>
              </div>
            )}

            {!detailsLoading && selectedReport && (
              <div className={styles.cls055}>

                <div className={styles.cls085}>
                  <p className={styles.cls056}>Current Status</p>
                  <StatusPill status={selectedReport.status} size="md" />
                </div>

                <div className={styles.cls057}>
                  <DetailField label="User Email"  value={selectedReport.userEmail} />
                  <DetailField label="User ID"     value={selectedReport.userID} />
                  <DetailField label="Dish Name"   value={selectedReport.dishName} />
                  <DetailField label="Dish ID"     value={selectedReport.dishID} />
                  <DetailField label="Submitted At" value={formatDate(selectedReport.submittedAt)} span />
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
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus("reviewed")}
                    disabled={
                      updatingStatus ||
                      selectedReport.status === "reviewed" ||
                      selectedReport.status === "resolved"
                    }
                    className={styles.cls064}
                  >
                    <Eye className={styles.cls046} />
                    {updatingStatus ? "Updating…" : "Mark as Reviewed"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus("resolved")}
                    disabled={updatingStatus || selectedReport.status === "resolved"}
                    className={styles.cls065}
                  >
                    <CheckCircle className={styles.cls046} />
                    {updatingStatus ? "Updating…" : "Mark as Resolved"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default FeedbackManagement;
