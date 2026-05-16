export const styles = {
  page: "flex h-screen bg-[#f5f7f5] overflow-hidden font-sans",
  overlay: "fixed inset-0 z-20 bg-black/30 backdrop-blur-sm lg:hidden",
  sidebar:
    "fixed lg:static inset-y-0 left-0 z-30 flex flex-col w-64 bg-white border-r border-gray-100 shadow-[4px_0_24px_0_rgba(0,0,0,0.04)] transform transition-transform duration-300 ease-in-out lg:translate-x-0",
  sidebarHeader: "flex items-center justify-between px-5 py-5 border-b border-gray-100",
  sidebarBrand: "flex items-center gap-3",
  logoWrap:
    "h-12 w-12 rounded-xl bg-[#e7f7ef] flex items-center justify-center flex-shrink-0 overflow-hidden",
  logo: "h-9 w-9 object-contain",
  brand: "text-[15px] font-bold text-gray-900 tracking-tight leading-none",
  brandSub: "text-[11px] text-gray-400 mt-0.5 font-medium tracking-wide uppercase",
  closeButton:
    "lg:hidden h-7 w-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors",
  nav: "flex-1 overflow-y-auto px-3 py-4 space-y-4",
  navSectionLabel: "text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-3 mb-2",
  navList: "space-y-0.5",
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
  adminCard: "flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gray-50 mb-2",
  adminAvatar:
    "h-8 w-8 rounded-full bg-gradient-to-br from-[#11915f] to-[#0d7a4f] flex items-center justify-center text-white text-xs font-bold flex-shrink-0 select-none",
  adminTitle: "text-xs font-semibold text-gray-800 leading-none",
  adminSub: "text-[10px] text-gray-400 mt-0.5",
  logoutButton:
    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed group",
  logoutIconWrap:
    "h-8 w-8 rounded-lg bg-gray-100 group-hover:bg-red-100 flex items-center justify-center flex-shrink-0 transition-all",
  content: "flex-1 flex flex-col min-w-0 overflow-hidden",
  header:
    "flex-shrink-0 bg-white border-b border-gray-100 shadow-[0_1px_0_0_#f0f0f0] px-4 lg:px-6 h-[60px] flex items-center justify-between",
  headerLeft: "flex items-center gap-3",
  menuButton:
    "lg:hidden h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors",
  breadcrumb: "flex items-center gap-1.5 text-sm",
  breadcrumbRoot: "text-gray-400 font-medium",
  breadcrumbArrow: "h-3.5 w-3.5 text-gray-300",
  breadcrumbCurrent: "font-semibold text-gray-800",
  headerRight: "hidden sm:flex items-center gap-2.5",
  headerRightText: "text-right",
  main: "flex-1 overflow-y-auto",
  mainInner: "max-w-7xl mx-auto px-4 lg:px-6 py-6",
  skeleton: "bg-gray-100 rounded animate-pulse",
  statCard: "bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4",
  statIconWrap: "h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0",
  statIcon: "h-6 w-6",
  statTextWrap: "min-w-0",
  statLabel: "text-[10px] font-semibold uppercase tracking-wider text-gray-400 leading-none",
  statValueLoading: "h-7 w-20 mt-1.5 mb-1",
  statValue: "text-2xl font-bold text-gray-900 mt-0.5 leading-none",
  statSubLoading: "h-3 w-28 mt-1.5",
  statSub: "text-xs text-gray-400 mt-1",
  actionCard:
    "group w-full text-left bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-[#11915f]/30 hover:shadow-md transition-all duration-150 active:scale-[0.99]",
  actionIconWrap:
    "h-10 w-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform",
  actionIcon: "h-5 w-5",
  actionLabel: "text-sm font-semibold text-gray-900",
  actionSub: "text-xs text-gray-400 mt-0.5",
  overview: "space-y-6",
  errorBanner: "flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3",
  errorIcon: "h-4 w-4 text-red-500 flex-shrink-0",
  errorText: "text-sm text-red-700",
  statsGrid: "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4",
  overviewGrid: "grid grid-cols-1 lg:grid-cols-3 gap-4",
  overviewSidebarCol: "lg:col-span-1",
  overviewMainCol: "lg:col-span-2",
  panel: "bg-white rounded-2xl border border-gray-100 shadow-sm p-5 h-full",
  panelLabel: "text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-4",
  quickActionsList: "space-y-2.5",
  activityHeader: "flex items-center justify-between mb-4",
  activityHeaderLabel: "text-[10px] font-semibold uppercase tracking-widest text-gray-400",
  activityHeaderIcon: "h-3.5 w-3.5 text-gray-300",
  activityLoadingList: "space-y-3",
  activityLoadingRow: "flex items-center gap-3",
  activityLoadingIcon: "h-7 w-7 rounded-full flex-shrink-0",
  activityLoadingText: "flex-1 space-y-1.5",
  activityLoadingPrimary: "h-3 w-3/4",
  activityLoadingSecondary: "h-2.5 w-16",
  activityEmpty: "flex flex-col items-center gap-2 py-10 text-gray-400",
  activityEmptyIcon: "h-7 w-7 opacity-30",
  activityEmptyText: "text-sm",
  activityList: "space-y-0.5",
  activityItem: "flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0",
  activityIconWrap: "h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0",
  activityUserIcon: "h-3.5 w-3.5 text-blue-500",
  activityFeedbackIcon: "h-3.5 w-3.5 text-purple-500",
  activityText: "text-sm text-gray-700 flex-1 truncate",
  activityTime: "text-[11px] text-gray-400 font-medium flex-shrink-0 tabular-nums",
};

export const cardTones = {
  blue: {
    bg: "bg-blue-50",
    icon: "text-blue-600",
  },
  emerald: {
    bg: "bg-emerald-50",
    icon: "text-emerald-600",
  },
  amber: {
    bg: "bg-amber-50",
    icon: "text-amber-600",
  },
  purple: {
    bg: "bg-purple-50",
    icon: "text-purple-600",
  },
};

export const getSidebarClass = (sidebarOpen) =>
  `${styles.sidebar} ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`;

export const getNavButtonClass = (isActive) =>
  `${styles.navButton} ${isActive ? styles.navButtonActive : styles.navButtonIdle}`;

export const getNavIconWrapClass = (isActive) =>
  `${styles.navIconWrap} ${isActive ? styles.navIconWrapActive : styles.navIconWrapIdle}`;

export const getSkeletonClass = (className = "") =>
  `${styles.skeleton} ${className}`.trim();

export const getStatIconWrapClass = (tone) =>
  `${styles.statIconWrap} ${cardTones[tone]?.bg || ""}`.trim();

export const getStatIconClass = (tone) =>
  `${styles.statIcon} ${cardTones[tone]?.icon || ""}`.trim();

export const getActionIconWrapClass = (tone) =>
  `${styles.actionIconWrap} ${cardTones[tone]?.bg || ""}`.trim();

export const getActionIconClass = (tone) =>
  `${styles.actionIcon} ${cardTones[tone]?.icon || ""}`.trim();
