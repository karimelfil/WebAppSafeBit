import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  TrendingUp,
  Users,
  AlertTriangle,
  Heart,
  Check,
  Loader2,
  ShieldCheck,
  X,
} from "lucide-react";
import { getHealthAnalytics } from "../services/adminHealthAnalyticsService";
import {
  styles,
  getSkeletonClass,
  getStatIconWrapClass,
  getStatIconClass,
  getStatValueClass,
  getProgressFillClass,
  getProgressWidthStyle,
  getChartHeightStyle,
  getLegendSwatchClass,
  getInsightCardClass,
  getInsightDotClass,
  getInsightIconClass,
  getInsightTitleClass,
  getInsightBodyClass,
} from "../styles/admin/HealthAnalytics.styles";

//convert number to percentage string
const formatPercent = (value) => `${Number(value || 0).toFixed(1)}%`;

// Reusable skeleton component for loading states
function Skeleton({ className }) {
  return <div className={getSkeletonClass(className)} />;
}

// Section title component with optional subtitle
function SectionTitle({ children, sub }) {
  return (
    <div className={styles.sectionTitleWrap}>
      <h3 className={styles.sectionTitle}>{children}</h3>
      {sub && <p className={styles.sectionSub}>{sub}</p>}
    </div>
  );
}

// Card component to display key statistics with an icon, value, and description
function StatCard({ label, value, sub, icon: Icon, tone, loading }) {
  return (
    <div className={styles.statCard}>
      <div className={getStatIconWrapClass(tone)}>
        <Icon className={getStatIconClass(tone)} />
      </div>
      <div className={styles.statBody}>
        <p className={styles.statLabel}>{label}</p>
        {loading ? (
          <Skeleton className={styles.statValueSkeleton} />
        ) : (
          <p className={getStatValueClass(tone)}>{value}</p>
        )}
        {loading ? (
          <Skeleton className={styles.statSubSkeleton} />
        ) : (
          <p className={styles.statSub}>{sub}</p>
        )}
      </div>
    </div>
  );
}

// Row component to display progress bars for allergy/disease statistics
function ProgressRow({ name, affectedUsers, percent, tone }) {
  const pct = Math.min(100, Math.max(0, percent));

  return (
    <div className={styles.progressRow}>
      <div className={styles.progressTop}>
        <span className={styles.progressName}>{name}</span>
        <div className={styles.progressMeta}>
          <span className={styles.progressUsers}>{affectedUsers.toLocaleString()} users</span>
          <span className={styles.progressPercent}>{formatPercent(percent)}</span>
        </div>
      </div>
      <div className={styles.progressTrack}>
        <div className={getProgressFillClass(tone)} style={getProgressWidthStyle(pct)} />
      </div>
    </div>
  );
}

// Bar component for the health data trends chart, showing allergies and diseases per month
function ChartBar({ month, allergies, diseases, maxVal }) {
  const allergyPct = maxVal > 0 ? (allergies / maxVal) * 100 : 0;
  const diseasePct = maxVal > 0 ? (diseases / maxVal) * 100 : 0;

  return (
    <div className={styles.chartBarGroup}>
      <div className={styles.chartTooltip}>
        <span className={styles.chartTooltipAllergies}>{allergies}</span>
        <span className={styles.chartTooltipSeparator}> - </span>
        <span className={styles.chartTooltipDiseases}>{diseases}</span>
        <div className={styles.chartTooltipArrow} />
      </div>
      <div className={`${styles.chartBars} ${styles.chartBarsTall}`}>
        <div className={styles.allergyBar} style={getChartHeightStyle(allergyPct)} />
        <div className={styles.diseaseBar} style={getChartHeightStyle(diseasePct)} />
      </div>
      <span className={styles.chartMonth}>{month}</span>
    </div>
  );
}

