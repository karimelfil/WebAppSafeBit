import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Database,
  UtensilsCrossed,
  FileText,
  BarChart3,
  MessageSquare,
  LogOut,
  Menu,
  X,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  Activity,
  Clock,
} from "lucide-react";
import { logout as authLogout } from "../services/auth";
import { getAllUsers } from "../services/adminUserService";
import { getAllDishesAdmin } from "../services/adminDishesService";
import { getFeedbackReports } from "../services/adminFeedbackService";
import { UserManagement } from "./UserManagement";
import HealthDataManagement from "./HealthDataManagement";
import { DishesManagement } from "./DishesManagement";
import { ReportsGeneration } from "./ReportsGeneration";
import { HealthAnalytics } from "./HealthAnalytics";
import { FeedbackManagement } from "./FeedbackManagement";
import logoImage from "../assets/logos/safebite.png";
import {
  styles,
  getSkeletonClass,
  getSidebarClass,
  getNavButtonClass,
  getNavIconWrapClass,
  getStatIconWrapClass,
  getStatIconClass,
  getActionIconWrapClass,
  getActionIconClass,
} from "../styles/admin/AdminDashboard.styles";

// Define menu items with groups 
const menuItems = [
  { id: "overview", label: "Overview", icon: BarChart3, group: "main" },
  { id: "users", label: "User Management", icon: Users, group: "main" },
  { id: "health-data", label: "Health Data", icon: Database, group: "main" },
  { id: "dishes", label: "Dishes", icon: UtensilsCrossed, group: "main" },
  { id: "reports", label: "Reports", icon: FileText, group: "tools" },
  { id: "analytics", label: "Health Analytics", icon: Activity, group: "tools" },
  { id: "feedback", label: "User Feedback", icon: MessageSquare, group: "tools" },
];

// Simple skeleton loader component
function Skeleton({ className }) {
  return <div className={getSkeletonClass(className)} />;
}

