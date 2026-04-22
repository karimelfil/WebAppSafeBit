import { useEffect, useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Alert, AlertDescription } from "../ui/alert";
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Eye,
  History,
  Loader2,
  Search,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import { styles } from "../../styles/user/ScanHistory.styles.js";
import { getScanDetails, getScanHistory } from "../../services/scanHistoryService";

const STATUS_META = {
  safe: {
    label: "Safe",
    Icon: ShieldCheck,
    iconClass: "h-4 w-4 text-emerald-600",
    badgeClass:
      "inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700",
    panelClass: "border-emerald-200 bg-emerald-50/80",
    dotClass: "bg-emerald-500",
    accentClass: "text-emerald-700",
  },
  risky: {
    label: "Risky",
    Icon: ShieldAlert,
    iconClass: "h-4 w-4 text-amber-600",
    badgeClass:
      "inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700",
    panelClass: "border-amber-200 bg-amber-50/80",
    dotClass: "bg-amber-500",
    accentClass: "text-amber-700",
  },
  unsafe: {
    label: "Unsafe",
    Icon: ShieldX,
    iconClass: "h-4 w-4 text-rose-600",
    badgeClass:
      "inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700",
    panelClass: "border-rose-200 bg-rose-50/80",
    dotClass: "bg-rose-500",
    accentClass: "text-rose-700",
  },
  unknown: {
    label: "Review",
    Icon: AlertTriangle,
    iconClass: "h-4 w-4 text-slate-600",
    badgeClass:
      "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700",
    panelClass: "border-slate-200 bg-slate-50/80",
    dotClass: "bg-slate-500",
    accentClass: "text-slate-700",
  },
};

const getStatusMeta = (status) =>
  STATUS_META[String(status || "unknown").toLowerCase()] || STATUS_META.unknown;

const getRecordTotals = (record) => ({
  safe: Number(record?.SafeCount) || 0,
  risky: Number(record?.RiskyCount) || 0,
  unsafe: Number(record?.UnsafeCount) || 0,
});

const getOverallStatus = (record) => {
  const { risky, unsafe } = getRecordTotals(record);
  if (unsafe > 0) return "unsafe";
  if (risky > 0) return "risky";
  return "safe";
};

const getAiNarrative = (record) => {
  const { safe, risky, unsafe } = getRecordTotals(record);
  const total = safe + risky + unsafe;

  if (!total) {
    return "No dish classification is available yet. Open the scan to review the extracted menu items.";
  }

  if (unsafe > 0) {
    return `AI flagged ${unsafe} ${unsafe === 1 ? "dish as unsafe" : "dishes as unsafe"} and recommends avoiding them before ordering.`;
  }

  if (risky > 0) {
    return `AI marked ${risky} ${risky === 1 ? "dish as risky" : "dishes as risky"} and suggests confirming ingredients with the restaurant.`;
  }

  return `AI reviewed ${total} ${total === 1 ? "dish" : "dishes"} and found a clean result with no warning flags.`;
};

const formatDateTime = (value) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value || "Unknown date";
  return parsed.toLocaleString();
};

const buildStatusBreakdown = (record) => {
  const { safe, risky, unsafe } = getRecordTotals(record);
  return [
    { key: "safe", label: "Safe dishes", count: safe, status: "safe" },
    { key: "risky", label: "Risky dishes", count: risky, status: "risky" },
    { key: "unsafe", label: "Unsafe dishes", count: unsafe, status: "unsafe" },
  ];
};

const getSummaryCards = (history, totalSafe, totalRisky, totalUnsafe) => [
  {
    key: "total",
    title: "Total scans",
    value: history.length,
    note: "Complete archive of reviewed menus",
    cardClass: styles.cls012,
    valueClass: styles.cls015,
    icon: History,
    iconWrapClass: styles.cls078,
    iconClass: styles.cls079,
  },
  {
    key: "safe",
    title: "Safe dishes",
    value: totalSafe,
    note: "Strong matches for your safer options",
    cardClass: styles.cls017,
    valueClass: styles.cls018,
    icon: ShieldCheck,
    iconWrapClass: styles.cls080,
    iconClass: styles.cls081,
  },
  {
    key: "risky",
    title: "Risky dishes",
    value: totalRisky,
    note: "Worth double-checking before ordering",
    cardClass: styles.cls019,
    valueClass: styles.cls020,
    icon: ShieldAlert,
    iconWrapClass: styles.cls082,
    iconClass: styles.cls083,
  },
  {
    key: "unsafe",
    title: "Unsafe dishes",
    value: totalUnsafe,
    note: "Avoid or review with extra caution",
    cardClass: styles.cls021,
    valueClass: styles.cls022,
    icon: ShieldX,
    iconWrapClass: styles.cls084,
    iconClass: styles.cls085,
  },
];

