export const styles = {
  page: "flex h-screen bg-[#f5f7f5] font-sans overflow-hidden",
  overlay: "fixed inset-0 z-20 bg-black/30 backdrop-blur-sm md:hidden",
  sidebar:
    "fixed md:static inset-y-0 left-0 z-30 flex flex-col w-64 bg-white border-r border-gray-100 transform transition-transform duration-300 ease-in-out md:translate-x-0",
  sidebarShadow: { boxShadow: "4px 0 24px 0 rgba(0,0,0,0.04)" },
  sidebarHeader: "flex items-center gap-3 px-5 py-5 border-b border-gray-100",
  sidebarLogoWrap:
    "h-12 w-12 rounded-xl bg-[#e7f7ef] flex items-center justify-center flex-shrink-0 overflow-hidden",
  sidebarLogo: "h-9 w-9 object-contain",
  brand: "text-[15px] font-bold text-gray-900 tracking-tight leading-none",
  brandSub: "text-[11px] text-gray-400 mt-0.5 font-medium tracking-wide uppercase",
  nav: "flex-1 overflow-y-auto px-3 py-4 space-y-0.5",
  navHeading: "text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-3 mb-3",
  navButton:
    "w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
  navButtonActive: "bg-[#e7f7ef] text-[#0e7a52]",
  navButtonIdle: "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
  navIconWrap:
    "h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all",
  navIconWrapActive: "bg-[#11915f] text-white shadow-sm",
  navIconWrapIdle: "bg-gray-100 text-gray-500 group-hover:bg-gray-200",
  navIcon: "h-4 w-4",
  navText: "flex-1 text-left",
  navDot: "h-1.5 w-1.5 rounded-full bg-[#11915f]",
  footer: "px-3 py-4 border-t border-gray-100 space-y-1",
  userCard: "flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gray-50 mb-2",
  userAvatar:
    "h-8 w-8 rounded-full bg-gradient-to-br from-[#11915f] to-[#0d7a4f] flex items-center justify-center text-white text-xs font-bold flex-shrink-0 select-none",
  userInfo: "min-w-0",
  userNameSkeleton: "h-2.5 w-24 bg-gray-200 rounded animate-pulse",
  userName: "text-xs font-semibold text-gray-800 truncate leading-none",
  userEmail: "text-[10px] text-gray-400 truncate mt-0.5",
  logoutButton:
    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed group",
  logoutIconWrap:
    "h-8 w-8 rounded-lg bg-gray-100 group-hover:bg-red-100 flex items-center justify-center flex-shrink-0 transition-all",
  content: "flex-1 flex flex-col min-w-0 overflow-hidden",
  header:
    "flex-shrink-0 bg-white border-b border-gray-100 px-4 md:px-6 h-[60px] flex items-center justify-between",
  headerShadow: { boxShadow: "0 1px 0 0 #f0f0f0" },
  headerLeft: "flex items-center gap-3",
  mobileMenuButton:
    "md:hidden h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors",
  headerIcon: "h-4 w-4",
  breadcrumb: "flex items-center gap-1.5 text-sm",
  breadcrumbRoot: "text-gray-400 font-medium",
  breadcrumbArrow: "h-3.5 w-3.5 text-gray-300",
  breadcrumbCurrent: "font-semibold text-gray-800",
  headerRight: "flex items-center gap-2.5",
  headerText: "text-right hidden sm:block",
  headerNameSkeleton: "h-2.5 w-24 bg-gray-100 rounded animate-pulse",
  headerName: "text-xs font-semibold text-gray-800 leading-none",
  headerSub: "text-[11px] text-gray-400 mt-0.5",
  headerAvatar:
    "h-8 w-8 rounded-full bg-gradient-to-br from-[#11915f] to-[#0d7a4f] flex items-center justify-center text-white text-xs font-bold shadow-sm hover:shadow-md transition-shadow flex-shrink-0 select-none",
  main: "flex-1 overflow-y-auto",
  mainInner: "max-w-6xl mx-auto px-4 md:px-6 py-6",
};

export const getSidebarClass = (sidebarOpen) =>
  `${styles.sidebar} ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`;

export const getNavButtonClass = (isActive) =>
  `${styles.navButton} ${
    isActive ? styles.navButtonActive : styles.navButtonIdle
  }`;

export const getNavIconWrapClass = (isActive) =>
  `${styles.navIconWrap} ${
    isActive ? styles.navIconWrapActive : styles.navIconWrapIdle
  }`;
