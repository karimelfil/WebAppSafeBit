import { useState } from "react";
import { AlertCircle, ArrowLeft, CheckCircle, Mail, X } from "lucide-react";
import logoImage from "../assets/logos/safebite.png";
import { forgotPasswordApi } from "../services/auth";
import axios from "axios";
import {
  getInputClass,
  styles,
} from "../styles/pages/ForgotPasswordPage.styles";

// display field-specific error messages
function FieldError({ msg }) {
  if (!msg) return null;

  return (
    <div className={styles.fieldErrorWrap}>
      <AlertCircle className={styles.fieldErrorIcon} />
      <p className={styles.fieldErrorText}>{msg}</p>
    </div>
  );
}

export function ForgotPasswordPage({ onBack }) {

  //states to store data 
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [formError, setFormError] = useState(null);
  const [emailError, setEmailError] = useState(null);

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  //  handle form submission and validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setEmailError(null);
    setSuccessMsg(null);

    if (!email.trim()) {
      setEmailError("Email address is required.");
      setFormError("Please correct the highlighted fields.");
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setEmailError("Please enter a valid email address.");
      setFormError("Please correct the highlighted fields.");
      return;
    }
    if (email.length > 254) {
      setEmailError("Email cannot exceed 254 characters.");
      setFormError("Please correct the highlighted fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPasswordApi(email.trim());
      setSuccessMsg(typeof res === "string" ? res : "Reset link sent! Please check your inbox.");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data;
        const msg =
          (typeof data === "string" ? data : null) ||
          data?.detail ||
          data?.message ||
          data?.error ||
          "Something went wrong. Please try again.";

        if (typeof msg === "string" && msg.toLowerCase().includes("email")) {
          setEmailError(msg);
        }
        setFormError(msg);
      } else {
        setFormError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (successMsg) {
    return (
      <div className={styles.page}>
        <div className={styles.successCard}>
          <div className={styles.successIconWrap}>
            <CheckCircle className={styles.successIcon} />
          </div>
          <h2 className={styles.successTitle}>Check your inbox</h2>
          <p className={styles.successText}>{successMsg}</p>
          <button type="button" onClick={onBack} className={styles.successBack}>
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.headerRow}>
              <button type="button" onClick={onBack} className={styles.backButton}>
                <ArrowLeft className={styles.backIcon} />
                Back
              </button>
              <img src={logoImage} alt="SafeBite" className={styles.logo} />
              <div className={styles.spacer} />
            </div>

            <div className={styles.headingWrap}>
              <h1 className={styles.title}>Forgot Password</h1>
              <p className={styles.subtitle}>Enter your email and we'll send you a reset link</p>
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
                  Email Address
                  <span className={styles.required}>*</span>
                </label>
                <div className={styles.inputWrap}>
                  <Mail className={styles.inputIcon} />
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    placeholder="Enter your email address"
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError(null);
                      setFormError(null);
                    }}
                    className={getInputClass(emailError)}
                  />
                </div>
                <FieldError msg={emailError} />
              </div>

              <button type="submit" disabled={loading} className={styles.submitButton}>
                {loading ? (
                  <span className={styles.submitSpinnerWrap}>
                    <span className={styles.submitSpinner} />
                    Sending reset link...
                  </span>
                ) : (
                  "Send Reset Link"
                )}
              </button>

              <p className={styles.footer}>
                Remembered your password?{" "}
                <button type="button" onClick={onBack} className={styles.footerButton}>
                  Sign in
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