export function HealthAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch health analytics data on component mount
  useEffect(() => {
    let mounted = true;

    (async () => {
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
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Calculate the maximum value for the trends chart to normalize bar heights
  const maxTrendValue = useMemo(() => {
    if (!analytics?.healthDataTrends?.length) return 1;
    return Math.max(
      1,
      ...analytics.healthDataTrends.map((item) =>
        Math.max(item.allergies, item.diseases)
      )
    );
  }, [analytics]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Health Analytics</h2>
          <p className={styles.subtitle}>Anonymized health statistics and trends</p>
        </div>
        <div className={styles.privacyBadge}>
          <ShieldCheck className={styles.privacyIcon} />
          All data is anonymized &amp; aggregated
        </div>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <AlertTriangle className={styles.errorIcon} />
          <p className={styles.errorText}>{error}</p>
          <button onClick={() => setError("")} className={styles.errorDismiss}>
            <X className={styles.errorDismissIcon} />
          </button>
        </div>
      )}

      <div className={styles.statsGrid}>
        <StatCard
          label="Total Users"
          icon={Users}
          tone="blue"
          value={analytics ? analytics.totalUsers.toLocaleString() : "-"}
          sub="Active platform users"
          loading={loading}
        />
        <StatCard
          label="Users with Allergies"
          icon={AlertTriangle}
          tone="amber"
          value={analytics ? analytics.usersWithAllergies.toLocaleString() : "-"}
          sub={
            analytics
              ? `${formatPercent(analytics.usersWithAllergiesPercent)} of total`
              : "-"
          }
          loading={loading}
        />
        <StatCard
          label="Users with Conditions"
          icon={Heart}
          tone="purple"
          value={analytics ? analytics.usersWithDiseases.toLocaleString() : "-"}
          sub={
            analytics
              ? `${formatPercent(analytics.usersWithDiseasesPercent)} of total`
              : "-"
          }
          loading={loading}
        />
        <StatCard
          label="Monthly Growth"
          icon={TrendingUp}
          tone="emerald"
          value={analytics ? formatPercent(analytics.monthlyGrowthPercent) : "-"}
          sub="Health tracking engagement"
          loading={loading}
        />
      </div>

      {loading && !analytics && (
        <div className={styles.loadingState}>
          <Loader2 className={styles.loadingIcon} />
          <span className={styles.loadingText}>Loading health analytics...</span>
        </div>
      )}

      {analytics && !loading && (
        <>
          <div className={styles.splitGrid}>
            <div className={styles.panel}>
              <SectionTitle sub="Anonymized user counts per allergy type">
                Allergy Statistics
              </SectionTitle>
              <div className={styles.dividedList}>
                {analytics.detailedAllergyStatistics.map((item) => (
                  <ProgressRow
                    key={item.allergyID}
                    name={item.name}
                    affectedUsers={item.affectedUsers}
                    percent={item.percentOfTotalUsers}
                    tone="amber"
                  />
                ))}
                {analytics.detailedAllergyStatistics.length === 0 && (
                  <p className={styles.emptyText}>No allergy data available.</p>
                )}
              </div>
            </div>

            <div className={styles.panel}>
              <SectionTitle sub="Percentage of users affected by chronic conditions">
                Disease Distribution
              </SectionTitle>
              <div className={styles.dividedList}>
                {analytics.diseaseDistribution.map((item) => (
                  <ProgressRow
                    key={item.diseaseID}
                    name={item.name}
                    affectedUsers={item.affectedUsers}
                    percent={item.percentOfTotalUsers}
                    tone="violet"
                  />
                ))}
                {analytics.diseaseDistribution.length === 0 && (
                  <p className={styles.emptyText}>No disease data available.</p>
                )}
              </div>
            </div>
          </div>

          <div className={styles.trendPanel}>
            <SectionTitle sub="Monthly growth in reported allergies and conditions">
              Health Data Trends
            </SectionTitle>

            <div className={`${styles.chartWrap} ${styles.chartWrapTall}`}>
              {analytics.healthDataTrends.map((month) => (
                <ChartBar
                  key={month.month}
                  month={month.month}
                  allergies={month.allergies}
                  diseases={month.diseases}
                  maxVal={maxTrendValue}
                />
              ))}
            </div>

            <div className={styles.legend}>
              <div className={styles.legendItem}>
                <span className={getLegendSwatchClass("allergies")} />
                <span className={styles.legendText}>Allergies</span>
              </div>
              <div className={styles.legendItem}>
                <span className={getLegendSwatchClass("conditions")} />
                <span className={styles.legendText}>Conditions</span>
              </div>
            </div>

            <div className={styles.trendGrid}>
              {analytics.healthDataTrends.map((month) => (
                <div key={`point-${month.month}`} className={styles.trendCard}>
                  <p className={styles.trendMonth}>{month.month}</p>
                  <p className={styles.trendAllergy}>{month.allergies}</p>
                  <p className={styles.trendLabel}>allergies</p>
                  <p className={styles.trendDisease}>{month.diseases}</p>
                  <p className={styles.trendLabel}>conditions</p>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.panel}>
            <SectionTitle sub="Important observations from aggregated health data">
              Key Insights &amp; Trends
            </SectionTitle>
            <div className={styles.insightsGrid}>
              {analytics.keyInsights.map((insight, index) => (
                <div
                  key={`${insight.title}-${index}`}
                  className={getInsightCardClass(insight.type)}
                >
                  <div className={styles.insightHeader}>
                    <span className={getInsightDotClass(insight.type)}>
                      <Check className={getInsightIconClass(insight.type)} />
                    </span>
                    <p className={getInsightTitleClass(insight.type)}>
                      {insight.title}
                    </p>
                  </div>
                  <p className={getInsightBodyClass(insight.type)}>{insight.message}</p>
                </div>
              ))}
              {analytics.keyInsights.length === 0 && (
                <p className={styles.insightsEmpty}>No insights available.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default HealthAnalytics;
