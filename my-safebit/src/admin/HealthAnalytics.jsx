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
import { styles } from '../styles/admin/HealthAnalytics.styles.js';
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
    <div className={styles.cls001}>
      <div>
        <h2 className={styles.cls002}>Health Analytics Dashboard</h2>
        <p className={styles.cls003}>Anonymized health statistics and trends</p>
      </div>

      <Alert className={styles.cls004}>
        <AlertDescription className={styles.cls005}>
          <strong>Privacy Protected:</strong> All data shown is anonymized and aggregated.
        </AlertDescription>
      </Alert>

      {loading && (
        <Card>
          <CardContent className={styles.cls006}>
            <div className={styles.cls007}>
              <Loader2 className={styles.cls008} />
              <span className={styles.cls009}>Loading health analytics...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {!!error && (
        <Alert className={styles.cls010}>
          <AlertTriangle className={styles.cls011} />
          <AlertDescription className={styles.cls012}>{error}</AlertDescription>
        </Alert>
      )}

      {!!analytics && !loading && (
        <>
          <div className={styles.cls013}>
            <Card className={styles.cls014}>
              <CardContent className={styles.cls015}>
                <div className={styles.cls016}>
                  <div>
                    <p className={styles.cls017}>Total Users</p>
                    <p className={styles.cls018}>
                      {analytics.totalUsers.toLocaleString()}
                    </p>
                    <p className={styles.cls019}>Active platform users</p>
                  </div>
                  <div className={styles.cls020}>
                    <Users className={styles.cls021} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={styles.cls022}>
              <CardContent className={styles.cls015}>
                <div className={styles.cls016}>
                  <div>
                    <p className={styles.cls023}>Users with Allergies</p>
                    <p className={styles.cls024}>
                      {analytics.usersWithAllergies.toLocaleString()}
                    </p>
                    <p className={styles.cls025}>
                      {formatPercent(analytics.usersWithAllergiesPercent)} of total users
                    </p>
                  </div>
                  <div className={styles.cls026}>
                    <AlertTriangle className={styles.cls021} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={styles.cls027}>
              <CardContent className={styles.cls015}>
                <div className={styles.cls016}>
                  <div>
                    <p className={styles.cls028}>Users with Diseases</p>
                    <p className={styles.cls029}>
                      {analytics.usersWithDiseases.toLocaleString()}
                    </p>
                    <p className={styles.cls030}>
                      {formatPercent(analytics.usersWithDiseasesPercent)} of total users
                    </p>
                  </div>
                  <div className={styles.cls031}>
                    <Heart className={styles.cls021} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={styles.cls032}>
              <CardContent className={styles.cls015}>
                <div className={styles.cls016}>
                  <div>
                    <p className={styles.cls033}>Monthly Growth</p>
                    <p className={styles.cls034}>
                      {formatPercent(analytics.monthlyGrowthPercent)}
                    </p>
                    <p className={styles.cls035}>Health tracking engagement</p>
                  </div>
                  <div className={styles.cls036}>
                    <TrendingUp className={styles.cls021} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className={styles.cls037}>
            <Card>
              <CardHeader className={styles.cls038}>
                <CardTitle className={styles.cls039}>
                  Detailed Allergy Statistics
                </CardTitle>
                <CardDescription className={styles.cls009}>
                  Anonymized user counts per allergy type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className={styles.cls040}>
                  {analytics.detailedAllergyStatistics.map((item) => (
                    <div
                      key={item.allergyID}
                      className={styles.cls041}
                    >
                      <div className={styles.cls042}>
                        <p className={styles.cls043}>{item.name}</p>
                        <p className={styles.cls044}>
                          {item.affectedUsers.toLocaleString()} affected users
                        </p>
                      </div>
                      <p className={styles.cls045}>
                        {formatPercent(item.percentOfTotalUsers)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className={styles.cls038}>
                <CardTitle className={styles.cls039}>
                  Disease Distribution
                </CardTitle>
                <CardDescription className={styles.cls009}>
                  Percentage of users affected by chronic diseases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className={styles.cls040}>
                  {analytics.diseaseDistribution.map((item) => (
                    <div key={item.diseaseID} className={styles.cls046}>
                      <div className={styles.cls047}>
                        <p className={styles.cls043}>{item.name}</p>
                        <div className={styles.cls048}>
                          <span className={styles.cls044}>
                            {item.affectedUsers.toLocaleString()} users
                          </span>
                          <span className={styles.cls045}>
                            {formatPercent(item.percentOfTotalUsers)}
                          </span>
                        </div>
                      </div>
                      <div className={styles.cls049}>
                        <div
                          className={styles.cls050}
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
              <CardTitle className={styles.cls039}>Health Data Trends</CardTitle>
              <CardDescription>Monthly growth in reported allergies and diseases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={styles.cls040}>
                <div className={styles.cls051}>
                  {analytics.healthDataTrends.map((month) => (
                    <div key={month.month} className={styles.cls052}>
                      <div className={styles.cls053}>
                        <div
                          className={styles.cls054}
                          style={{ height: `${(month.allergies / maxTrendValue) * 90}%` }}
                        />
                        <div
                          className={styles.cls055}
                          style={{ height: `${(month.diseases / maxTrendValue) * 90}%` }}
                        />
                      </div>
                      <span className={styles.cls044}>{month.month}</span>
                    </div>
                  ))}
                </div>

                <div className={styles.cls056}>
                  <div className={styles.cls048}>
                    <div className={styles.cls057} />
                    <span className={styles.cls058}>Allergies</span>
                  </div>
                  <div className={styles.cls048}>
                    <div className={styles.cls059} />
                    <span className={styles.cls058}>Diseases</span>
                  </div>
                </div>

                <div className={styles.cls060}>
                  {analytics.healthDataTrends.map((month) => (
                    <div key={`point-${month.month}`} className={styles.cls061}>
                      <p className={styles.cls062}>{month.month}</p>
                      <p className={styles.cls043}>{month.allergies}</p>
                      <p className={styles.cls063}>allergies</p>
                      <p className={styles.cls064}>{month.diseases}</p>
                      <p className={styles.cls063}>diseases</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className={styles.cls039}>Key Insights & Trends</CardTitle>
              <CardDescription>Important observations from aggregated health data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={styles.cls065}>
                {analytics.keyInsights.map((insight, index) => {
                  const cls = insightStyles[insight.type] || insightStyles.info;
                  const parts = cls.split(" ");
                  return (
                    <div
                      key={`${insight.title}-${index}`}
                      className={`p-4 bg-gradient-to-br ${parts[0]} ${parts[1]} border ${parts[2]} rounded-lg`}
                    >
                      <div className={styles.cls066}>
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


