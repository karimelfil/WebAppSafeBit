// this is forgot password page
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { forgotPasswordApi } from "../services/auth";
import logoImage from "../assets/logos/safebite.png";
import axios from "axios";

export function ForgotPasswordPage({ onBack }) {
  // State variables
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim()) {
      setErrorMsg("Email is required.");
      return;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPasswordApi(email);
      setSuccessMsg(res);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setErrorMsg(err.response?.data || "Something went wrong.");
      } else {
        setErrorMsg("Unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img src={logoImage} className="h-20 mx-auto mb-2" />
          <CardTitle>Forgot Password</CardTitle>
          <CardDescription>
            Enter your email to receive a reset link
          </CardDescription>
        </CardHeader>

        <CardContent>
          {errorMsg && (
            <Alert className="mb-4 bg-red-50 border-red-200">
              <AlertDescription className="text-red-700">{errorMsg}</AlertDescription>
            </Alert>
          )}

          {successMsg && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <AlertDescription className="text-green-700">{successMsg}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <Label>Email Address</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>

            <Button variant="ghost" type="button" className="w-full" onClick={onBack}>
              Back to Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
