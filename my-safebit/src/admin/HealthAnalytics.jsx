import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  TrendingUp,
  Users,
  AlertTriangle,
  Heart,
  Check,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { getHealthAnalytics } from "../services/adminHealthAnalyticsService";

const insightStyles = {
  primary: "from-blue-50 to-blue-100 border-blue-200 text-blue-900 text-blue-800",
  warning:
    "from-orange-50 to-orange-100 border-orange-200 text-orange-900 text-orange-800",
  info: "from-purple-50 to-purple-100 border-purple-200 text-purple-900 text-purple-800",
  success:
    "from-green-50 to-green-100 border-green-200 text-green-900 text-green-800",
};

const formatPercent = (value) => `${Number(value || 0).toFixed(1)}%`;

export function HealthAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getHealthAnalytics();
        if (mounted) setAnalytics(data);
      } catch (err) {
        const message =
          (axios.isAxiosError(err) &&
            (err.response?.data?.message || err.response?.data || err.message)) ||
          "Failed to load health analytics.";
        if (mounted) {
          setAnalytics(null);
          setError(typeof message === "string" ? message : "Failed to load health analytics.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const maxTrendValue = useMemo(() => {
    if (!analytics?.healthDataTrends?.length) return 1;
    return Math.max(
      1,
      ...analytics.healthDataTrends.map((x) => Math.max(x.allergies, x.diseases))
    );
  }, [analytics]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Health Analytics Dashboard</h2>
        <p className="text-sm text-gray-600 mt-1">Anonymized health statistics and trends</p>
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <AlertDescription className="m-0 text-blue-800 text-sm">
          <strong>Privacy Protected:</strong> All data shown is anonymized and aggregated.
        </AlertDescription>
      </Alert>

      {loading && (
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center gap-3 text-gray-700">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading health analytics...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {!!error && (
        <Alert className="flex items-center gap-2 bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="m-0 text-red-800 text-sm">{error}</AlertDescription>
        </Alert>
      )}

      {!!analytics && !loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700 mb-1">Total Users</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {analytics.totalUsers.toLocaleString()}
                    </p>
                    <p className="text-xs text-blue-600 mt-2">Active platform users</p>
                  </div>
                  <div className="p-3 bg-blue-600 rounded-xl">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-700 mb-1">Users with Allergies</p>
                    <p className="text-2xl font-bold text-orange-900">
                      {analytics.usersWithAllergies.toLocaleString()}
                    </p>
                    <p className="text-xs text-orange-600 mt-2">
                      {formatPercent(analytics.usersWithAllergiesPercent)} of total users
                    </p>
                  </div>
                  <div className="p-3 bg-orange-600 rounded-xl">
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700 mb-1">Users with Diseases</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {analytics.usersWithDiseases.toLocaleString()}
                    </p>
                    <p className="text-xs text-purple-600 mt-2">
                      {formatPercent(analytics.usersWithDiseasesPercent)} of total users
                    </p>
                  </div>
                  <div className="p-3 bg-purple-600 rounded-xl">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700 mb-1">Monthly Growth</p>
                    <p className="text-2xl font-bold text-green-900">
                      {formatPercent(analytics.monthlyGrowthPercent)}
                    </p>
                    <p className="text-xs text-green-600 mt-2">Health tracking engagement</p>
                  </div>
                  <div className="p-3 bg-green-600 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Detailed Allergy Statistics
                </CardTitle>
                <CardDescription className="text-sm">
                  Anonymized user counts per allergy type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.detailedAllergyStatistics.map((item) => (
                    <div
                      key={item.allergyID}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-600">
                          {item.affectedUsers.toLocaleString()} affected users
                        </p>
                      </div>
                      <p className="text-sm font-bold text-gray-900">
                        {formatPercent(item.percentOfTotalUsers)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Disease Distribution
                </CardTitle>
                <CardDescription className="text-sm">
                  Percentage of users affected by chronic diseases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.diseaseDistribution.map((item) => (
                    <div key={item.diseaseID} className="p-4 bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">
                            {item.affectedUsers.toLocaleString()} users
                          </span>
                          <span className="text-sm font-bold text-gray-900">
                            {formatPercent(item.percentOfTotalUsers)}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="h-2 bg-purple-500 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, Math.max(0, item.percentOfTotalUsers))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Health Data Trends</CardTitle>
              <CardDescription>Monthly growth in reported allergies and diseases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-64 flex items-end justify-between px-4 pb-4 border-b border-gray-200">
                  {analytics.healthDataTrends.map((month) => (
                    <div key={month.month} className="flex flex-col items-center gap-2 flex-1">
                      <div className="flex flex-col items-center gap-1 w-full max-w-16">
                        <div
                          className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                          style={{ height: `${(month.allergies / maxTrendValue) * 90}%` }}
                        />
                        <div
                          className="w-full bg-purple-500 rounded-t transition-all duration-300 hover:bg-purple-600"
                          style={{ height: `${(month.diseases / maxTrendValue) * 90}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">{month.month}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded" />
                    <span className="text-sm text-gray-600">Allergies</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded" />
                    <span className="text-sm text-gray-600">Diseases</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 pt-4">
                  {analytics.healthDataTrends.map((month) => (
                    <div key={`point-${month.month}`} className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">{month.month}</p>
                      <p className="text-sm font-medium text-gray-900">{month.allergies}</p>
                      <p className="text-xs text-gray-500">allergies</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">{month.diseases}</p>
                      <p className="text-xs text-gray-500">diseases</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Key Insights & Trends</CardTitle>
              <CardDescription>Important observations from aggregated health data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analytics.keyInsights.map((insight, index) => {
                  const cls = insightStyles[insight.type] || insightStyles.info;
                  const parts = cls.split(" ");
                  return (
                    <div
                      key={`${insight.title}-${index}`}
                      className={`p-4 bg-gradient-to-br ${parts[0]} ${parts[1]} border ${parts[2]} rounded-lg`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Check className={`h-4 w-4 ${parts[3]}`} />
                        <p className={`text-sm font-medium ${parts[3]}`}>{insight.title}</p>
                      </div>
                      <p className={`text-xs ${parts[4]}`}>{insight.message}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

export default HealthAnalytics;
