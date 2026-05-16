import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import logoImage from "../assets/logos/safebite.png";
import { loginApi } from "../services/auth";
import {
  getInputClass,
  getPasswordInputClass,
  styles,
} from "../styles/pages/LoginPage.styles";

//  component for displaying field errors
function FieldError({ message }) {
  if (!message) return null;

  return (
    <div className={styles.fieldErrorWrap}>
      <AlertCircle className={styles.fieldErrorIcon} />
      <p className={styles.fieldErrorText}>{message}</p>
    </div>
  );
}

//  password input with visibility toggle
function PasswordInput({ value, onChange, hasError, autoComplete, placeholder, id }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={styles.passwordWrap}>
      <input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder={placeholder || "Enter your password"}
        className={getPasswordInputClass(hasError)}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        className={styles.passwordToggle}
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff className={styles.passwordToggleIcon} /> : <Eye className={styles.passwordToggleIcon} />}
      </button>
    </div>
  );
}

export function LoginPage({ onLogin }) {
  const navigate = useNavigate();

  //state to store data 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");

  //  function to clear error messages
  const clearErrors = () => {
    setEmailError("");
    setPasswordError("");
    setGeneralError("");
  };

  //  function to validate form inputs
  const validate = () => {
    let valid = true;
    setEmailError("");
    setPasswordError("");

    if (!email.trim()) {
      setEmailError("Email address is required.");
      valid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setEmailError("Please enter a valid email address.");
      valid = false;
    }

    if (!password) {
      setPasswordError("Password is required.");
      valid = false;
    }

    return valid;
  };


  //  function to handle form submission and login logic
  const handleLogin = async (e) => {
    e.preventDefault();
    clearErrors();
    if (!validate()) return;

    setSubmitting(true);

    try {
      const res = await loginApi({ email: email.trim(), password });

      localStorage.setItem("sb_token", res.token);
      localStorage.setItem("sb_role", res.role);
      localStorage.setItem("sb_userId", String(res.userId));
      sessionStorage.setItem("sb_session_active", "1");

      const roleLower = (res.role || "").toLowerCase();
      onLogin(roleLower === "admin" ? "admin" : "user");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setEmailError("Incorrect email or password.");
          setPasswordError("Incorrect email or password.");
        } else if (err.response?.status === 400) {
          setGeneralError(err.response.data || "Invalid request.");
        } else {
          setGeneralError("Server error. Please try again later.");
        }
      } else {
        setGeneralError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  //  determine if fields have errors for styling
  const emailHasError = Boolean(emailError);
  const passwordHasError = Boolean(passwordError);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <img src={logoImage} alt="SafeBite" className={styles.logo} />
            <h1 className={styles.title}>Welcome back</h1>
            <p className={styles.subtitle}>Sign in to your SafeBite account</p>
          </div>

          <div className={styles.body}>
            {generalError && (
              <div className={styles.generalError}>
                <AlertCircle className={styles.generalErrorIcon} />
                <p className={styles.generalErrorText}>{generalError}</p>
              </div>
            )}

            <form onSubmit={handleLogin} noValidate className={styles.form}>
              <div>
                <label htmlFor="email" className={styles.label}>
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  placeholder="Enter your email address"
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError("");
                    if (generalError) setGeneralError("");
                  }}
                  className={getInputClass(emailHasError)}
                />
                <FieldError message={emailError} />
              </div>

              <div>
                <div className={styles.passwordRow}>
                  <label htmlFor="password" className={styles.label}>
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className={styles.forgotButton}
                  >
                    Forgot password?
                  </button>
                </div>
                <PasswordInput
                  id="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError("");
                    if (generalError) setGeneralError("");
                  }}
                  hasError={passwordHasError}
                  autoComplete="current-password"
                />
                <FieldError message={passwordError} />
              </div>

              <button type="submit" disabled={submitting} className={styles.submitButton}>
                {submitting ? (
                  <span className={styles.submitSpinnerWrap}>
                    <span className={styles.submitSpinner} />
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <p className={styles.footer}>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className={styles.footerButton}
              >
                Create one
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
