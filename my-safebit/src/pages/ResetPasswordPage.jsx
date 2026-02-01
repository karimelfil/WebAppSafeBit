import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { resetPasswordApi } from "../services/auth";
import axios from "axios";

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!token) {
      setErrorMsg("Invalid or missing reset token.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setErrorMsg("All fields are required.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await resetPasswordApi({
        token,
        newPassword,
        confirmPassword,
      });
      setSuccessMsg(res);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setErrorMsg(err.response?.data || "Reset failed.");
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
          <CardTitle>Reset Password</CardTitle>
        </CardHeader>

        <CardContent>
          {errorMsg && (
            <Alert className="mb-4 bg-red-50 border-red-200">
              <AlertDescription className="text-red-700">{errorMsg}</AlertDescription>
            </Alert>
          )}

          {successMsg && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <AlertDescription className="text-green-700">
                {successMsg} Redirecting to login…
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <Label>New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div>
              <Label>Confirm Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
