import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/auth";
import { Button } from "../components/ui/button";
import { UserHome } from "../components/user/UserHome";
import { MenuUpload } from "../components/user/MenuUpload";
import { ScanHistory } from "../components/user/ScanHistory";
import { UserProfile } from "../components/user/UserProfile";
import { Home, Upload, History, User, LogOut, Menu, X } from "lucide-react";

export default function UserDashboard() {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const handleNavigate = (section) => {
    setCurrentSection(section);
    setSidebarOpen(false);
  };

  const renderContent = () => {
    switch (currentSection) {
      case "home":
        return <UserHome onNavigate={handleNavigate} />;
      case "upload":
        return <MenuUpload />;
      case "history":
        return <ScanHistory />;
      case "profile":
        return <UserProfile />;
      default:
        return <UserHome onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 lg:h-screen lg:overflow-hidden">
      {/* Mobile Top Bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between lg:hidden">
        <h2 className="text-lg font-bold text-emerald-600">SafeBite</h2>
        <button
          onClick={() => setSidebarOpen((prev) => !prev)}
          className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
          aria-label="Toggle navigation"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <button
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation"
        />
      )}

      {/* Sidebar Navigation */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 shadow-sm flex flex-col transform transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-emerald-600">SafeBite</h2>
        </div>

        <nav className="p-4 space-y-2 flex-1">
          <button
            onClick={() => handleNavigate("home")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentSection === "home"
                ? "bg-emerald-100 text-emerald-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Home className="h-5 w-5" />
            <span className="font-medium">Home</span>
          </button>

          <button
            onClick={() => handleNavigate("upload")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentSection === "upload"
                ? "bg-emerald-100 text-emerald-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Upload className="h-5 w-5" />
            <span className="font-medium">Scan Menu</span>
          </button>

          <button
            onClick={() => handleNavigate("history")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentSection === "history"
                ? "bg-emerald-100 text-emerald-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <History className="h-5 w-5" />
            <span className="font-medium">Scan History</span>
          </button>

          <button
            onClick={() => handleNavigate("profile")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentSection === "profile"
                ? "bg-emerald-100 text-emerald-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <User className="h-5 w-5" />
            <span className="font-medium">My Profile</span>
          </button>
        </nav>

        <div className="mt-auto p-4 border-t border-gray-200">
          <Button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 lg:h-screen lg:overflow-y-auto">
        <div className="p-4 lg:p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