export function AdminDashboard({ onLogout }) {
  const navigate = useNavigate();
  
  const [activeSection, setActiveSection] = useState("overview"); 
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  
  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await authLogout();
      if (onLogout) onLogout();
      else navigate("/", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Navigate to a specific section and close sidebar on mobile
  const navigateToSection = (id) => {
    setActiveSection(id);
    setSidebarOpen(false);
  };

  // Render content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case "users":
        return <UserManagement />;
      case "health-data":
        return <HealthDataManagement />;
      case "dishes":
        return <DishesManagement />;
      case "reports":
        return <ReportsGeneration />;
      case "analytics":
        return <HealthAnalytics />;
      case "feedback":
        return <FeedbackManagement />;
      default:
        return <DashboardOverview onNavigate={navigateToSection} />;
    }
  };

  // Get active item and grouped menu items for rendering
  const activeItem = menuItems.find((item) => item.id === activeSection);
  const mainItems = menuItems.filter((item) => item.group === "main");
  const toolItems = menuItems.filter((item) => item.group === "tools");

  return (
    <div className={styles.page}>
      {sidebarOpen && (
        <div
          className={styles.overlay}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={getSidebarClass(sidebarOpen)}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarBrand}>
            <div className={styles.logoWrap}>
              <img src={logoImage} alt="SafeBite" className={styles.logo} />
            </div>
            <div>
              <p className={styles.brand}>SafeBite</p>
              <p className={styles.brandSub}>Admin Panel</p>
            </div>
          </div>
          <button
            className={styles.closeButton}
            onClick={() => setSidebarOpen(false)}
          >
            <X className={styles.navIcon} />
          </button>
        </div>

        <nav className={styles.nav}>
          <div>
            <p className={styles.navSectionLabel}>Main</p>
            <div className={styles.navList}>
              {mainItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => navigateToSection(item.id)}
                    className={getNavButtonClass(isActive)}
                  >
                    <span className={getNavIconWrapClass(isActive)}>
                      <Icon className={styles.navIcon} />
                    </span>
                    <span className={styles.navText}>{item.label}</span>
                    {isActive && <span className={styles.navDot} />}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className={styles.navSectionLabel}>Tools</p>
            <div className={styles.navList}>
              {toolItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => navigateToSection(item.id)}
                    className={getNavButtonClass(isActive)}
                  >
                    <span className={getNavIconWrapClass(isActive)}>
                      <Icon className={styles.navIcon} />
                    </span>
                    <span className={styles.navText}>{item.label}</span>
                    {isActive && <span className={styles.navDot} />}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        <div className={styles.footer}>
          <div className={styles.adminCard}>
            <div className={styles.adminAvatar}>A</div>
            <div>
              <p className={styles.adminTitle}>Administrator</p>
              <p className={styles.adminSub}>Full access</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={styles.logoutButton}
          >
            <span className={styles.logoutIconWrap}>
              <LogOut className={styles.navIcon} />
            </span>
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </aside>

      <div className={styles.content}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button
              className={styles.menuButton}
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className={styles.navIcon} />
            </button>
            <div className={styles.breadcrumb}>
              <span className={styles.breadcrumbRoot}>SafeBite</span>
              <ChevronRight className={styles.breadcrumbArrow} />
              <span className={styles.breadcrumbCurrent}>
                {activeItem?.label || "Dashboard"}
              </span>
            </div>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.headerRightText}>
              <p className={styles.adminTitle}>Administrator</p>
              <p className={styles.brandSub}>Full access</p>
            </div>
            <div className={styles.adminAvatar}>A</div>
          </div>
        </header>

        <main className={styles.main}>
          <div className={styles.mainInner}>{renderContent()}</div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon, tone, loading }) {
  return (
    <div className={styles.statCard}>
      <div className={getStatIconWrapClass(tone)}>
        <Icon className={getStatIconClass(tone)} />
      </div>
      <div className={styles.statTextWrap}>
        <p className={styles.statLabel}>{label}</p>
        {loading ? (
          <Skeleton className={styles.statValueLoading} />
        ) : (
          <p className={styles.statValue}>{value}</p>
        )}
        {loading ? (
          <Skeleton className={styles.statSubLoading} />
        ) : (
          <p className={styles.statSub}>{sub}</p>
        )}
      </div>
    </div>
  );
}

function ActionCard({ label, sub, icon: Icon, tone, onClick }) {
  return (
    <button onClick={onClick} className={styles.actionCard}>
      <div className={getActionIconWrapClass(tone)}>
        <Icon className={getActionIconClass(tone)} />
      </div>
      <p className={styles.actionLabel}>{label}</p>
      <p className={styles.actionSub}>{sub}</p>
    </button>
  );
}

