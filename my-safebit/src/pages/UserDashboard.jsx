import { useNavigate } from "react-router-dom";
import { logout } from "../services/auth";
import { Button } from "../components/ui/button"; // adjust path if needed

export default function UserDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // clears localStorage
    navigate("/", { replace: true }); // redirect to login
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-green-700">
          User Dashboard
        </h1>

        <Button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700"
        >
          Logout
        </Button>
      </div>

      <p className="mt-4">
        You are logged in as <strong>User</strong>.
      </p>
    </div>
  );
}
