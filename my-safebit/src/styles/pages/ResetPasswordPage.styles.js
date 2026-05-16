export const styles = {
  page: "min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-emerald-50 via-white to-green-50",
  container: "w-full max-w-md",
  card: "bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden",
  successCard: "w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 p-10 text-center",
  successIconWrap: "mx-auto mb-5 h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center",
  successIcon: "h-8 w-8 text-emerald-600",
  successTitle: "text-xl font-bold text-gray-900 mb-2",
  successText: "text-sm text-gray-500",
  header: "px-8 pt-8 pb-6 border-b border-gray-100",
  logoRow: "flex items-center justify-center mb-6",
  logo: "h-10 object-contain",
  headingWrap: "text-center",
  title: "text-2xl font-bold text-gray-900 tracking-tight",
  subtitle: "text-sm text-gray-400 mt-1",
  body: "px-8 py-7",
  errorBanner: "mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5",
  errorBannerIconWrap: "mt-px h-4 w-4 rounded-full bg-red-500 flex-shrink-0 flex items-center justify-center",
  errorBannerIcon: "h-2.5 w-2.5 text-white",
  errorBannerText: "text-sm text-red-700 leading-relaxed",
  form: "space-y-5",
  label: "block text-sm font-medium text-gray-700 mb-1.5",
  required: "text-red-500 ml-0.5",
  passwordWrap: "relative",
  passwordToggle: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none",
  passwordToggleIcon: "h-4 w-4",
  fieldErrorWrap: "flex items-center gap-1.5 mt-1.5",
  fieldErrorIcon: "h-3.5 w-3.5 text-red-500 flex-shrink-0",
  fieldErrorText: "text-xs text-red-500 leading-snug whitespace-pre-line",
  passwordMatchWrap: "flex items-center gap-1.5 mt-1.5",
  passwordMatchIconWrap: "h-3.5 w-3.5 rounded-full bg-emerald-500 flex items-center justify-center",
  passwordMatchIcon: "h-2 w-2 text-white",
  passwordMatchText: "text-xs text-emerald-700 font-medium",
  submitButton: "w-full h-11 mt-1 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 active:scale-[0.99] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
  submitSpinnerWrap: "flex items-center justify-center gap-2",
  submitSpinner: "h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin",
};

export const getPasswordInputClass = (hasError) =>
  `w-full h-10 rounded-lg border px-3 pr-10 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500 placeholder:text-gray-400 transition-colors ${
    hasError
      ? "border-red-400 bg-red-50/40 focus:ring-red-400"
      : "border-gray-300 hover:border-gray-400"
  }`;
