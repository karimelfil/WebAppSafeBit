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
import { styles } from '../../styles/user/UserProfile.styles.js';
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
      <div className={styles.cls001}>
        <div className={styles.cls002}>
          <Loader2 className={styles.cls003} />
          <span>Loading your profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.cls004}>
      <div>
        <h2 className={styles.cls005}>My Profile</h2>
        <p className={styles.cls006}>
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
            <AlertTriangle className={styles.cls007} />
          ) : (
            <Check className={styles.cls008} />
          )}
          <AlertDescription className={notice.type === "error" ? "m-0 text-red-800" : "m-0 text-green-800"}>
            {notice.text}
          </AlertDescription>
        </Alert>
      ) : null}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className={styles.cls009}>
          <TabsTrigger
            value="overview"
            className={styles.cls010}
          >
            <Info className={styles.cls011} />
            General Info
          </TabsTrigger>
          <TabsTrigger
            value="personal"
            className={styles.cls010}
          >
            <UserRoundPen className={styles.cls011} />
            Personal
          </TabsTrigger>
          <TabsTrigger
            value="health"
            className={styles.cls010}
          >
            <ShieldCheck className={styles.cls011} />
            Health Updates
          </TabsTrigger>
          <TabsTrigger
            value="delete"
            className={styles.cls010}
          >
            <Trash2 className={styles.cls011} />
            Delete
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className={styles.cls004}>
          <Card className={styles.cls012}>
            <CardHeader>
              <CardTitle className={styles.cls013}>Profile Informations</CardTitle>
              <CardDescription>Latest account and health information</CardDescription>
            </CardHeader>
            <CardContent className={styles.cls014}>
              <div className={styles.cls015}>
                <div>
                  <Label className={styles.cls016}>Full Name</Label>
                  <p className={styles.cls017}>
                    {`${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "Not set"}
                  </p>
                </div>
                <div>
                  <Label className={styles.cls016}>Email</Label>
                  <p className={styles.cls017}>{profile.email || "Not set"}</p>
                </div>
                <div>
                  <Label className={styles.cls016}>Date of Birth</Label>
                  <p className={styles.cls017}>{formatDate(profile.dateOfBirth)}</p>
                </div>
                <div>
                  <Label className={styles.cls016}>Gender</Label>
                  <p className={styles.cls017}>{humanizeGender(profile.gender)}</p>
                </div>
              </div>

              <div className={styles.cls018}>
                <Label className={styles.cls019}>Selected Allergies</Label>
                {selectedAllergyNames.length ? (
                  <div className={styles.cls020}>
                    {selectedAllergyNames.map((name) => (
                      <Badge
                        key={`allergy-current-${name}`}
                        className={styles.cls021}
                      >
                        {name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className={styles.cls022}>No allergies selected.</p>
                )}
              </div>

              <div className={styles.cls018}>
                <Label className={styles.cls019}>Selected Diseases</Label>
                {selectedDiseaseNames.length ? (
                  <div className={styles.cls020}>
                    {selectedDiseaseNames.map((name) => (
                      <Badge
                        key={`disease-current-${name}`}
                        className={styles.cls023}
                      >
                        {name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className={styles.cls022}>No diseases selected.</p>
                )}
              </div>

              {isFemale ? (
                <div className={styles.cls024}>
                  <Label className={styles.cls025}>Pregnancy Status</Label>
                  <p className={styles.cls026}>
                    {health.isPregnant ? "Pregnant" : "Not pregnant"}
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personal">
          <Card className={styles.cls012}>
            <CardHeader>
              <CardTitle>Update Personal Information</CardTitle>
              <CardDescription>Keep your account details up to date</CardDescription>
            </CardHeader>
            <CardContent className={styles.cls014}>
              <div className={styles.cls015}>
                <div className={styles.cls018}>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profile.firstName}
                    onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
                  />
                </div>
                <div className={styles.cls018}>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profile.lastName}
                    onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
                  />
                </div>
              </div>

              <div className={styles.cls018}>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  readOnly
                  disabled
                  className={styles.cls027}
                />
                <p className={styles.cls028}>Email cannot be changed from this screen.</p>
              </div>

              <div className={styles.cls018}>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>

              <div className={styles.cls015}>
                <div className={styles.cls018}>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={profile.dateOfBirth || ""}
                    onChange={(e) => setProfile((p) => ({ ...p, dateOfBirth: e.target.value }))}
                  />
                </div>
                <div className={styles.cls018}>
                  <Label htmlFor="gender">Gender</Label>
                  <Input id="gender" value={humanizeGender(profile.gender)} readOnly disabled className={styles.cls027} />
                  <p className={styles.cls028}>Gender cannot be changed from this screen.</p>
                </div>
              </div>

              <Button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className={styles.cls029}
              >
                {savingProfile ? (
                  <>
                    <Loader2 className={styles.cls030} />
                    Saving...
                  </>
                ) : (
                  "Save Personal Information"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className={styles.cls004}>
          <Card className={styles.cls031}>
            <CardHeader>
              <CardTitle>Update Health Profile</CardTitle>
              <CardDescription>
                Each allergy and disease is updated independently as soon as you click it.
              </CardDescription>
            </CardHeader>
            <CardContent className={styles.cls004}>
              <Alert className={styles.cls032}>
                <ShieldCheck className={styles.cls033} />
                <AlertDescription className={styles.cls034}>
                  Your health data is confidential and used only for safer food recommendations.
                </AlertDescription>
              </Alert>

              <div className={styles.cls035}>
                <h3 className={styles.cls036}>Allergies</h3>
                <div className={styles.cls037}>
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
                        <span className={styles.cls038}>{item.name}</span>
                        {busy ? <Loader2 className={styles.cls039} /> : null}
                      </label>
                    );
                  })}
                  {allergyCatalog.length === 0 ? (
                    <p className={styles.cls022}>No allergies found.</p>
                  ) : null}
                </div>
              </div>

              <div className={styles.cls035}>
                <h3 className={styles.cls036}>Chronic Diseases</h3>
                <div className={styles.cls040}>
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
                        <span className={styles.cls038}>{item.name}</span>
                        {busy ? <Loader2 className={styles.cls039} /> : null}
                      </label>
                    );
                  })}
                  {diseaseCatalog.length === 0 ? (
                    <p className={styles.cls022}>No diseases found.</p>
                  ) : null}
                </div>
              </div>

              {isFemale ? (
                <div className={styles.cls041}>
                  <h3 className={styles.cls042}>Pregnancy Status</h3>
                  <div className={styles.cls043}>
                    <Checkbox
                      id="isPregnant"
                      checked={health.isPregnant}
                      onCheckedChange={(checked) => handlePregnancyUpdate(Boolean(checked))}
                      disabled={savingPregnancy}
                      className={styles.cls044}
                    />
                    <Label htmlFor="isPregnant" className={styles.cls045}>
                      I am currently pregnant
                    </Label>
                    {savingPregnancy ? <Loader2 className={styles.cls046} /> : null}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delete">
          <Card className={styles.cls047}>
            <CardHeader>
              <CardTitle className={styles.cls048}>Delete Account</CardTitle>
              <CardDescription>Permanently remove your account and all related data</CardDescription>
            </CardHeader>
            <CardContent className={styles.cls014}>
              <Alert className={styles.cls049}>
                <Trash2 className={styles.cls050} />
                <AlertDescription className={styles.cls051}>
                  This action is irreversible. All profile and health data will be lost permanently.
                </AlertDescription>
              </Alert>

              {!showDeleteConfirm ? (
                <Button
                  className={styles.cls052}
                  onClick={() => {
                    setShowDeleteConfirm(true);
                    setDeleteConfirmText("");
                  }}
                >
                  <Trash2 className={styles.cls011} />
                  Proceed to Delete Account
                </Button>
              ) : (
                <div className={styles.cls035}>
                  <Label htmlFor="deleteConfirm">Type DELETE to confirm</Label>
                  <Input
                    id="deleteConfirm"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="DELETE"
                  />
                  <div className={styles.cls053}>
                    <Button
                      variant="outline"
                      className={styles.cls054}
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteConfirmText("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className={styles.cls055}
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


