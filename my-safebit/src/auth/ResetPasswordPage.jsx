import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AlertCircle, Check, CheckCircle, Eye, EyeOff, X } from "lucide-react";
import logoImage from "../assets/logos/safebite.png";
import { resetPasswordApi } from "../services/auth";
import axios from "axios";
import {
  getPasswordInputClass,
  styles,
} from "../styles/pages/ResetPasswordPage.styles";


const getStrength = (pwd) => {
  if (!pwd) return null;

  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  const levels = [
    null,
    { label: "Very Weak", bar: "bg-red-500", text: "text-red-500" },
    { label: "Weak", bar: "bg-orange-400", text: "text-orange-400" },
    { label: "Fair", bar: "bg-yellow-400", text: "text-yellow-500" },
    { label: "Strong", bar: "bg-emerald-500", text: "text-emerald-600" },
    { label: "Very Strong", bar: "bg-emerald-600", text: "text-emerald-700" },
  ];

  return { score, ...levels[score] };
};

//  displaying field-specific error messages
function FieldError({ msg }) {
  if (!msg) return null;

  return (
    <div className={styles.fieldErrorWrap}>
      <AlertCircle className={styles.fieldErrorIcon} />
      <p className={styles.fieldErrorText}>{msg}</p>
    </div>
  );
}

//  password input with visibility toggle and strength meter
function PasswordInput({ id, value, onChange, hasError, autoComplete, placeholder }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={styles.passwordWrap}>
      <input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={getPasswordInputClass(hasError)}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        className={styles.passwordToggle}
        aria-label={visible ? "Show password" : "Hide password"}
      >
        {visible ? <Eye className={styles.passwordToggleIcon} /> : <EyeOff className={styles.passwordToggleIcon} />}
      </button>
    </div>
  );
}

//  visual password strength meter with specific criteria indicators
function PasswordStrengthBar({ password }) {
  const s = getStrength(password);
  if (!s) return null;

  const rules = [
    { met: password.length >= 8 && password.length <= 16, label: "Between 8-16 characters" },
    { met: /[A-Z]/.test(password), label: "Uppercase letter" },
    { met: /[a-z]/.test(password), label: "Lowercase letter" },
    { met: /[0-9]/.test(password), label: "Number" },
    { met: /[^A-Za-z0-9]/.test(password), label: "Special character" },
  ];

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= s.score ? s.bar : "bg-gray-200"}`}
            />
          ))}
        </div>
        <span className={`text-xs font-semibold w-20 text-right ${s.text}`}>{s.label}</span>
      </div>
      <div className="space-y-0.5">
        {rules.map((r) => (
          <div key={r.label} className="flex items-center gap-1.5">
            <div
              className={`h-3.5 w-3.5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                r.met ? "bg-emerald-500" : "bg-gray-200"
              }`}
            >
              {r.met && <Check className="h-2 w-2 text-white" strokeWidth={3} />}
            </div>
            <span className={`text-xs ${r.met ? "text-emerald-700" : "text-gray-400"}`}>{r.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ResetPasswordPage() {
  //read the token form the Url
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token");

  //states to store data 
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);


  //  clear specific field errors when user starts typing
  const clearErr = (field) =>
    setFieldErrors((prev) => {
      const { [field]: _, ...rest } = prev;
      return rest;
    });

    //  validate form fields before submission
  const validate = () => {
    const next = {};

    if (!newPassword) next.newPassword = "New password is required.";
    else if (newPassword.length < 8) next.newPassword = "Password must be at least 8 characters.";
    else if (newPassword.length > 16) next.newPassword = "Password cannot exceed 16 characters.";

    if (!confirmPassword) next.confirmPassword = "Please confirm your password.";
    else if (confirmPassword !== newPassword) next.confirmPassword = "Passwords do not match.";

    return next;
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!token) {
      setFormError("Invalid or missing reset token. Please request a new reset link.");
      return;
    }

    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors);
      setFormError("Please correct the highlighted fields.");
      return;
    }

    setFieldErrors({});
    setLoading(true);

    try {
      await resetPasswordApi({ token, newPassword, confirmPassword });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data;
        const msg =
          (typeof data === "string" ? data : null) ||
          data?.detail ||
          data?.message ||
          data?.error ||
          "Reset failed. Please try again.";

        const nextErrors = {};
        const lower = typeof msg === "string" ? msg.toLowerCase() : "";

        if (lower.includes("passwords do not match")) nextErrors.confirmPassword = msg;
        else if (lower.includes("token")) setFormError(msg);
        else if (lower.includes("password")) nextErrors.newPassword = msg;
        else setFormError(msg);

        if (Object.keys(nextErrors).length) {
          setFieldErrors(nextErrors);
          setFormError("Please correct the highlighted fields.");
        }
      } else {
        setFormError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.page}>
        <div className={styles.successCard}>
          <div className={styles.successIconWrap}>
            <CheckCircle className={styles.successIcon} />
          </div>
          <h2 className={styles.successTitle}>Password reset!</h2>
          <p className={styles.successText}>Redirecting you to the login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.logoRow}>
              <img src={logoImage} alt="SafeBite" className={styles.logo} />
            </div>
            <div className={styles.headingWrap}>
              <h1 className={styles.title}>Reset Password</h1>
              <p className={styles.subtitle}>Choose a strong new password for your account</p>
            </div>
          </div>

          <div className={styles.body}>
            {formError && (
              <div className={styles.errorBanner}>
                <div className={styles.errorBannerIconWrap}>
                  <X className={styles.errorBannerIcon} strokeWidth={3} />
                </div>
                <p className={styles.errorBannerText}>{formError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className={styles.form}>
              <div>
                <label className={styles.label}>
                  New Password
                  <span className={styles.required}>*</span>
                </label>
                <PasswordInput
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    clearErr("newPassword");
                  }}
                  hasError={Boolean(fieldErrors.newPassword)}
                  autoComplete="new-password"
                  placeholder="Enter new password (8-16 chars)"
                />
                <FieldError msg={fieldErrors.newPassword} />
                {!fieldErrors.newPassword && <PasswordStrengthBar password={newPassword} />}
              </div>

              <div>
                <label className={styles.label}>
                  Confirm Password
                  <span className={styles.required}>*</span>
                </label>
                <PasswordInput
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    clearErr("confirmPassword");
                  }}
                  hasError={Boolean(fieldErrors.confirmPassword)}
                  autoComplete="new-password"
                  placeholder="Re-enter your new password"
                />
                <FieldError msg={fieldErrors.confirmPassword} />
                {confirmPassword && !fieldErrors.confirmPassword && newPassword === confirmPassword && (
                  <div className={styles.passwordMatchWrap}>
                    <div className={styles.passwordMatchIconWrap}>
                      <Check className={styles.passwordMatchIcon} strokeWidth={3} />
                    </div>
                    <span className={styles.passwordMatchText}>Passwords match</span>
                  </div>
                )}
              </div>

              <button type="submit" disabled={loading} className={styles.submitButton}>
                {loading ? (
                  <span className={styles.submitSpinnerWrap}>
                    <span className={styles.submitSpinner} />
                    Resetting password...
                  </span>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
