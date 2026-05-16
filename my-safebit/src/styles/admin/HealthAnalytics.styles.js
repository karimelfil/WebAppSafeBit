export const styles = {
  page: "space-y-6",
  header: "flex flex-col sm:flex-row sm:items-center justify-between gap-3",
  title: "text-xl font-bold text-gray-900 tracking-tight",
  subtitle: "text-sm text-gray-400 mt-0.5",
  privacyBadge:
    "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-xs font-medium flex-shrink-0",
  privacyIcon: "h-3.5 w-3.5",
  errorBanner: "flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3",
  errorIcon: "h-4 w-4 text-red-500 mt-0.5 flex-shrink-0",
  errorText: "text-sm text-red-700 flex-1",
  errorDismiss: "text-red-400 hover:text-red-600 transition-colors",
  errorDismissIcon: "h-4 w-4",
  statsGrid: "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4",
  statCard: "bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4",
  statIconWrap: "h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0",
  statIcon: "h-6 w-6",
  statBody: "min-w-0",
  statLabel: "text-[10px] font-semibold uppercase tracking-wider text-gray-400 leading-none",
  statValue: "text-2xl font-bold mt-0.5 leading-none",
  statSub: "text-xs text-gray-400 mt-1",
  skeleton: "bg-gray-100 rounded animate-pulse",
  statValueSkeleton: "h-7 w-20 mt-1.5 mb-1",
  statSubSkeleton: "h-3 w-28 mt-1.5",
  loadingState: "flex flex-col items-center gap-3 py-20 text-gray-400",
  loadingIcon: "h-8 w-8 animate-spin text-[#11915f]",
  loadingText: "text-sm font-medium",
  splitGrid: "grid grid-cols-1 lg:grid-cols-2 gap-4",
  panel: "bg-white rounded-2xl border border-gray-100 shadow-sm p-5",
  sectionTitleWrap: "mb-5",
  sectionTitle: "text-sm font-bold text-gray-900 tracking-tight",
  sectionSub: "text-xs text-gray-400 mt-0.5",
  dividedList: "divide-y divide-gray-50",
  progressRow: "py-3 border-b border-gray-50 last:border-0",
  progressTop: "flex items-center justify-between mb-1.5",
  progressName: "text-sm font-medium text-gray-800",
  progressMeta: "flex items-center gap-3",
  progressUsers: "text-xs text-gray-400",
  progressPercent: "text-xs font-bold text-gray-700 w-12 text-right",
  progressTrack: "h-1.5 w-full bg-gray-100 rounded-full overflow-hidden",
  progressFill: "h-full rounded-full transition-all duration-500",
  emptyText: "text-sm text-gray-400 italic py-4",
  trendPanel: "bg-white rounded-2xl border border-gray-100 shadow-sm p-5",
  chartWrap: "relative flex items-end gap-1.5 px-2 pb-2 border-b border-gray-100",
  chartWrapTall: "h-40",
  chartBarGroup: "flex flex-col items-center gap-1 flex-1 min-w-0 group",
  chartTooltip:
    "opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] rounded-lg px-2.5 py-1.5 whitespace-nowrap z-10 shadow-lg pointer-events-none",
  chartTooltipAllergies: "text-blue-300",
  chartTooltipSeparator: "text-gray-400",
  chartTooltipDiseases: "text-purple-300",
  chartTooltipArrow:
    "absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-4 border-transparent border-t-gray-900",
  chartBars: "w-full flex items-end justify-center gap-0.5",
  chartBarsTall: "h-32",
  allergyBar: "flex-1 bg-blue-400 rounded-t-sm hover:bg-blue-500 transition-colors",
  diseaseBar: "flex-1 bg-violet-400 rounded-t-sm hover:bg-violet-500 transition-colors",
  chartMonth: "text-[9px] text-gray-400 font-medium truncate w-full text-center",
  legend: "flex items-center justify-center gap-6 mt-3",
  legendItem: "flex items-center gap-1.5",
  legendSwatch: "h-2.5 w-2.5 rounded-sm flex-shrink-0",
  legendSwatchAllergies: "bg-blue-400",
  legendSwatchConditions: "bg-violet-400",
  legendText: "text-xs text-gray-500 font-medium",
  trendGrid: "mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2",
  trendCard: "rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 text-center",
  trendMonth: "text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1",
  trendAllergy: "text-sm font-bold text-blue-700",
  trendDisease: "text-sm font-bold text-violet-700 mt-1",
  trendLabel: "text-[10px] text-gray-400",
  insightsGrid: "grid grid-cols-1 sm:grid-cols-2 gap-3",
  insightCard: "rounded-xl border px-4 py-3.5",
  insightHeader: "flex items-center gap-2 mb-1.5",
  insightDot: "h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 bg-opacity-20",
  insightIcon: "h-3 w-3",
  insightTitle: "text-sm font-semibold",
  insightBody: "text-xs leading-relaxed pl-7",
  insightsEmpty: "text-sm text-gray-400 italic col-span-2",
};

