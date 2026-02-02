// this file is login page component
import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import logoImage from '../../assets/logos/safebite.png';
import { loginApi } from '../../services/auth';
import axios from 'axios';
import { useNavigate } from "react-router-dom";


export function LoginPage({ onLogin, onNavigateToRegister }) {
  // ---- State ----
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
const navigate = useNavigate();

  // ---- LOGIN ----
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    //  CUSTOM VALIDATION 
    if (!email.trim()) {
      setErrorMsg('Email is required.');
      return;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!password.trim()) {
      setErrorMsg('Password is required.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await loginApi({ email, password });

      localStorage.setItem('sb_token', res.token);
      localStorage.setItem('sb_role', res.role);
      localStorage.setItem('sb_userId', String(res.userId));

      const roleLower = (res.role || '').toLowerCase();
      onLogin(roleLower === 'admin' ? 'admin' : 'user');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setErrorMsg('Incorrect email or password.');
        } else if (err.response?.status === 400) {
          setErrorMsg(err.response.data || 'Invalid request.');
        } else {
          setErrorMsg('Server error. Please try again later.');
        }
      } else {
        setErrorMsg('Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ---- FORGOT PASSWORD  ----
  const handleForgotPassword = (e) => {
    e.preventDefault();
    setResetSent(true);
    setTimeout(() => {
      setResetSent(false);
      setShowForgotPassword(false);
      setResetEmail('');
    }, 3000);
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-blue-50">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <img src={logoImage} alt="SafeBite Logo" className="h-20 w-20" />
            </div>
            <CardTitle className="text-center">Reset Password</CardTitle>
            <CardDescription className="text-center">
              Enter your email address and we'll send you a reset link
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {resetSent ? (
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">
                  Password reset link has been sent to your email!
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleForgotPassword} noValidate className="space-y-4">
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                  Send Reset Link
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setShowForgotPassword(false)}
                >
                  Back to Login
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-blue-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <img src={logoImage} alt="SafeBite Logo" className="h-24 w-24" />
          </div>
          <CardTitle className="text-center">Welcome to SafeBite</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4">
          {/*  Error Message */}
          {errorMsg && (
            <Alert className="mb-4 bg-red-50 border-red-200">
              <AlertDescription className="text-red-700">
                {errorMsg}
              </AlertDescription>
            </Alert>
          )}

          {/*  noValidate disables browser validation */}
          <form onSubmit={handleLogin} noValidate className="space-y-4">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

<button
  type="button"
  onClick={() => navigate("/forgot-password")}
  className="text-sm text-green-600 hover:text-green-700"
>
  Forgot Password?
</button>


            <Button
              type="submit"
              disabled={submitting}
              className={`w-full ${
                submitting
                  ? 'opacity-70 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {submitting ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
<button
  type="button"
  onClick={() => navigate("/register")}
  className="text-green-600 hover:text-green-700"
>
  Register here
</button>

            </p>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
