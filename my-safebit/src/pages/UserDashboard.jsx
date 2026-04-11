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
import { styles } from '../styles/user/UserDashboard.styles.js';
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
    <div className={styles.cls001}>
      {/* Mobile top bar */}
      <header className={styles.cls002}>
        <Button variant="ghost" size="sm" onClick={() => setSidebarOpen((v) => !v)}>
          {sidebarOpen ? <X className={styles.cls003} /> : <Menu className={styles.cls003} />}
        </Button>
        <h2 className={styles.cls004}>SafeBite</h2>
      </header>

      {sidebarOpen && (
        <button
          className={styles.cls005}
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={styles.cls006}>
        <aside
          className={[
            "fixed md:static inset-y-0 left-0 z-30",
            "w-[292px] bg-white border-r border-[#e5e7eb]",
            "transform transition-transform duration-200 md:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          <div className={styles.cls007}>
            <div className={styles.cls008}>
              <div className={styles.cls009}>
                <img src={logoImage} alt="SafeBite Logo" className={styles.cls010} />
                <div>
                  <h1 className={styles.cls011}>SafeBite</h1>
                  <p className={styles.cls012}>User Dashboard</p>
                </div>
              </div>
            </div>

            <nav className={styles.cls013}>
              <div className={styles.cls014}>
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
                        "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-lg font-medium border transition-colors",
                        isActive
                          ? "bg-[#e7f7ef] text-[#11915f] border-[#111827]"
                          : "text-gray-700 border-transparent hover:bg-gray-100",
                      ].join(" ")}
                    >
                      <Icon className={styles.cls015} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </nav>

            <div className={styles.cls016}>
              <Button
                variant="ghost"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={styles.cls017}
              >
                <LogOut className={styles.cls018} />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </Button>
            </div>
          </div>
        </aside>

        <main className={styles.cls019}>
          <header className={styles.cls020}>
            <div className={styles.cls021}>
              <div>
                <h2 className={styles.cls022}>{activeLabel}</h2>
                <p className={styles.cls012}>Welcome back!</p>
              </div>
              <div className={styles.cls023}>
                <p className={styles.cls024}>User Account</p>
              </div>
            </div>
          </header>

          <div className={styles.cls025}>{renderContent()}</div>
        </main>
      </div>
    </div>
  );
}


