import React from "react";
import {
  Upload,
  History,
  Shield,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  Home,
  User,
  LogOut,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Alert, AlertDescription } from "../ui/alert";


export default function UserDashboardPage({ onNavigate, activePage = "home" }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <UserSidebar active={activePage} onNavigate={onNavigate} />
      <main className="flex-1">
        <TopHeader />
        <div className="p-6">
          <UserHome onNavigate={onNavigate} />
        </div>
      </main>
    </div>
  );
}

function TopHeader() {
  return (
    <div className="h-16 bg-white border-b px-6 flex items-center justify-between">
      <div className="leading-tight">
        <div className="text-sm text-gray-500">Home</div>
        <div className="text-lg font-semibold text-gray-900">Welcome back!</div>
      </div>

      <Button
        variant="outline"
        className="rounded-xl border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
      >
        User Account
      </Button>
    </div>
  );
}

function UserSidebar({ active = "home", onNavigate }) {
  const nav = [
    { key: "home", label: "Home", icon: Home },
    { key: "upload", label: "Scan Menu", icon: Upload },
    { key: "history", label: "Scan History", icon: History },
    { key: "profile", label: "My Profile", icon: User },
  ];

  return (
    <aside className="w-72 min-h-screen bg-white border-r flex flex-col">
      {/* Brand */}
      <div className="h-16 px-5 flex items-center gap-3 border-b">
        <div className="h-9 w-9 rounded-lg bg-emerald-50 flex items-center justify-center">
          <Shield className="h-5 w-5 text-emerald-600" />
        </div>
        <div className="leading-tight">
          <div className="font-semibold text-gray-900">SafeBite</div>
          <div className="text-xs text-gray-500">User Dashboard</div>
        </div>
      </div>


      <nav className="p-3 space-y-1">
        {nav.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;

          return (
            <button
              key={item.key}
              onClick={() => onNavigate?.(item.key)}
              className={[
                "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm",
                "transition-colors",
                isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              ].join(" ")}
            >
              <Icon className={isActive ? "h-4 w-4 text-emerald-600" : "h-4 w-4"} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>


      <div className="mt-auto p-3 border-t">
        <button
          onClick={() => onNavigate?.("logout")}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}

export function UserHome({ onNavigate }) {
  const recentScans = [
    { dish: "Caesar Salad", restaurant: "Italian Bistro", status: "safe", date: "2 hours ago" },
    { dish: "Pad Thai", restaurant: "Thai Kitchen", status: "unsafe", date: "Yesterday" },
    { dish: "Margherita Pizza", restaurant: "Pizza Palace", status: "safe", date: "2 days ago" },
  ];

  const userAllergies = ["Peanuts", "Shellfish"];
  const userDiseases = ["Diabetes", "Celiac Disease"];

  return (
    <div className="space-y-6">

      <div className="relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-6 md:p-8 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full -ml-24 -mb-24" />
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-yellow-300" />
            <h2 className="text-3xl font-bold leading-tight">Welcome to SafeBite</h2>
          </div>

          <p className="text-emerald-50 mb-6 text-sm md:text-base">
            Your personal food safety assistant. Scan menus to get instant allergen warnings and safe
            meal recommendations.
          </p>


          <Button
            onClick={() => onNavigate?.("upload")}
            variant="ghost"
            className="
              h-10 px-4 rounded-xl
              bg-white hover:bg-white
              shadow-sm
              text-sm font-semibold
              !text-[#00bc8a] hover:!text-[#00bc8a]
              [&_svg]:!text-[#00bc8a]
            "
          >
            <Upload className="h-4 w-4 mr-2" />
            Scan a Menu Now
          </Button>
        </div>
      </div>


      {(userAllergies.length > 0 || userDiseases.length > 0) && (
        <Alert className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 shadow-sm rounded-2xl">
          <Shield className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-900">
            <div className="space-y-1">
              {userAllergies.length > 0 && (
                <p>
                  <strong className="font-semibold">Active Allergies:</strong>{" "}
                  <span className="text-amber-800">{userAllergies.join(", ")}</span>
                </p>
              )}
              {userDiseases.length > 0 && (
                <p>
                  <strong className="font-semibold">Active Conditions:</strong>{" "}
                  <span className="text-amber-800">{userDiseases.join(", ")}</span>
                </p>
              )}
              <p className="text-sm text-amber-700 mt-2">
                We'll warn you about dishes containing these allergens or that may not be suitable for
                your conditions.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card className="border border-gray-200 shadow-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            Quick Actions
          </CardTitle>
          <CardDescription>Access your most-used features</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="
                w-full justify-start items-start h-auto
                py-5 px-4 rounded-2xl
                border border-emerald-200
                bg-white hover:bg-emerald-50
                hover:border-emerald-300
                transition-all
              "
              onClick={() => onNavigate?.("upload")}
            >
              <div className="bg-emerald-100 p-3 rounded-xl mr-4 shrink-0">
                <Upload className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Scan New Menu</p>
                <p className="text-xs text-gray-500 mt-1">Upload or capture a menu</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="
                w-full justify-start items-start h-auto
                py-5 px-4 rounded-2xl
                border border-gray-200
                bg-white hover:bg-blue-50
                hover:border-blue-200
                transition-all
              "
              onClick={() => onNavigate?.("history")}
            >
              <div className="bg-blue-100 p-3 rounded-xl mr-4 shrink-0">
                <History className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">View Scan History</p>
                <p className="text-xs text-gray-500 mt-1">Review past menu scans</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="
                w-full justify-start items-start h-auto
                py-5 px-4 rounded-2xl
                border border-gray-200
                bg-white hover:bg-purple-50
                hover:border-purple-200
                transition-all
              "
              onClick={() => onNavigate?.("profile")}
            >
              <div className="bg-purple-100 p-3 rounded-xl mr-4 shrink-0">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Manage Profile</p>
                <p className="text-xs text-gray-500 mt-1">Update health information</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm rounded-2xl border border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Scans</CardTitle>
              <CardDescription>Your latest menu scans and results</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate?.("history")}
              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl"
            >
              View All
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {recentScans.map((scan, index) => (
              <div
                key={index}
                className="
                  flex items-center justify-between
                  p-4 bg-white rounded-2xl
                  border border-gray-200
                  hover:border-emerald-200 hover:shadow-sm
                  transition-all
                "
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{scan.dish}</p>
                  <p className="text-xs text-gray-500 mt-1">{scan.restaurant}</p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-500 font-medium">{scan.date}</span>

                  {scan.status === "safe" ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full border border-green-200">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-xs font-medium">Safe</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-full border border-red-200">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-xs font-medium">Warning</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>


      <Card className="bg-white border border-gray-200 shadow-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-600" />
            Safety Tips
          </CardTitle>
          <CardDescription>Important reminders for safe dining</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-2xl shadow-sm">
              <p className="text-sm text-blue-900 font-medium">
                Always inform restaurant staff about your allergies, even if the app says a dish is
                safe.
              </p>
            </div>
            <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-2xl shadow-sm">
              <p className="text-sm text-emerald-900 font-medium">
                Keep your health profile updated for accurate recommendations.
              </p>
            </div>
            <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-2xl shadow-sm">
              <p className="text-sm text-amber-900 font-medium">
                When in doubt, choose dishes with simpler ingredient lists to reduce risk.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}