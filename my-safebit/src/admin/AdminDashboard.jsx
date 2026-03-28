import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
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
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { styles } from '../styles/admin/AdminDashboard.styles.js';
import { logout as authLogout } from '../services/auth';
import { getAllUsers } from '../services/adminUserService';
import { getAllDishesAdmin } from '../services/adminDishesService';
import { getFeedbackReports } from '../services/adminFeedbackService';

import { UserManagement } from './UserManagement';
import HealthDataManagement from './HealthDataManagement';
import { DishesManagement } from './DishesManagement';
import { ReportsGeneration } from './ReportsGeneration';
import { HealthAnalytics } from './HealthAnalytics';
import { FeedbackManagement } from './FeedbackManagement';

import logoImage from '../assets/logos/safebite.png';

export function AdminDashboard({ onLogout }) {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'health-data', label: 'Health Data', icon: Database },
    { id: 'dishes', label: 'Dishes & Ingredients', icon: UtensilsCrossed },
    { id: 'reports', label: 'Generate Reports', icon: FileText },
    { id: 'analytics', label: 'Health Analytics', icon: BarChart3 },
    { id: 'feedback', label: 'User Feedback', icon: MessageSquare },
  ];

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await authLogout();
      if (onLogout) onLogout();
      else navigate('/', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'users':
        return <UserManagement />;
      case 'health-data':
        return <HealthDataManagement />;
      case 'dishes':
        return <DishesManagement />;
      case 'reports':
        return <ReportsGeneration />;
      case 'analytics':
        return <HealthAnalytics />;
      case 'feedback':
        return <FeedbackManagement />;
      default:
        return <DashboardOverview onNavigate={setActiveSection} />;
    }
  };

  return (
    <div className={styles.cls001}>
      {sidebarOpen && (
        <div
          className={styles.cls002}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30
          w-64 bg-white border-r border-gray-200
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className={styles.cls003}>
          <div className={styles.cls004}>
            <div className={styles.cls005}>
              <div className={styles.cls006}>
                <img src={logoImage} alt="SafeBite Logo" className={styles.cls007} />
                <div>
                  <h1 className={styles.cls008}>SafeBite</h1>
                  <p className={styles.cls009}>Admin Panel</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className={styles.cls010}
                onClick={() => setSidebarOpen(false)}
              >
                <X className={styles.cls011} />
              </Button>
            </div>
          </div>

          <nav className={styles.cls012}>
            <div className={styles.cls013}>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg
                      transition-colors
                      ${isActive ? 'bg-green-50 text-green-600' : 'text-gray-700 hover:bg-gray-100'}
                    `}
                  >
                    <Icon className={styles.cls011} />
                    <span className={styles.cls014}>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          <div className={styles.cls015}>
            <Button
              variant="ghost"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={styles.cls016}
            >
              <LogOut className={styles.cls017} />
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Button>
          </div>
        </div>
      </aside>

      <main className={styles.cls018}>
        <header className={styles.cls019}>
          <div className={styles.cls005}>
            <div className={styles.cls020}>
              <Button
                variant="ghost"
                size="sm"
                className={styles.cls010}
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className={styles.cls021} />
              </Button>
              <div>
                <h2 className={styles.cls022}>
                  {menuItems.find((item) => item.id === activeSection)?.label || 'Dashboard'}
                </h2>
                <p className={styles.cls023}>Welcome back, Administrator</p>
              </div>
            </div>
            <div className={styles.cls024}>
              <div className={styles.cls025}>
                <p className={styles.cls026}>Admin Account</p>
              </div>
            </div>
          </div>
        </header>

        <div className={styles.cls027}>{renderContent()}</div>
      </main>
    </div>
  );
}

function DashboardOverview({ onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalDishes: 0,
    pendingFeedback: 0,
  });
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    let mounted = true;

    const toTime = (value) => {
      const dt = new Date(value || '');
      return Number.isNaN(dt.getTime()) ? 0 : dt.getTime();
    };

    const toRelative = (value) => {
      const dt = new Date(value || '');
      if (Number.isNaN(dt.getTime())) return 'Unknown time';
      const diffMs = Date.now() - dt.getTime();
      const mins = Math.max(1, Math.floor(diffMs / 60000));
      if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
      const days = Math.floor(hours / 24);
      if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
      return dt.toLocaleDateString();
    };

    const loadOverview = async () => {
      setLoading(true);
      setError('');
      try {
        const [users, dishes, feedback] = await Promise.all([
          getAllUsers(),
          getAllDishesAdmin(),
          getFeedbackReports(),
        ]);

        if (!mounted) return;

        const activeUsers = users.filter((x) => x.status === 'active').length;
        const pendingFeedback = feedback.filter((x) => x.status === 'pending').length;

        const userEvents = users
          .filter((x) => !!x.registeredAt)
          .map((x) => ({
            action: `New user registered (${x.displayName || x.email})`,
            timeRaw: x.registeredAt,
          }));

        const feedbackEvents = feedback
          .filter((x) => !!x.submittedAt)
          .map((x) => ({
            action: `Feedback submitted for ${x.dishName} (${x.reportID})`,
            timeRaw: x.submittedAt,
          }));

        const mergedActivities = [...userEvents, ...feedbackEvents]
          .sort((a, b) => toTime(b.timeRaw) - toTime(a.timeRaw))
          .slice(0, 6)
          .map((x) => ({ action: x.action, time: toRelative(x.timeRaw) }));

        setStats({
          totalUsers: users.length,
          activeUsers,
          totalDishes: dishes.length,
          pendingFeedback,
        });
        setActivities(mergedActivities);
      } catch {
        if (mounted) setError('Failed to load overview data.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadOverview();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className={styles.cls028}>
      {loading && (
        <div className={styles.cls029}>
          <span className={styles.cls030}>
            <Loader2 className={styles.cls031} />
            Loading overview data...
          </span>
        </div>
      )}

      {!!error && (
        <div className={styles.cls032}>
          <span className={styles.cls030}>
            <AlertCircle className={styles.cls033} />
            {error}
          </span>
        </div>
      )}

      <div className={styles.cls034}>
        <div className={styles.cls035}>
          <p className={styles.cls036}>Total Users</p>
          <p className={styles.cls037}>{stats.totalUsers.toLocaleString()}</p>
          <p className={styles.cls038}>Registered accounts</p>
        </div>
        <div className={styles.cls035}>
          <p className={styles.cls036}>Active Users</p>
          <p className={styles.cls037}>{stats.activeUsers.toLocaleString()}</p>
          <p className={styles.cls038}>Users with active status</p>
        </div>
        <div className={styles.cls035}>
          <p className={styles.cls036}>Total Dishes</p>
          <p className={styles.cls037}>{stats.totalDishes.toLocaleString()}</p>
          <p className={styles.cls038}>Dishes in catalog</p>
        </div>
        <div className={styles.cls035}>
          <p className={styles.cls036}>Pending Feedback</p>
          <p className={styles.cls037}>{stats.pendingFeedback.toLocaleString()}</p>
          <p className={styles.cls038}>Awaiting review</p>
        </div>
      </div>

      <div className={styles.cls035}>
        <h3 className={styles.cls039}>Quick Actions</h3>
        <div className={styles.cls040}>
          <Button className={styles.cls041} onClick={() => onNavigate('users')}>
            <Users className={styles.cls042} />
            View All Users
          </Button>
          <Button variant="outline" onClick={() => onNavigate('reports')}>
            <FileText className={styles.cls042} />
            Generate Report
          </Button>
          <Button variant="outline" onClick={() => onNavigate('health-data')}>
            <Database className={styles.cls042} />
            Add Health Data
          </Button>
        </div>
      </div>

      <div className={styles.cls035}>
        <h3 className={styles.cls039}>Recent Activity</h3>
        <div className={styles.cls043}>
          {activities.length === 0 ? (
            <p className={styles.cls023}>No recent activity available.</p>
          ) : (
            activities.map((activity, index) => (
              <div
                key={`${activity.action}-${index}`}
                className={styles.cls044}
              >
                <p className={styles.cls045}>{activity.action}</p>
                <span className={styles.cls009}>{activity.time}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;


