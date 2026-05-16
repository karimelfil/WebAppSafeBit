export const styles = {
  page: "min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-emerald-50 via-white to-green-50",
  container: "w-full max-w-md",
  card: "bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden",
  header: "px-8 pt-9 pb-7 border-b border-gray-100 text-center",
  logo: "h-20 object-contain mx-auto mb-5",
  title: "text-2xl font-bold text-gray-900 tracking-tight",
  subtitle: "text-sm text-gray-400 mt-1",
  body: "px-8 py-8",
  fieldErrorWrap: "flex items-center gap-1.5 mt-1.5",
  fieldErrorIcon: "h-3.5 w-3.5 text-red-500 flex-shrink-0",
  fieldErrorText: "text-xs text-red-500 leading-snug",
  generalError: "mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5",
  generalErrorIcon: "h-4 w-4 text-red-500 mt-px flex-shrink-0",
  generalErrorText: "text-sm text-red-700 leading-relaxed",
  form: "space-y-5",
  label: "block text-sm font-medium text-gray-700 mb-1.5",
  passwordRow: "flex items-center justify-between mb-1.5",
  forgotButton: "text-xs font-medium text-green-600 hover:text-green-700 hover:underline transition-colors",
  passwordWrap: "relative",
  passwordToggle: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none",
  passwordToggleIcon: "h-4 w-4",
  submitButton: "w-full h-11 mt-1 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 active:scale-[0.99] transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100",
  submitSpinnerWrap: "flex items-center justify-center gap-2",
  submitSpinner: "h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin",
  footer: "text-center text-sm text-gray-400 mt-6",
  footerButton: "text-green-600 font-semibold hover:underline transition-colors",
};

export const getInputClass = (hasError) =>
  `w-full h-11 rounded-lg border px-3.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-inset transition-colors placeholder:text-gray-400 ${
    hasError
      ? "border-red-400 bg-red-50/40 focus:ring-red-400"
      : "border-gray-300 hover:border-gray-400 focus:ring-green-500"
  }`;

export const getPasswordInputClass = (hasError) =>
  `${getInputClass(hasError)} pr-11`;
