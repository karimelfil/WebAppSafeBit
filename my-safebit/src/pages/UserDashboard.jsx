import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { logout } from "../services/auth";
import { User, Upload, History, LogOut, Menu, X, Home } from "lucide-react";
import { UserProfile } from "../components/user/UserProfile";
import { MenuUpload } from "../components/user/MenuUpload";
import { ScanHistory } from "../components/user/ScanHistory";
import { UserHome } from "../components/user/UserHome";
import logoImage from "../assets/logos/safebite.png";

const ALLOWED_SECTIONS = ["home", "upload", "history", "profile"];

export default function UserDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(() => {
    const saved = sessionStorage.getItem("sb_active_section");
    return ALLOWED_SECTIONS.includes(saved) ? saved : "home";
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const menuItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "upload", label: "Scan Menu", icon: Upload },
    { id: "history", label: "Scan History", icon: History },
    { id: "profile", label: "My Profile", icon: User },
  ];

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
      sessionStorage.removeItem("sb_active_section");
      navigate("/", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    if (ALLOWED_SECTIONS.includes(activeSection)) {
      sessionStorage.setItem("sb_active_section", activeSection);
    }
  }, [activeSection]);

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return <UserProfile />;
      case "upload":
        return <MenuUpload />;
      case "history":
        return <ScanHistory />;
      default:
        return <UserHome onNavigate={setActiveSection} />;
    }
  };

  const activeLabel = menuItems.find((item) => item.id === activeSection)?.label || "Dashboard";

  return (
    <div className="min-h-screen bg-[#f3f5f7] md:h-screen md:overflow-hidden">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-2 md:hidden">
        <Button variant="ghost" size="sm" onClick={() => setSidebarOpen((v) => !v)}>
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <h2 className="text-base font-semibold text-[#1f2937]">SafeBite</h2>
      </header>

      {sidebarOpen && (
        <button
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex md:h-screen">
        <aside
          className={[
            "fixed md:static inset-y-0 left-0 z-30",
            "w-64 bg-white border-r border-gray-200",
            "transform transition-transform duration-200 md:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          <div className="flex h-full flex-col">
            <div className="p-5 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <img src={logoImage} alt="SafeBite Logo" className="h-9 w-9 object-contain" />
                <div>
                  <h1 className="text-sm font-semibold text-[#16a36d]">SafeBite</h1>
                  <p className="text-xs text-gray-500">User Dashboard</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto p-3">
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
                      className={[
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium",
                        isActive
                          ? "bg-[#e7f7ef] text-[#11915f]"
                          : "text-gray-700 hover:bg-gray-100",
                      ].join(" ")}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </nav>

            <div className="p-3 border-t border-gray-200">
              <Button
                variant="ghost"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </Button>
            </div>
          </div>
        </aside>

        <main className="flex-1 md:min-w-0 md:overflow-hidden">
          <header className="hidden md:block bg-white border-b border-gray-200 px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-[#111827]">{activeLabel}</h2>
                <p className="text-xs text-gray-500">Welcome back!</p>
              </div>
              <div className="px-3 py-2 rounded-lg border border-green-200 bg-green-50">
                <p className="text-xs text-green-800">User Account</p>
              </div>
            </div>
          </header>

          <div className="p-4 md:p-5 md:h-[calc(100vh-65px)] md:overflow-auto">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
}