export function ScanHistory() {
  const PAGE_SIZE = 5;
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedScan, setSelectedScan] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);

  useEffect(() => {
    const fetchScanHistory = async () => {
      try {
        setLoading(true);
        const data = await getScanHistory();
        setHistory(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        setError(err?.message || "Failed to load scan history. Please try again.");
        console.error("Error fetching scan history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchScanHistory();
  }, []);

  const filteredHistory = history.filter((record) =>
    String(record?.RestaurantName || "").toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / PAGE_SIZE));
  const paginatedHistory = filteredHistory.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const totalSafe = history.reduce((acc, scan) => acc + (Number(scan.SafeCount) || 0), 0);
  const totalRisky = history.reduce((acc, scan) => acc + (Number(scan.RiskyCount) || 0), 0);
  const totalUnsafe = history.reduce((acc, scan) => acc + (Number(scan.UnsafeCount) || 0), 0);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleViewScan = async (scan) => {
    setShowDetailsDialog(true);
    setSelectedScan(scan);
    setDetailsError(null);
    setDetailsLoading(true);

    try {
      const details = await getScanDetails(scan.ScanID);
      setSelectedScan({
        ...scan,
        ...details,
        SafeCount: scan.SafeCount,
        UnsafeCount: scan.UnsafeCount,
        RiskyCount: scan.RiskyCount,
      });
    } catch (err) {
      setDetailsError(err?.message || "Failed to load scan details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <div className={styles.cls001}>
      <div className={styles.cls002}>
        <div>
          <h2 className={styles.cls004}>Scan History</h2>
          <p className={styles.cls005}>
            Review every scan with richer safety signals, cleaner dish details, and a clearer AI verdict.
          </p>
        </div>

        <div className={styles.cls006}>
          <Search className={styles.cls007} />
          <Input
            placeholder="Search by restaurant name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.cls008}
          />
        </div>
      </div>

      {loading && (
        <div className={styles.cls009}>
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <span>Loading scan history...</span>
        </div>
      )}

      {error && (
        <Alert className={styles.cls010}>
          <AlertTriangle className="h-4 w-4 text-rose-600" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && (
        <>
          <div className={styles.cls011}>
            {getSummaryCards(history, totalSafe, totalRisky, totalUnsafe).map((card) => (
              <Card key={card.key} className={card.cardClass}>
                <CardContent className={styles.cls013}>
                  <div className={styles.cls086}>
                    <div>
                      <p className={styles.cls014}>{card.title}</p>
                      <p className={card.valueClass}>{card.value}</p>
                    </div>
                    <div className={card.iconWrapClass}>
                      <card.icon className={card.iconClass} />
                    </div>
                  </div>
                  <p className={styles.cls016}>{card.note}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className={styles.cls023}>
            {filteredHistory.length === 0 ? (
              <Card className={styles.cls024}>
                <CardContent className={styles.cls025}>
                  <Search className="h-8 w-8 text-slate-400" />
                  <div>
                    <p className={styles.cls026}>No matching scans found</p>
                    <p className={styles.cls027}>Try another restaurant name or clear the search field.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              paginatedHistory.map((record) => {
                const totals = getRecordTotals(record);
                const totalDishes = totals.safe + totals.risky + totals.unsafe;
                const overallStatus = getOverallStatus(record);
                const statusMeta = getStatusMeta(overallStatus);
                const StatusIcon = statusMeta.Icon;

                return (
                  <Card key={record.ScanID} className={styles.cls028}>
                    <CardContent className={styles.cls029}>
                      <div className={styles.cls030}>
                        <div className={styles.cls031}>
                          <div className={styles.cls032}>
                            <span className={statusMeta.badgeClass}>
                              <StatusIcon className={statusMeta.iconClass} />
                              {statusMeta.label} scan
                            </span>
                            <span className={styles.cls033}>
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDateTime(record.ScanDate)}
                            </span>
                          </div>

                          <div>
                            <h3 className={styles.cls034}>{record.RestaurantName}</h3>
                            <p className={styles.cls035}>{getAiNarrative(record)}</p>
                          </div>
                        </div>

                        <Button size="sm" variant="outline" className={styles.cls036} onClick={() => handleViewScan(record)}>
                          <Eye className="h-4 w-4" />
                          <span>View details</span>
                        </Button>
                      </div>

                      <div className={styles.cls037}>
                        <div className={styles.cls038}>
                          <p className={styles.cls039}>Menu coverage</p>
                          <p className={styles.cls040}>
                            {totalDishes} {totalDishes === 1 ? "dish" : "dishes"} classified
                          </p>
                        </div>
                      </div>

                      <div className={styles.cls042}>
                        {buildStatusBreakdown(record).map((item) => {
                          const itemMeta = getStatusMeta(item.status);
                          const ItemIcon = itemMeta.Icon;
                          return (
                            <div key={item.key} className={`${styles.cls043} ${itemMeta.panelClass}`}>
                              <div className={styles.cls044}>
                                <span className={`h-2.5 w-2.5 rounded-full ${itemMeta.dotClass}`} />
                                <span className={styles.cls045}>{item.label}</span>
                              </div>
                              <div className={styles.cls046}>
                                <ItemIcon className={itemMeta.iconClass} />
                                <span className={styles.cls047}>{item.count}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {filteredHistory.length > PAGE_SIZE && (
            <div className={styles.cls098}>
              <p className={styles.cls099}>
                Showing {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, filteredHistory.length)} of {filteredHistory.length} scans
              </p>
              <div className={styles.cls100}>
                <Button
                  variant="outline"
                  size="sm"
                  className={styles.cls101}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <Button
                    key={page}
                    variant="outline"
                    size="sm"
                    className={page === currentPage ? styles.cls102 : styles.cls103}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className={styles.cls101}
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className={styles.cls048}>
          <DialogHeader className={styles.cls049}>
            <div className={styles.cls050}>
              <DialogTitle className={styles.cls052}>Scan Details</DialogTitle>
              <DialogDescription className={styles.cls053}>
                A focused view of the scan result, safety classification, and dish-by-dish findings.
              </DialogDescription>
            </div>
          </DialogHeader>

          {detailsLoading && (
            <div className={styles.cls054}>
              <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
              <span>Loading scan details...</span>
            </div>
          )}

          {detailsError && (
            <Alert className={styles.cls010}>
              <AlertTriangle className="h-4 w-4 text-rose-600" />
              <AlertDescription>{detailsError}</AlertDescription>
            </Alert>
          )}

          {selectedScan && (
            <div className={styles.cls055}>
              <div className={styles.cls087}>
                <div className={styles.cls088}>
                  <div className={styles.cls089}>
                    <p className={styles.cls057}>Restaurant</p>
                    <p className={styles.cls090}>{selectedScan.RestaurantName}</p>
                  </div>
                  <div className={styles.cls092}>
                    <div className={styles.cls104}>
                      <p className={styles.cls057}>Scanned at</p>
                      <p className={styles.cls058}>{formatDateTime(selectedScan.ScanDate)}</p>
                    </div>
                    <div className={styles.cls104}>
                      <p className={styles.cls057}>Scanned dishes</p>
                      <p className={styles.cls058}>
                        {(selectedScan.SafeCount || 0) + (selectedScan.RiskyCount || 0) + (selectedScan.UnsafeCount || 0)} dishes reviewed
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedScan.Summary && (
                <div className={styles.cls087}>
                  <p className={styles.cls057}>AI summary</p>
                  <p className={styles.cls058}>{selectedScan.Summary}</p>
                </div>
              )}

              {selectedScan.FilePath && (
                <div className={styles.cls087}>
                  <p className={styles.cls057}>Saved menu location</p>
                  <p className={`${styles.cls058} break-all`}>{selectedScan.FilePath}</p>
                </div>
              )}

              {Array.isArray(selectedScan.Dishes) && selectedScan.Dishes.length > 0 && (
                <div className={styles.cls068}>
                  <div className={styles.cls069}>
                    <p className={styles.cls061}>Scanned dishes</p>
                    <p className={styles.cls070}>Each dish shows only the essential result details.</p>
                  </div>

                  <div className={styles.cls071}>
                    {selectedScan.Dishes.map((dish) => {
                      const dishMeta = getStatusMeta(dish.SafetyStatus);
                      const DishIcon = dishMeta.Icon;

                      return (
                        <div key={dish.DishID} className={`${styles.cls072} ${dishMeta.panelClass}`}>
                          <div className={styles.cls073}>
                            <div>
                              <div className={styles.cls105}>
                                <DishIcon className={dishMeta.iconClass} />
                                <p className={styles.cls074}>{dish.DishName}</p>
                              </div>
                              <div className={dishMeta.badgeClass}>
                                <span>{dishMeta.label}</span>
                              </div>
                            </div>
                          </div>

                          <div className={styles.cls075}>
                            {String(dish.SafetyStatus).toLowerCase() !== "safe" && dish.Analysis && (
                              <>
                                <p className={styles.cls076}>AI analysis</p>
                                <p className={styles.cls077}>{dish.Analysis}</p>
                              </>
                            )}

                            <p className={styles.cls076}>Ingredients</p>
                            {Array.isArray(dish.Ingredients) && dish.Ingredients.length > 0 ? (
                              <div className={styles.cls106}>
                                {dish.Ingredients.map((ingredient, index) => (
                                  <span key={`${dish.DishID}-${ingredient}-${index}`} className={styles.cls107}>
                                    {ingredient}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className={styles.cls077}>No ingredient details were returned for this dish.</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
