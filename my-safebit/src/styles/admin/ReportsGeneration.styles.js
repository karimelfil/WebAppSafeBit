export const styles = {
  page: "space-y-6",
  title: "text-xl font-bold text-gray-900 tracking-tight",
  subtitle: "text-sm text-gray-400 mt-0.5",
  notice: "flex items-start gap-3 rounded-xl border px-4 py-3",
  noticeError: "border-red-200 bg-red-50",
  noticeSuccess: "border-emerald-200 bg-emerald-50",
  noticeIcon: "mt-0.5 flex-shrink-0",
  noticeIconError: "text-red-500",
  noticeIconSuccess: "text-emerald-600",
  noticeText: "text-sm flex-1",
  noticeTextError: "text-red-700",
  noticeTextSuccess: "text-emerald-700",
  noticeClose: "text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0",
  noticeAlertIcon: "h-4 w-4",
  noticeCloseIcon: "h-3.5 w-3.5",
  fieldWrap: "space-y-1.5",
  fieldLabel:
    "flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400",
  fieldLabelIcon: "h-3 w-3",
  selectTrigger:
    "h-10 text-sm bg-white border-gray-200 rounded-xl focus:ring-2 focus:ring-inset focus:ring-[#11915f] hover:border-gray-300 transition-colors",
  selectContent:
    "z-[120] bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden",
  selectItem:
    "py-2.5 text-sm cursor-pointer focus:bg-[#e7f7ef] hover:bg-[#e7f7ef] focus:text-[#0e7a52]",
  summaryChip: "flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-xs font-medium",
  summaryIcon: "h-3.5 w-3.5 flex-shrink-0",
  summaryLabel: "opacity-70 leading-none text-[10px] uppercase tracking-wider",
  summaryValue: "font-semibold mt-0.5 leading-none",
  configCard: "bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden",
  configStrip: "h-1 bg-gradient-to-r from-[#11915f] to-[#16c47a]",
  configHeader: "px-5 pt-5 pb-2 border-b border-gray-100",
  configHeaderRow: "flex items-center gap-2.5",
  configHeaderIconWrap: "h-8 w-8 rounded-lg bg-[#e7f7ef] flex items-center justify-center flex-shrink-0",
  configHeaderIcon: "h-4 w-4 text-[#11915f]",
  configHeaderTitle: "text-sm font-bold text-gray-900",
  configHeaderBody: "text-xs text-gray-400",
  configBody: "p-5 space-y-5",
  selectGrid: "grid grid-cols-1 md:grid-cols-3 gap-4",
  summaryGrid: "flex flex-wrap gap-2",
  actionsGrid: "grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1",
  primaryButton:
    "h-11 rounded-xl bg-[#11915f] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#0e7a52] active:scale-[0.99] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed",
  secondaryButton:
    "h-11 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 hover:border-gray-300 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed",
  actionIcon: "h-4 w-4",
  loadingIcon: "h-4 w-4 animate-spin",
  resultsCard: "bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden",
  resultsHeader: "px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3",
  resultsTitle: "text-sm font-bold text-gray-900",
  resultsSub: "text-xs text-gray-400 mt-0.5",
  recordsBadge:
    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 border border-blue-200 text-blue-700",
  tableWrap: "overflow-x-auto",
  table: "w-full text-sm",
  tableHeadRow: "border-b border-gray-100 bg-gray-50/80",
  tableHead: "px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400",
  tableHeadWide: "w-64",
  emptyState: "flex flex-col items-center gap-2 py-16 text-gray-400",
  emptyIcon: "h-7 w-7 opacity-30",
  emptyText: "text-sm",
  tableRow: "border-b border-gray-50 hover:bg-gray-50/60 transition-colors",
  tableRowAlt: "bg-gray-50/30",
  categoryCell: "px-5 py-3.5 font-medium text-gray-900",
  countCell: "px-5 py-3.5",
  countBadge:
    "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700",
  percentCell: "px-5 py-3.5",
  percentRow: "flex items-center gap-3",
  percentTrack: "flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-40",
  percentFill:
    "h-full bg-gradient-to-r from-[#11915f] to-[#16c47a] rounded-full transition-all duration-500",
  percentValue: "text-xs font-semibold text-gray-700 tabular-nums w-12",
  footer:
    "px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between",
  footerText: "text-xs text-gray-400",
  footerButton:
    "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#11915f] text-white hover:bg-[#0e7a52] transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
  footerIcon: "h-3.5 w-3.5",
};

export const getNoticeClass = (type) =>
  `${styles.notice} ${type === "error" ? styles.noticeError : styles.noticeSuccess}`;

export const getNoticeIconClass = (type) =>
  `${styles.noticeIcon} ${type === "error" ? styles.noticeIconError : styles.noticeIconSuccess}`;

export const getNoticeTextClass = (type) =>
  `${styles.noticeText} ${type === "error" ? styles.noticeTextError : styles.noticeTextSuccess}`;

export const getSummaryChipClass = (color) => {
  const colors = {
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
  };

  return `${styles.summaryChip} ${colors[color] || colors.emerald}`;
};

export const getTableRowClass = (index) =>
  `${styles.tableRow} ${index % 2 === 0 ? "" : styles.tableRowAlt}`.trim();

export const getPercentWidthStyle = (pct) => ({ width: `${pct}%` });
