import { useState } from 'react';
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
} from 'lucide-react';

// Service: import logout from your auth service (path may vary)
import { logout as authLogout } from '../services/auth';

// Sections
import { UserManagement } from '../admin/UserManagement';
import  HealthDataManagement  from '../admin/HealthDataManagement';
// import { DishesManagement } from '../admin/DishesManagement';
// import { ReportsGeneration } from '../admin/ReportsGeneration';
// import { HealthAnalytics } from '../admin/HealthAnalytics';
// import { FeedbackManagement } from '../admin/FeedbackManagement';

import logoImage from '../assets/logos/safebite.png';

export function AdminDashboard({ onLogout }) {
  const [activeSection, setActiveSection] = useState('overview'); // 'overview' | 'users' | 'health-data' | 'dishes' | 'reports' | 'analytics' | 'feedback'
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'health-data', label: 'Health Data', icon: Database },
    { id: 'dishes', label: 'Dishes & Ingredients', icon: UtensilsCrossed },
    { id: 'reports', label: 'Generate Reports', icon: FileText },
    { id: 'analytics', label: 'Health Analytics', icon: BarChart3 },
    { id: 'feedback', label: 'User Feedback', icon: MessageSquare },
  ];

  // Ensure logout clears storage then lets the parent (router) navigate away
  const handleLogout = () => {
    try {
      authLogout();                 // clears sb_token, sb_role, sb_userId
    } finally {
      onLogout?.();                 // parent can route to /login
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'users':
        return <UserManagement />;
      case 'health-data':
        return <HealthDataManagement />;
      // case 'dishes':
      //   return <DishesManagement />;
      // case 'reports':
      //   return <ReportsGeneration />;
      // case 'analytics':
      //   return <HealthAnalytics />;
      // case 'feedback':
      //   return <FeedbackManagement />;
      default:
        return <DashboardOverview onNavigate={setActiveSection} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30
          w-64 bg-white border-r border-gray-200
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
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

          {/* Navigation */}
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

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Top Bar */}
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

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 lg:p-6">{renderContent()}</div>
      </main>
    </div>
  );
}

function DashboardOverview({ onNavigate }) {
  const stats = [
    { label: 'Total Users', value: '1,284', change: '+12%', color: 'blue' },
    { label: 'Active Today', value: '342', change: '+5%', color: 'green' },
    { label: 'Total Dishes', value: '2,456', change: '+18%', color: 'purple' },
    { label: 'Pending Feedback', value: '23', change: '-3%', color: 'orange' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              <span
                className={`text-xs ${
                  stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
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

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { action: 'New user registered', time: '5 minutes ago', type: 'user' },
            { action: 'Feedback submitted for dish #2341', time: '15 minutes ago', type: 'feedback' },
            { action: 'Report generated: Allergy Statistics', time: '1 hour ago', type: 'report' },
            { action: 'New allergen added: Lupin', time: '2 hours ago', type: 'health' },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
            >
              <p className="text-sm text-gray-700">{activity.action}</p>
              <span className="text-xs text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;