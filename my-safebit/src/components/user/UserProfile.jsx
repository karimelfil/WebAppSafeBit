import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import {
  AlertTriangle,
  Check,
  Info,
  Loader2,
  ShieldCheck,
  Trash2,
  UserRoundPen,
} from "lucide-react";
import {
  addUserAllergy,
  addUserDisease,
  getUserAllergiesCatalog,
  getUserDiseasesCatalog,
  getUserHealth,
  getUserHealthSummary,
  getUserProfile,
  patchUserProfile,
  putUserHealth,
  removeUserAllergy,
  removeUserDisease,
} from "../../services/userProfile";
import { deactivateAccountApi } from "../../services/auth";

const getErrorMessage = (e, fallback) =>
  e?.response?.data?.message || e?.response?.data?.title || e?.message || fallback;

const formatDate = (value) => {
  if (!value) return "Not set";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
};

const humanizeGender = (value) => {
  const raw = String(value || "").toLowerCase();
  if (raw === "male" || raw === "1") return "Male";
  if (raw === "female" || raw === "2") return "Female";
  if (!raw) return "Not set";
  return raw.charAt(0).toUpperCase() + raw.slice(1);
};

export function UserProfile() {
  const userId = localStorage.getItem("sb_userId");

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
  });

  const [health, setHealth] = useState({
    isPregnant: false,
    allergies: [],
    diseases: [],
  });

  const [summary, setSummary] = useState({});
  const [allergyCatalog, setAllergyCatalog] = useState([]);
  const [diseaseCatalog, setDiseaseCatalog] = useState([]);

  const [notice, setNotice] = useState({ type: "", text: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPregnancy, setSavingPregnancy] = useState(false);
  const [pendingAllergyIds, setPendingAllergyIds] = useState([]);
  const [pendingDiseaseIds, setPendingDiseaseIds] = useState([]);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const selectedAllergyIds = useMemo(
    () => health.allergies.map((x) => Number(x.id)).filter(Number.isFinite),
    [health.allergies]
  );
  const selectedDiseaseIds = useMemo(
    () => health.diseases.map((x) => Number(x.id)).filter(Number.isFinite),
    [health.diseases]
  );

  const selectedAllergyNames = useMemo(
    () => health.allergies.map((x) => x.name).filter(Boolean),
    [health.allergies]
  );
  const selectedDiseaseNames = useMemo(
    () => health.diseases.map((x) => x.name).filter(Boolean),
    [health.diseases]
  );

  const isFemale = String(profile.gender).toLowerCase() === "female";

  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      if (!userId) {
        setNotice({ type: "error", text: "Missing user session. Please log in again." });
        setLoading(false);
        return;
      }

      setLoading(true);
      setNotice({ type: "", text: "" });

      try {
        const [profileData, healthData, allergies, diseases, summaryData] = await Promise.all([
          getUserProfile(userId),
          getUserHealth(userId),
          getUserAllergiesCatalog(),
          getUserDiseasesCatalog(),
          getUserHealthSummary(userId).catch(() => ({})),
        ]);

        if (cancelled) return;

        setProfile(profileData);
        setHealth(healthData);
        setAllergyCatalog(allergies);
        setDiseaseCatalog(diseases);
        setSummary(summaryData || {});
      } catch (e) {
        if (!cancelled) {
          setNotice({
            type: "error",
            text: getErrorMessage(e, "Failed to load profile information."),
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAll();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (notice.type !== "success" || !notice.text) return;
    const timer = setTimeout(() => setNotice({ type: "", text: "" }), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  const refreshSummary = async () => {
    if (!userId) return;
    try {
      const summaryData = await getUserHealthSummary(userId);
      setSummary(summaryData || {});
    } catch {}
  };

  const handleSaveProfile = async () => {
    if (!userId) return;
    setSavingProfile(true);
    setNotice({ type: "", text: "" });
    try {
      const updated = await patchUserProfile(userId, profile);
      setProfile(updated);
      setNotice({ type: "success", text: "Personal information updated successfully." });
    } catch (e) {
      setNotice({
        type: "error",
        text: getErrorMessage(e, "Failed to update personal information."),
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePregnancyUpdate = async (checked) => {
    if (!userId) return;
    setSavingPregnancy(true);
    setNotice({ type: "", text: "" });
    try {
      const updated = await putUserHealth(userId, {
        isPregnant: Boolean(checked),
        allergyIds: selectedAllergyIds,
        diseaseIds: selectedDiseaseIds,
      });
      setHealth(updated);
      await refreshSummary();
      setNotice({ type: "success", text: "Pregnancy status updated." });
    } catch (e) {
      setNotice({
        type: "error",
        text: getErrorMessage(e, "Failed to update pregnancy status."),
      });
    } finally {
      setSavingPregnancy(false);
    }
  };

  const handleToggleAllergy = async (item) => {
    if (!userId) return;
    const id = Number(item.id);
    if (!Number.isFinite(id)) return;

    const alreadySelected = selectedAllergyIds.includes(id);
    setPendingAllergyIds((prev) => [...new Set([...prev, id])]);
    setNotice({ type: "", text: "" });

    try {
      if (alreadySelected) {
        await removeUserAllergy(userId, id);
        setHealth((prev) => ({ ...prev, allergies: prev.allergies.filter((a) => Number(a.id) !== id) }));
        setNotice({ type: "success", text: `${item.name} removed from your allergies.` });
      } else {
        await addUserAllergy(userId, id);
        setHealth((prev) => ({ ...prev, allergies: [...prev.allergies, { id, name: item.name }] }));
        setNotice({ type: "success", text: `${item.name} added to your allergies.` });
      }
      await refreshSummary();
    } catch (e) {
      setNotice({
        type: "error",
        text: getErrorMessage(e, "Failed to update allergy."),
      });
    } finally {
      setPendingAllergyIds((prev) => prev.filter((x) => x !== id));
    }
  };

  const handleToggleDisease = async (item) => {
    if (!userId) return;
    const id = Number(item.id);
    if (!Number.isFinite(id)) return;

    const alreadySelected = selectedDiseaseIds.includes(id);
    setPendingDiseaseIds((prev) => [...new Set([...prev, id])]);
    setNotice({ type: "", text: "" });

    try {
      if (alreadySelected) {
        await removeUserDisease(userId, id);
        setHealth((prev) => ({ ...prev, diseases: prev.diseases.filter((d) => Number(d.id) !== id) }));
        setNotice({ type: "success", text: `${item.name} removed from your diseases.` });
      } else {
        await addUserDisease(userId, id);
        setHealth((prev) => ({ ...prev, diseases: [...prev.diseases, { id, name: item.name }] }));
        setNotice({ type: "success", text: `${item.name} added to your diseases.` });
      }
      await refreshSummary();
    } catch (e) {
      setNotice({
        type: "error",
        text: getErrorMessage(e, "Failed to update disease."),
      });
    } finally {
      setPendingDiseaseIds((prev) => prev.filter((x) => x !== id));
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      setNotice({ type: "error", text: "Please type DELETE to confirm account deletion." });
      return;
    }

    setDeletingAccount(true);
    setNotice({ type: "", text: "" });

    try {
      await deactivateAccountApi();
      localStorage.removeItem("sb_token");
      localStorage.removeItem("sb_role");
      localStorage.removeItem("sb_userId");
      window.location.href = "/";
    } catch (e) {
      setNotice({
        type: "error",
        text: getErrorMessage(e, "Failed to deactivate account."),
      });
    } finally {
      setDeletingAccount(false);
      setShowDeleteConfirm(false);
      setDeleteConfirmText("");
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3 text-gray-700">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading your profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">My Profile</h2>
        <p className="mt-1 text-sm text-gray-700">
          Manage your personal profile and health data.
        </p>
      </div>

      {notice.text ? (
        <Alert
          role="status"
          className={
            notice.type === "error"
              ? "flex items-center gap-2 border-red-200 bg-red-50"
              : "flex items-center gap-2 border-green-200 bg-green-50"
          }
        >
          {notice.type === "error" ? (
            <AlertTriangle className="h-4 w-4 text-red-600" />
          ) : (
            <Check className="h-4 w-4 text-green-600" />
          )}
          <AlertDescription className={notice.type === "error" ? "m-0 text-red-800" : "m-0 text-green-800"}>
            {notice.text}
          </AlertDescription>
        </Alert>
      ) : null}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-2xl border border-gray-200 bg-gray-100 p-1.5 md:grid-cols-4">
          <TabsTrigger
            value="overview"
            className="rounded-xl text-gray-900 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
          >
            <Info className="mr-2 h-4 w-4" />
            General Info
          </TabsTrigger>
          <TabsTrigger
            value="personal"
            className="rounded-xl text-gray-900 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
          >
            <UserRoundPen className="mr-2 h-4 w-4" />
            Personal
          </TabsTrigger>
          <TabsTrigger
            value="health"
            className="rounded-xl text-gray-900 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
          >
            <ShieldCheck className="mr-2 h-4 w-4" />
            Health Updates
          </TabsTrigger>
          <TabsTrigger
            value="delete"
            className="rounded-xl text-gray-900 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Profile Informations</CardTitle>
              <CardDescription>Latest account and health information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-xs uppercase tracking-wide text-gray-500">Full Name</Label>
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {`${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "Not set"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wide text-gray-500">Email</Label>
                  <p className="mt-1 text-sm font-medium text-gray-900">{profile.email || "Not set"}</p>
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wide text-gray-500">Date of Birth</Label>
                  <p className="mt-1 text-sm font-medium text-gray-900">{formatDate(profile.dateOfBirth)}</p>
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wide text-gray-500">Gender</Label>
                  <p className="mt-1 text-sm font-medium text-gray-900">{humanizeGender(profile.gender)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-800">Selected Allergies</Label>
                {selectedAllergyNames.length ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedAllergyNames.map((name) => (
                      <Badge
                        key={`allergy-current-${name}`}
                        className="border border-amber-300 bg-amber-100 text-amber-900 hover:bg-amber-100"
                      >
                        {name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No allergies selected.</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-800">Selected Diseases</Label>
                {selectedDiseaseNames.length ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedDiseaseNames.map((name) => (
                      <Badge
                        key={`disease-current-${name}`}
                        className="border border-sky-300 bg-sky-100 text-sky-900 hover:bg-sky-100"
                      >
                        {name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No diseases selected.</p>
                )}
              </div>

              {isFemale ? (
                <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2.5">
                  <Label className="text-xs uppercase tracking-wide text-indigo-700">Pregnancy Status</Label>
                  <p className="mt-1 text-sm font-medium text-indigo-900">
                    {health.isPregnant ? "Pregnant" : "Not pregnant"}
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personal">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle>Update Personal Information</CardTitle>
              <CardDescription>Keep your account details up to date</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profile.firstName}
                    onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profile.lastName}
                    onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  readOnly
                  disabled
                  className="cursor-not-allowed bg-slate-100 text-slate-500"
                />
                <p className="text-xs text-slate-500">Email cannot be changed from this screen.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={profile.dateOfBirth || ""}
                    onChange={(e) => setProfile((p) => ({ ...p, dateOfBirth: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Input id="gender" value={humanizeGender(profile.gender)} readOnly disabled className="cursor-not-allowed bg-slate-100 text-slate-500" />
                  <p className="text-xs text-slate-500">Gender cannot be changed from this screen.</p>
                </div>
              </div>

              <Button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {savingProfile ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Personal Information"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>Update Health Profile</CardTitle>
              <CardDescription>
                Each allergy and disease is updated independently as soon as you click it.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="flex items-center gap-2 border-slate-200 bg-slate-50">
                <ShieldCheck className="h-4 w-4 text-slate-700" />
                <AlertDescription className="m-0 text-slate-700">
                  Your health data is confidential and used only for safer food recommendations.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <h3 className="text-base font-semibold text-gray-900">Allergies</h3>
                <div className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-white p-4 md:grid-cols-2 lg:grid-cols-3">
                  {allergyCatalog.map((item) => {
                    const id = Number(item.id);
                    const checked = selectedAllergyIds.includes(id);
                    const busy = pendingAllergyIds.includes(id);
                    return (
                      <label
                        key={`allergy-${id}`}
                        className={`flex items-center gap-2 rounded-md border px-3 py-2 transition ${
                          checked ? "border-amber-300 bg-amber-50" : "border-gray-200 bg-white"
                        } ${busy ? "opacity-70" : ""}`}
                      >
                        <Checkbox checked={checked} onCheckedChange={() => handleToggleAllergy(item)} disabled={busy} />
                        <span className="text-sm text-gray-800">{item.name}</span>
                        {busy ? <Loader2 className="ml-auto h-3.5 w-3.5 animate-spin text-gray-500" /> : null}
                      </label>
                    );
                  })}
                  {allergyCatalog.length === 0 ? (
                    <p className="text-sm text-gray-500">No allergies found.</p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-semibold text-gray-900">Chronic Diseases</h3>
                <div className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-white p-4 md:grid-cols-2">
                  {diseaseCatalog.map((item) => {
                    const id = Number(item.id);
                    const checked = selectedDiseaseIds.includes(id);
                    const busy = pendingDiseaseIds.includes(id);
                    return (
                      <label
                        key={`disease-${id}`}
                        className={`flex items-center gap-2 rounded-md border px-3 py-2 transition ${
                          checked ? "border-sky-300 bg-sky-50" : "border-gray-200 bg-white"
                        } ${busy ? "opacity-70" : ""}`}
                      >
                        <Checkbox checked={checked} onCheckedChange={() => handleToggleDisease(item)} disabled={busy} />
                        <span className="text-sm text-gray-800">{item.name}</span>
                        {busy ? <Loader2 className="ml-auto h-3.5 w-3.5 animate-spin text-gray-500" /> : null}
                      </label>
                    );
                  })}
                  {diseaseCatalog.length === 0 ? (
                    <p className="text-sm text-gray-500">No diseases found.</p>
                  ) : null}
                </div>
              </div>

              {isFemale ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-base font-semibold text-slate-900">Pregnancy Status</h3>
                  <div className="mt-4 flex items-center gap-3">
                    <Checkbox
                      id="isPregnant"
                      checked={health.isPregnant}
                      onCheckedChange={(checked) => handlePregnancyUpdate(Boolean(checked))}
                      disabled={savingPregnancy}
                      className="h-5 w-5 border-slate-400 data-[state=checked]:border-green-600 data-[state=checked]:bg-green-600 data-[state=checked]:text-white"
                    />
                    <Label htmlFor="isPregnant" className="cursor-pointer text-sm text-slate-900">
                      I am currently pregnant
                    </Label>
                    {savingPregnancy ? <Loader2 className="h-4 w-4 animate-spin text-slate-700" /> : null}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delete">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-700">Delete Account</CardTitle>
              <CardDescription>Permanently remove your account and all related data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="flex items-center gap-2 border-red-200 bg-red-50">
                <Trash2 className="h-4 w-4 text-red-700" />
                <AlertDescription className="m-0 text-red-900">
                  This action is irreversible. All profile and health data will be lost permanently.
                </AlertDescription>
              </Alert>

              {!showDeleteConfirm ? (
                <Button
                  className="w-full bg-red-600 text-white hover:bg-red-700"
                  onClick={() => {
                    setShowDeleteConfirm(true);
                    setDeleteConfirmText("");
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Proceed to Delete Account
                </Button>
              ) : (
                <div className="space-y-3">
                  <Label htmlFor="deleteConfirm">Type DELETE to confirm</Label>
                  <Input
                    id="deleteConfirm"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="DELETE"
                  />
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteConfirmText("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 bg-red-600 text-white hover:bg-red-700"
                      disabled={deleteConfirmText !== "DELETE" || deletingAccount}
                      onClick={handleDeleteAccount}
                    >
                      {deletingAccount ? "Deleting..." : "Delete Permanently"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