function DashboardOverview({ onNavigate }) {
  // State for loading, error, stats, and recent activities
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalDishes: 0,
    pendingFeedback: 0,
  });
  const [activities, setActivities] = useState([]);

  // Fetch overview data on component mount
  useEffect(() => {
    let mounted = true;

    const toTime = (value) => {
      const date = new Date(value || "");
      return Number.isNaN(date.getTime()) ? 0 : date.getTime();
    };

    const toRelative = (value) => {
      const date = new Date(value || "");
      if (Number.isNaN(date.getTime())) return "Unknown time";
      const mins = Math.max(1, Math.floor((Date.now() - date.getTime()) / 60000));
      if (mins < 60) return `${mins}m ago`;
      if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
      const days = Math.floor(mins / 1440);
      return days < 30 ? `${days}d ago` : date.toLocaleDateString();
    };

    (async () => {
      setLoading(true);
      setError("");
      try {
        const [users, dishes, feedback] = await Promise.all([
          getAllUsers(),
          getAllDishesAdmin(),
          getFeedbackReports(),
        ]);
        if (!mounted) return;

        const activeUsers = users.filter((user) => user.status === "active").length;
        const pendingFeedback = feedback.filter((item) => item.status === "pending").length;

        const events = [
          ...users
            .filter((user) => Boolean(user.registeredAt))
            .map((user) => ({
              type: "user",
              action: `New user registered - ${user.displayName || user.email}`,
              timeRaw: user.registeredAt,
            })),
          ...feedback
            .filter((item) => Boolean(item.submittedAt))
            .map((item) => ({
              type: "feedback",
              action: `Feedback submitted for ${item.dishName}`,
              timeRaw: item.submittedAt,
            })),
        ]
          .sort((a, b) => toTime(b.timeRaw) - toTime(a.timeRaw))
          .slice(0, 6)
          .map((item) => ({ ...item, time: toRelative(item.timeRaw) }));

        setStats({
          totalUsers: users.length,
          activeUsers,
          totalDishes: dishes.length,
          pendingFeedback,
        });
        setActivities(events);
      } catch {
        if (mounted) setError("Failed to load overview data.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const activityIcon = (type) =>
    type === "user" ? (
      <Users className={styles.activityUserIcon} />
    ) : (
      <MessageSquare className={styles.activityFeedbackIcon} />
    );

  return (
    <div className={styles.overview}>
      {error && (
        <div className={styles.errorBanner}>
          <AlertCircle className={styles.errorIcon} />
          <p className={styles.errorText}>{error}</p>
        </div>
      )}

      <div className={styles.statsGrid}>
        <StatCard
          label="Total Users"
          icon={Users}
          tone="blue"
          value={stats.totalUsers.toLocaleString()}
          sub="Registered accounts"
          loading={loading}
        />
        <StatCard
          label="Active Users"
          icon={TrendingUp}
          tone="emerald"
          value={stats.activeUsers.toLocaleString()}
          sub="Users with active status"
          loading={loading}
        />
        <StatCard
          label="Total Dishes"
          icon={UtensilsCrossed}
          tone="amber"
          value={stats.totalDishes.toLocaleString()}
          sub="Dishes in catalog"
          loading={loading}
        />
        <StatCard
          label="Pending Feedback"
          icon={MessageSquare}
          tone="purple"
          value={stats.pendingFeedback.toLocaleString()}
          sub="Awaiting review"
          loading={loading}
        />
      </div>

      <div className={styles.overviewGrid}>
        <div className={styles.overviewSidebarCol}>
          <div className={styles.panel}>
            <p className={styles.panelLabel}>Quick Actions</p>
            <div className={styles.quickActionsList}>
              <ActionCard
                label="View All Users"
                sub="Manage user accounts"
                icon={Users}
                tone="blue"
                onClick={() => onNavigate("users")}
              />
              <ActionCard
                label="Generate Report"
                sub="Export data reports"
                icon={FileText}
                tone="amber"
                onClick={() => onNavigate("reports")}
              />
              <ActionCard
                label="Health Data"
                sub="Manage allergies and conditions"
                icon={Database}
                tone="emerald"
                onClick={() => onNavigate("health-data")}
              />
            </div>
          </div>
        </div>

        <div className={styles.overviewMainCol}>
          <div className={styles.panel}>
            <div className={styles.activityHeader}>
              <p className={styles.activityHeaderLabel}>Recent Activity</p>
              <Clock className={styles.activityHeaderIcon} />
            </div>

            {loading ? (
              <div className={styles.activityLoadingList}>
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className={styles.activityLoadingRow}>
                    <Skeleton className={styles.activityLoadingIcon} />
                    <div className={styles.activityLoadingText}>
                      <Skeleton className={styles.activityLoadingPrimary} />
                      <Skeleton className={styles.activityLoadingSecondary} />
                    </div>
                  </div>
                ))}
              </div>
            ) : activities.length === 0 ? (
              <div className={styles.activityEmpty}>
                <Activity className={styles.activityEmptyIcon} />
                <p className={styles.activityEmptyText}>No recent activity available.</p>
              </div>
            ) : (
              <div className={styles.activityList}>
                {activities.map((activity, index) => (
                  <div key={`${activity.action}-${index}`} className={styles.activityItem}>
                    <div className={styles.activityIconWrap}>
                      {activityIcon(activity.type)}
                    </div>
                    <p className={styles.activityText}>{activity.action}</p>
                    <span className={styles.activityTime}>{activity.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
