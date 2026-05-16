import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/auth";
import { getUserProfile, getUserHealth } from "../services/userProfile";
import {
  User,
  Upload,
  History,
  LogOut,
  Menu,
  X,
  Home,
  ChevronRight,
} from "lucide-react";
import { UserProfile } from "./UserProfile";
import { MenuUpload } from "./MenuUpload";
import { ScanHistory } from "./ScanHistory";
import { UserHome } from "./UserHome";
import logoImage from "../assets/logos/safebite.png";
import {
  styles,
  getSidebarClass,
  getNavButtonClass,
  getNavIconWrapClass,
} from "../styles/user/UserDashboard.styles";

const ALLOWED_SECTIONS = ["home", "upload", "history", "profile"];

const menuItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "upload", label: "Scan Menu", icon: Upload },
  { id: "history", label: "Scan History", icon: History },
  { id: "profile", label: "My Profile", icon: User },
];

//get user details for display 
const getInitials = (firstName, lastName, email) => {
  const f = firstName?.trim();
  const l = lastName?.trim();
  if (f && l) return `${f[0]}${l[0]}`.toUpperCase();
  if (f) return f.slice(0, 2).toUpperCase();
  if (email) return email[0].toUpperCase();
  return "U";
};

export default function UserDashboard() {
  const navigate = useNavigate();
  //get user id from local storage to have the logged in user 
  const userId = localStorage.getItem("sb_userId");

  //decide which page is shown
  const [activeSection, setActiveSection] = useState(() => {
    const saved = sessionStorage.getItem("sb_active_section");
    return ALLOWED_SECTIONS.includes(saved) ? saved : "home";
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [profile, setProfile] = useState(null);
  const [health, setHealth] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  //get user data 
  const fetchUserData = useCallback(async () => {
    if (!userId) {
      setLoadingUser(false);
      return;
    }

    setLoadingUser(true);
    try {
      const [p, h] = await Promise.all([
        getUserProfile(userId),
        getUserHealth(userId),
      ]);
      setProfile(p);
      setHealth(h);
    } catch {
    } finally {
      setLoadingUser(false);
    }
  }, [userId]);

  //fetch the user data run when the page open
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const firstName = profile?.firstName || "";
  const lastName = profile?.lastName || "";
  const email = profile?.email || "";
  const displayName =
    firstName || lastName ? `${firstName} ${lastName}`.trim() : email || "User Account";
  const initials = getInitials(firstName, lastName, email);

  //save the last page the user visisted
  useEffect(() => {
    if (ALLOWED_SECTIONS.includes(activeSection)) {
      sessionStorage.setItem("sb_active_section", activeSection);
    }
  }, [activeSection]);

  //navigate to the section when click the menu item
  const navigateToSection = (id) => {
    setActiveSection(id);
    setSidebarOpen(false);
  };

  //logout function
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


  //render the content based on the active section
  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return <UserProfile />;
      case "upload":
        return <MenuUpload />;
      case "history":
        return <ScanHistory />;
      default:
        return (
          <UserHome
            onNavigate={setActiveSection}
            profile={profile}
            health={health}
            loadingUser={loadingUser}
          />
        );
    }
  };

  //tell which menu is activated
  const activeItem = menuItems.find((item) => item.id === activeSection);

  return (
    <div className={styles.page}>
    
      {sidebarOpen && (
        <div
          className={styles.overlay}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={getSidebarClass(sidebarOpen)} style={styles.sidebarShadow}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarLogoWrap}>
            <img src={logoImage} alt="SafeBite" className={styles.sidebarLogo} />
          </div>
          <div>
            <p className={styles.brand}>SafeBite</p>
            <p className={styles.brandSub}>Dashboard</p>
          </div>
        </div>

        <nav className={styles.nav}>
          <p className={styles.navHeading}>Navigation</p>
          {menuItems.map((item) => {
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
        </nav>

        <div className={styles.footer}>
          <div className={styles.userCard}>
            <div className={styles.userAvatar}>
              {loadingUser ? "..." : initials}
            </div>
            <div className={styles.userInfo}>
              {loadingUser ? (
                <div className={styles.userNameSkeleton} />
              ) : (
                <p className={styles.userName}>{displayName}</p>
              )}
              {!loadingUser && email && <p className={styles.userEmail}>{email}</p>}
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={styles.logoutButton}
          >
            <span className={styles.logoutIconWrap}>
              <LogOut className={styles.headerIcon} />
            </span>
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </aside>

      <div className={styles.content}>
        <header className={styles.header} style={styles.headerShadow}>
          <div className={styles.headerLeft}>
            <button
              className={styles.mobileMenuButton}
              onClick={() => setSidebarOpen((value) => !value)}
            >
              {sidebarOpen ? (
                <X className={styles.headerIcon} />
              ) : (
                <Menu className={styles.headerIcon} />
              )}
            </button>
            <div className={styles.breadcrumb}>
              <span className={styles.breadcrumbRoot}>SafeBite</span>
              <ChevronRight className={styles.breadcrumbArrow} />
              <span className={styles.breadcrumbCurrent}>{activeItem?.label}</span>
            </div>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.headerText}>
              {loadingUser ? (
                <div className={styles.headerNameSkeleton} />
              ) : (
                <p className={styles.headerName}>{displayName}</p>
              )}
              <p className={styles.headerSub}>Welcome back!</p>
            </div>
            <button
              onClick={() => navigateToSection("profile")}
              className={styles.headerAvatar}
            >
              {loadingUser ? <User className={styles.headerIcon} /> : initials}
            </button>
          </div>
        </header>

        <main className={styles.main}>
          <div className={styles.mainInner}>{renderContent()}</div>
        </main>
      </div>
    </div>
  );
}
