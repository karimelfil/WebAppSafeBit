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
    <div className="flex h-screen bg-gray-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
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
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={logoImage} alt="SafeBite Logo" className="h-10 w-10" />
                <div>
                  <h1 className="text-green-600 font-semibold leading-none">SafeBite</h1>
                  <p className="text-xs text-gray-500">Admin Panel</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
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
                    <Icon className="h-5 w-5" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="p-4 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-5 w-5 mr-3" />
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden flex flex-col">
        <header className="bg-white border-b border-gray-200 p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {menuItems.find((item) => item.id === activeSection)?.label || 'Dashboard'}
                </h2>
                <p className="text-sm text-gray-500">Welcome back, Administrator</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <div className="px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">Admin Account</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 lg:p-6">{renderContent()}</div>
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
    <div className="space-y-6">
      {loading && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-gray-600">
          <span className="inline-flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading overview data...
          </span>
        </div>
      )}

      {!!error && (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-700">
          <span className="inline-flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4" />
            {error}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total Users</p>
          <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-2">Registered accounts</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Active Users</p>
          <p className="text-2xl font-semibold text-gray-900">{stats.activeUsers.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-2">Users with active status</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total Dishes</p>
          <p className="text-2xl font-semibold text-gray-900">{stats.totalDishes.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-2">Dishes in catalog</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Pending Feedback</p>
          <p className="text-2xl font-semibold text-gray-900">{stats.pendingFeedback.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-2">Awaiting review</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button className="bg-green-600 hover:bg-green-700" onClick={() => onNavigate('users')}>
            <Users className="h-4 w-4 mr-2" />
            View All Users
          </Button>
          <Button variant="outline" onClick={() => onNavigate('reports')}>
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
          <Button variant="outline" onClick={() => onNavigate('health-data')}>
            <Database className="h-4 w-4 mr-2" />
            Add Health Data
          </Button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {activities.length === 0 ? (
            <p className="text-sm text-gray-500">No recent activity available.</p>
          ) : (
            activities.map((activity, index) => (
              <div
                key={`${activity.action}-${index}`}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
              >
                <p className="text-sm text-gray-700">{activity.action}</p>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
