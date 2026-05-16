import { useEffect, useState } from "react";
import {
  Upload,
  History,
  Shield,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  User,
  Baby,
  Activity,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { getScanHistory } from "../services/scanHistoryService";
import {
  styles,
  getActionCardClass,
  getActionIconBoxClass,
  getSkeletonClass,
  getBadgeWrapClass,
} from "../styles/user/UserHome.styles";


// skeleton component for loading 
function Skeleton({ className }) {
  return <div className={getSkeletonClass(className)} />;
}

export function UserHome({ onNavigate, profile, health, loadingUser }) {
  
  const [recentScans, setRecentScans] = useState([]);
  const [recentScansError, setRecentScansError] = useState(null);
  const [scansLoading, setScansLoading] = useState(true);//show skeleton loading ui

//fetech scans when the page open 
  useEffect(() => {
    let cancelled = false;

    const fetchRecentScans = async () => {
      try {
        const history = await getScanHistory();

        if (cancelled) return;

        setRecentScans(Array.isArray(history) ? history.slice(0, 3) : []);
        setRecentScansError(null);
      } catch (err) {
        if (cancelled) return;

        setRecentScans([]);
        setRecentScansError(err?.message || "Failed to load recent scans.");
      } finally {
        if (!cancelled) setScansLoading(false);
      }
    };

    fetchRecentScans();

    return () => {
      cancelled = true;
    };
  }, []);

  //display welcome values
  const firstName = profile?.firstName?.trim() || "";
  const greeting = firstName ? `Welcome back, ${firstName}!` : "Welcome to SafeBite!";
  const isFemale = profile?.gender === "female";
  const allergies = health?.allergies ?? [];
  const diseases = health?.diseases ?? [];
  const isPregnant = health?.isPregnant ?? false;

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroOverlay}>
          <div className={styles.heroBubbleTop} />
          <div className={styles.heroBubbleBottom} />
        </div>

        <div className={styles.heroContent}>
          <div className={styles.heroTitleRow}>
            <Sparkles className={styles.heroIcon} />

            {loadingUser ? (
              <Skeleton className={styles.heroTitleSkeleton} />
            ) : (
              <h2 className={styles.heroTitle}>{greeting}</h2>
            )}
          </div>

          <p className={styles.heroDescription}>
            Your personal food safety assistant. Scan menus to get instant allergen
            warnings and safe meal recommendations.
          </p>

          <Button
            onClick={() => onNavigate?.("upload")}
            variant="ghost"
            className={styles.heroButton}
          >
            <Upload className={styles.heroButtonIcon} />
            Scan a Menu Now
          </Button>
        </div>
      </div>

      <div className={styles.cardGrid}>
        <Card className={styles.infoCard}>
          <CardHeader className={styles.infoHeader}>
            <CardTitle className={styles.infoTitle}>
              <span className={getBadgeWrapClass("allergies")}>
                <AlertTriangle className={styles.allergiesIcon} />
              </span>
              Allergies
            </CardTitle>
          </CardHeader>

          <CardContent>
            {loadingUser ? (
              <div className={styles.chipList}>
                <Skeleton className={styles.chipSkeletonShort} />
                <Skeleton className={styles.chipSkeletonMedium} />
              </div>
            ) : allergies.length === 0 ? (
              <p className={styles.emptyText}>No allergies recorded.</p>
            ) : (
              <div className={styles.chipList}>
                {allergies.map((allergy) => (
                  <span key={allergy.id} className={styles.allergyChip}>
                    {allergy.name}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={styles.infoCard}>
          <CardHeader className={styles.infoHeader}>
            <CardTitle className={styles.infoTitle}>
              <span className={getBadgeWrapClass("diseases")}>
                <Activity className={styles.diseasesIcon} />
              </span>
              Diseases
            </CardTitle>
          </CardHeader>

          <CardContent>
            {loadingUser ? (
              <div className={styles.chipList}>
                <Skeleton className={styles.chipSkeletonMedium} />
                <Skeleton className={styles.chipSkeletonLong} />
              </div>
            ) : diseases.length === 0 ? (
              <p className={styles.emptyText}>No diseases recorded.</p>
            ) : (
              <div className={styles.chipList}>
                {diseases.map((disease) => (
                  <span key={disease.id} className={styles.diseaseChip}>
                    {disease.name}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {(isFemale || loadingUser) && (
          <Card className={styles.infoCard}>
            <CardHeader className={styles.infoHeader}>
              <CardTitle className={styles.infoTitle}>
                <span className={getBadgeWrapClass("pregnancy")}>
                  <Baby className={styles.pregnancyIcon} />
                </span>
                Pregnancy
              </CardTitle>
            </CardHeader>

            <CardContent>
              {loadingUser ? (
                <Skeleton className={styles.pregnancySkeleton} />
              ) : isPregnant ? (
                <span className={styles.pregnantChip}>Currently pregnant</span>
              ) : (
                <p className={styles.emptyText}>Not currently pregnant.</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <Card className={styles.quickActionsCard}>
        <CardHeader>
          <CardTitle className={styles.quickActionsTitle}>
            <Sparkles className={styles.quickActionsIcon} />
            Quick Actions
          </CardTitle>
          <CardDescription>Access your most-used features</CardDescription>
        </CardHeader>

        <CardContent>
          <div className={styles.quickActionsGrid}>
            <Button
              variant="outline"
              className={getActionCardClass("upload")}
              onClick={() => onNavigate?.("upload")}
            >
              <div className={getActionIconBoxClass("upload")}>
                <Upload className={styles.actionUploadIcon} />
              </div>
              <div className={styles.actionText}>
                <p className={styles.actionTitle}>Scan New Menu</p>
                <p className={styles.actionBody}>Upload or capture a menu</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className={getActionCardClass("history")}
              onClick={() => onNavigate?.("history")}
            >
              <div className={getActionIconBoxClass("history")}>
                <History className={styles.actionHistoryIcon} />
              </div>
              <div className={styles.actionText}>
                <p className={styles.actionTitle}>View Scan History</p>
                <p className={styles.actionBody}>Review past menu scans</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className={getActionCardClass("profile")}
              onClick={() => onNavigate?.("profile")}
            >
              <div className={getActionIconBoxClass("profile")}>
                <User className={styles.actionProfileIcon} />
              </div>
              <div className={styles.actionText}>
                <p className={styles.actionTitle}>Manage Profile</p>
                <p className={styles.actionBody}>Update health information</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className={styles.scansCard}>
        <CardHeader>
          <div className={styles.scansHeader}>
            <div>
              <CardTitle>Recent Scans</CardTitle>
              <CardDescription>Your latest menu scans and results</CardDescription>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate?.("history")}
              className={styles.viewAllButton}
            >
              View All
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className={styles.scansList}>
            {recentScansError && (
              <Alert>
                <AlertDescription>{recentScansError}</AlertDescription>
              </Alert>
            )}

            {scansLoading &&
              !recentScansError &&
              [1, 2, 3].map((item) => (
                <div key={item} className={styles.scanRowStatic}>
                  <div className={styles.scanMeta}>
                    <Skeleton className={styles.recentScanTitleSkeleton} />
                    <Skeleton className={styles.recentScanDateSkeleton} />
                  </div>
                  <Skeleton className={styles.recentScanPillSkeleton} />
                </div>
              ))}

            {!scansLoading && !recentScansError && recentScans.length === 0 && (
              <div className={styles.scanRowStatic}>
                <div>
                  <p className={styles.scanTitle}>No scans yet</p>
                  <p className={styles.scanBody}>Your latest scans will appear here</p>
                </div>
              </div>
            )}

            {!scansLoading &&
              recentScans.map((scan) => {
                const totalDishes =
                  (scan.SafeCount ?? 0) +
                  (scan.UnsafeCount ?? 0) +
                  (scan.RiskyCount ?? 0);

                const hasWarnings =
                  (scan.UnsafeCount ?? 0) > 0 || (scan.RiskyCount ?? 0) > 0;

                return (
                  <div key={scan.ScanID} className={styles.scanRow}>
                    <div>
                      <p className={styles.scanTitle}>{scan.RestaurantName}</p>
                      <p className={styles.scanBody}>
                        {totalDishes} {totalDishes === 1 ? "dish" : "dishes"} scanned
                      </p>
                    </div>

                    <div className={styles.scanRight}>
                      <span className={styles.scanDate}>
                        {new Date(scan.ScanDate).toLocaleDateString()}
                      </span>

                      {hasWarnings ? (
                        <div className={styles.warningPill}>
                          <AlertTriangle className={styles.smallIcon} />
                          <span className={styles.pillText}>Warning</span>
                        </div>
                      ) : (
                        <div className={styles.safePill}>
                          <CheckCircle className={styles.smallIcon} />
                          <span className={styles.pillText}>Safe</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      <Card className={styles.tipsCard}>
        <CardHeader>
          <CardTitle className={styles.tipsTitle}>
            <Shield className={styles.quickActionsIcon} />
            Safety Tips
          </CardTitle>
          <CardDescription>Important reminders for safe dining</CardDescription>
        </CardHeader>

        <CardContent>
          <div className={styles.tipsList}>
            <div className={styles.tipPrimary}>
              <p className={styles.tipPrimaryText}>
                Always inform restaurant staff about your allergies, even if the app
                says a dish is safe.
              </p>
            </div>

            <div className={styles.tipSuccess}>
              <p className={styles.tipSuccessText}>
                Keep your health profile updated for accurate recommendations.
              </p>
            </div>

            <div className={styles.tipWarning}>
              <p className={styles.tipWarningText}>
                When in doubt, choose dishes with simpler ingredient lists to reduce
                risk.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
