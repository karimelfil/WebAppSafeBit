export const styles = {
  page: "space-y-6",
  hero:
    "relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-6 md:p-8 text-white overflow-hidden",
  heroOverlay: "absolute inset-0 opacity-10 pointer-events-none",
  heroBubbleTop: "absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32",
  heroBubbleBottom:
    "absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full -ml-24 -mb-24",
  heroContent: "relative z-10 max-w-3xl",
  heroTitleRow: "flex items-center gap-2 mb-2",
  heroIcon: "h-5 w-5 text-yellow-300",
  heroTitle: "text-2xl md:text-3xl font-bold leading-tight",
  heroDescription: "text-emerald-50 mb-6 text-sm md:text-base",
  heroButton:
    "h-10 px-4 rounded-xl bg-white hover:bg-white shadow-sm text-sm font-semibold !text-[#00bc8a] hover:!text-[#00bc8a] [&_svg]:!text-[#00bc8a]",
  heroButtonIcon: "h-4 w-4 mr-2",
  smallIcon: "h-4 w-4",
  skeleton: "bg-gray-200 rounded animate-pulse",
  heroTitleSkeleton: "h-7 w-52 bg-white/30",
  chipSkeletonShort: "h-6 w-16",
  chipSkeletonMedium: "h-6 w-20",
  chipSkeletonLong: "h-6 w-24",
  pregnancySkeleton: "h-6 w-32",
  recentScanTitleSkeleton: "h-4 w-32",
  recentScanDateSkeleton: "h-3 w-20",
  recentScanPillSkeleton: "h-7 w-16 rounded-full",
  cardGrid: "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4",
  infoCard: "border border-gray-200 shadow-sm rounded-2xl",
  infoHeader: "pb-3",
  infoTitle: "flex items-center gap-2 text-sm font-semibold",
  badgeWrap: "h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0",
  allergiesBadge: "bg-red-50",
  diseasesBadge: "bg-amber-50",
  pregnancyBadge: "bg-pink-50",
  allergiesIcon: "h-4 w-4 text-red-500",
  diseasesIcon: "h-4 w-4 text-amber-500",
  pregnancyIcon: "h-4 w-4 text-pink-400",
  chipList: "flex flex-wrap gap-1.5",
  emptyText: "text-xs text-gray-400 italic",
  allergyChip:
    "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200",
  diseaseChip:
    "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200",
  pregnantChip:
    "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200",
  quickActionsCard: "border border-gray-200 shadow-sm rounded-2xl",
  quickActionsTitle: "flex items-center gap-2",
  quickActionsIcon: "h-5 w-5 text-emerald-600",
  quickActionsGrid: "grid grid-cols-1 md:grid-cols-3 gap-4",
  actionCard:
    "w-full justify-start items-start h-auto py-5 px-4 rounded-2xl bg-white transition-all",
  actionUpload: "border border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300",
  actionHistory: "border border-gray-200 hover:bg-blue-50 hover:border-blue-200",
  actionProfile: "border border-gray-200 hover:bg-purple-50 hover:border-purple-200",
  actionIconBox: "p-3 rounded-xl mr-4 shrink-0",
  actionUploadIconBox: "bg-emerald-100",
  actionHistoryIconBox: "bg-blue-100",
  actionProfileIconBox: "bg-purple-100",
  actionUploadIcon: "h-5 w-5 text-emerald-600",
  actionHistoryIcon: "h-5 w-5 text-blue-600",
  actionProfileIcon: "h-5 w-5 text-purple-600",
  actionText: "text-left",
  actionTitle: "font-semibold text-gray-900",
  actionBody: "text-xs text-gray-500 mt-1",
  scansCard: "shadow-sm rounded-2xl border border-gray-200",
  scansHeader: "flex items-center justify-between",
  viewAllButton: "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl",
  scansList: "space-y-3",
  scanRow:
    "flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200 hover:border-emerald-200 hover:shadow-sm transition-all",
  scanRowStatic: "flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200",
  scanMeta: "space-y-1.5",
  scanTitle: "font-medium text-gray-900",
  scanBody: "text-xs text-gray-500 mt-0.5",
  scanRight: "flex items-center gap-4",
  scanDate: "text-xs text-gray-500 font-medium hidden sm:block",
  warningPill:
    "flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-full border border-red-200",
  safePill:
    "flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full border border-green-200",
  pillText: "text-xs font-medium",
  tipsCard: "bg-white border border-gray-200 shadow-sm rounded-2xl",
  tipsTitle: "flex items-center gap-2",
  tipsList: "space-y-4",
  tipPrimary: "p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-2xl shadow-sm",
  tipPrimaryText: "text-sm text-blue-900 font-medium",
  tipSuccess:
    "p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-2xl shadow-sm",
  tipSuccessText: "text-sm text-emerald-900 font-medium",
  tipWarning: "p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-2xl shadow-sm",
  tipWarningText: "text-sm text-amber-900 font-medium",
};

export const getActionCardClass = (variant) =>
  `${styles.actionCard} ${
    variant === "upload"
      ? styles.actionUpload
      : variant === "history"
        ? styles.actionHistory
        : styles.actionProfile
  }`;

export const getActionIconBoxClass = (variant) =>
  `${styles.actionIconBox} ${
    variant === "upload"
      ? styles.actionUploadIconBox
      : variant === "history"
        ? styles.actionHistoryIconBox
        : styles.actionProfileIconBox
  }`;

export const getSkeletonClass = (className = "") =>
  `${styles.skeleton} ${className}`.trim();

export const getBadgeWrapClass = (variant) =>
  `${styles.badgeWrap} ${
    variant === "allergies"
      ? styles.allergiesBadge
      : variant === "diseases"
        ? styles.diseasesBadge
        : styles.pregnancyBadge
  }`;
