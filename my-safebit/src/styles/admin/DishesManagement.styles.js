export const styles = {
  page: "space-y-6",
  header: "flex flex-col md:flex-row md:items-center justify-between gap-4",
  title: "text-xl font-bold text-gray-900 tracking-tight",
  subtitle: "text-sm text-gray-400 mt-0.5",
  searchWrap: "relative w-full md:w-72",
  searchIcon:
    "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400",
  searchInput:
    "w-full h-10 pl-9 pr-9 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#11915f] placeholder:text-gray-400 transition-colors hover:border-gray-300",
  clearButton:
    "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors",
  summaryGrid: "grid grid-cols-1 sm:grid-cols-3 gap-4",
  summaryCard: "bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4",
  summaryIconWrap: "h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0",
  summaryBlue: "bg-blue-50",
  summaryEmerald: "bg-emerald-50",
  summaryAmber: "bg-amber-50",
  summaryBlueIcon: "h-6 w-6 text-blue-600",
  summaryEmeraldIcon: "h-6 w-6 text-emerald-600",
  summaryAmberIcon: "h-6 w-6 text-amber-600",
  summaryLabel: "text-xs font-semibold uppercase tracking-wider text-gray-400",
  summaryValue: "text-2xl font-bold text-gray-900 mt-0.5",
  summaryBody: "text-xs text-gray-400 mt-0.5",
  skeletonBar: "h-4 bg-gray-100 rounded animate-pulse",
  summaryValueSkeleton: "inline-block h-7 w-16 bg-gray-100 rounded animate-pulse",
  errorBanner: "flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3",
  errorIcon: "h-4 w-4 text-red-500 mt-0.5 flex-shrink-0",
  errorText: "text-sm text-red-700 flex-1 leading-relaxed",
  dismissButton: "text-red-400 hover:text-red-600 transition-colors flex-shrink-0",
  dismissIcon: "h-4 w-4",
  infoRow: "grid grid-cols-[140px_1fr]",
  infoRowBorder: "border-b border-gray-100",
  infoLabel: "bg-gray-50 px-4 py-3 text-sm font-medium text-gray-500",
  infoValue: "px-4 py-3 text-sm font-semibold text-gray-900 text-right min-w-0",
  infoValueTruncate: "block truncate",
  tableCard: "bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden",
  tableWrap: "overflow-x-auto",
  table: "w-full text-sm",
  tableHeadRow: "border-b border-gray-100 bg-gray-50/80",
  tableHead: "px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400",
  tableHeadRight: "text-right",
  tableSkeletonRow: "border-b border-gray-100",
  tableCell: "px-4 py-3.5",
  emptyState: "flex flex-col items-center gap-2 py-16 text-gray-400",
  emptyIcon: "h-8 w-8 opacity-30",
  emptyTitle: "text-sm font-medium",
  clearSearch: "text-xs text-[#11915f] hover:underline mt-1",
  row: "border-b border-gray-50 hover:bg-gray-50/60 transition-colors",
  rowAlt: "bg-gray-50/30",
  idPill: "font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md",
  nameText: "font-medium text-gray-900",
  mutedText: "text-gray-300",
  dateText: "text-sm text-gray-500",
  viewButton:
    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100 hover:border-blue-200 transition-all",
  viewButtonIcon: "h-3.5 w-3.5",
  statusTag: "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
  tableFooter: "flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50",
  footerText: "text-xs text-gray-400",
  footerEmphasis: "font-semibold text-gray-700",
  pager: "flex items-center gap-1.5",
  pagerButton:
    "h-8 w-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors",
  pagerEllipsis: "px-1 text-xs text-gray-400",
  pagerNumber: "h-8 min-w-[32px] px-2 rounded-lg text-xs font-medium transition-all",
  pagerNumberActive: "bg-[#11915f] text-white shadow-sm",
  pagerNumberIdle: "border border-gray-200 bg-white text-gray-600 hover:bg-gray-100",
  dialog:
    "max-w-xl p-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl [&>button]:hidden",
  dialogHeader: "relative px-6 py-5 border-b border-gray-100",
  dialogClose:
    "absolute right-5 top-5 h-9 w-9 rounded-full border border-gray-200 bg-white text-gray-500 flex items-center justify-center hover:bg-gray-50 hover:text-gray-900 transition",
  dialogCloseIcon: "h-4 w-4",
  dialogTitleRow: "flex items-center gap-4 pr-12",
  dialogIconWrap: "h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0",
  dialogIcon: "h-6 w-6 text-[#11915f]",
  dialogHeaderText: "text-left space-y-1 min-w-0",
  dialogTitle: "text-lg font-bold text-gray-950 truncate",
  dialogDescription: "text-sm text-gray-500",
  dialogBody: "px-6 py-6 space-y-6 max-h-[70vh] overflow-y-auto",
  sectionTitle: "text-xs font-bold uppercase tracking-[0.16em] text-gray-400 mb-3",
  sectionCard: "rounded-xl border border-gray-200 overflow-hidden bg-white",
  idBadge:
    "inline-flex rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 font-mono text-xs text-gray-700",
  helperText: "text-gray-400 font-medium",
  sectionHeader: "flex items-center justify-between mb-3",
  countText: "text-xs font-semibold text-gray-500",
  loadingBox: "flex items-center justify-center gap-3 py-10 rounded-xl border border-gray-200 bg-gray-50",
  loadingIcon: "h-5 w-5 animate-spin text-[#11915f]",
  loadingText: "text-sm font-medium text-gray-500",
  ingredientCard: "rounded-xl border border-gray-200 bg-white p-4",
  ingredientList: "flex flex-wrap gap-2 max-h-52 overflow-y-auto",
  ingredientChip:
    "inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700",
  noIngredients: "rounded-xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center",
  noIngredientsIcon: "mx-auto h-7 w-7 text-gray-300",
  noIngredientsTitle: "mt-3 text-sm font-semibold text-gray-700",
  noIngredientsBody: "mt-1 text-sm text-gray-400",
};

export const getStatusTagClass = (color = "blue") => {
  const colors = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
  };

  return `${styles.statusTag} ${colors[color] || colors.blue}`;
};

export const skeletonBarWidths = [180, 220, 160, 140, 80];

export const getSkeletonBarClass = (width) => {
  const widths = {
    80: "w-[80px]",
    140: "w-[140px]",
    160: "w-[160px]",
    180: "w-[180px]",
    220: "w-[220px]",
  };

  return `${styles.skeletonBar} ${widths[width] || ""}`.trim();
};

export const getRowClass = (index) =>
  `${styles.row} ${index % 2 === 0 ? "" : styles.rowAlt}`.trim();

export const getPagerNumberClass = (isActive) =>
  `${styles.pagerNumber} ${isActive ? styles.pagerNumberActive : styles.pagerNumberIdle}`;