export const statTones = {
  blue: {
    wrap: "bg-blue-50",
    icon: "text-blue-600",
    value: "text-blue-900",
  },
  amber: {
    wrap: "bg-amber-50",
    icon: "text-amber-600",
    value: "text-amber-900",
  },
  purple: {
    wrap: "bg-purple-50",
    icon: "text-purple-600",
    value: "text-purple-900",
  },
  emerald: {
    wrap: "bg-emerald-50",
    icon: "text-emerald-600",
    value: "text-emerald-900",
  },
};

export const insightTones = {
  primary: {
    card: "bg-blue-50 border-blue-200",
    title: "text-blue-800",
    body: "text-blue-700",
    dot: "bg-blue-500",
  },
  warning: {
    card: "bg-amber-50 border-amber-200",
    title: "text-amber-800",
    body: "text-amber-700",
    dot: "bg-amber-500",
  },
  info: {
    card: "bg-purple-50 border-purple-200",
    title: "text-purple-800",
    body: "text-purple-700",
    dot: "bg-purple-500",
  },
  success: {
    card: "bg-emerald-50 border-emerald-200",
    title: "text-emerald-800",
    body: "text-emerald-700",
    dot: "bg-emerald-500",
  },
};

export const getSkeletonClass = (className = "") =>
  `${styles.skeleton} ${className}`.trim();

export const getStatIconWrapClass = (tone) =>
  `${styles.statIconWrap} ${statTones[tone]?.wrap || ""}`.trim();

export const getStatIconClass = (tone) =>
  `${styles.statIcon} ${statTones[tone]?.icon || ""}`.trim();

export const getStatValueClass = (tone) =>
  `${styles.statValue} ${statTones[tone]?.value || ""}`.trim();

export const getProgressFillClass = (tone) =>
  `${styles.progressFill} ${tone === "violet" ? "bg-violet-400" : "bg-amber-400"}`.trim();

export const getProgressWidthStyle = (pct) => ({
  width: `${Math.round(Math.min(100, Math.max(0, pct)))}%`,
});

export const getChartHeightStyle = (pct) => ({
  height: `${Math.round(Math.max(2, pct))}%`,
});

export const getLegendSwatchClass = (tone) =>
  `${styles.legendSwatch} ${
    tone === "conditions" ? styles.legendSwatchConditions : styles.legendSwatchAllergies
  }`.trim();

export const getInsightCardClass = (tone) =>
  `${styles.insightCard} ${insightTones[tone]?.card || insightTones.info.card}`.trim();

export const getInsightDotClass = (tone) =>
  `${styles.insightDot} ${insightTones[tone]?.dot || insightTones.info.dot}`.trim();

export const getInsightIconClass = (tone) =>
  `${styles.insightIcon} ${insightTones[tone]?.title || insightTones.info.title}`.trim();

export const getInsightTitleClass = (tone) =>
  `${styles.insightTitle} ${insightTones[tone]?.title || insightTones.info.title}`.trim();

export const getInsightBodyClass = (tone) =>
  `${styles.insightBody} ${insightTones[tone]?.body || insightTones.info.body}`.trim();
