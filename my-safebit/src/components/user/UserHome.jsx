import React, { useEffect, useState } from "react";
import {
  Upload,
  History,
  Shield,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  Home,
  User,
  LogOut,
} from "lucide-react";
import { styles } from "../../styles/user/UserHome.styles.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Alert, AlertDescription } from "../ui/alert";
import { getScanHistory } from "../../services/scanHistoryService";

export default function UserDashboardPage({ onNavigate, activePage = "home" }) {
  return (
    <div className={styles.cls001}>
      <UserSidebar active={activePage} onNavigate={onNavigate} />
      <main className={styles.cls002}>
        <TopHeader />
        <div className={styles.cls003}>
          <UserHome onNavigate={onNavigate} />
        </div>
      </main>
    </div>
  );
}

function TopHeader() {
  return (
    <div className={styles.cls004}>
      <div className={styles.cls005}>
        <div className={styles.cls006}>Home</div>
        <div className={styles.cls007}>Welcome back!</div>
      </div>

      <Button
        variant="outline"
        className={styles.cls008}
      >
        User Account
      </Button>
    </div>
  );
}

function UserSidebar({ active = "home", onNavigate }) {
  const nav = [
    { key: "home", label: "Home", icon: Home },
    { key: "upload", label: "Scan Menu", icon: Upload },
    { key: "history", label: "Scan History", icon: History },
    { key: "profile", label: "My Profile", icon: User },
  ];

  return (
    <aside className={styles.cls009}>
      {/* Brand */}
      <div className={styles.cls010}>
        <div className={styles.cls011}>
          <Shield className={styles.cls012} />
        </div>
        <div className={styles.cls005}>
          <div className={styles.cls013}>SafeBite</div>
          <div className={styles.cls014}>User Dashboard</div>
        </div>
      </div>

      <nav className={styles.cls015}>
        {nav.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;

          return (
            <button
              key={item.key}
              onClick={() => onNavigate?.(item.key)}
              className={[
                "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm",
                "transition-colors",
                isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              ].join(" ")}
            >
              <Icon className={isActive ? "h-4 w-4 text-emerald-600" : "h-4 w-4"} />
              <span className={styles.cls016}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className={styles.cls017}>
        <button
          onClick={() => onNavigate?.("logout")}
          className={styles.cls018}
        >
          <LogOut className={styles.cls019} />
          <span className={styles.cls016}>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export function UserHome({ onNavigate }) {
  const [recentScans, setRecentScans] = useState([]);
  const [recentScansError, setRecentScansError] = useState(null);

  const userAllergies = ["Peanuts", "Shellfish"];
  const userDiseases = ["Diabetes", "Celiac Disease"];

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const history = await getScanHistory();
        if (cancelled) return;
        setRecentScans(Array.isArray(history) ? history.slice(0, 3) : []);
        setRecentScansError(null);
      } catch (error) {
        if (cancelled) return;
        setRecentScans([]);
        setRecentScansError(error?.message || "Failed to load recent scans.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={styles.cls020}>
      <div className={styles.cls021}>
        <div className={styles.cls022}>
          <div className={styles.cls023} />
          <div className={styles.cls024} />
        </div>

        <div className={styles.cls025}>
          <div className={styles.cls026}>
            <Sparkles className={styles.cls027} />
            <h2 className={styles.cls028}>Welcome to SafeBite</h2>
          </div>

          <p className={styles.cls029}>
            Your personal food safety assistant. Scan menus to get instant allergen warnings and safe
            meal recommendations.
          </p>

          <Button
            onClick={() => onNavigate?.("upload")}
            variant="ghost"
            className={styles.cls030}
          >
            <Upload className={styles.cls031} />
            Scan a Menu Now
          </Button>
        </div>
      </div>

      {(userAllergies.length > 0 || userDiseases.length > 0) && (
        <Alert className={styles.cls032}>
          <Shield className={styles.cls033} />
          <AlertDescription className={styles.cls034}>
            <div className={styles.cls035}>
              {userAllergies.length > 0 && (
                <p>
                  <strong className={styles.cls036}>Active Allergies:</strong>{" "}
                  <span className={styles.cls037}>{userAllergies.join(", ")}</span>
                </p>
              )}
              {userDiseases.length > 0 && (
                <p>
                  <strong className={styles.cls036}>Active Conditions:</strong>{" "}
                  <span className={styles.cls037}>{userDiseases.join(", ")}</span>
                </p>
              )}
              <p className={styles.cls038}>
                We&apos;ll warn you about dishes containing these allergens or that may not be suitable for
                your conditions.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card className={styles.cls039}>
        <CardHeader>
          <CardTitle className={styles.cls040}>
            <Sparkles className={styles.cls012} />
            Quick Actions
          </CardTitle>
          <CardDescription>Access your most-used features</CardDescription>
        </CardHeader>

        <CardContent>
          <div className={styles.cls041}>
            <Button
              variant="outline"
              className={styles.cls042}
              onClick={() => onNavigate?.("upload")}
            >
              <div className={styles.cls043}>
                <Upload className={styles.cls012} />
              </div>
              <div className={styles.cls044}>
                <p className={styles.cls013}>Scan New Menu</p>
                <p className={styles.cls045}>Upload or capture a menu</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className={styles.cls046}
              onClick={() => onNavigate?.("history")}
            >
              <div className={styles.cls047}>
                <History className={styles.cls048} />
              </div>
              <div className={styles.cls044}>
                <p className={styles.cls013}>View Scan History</p>
                <p className={styles.cls045}>Review past menu scans</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className={styles.cls049}
              onClick={() => onNavigate?.("profile")}
            >
              <div className={styles.cls050}>
                <Shield className={styles.cls051} />
              </div>
              <div className={styles.cls044}>
                <p className={styles.cls013}>Manage Profile</p>
                <p className={styles.cls045}>Update health information</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className={styles.cls052}>
        <CardHeader>
          <div className={styles.cls053}>
            <div>
              <CardTitle>Recent Scans</CardTitle>
              <CardDescription>Your latest menu scans and results</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate?.("history")}
              className={styles.cls054}
            >
              View All
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className={styles.cls055}>
            {recentScansError && (
              <Alert>
                <AlertDescription>{recentScansError}</AlertDescription>
              </Alert>
            )}
            {!recentScansError && recentScans.length === 0 && (
              <div className={styles.cls056}>
                <div className={styles.cls002}>
                  <p className={styles.cls057}>No scans yet</p>
                  <p className={styles.cls045}>Your latest scans will appear here</p>
                </div>
              </div>
            )}
            {recentScans.map((scan) => {
              const totalDishes = scan.SafeCount + scan.UnsafeCount + scan.RiskyCount;
              const hasWarnings = scan.UnsafeCount > 0 || scan.RiskyCount > 0;

              return (
                <div
                  key={scan.ScanID}
                  className={styles.cls056}
                >
                  <div className={styles.cls002}>
                    <p className={styles.cls057}>{scan.RestaurantName}</p>
                    <p className={styles.cls045}>
                      {totalDishes} {totalDishes === 1 ? "dish" : "dishes"} scanned
                    </p>
                  </div>

                  <div className={styles.cls058}>
                    <span className={styles.cls059}>{new Date(scan.ScanDate).toLocaleString()}</span>

                    {hasWarnings ? (
                      <div className={styles.cls062}>
                        <AlertTriangle className={styles.cls019} />
                        <span className={styles.cls061}>Warning</span>
                      </div>
                    ) : (
                      <div className={styles.cls060}>
                        <CheckCircle className={styles.cls019} />
                        <span className={styles.cls061}>Safe</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className={styles.cls063}>
        <CardHeader>
          <CardTitle className={styles.cls040}>
            <Shield className={styles.cls012} />
            Safety Tips
          </CardTitle>
          <CardDescription>Important reminders for safe dining</CardDescription>
        </CardHeader>

        <CardContent>
          <div className={styles.cls064}>
            <div className={styles.cls065}>
              <p className={styles.cls066}>
                Always inform restaurant staff about your allergies, even if the app says a dish is
                safe.
              </p>
            </div>
            <div className={styles.cls067}>
              <p className={styles.cls068}>
                Keep your health profile updated for accurate recommendations.
              </p>
            </div>
            <div className={styles.cls069}>
              <p className={styles.cls070}>
                When in doubt, choose dishes with simpler ingredient lists to reduce risk.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
