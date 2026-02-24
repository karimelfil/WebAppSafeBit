import { http } from "./http";

const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const toArray = (value) => (Array.isArray(value) ? value : []);

const normalizeInsight = (item) => ({
  title: String(item?.title ?? ""),
  message: String(item?.message ?? ""),
  type: String(item?.type ?? "info").toLowerCase(),
});

export async function getHealthAnalytics() {
  const res = await http.get("/HealthAnalytics");
  const data = res?.data ?? {};

  return {
    totalUsers: toNumber(data.totalUsers),
    usersWithAllergies: toNumber(data.usersWithAllergies),
    usersWithAllergiesPercent: toNumber(data.usersWithAllergiesPercent),
    usersWithDiseases: toNumber(data.usersWithDiseases),
    usersWithDiseasesPercent: toNumber(data.usersWithDiseasesPercent),
    monthlyGrowthPercent: toNumber(data.monthlyGrowthPercent),
    detailedAllergyStatistics: toArray(data.detailedAllergyStatistics).map((x) => ({
      allergyID: toNumber(x?.allergyID),
      name: String(x?.name ?? "Unknown"),
      affectedUsers: toNumber(x?.affectedUsers),
      percentOfTotalUsers: toNumber(x?.percentOfTotalUsers),
    })),
    diseaseDistribution: toArray(data.diseaseDistribution).map((x) => ({
      diseaseID: toNumber(x?.diseaseID),
      name: String(x?.name ?? "Unknown"),
      affectedUsers: toNumber(x?.affectedUsers),
      percentOfTotalUsers: toNumber(x?.percentOfTotalUsers),
    })),
    healthDataTrends: toArray(data.healthDataTrends).map((x) => ({
      month: String(x?.month ?? ""),
      allergies: toNumber(x?.allergies),
      diseases: toNumber(x?.diseases),
    })),
    keyInsights: toArray(data.keyInsights).map(normalizeInsight),
  };
}

