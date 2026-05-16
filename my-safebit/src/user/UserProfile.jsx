import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import {
  AlertCircle,
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
  Info,
  Loader2,
  Search,
  ShieldCheck,
  Trash2,
  UserRoundPen,
  X,
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
} from "../services/userProfile";
import { deactivateAccountApi } from "../services/auth";
import { styles } from "../styles/user/UserProfile.styles.js";

const COUNTRY_CODES = [
  { iso2: "lb", code: "+961", name: "Lebanon" },
  { iso2: "us", code: "+1", name: "United States" },
  { iso2: "ca", code: "+1", name: "Canada" },
  { iso2: "gb", code: "+44", name: "United Kingdom" },
  { iso2: "fr", code: "+33", name: "France" },
  { iso2: "de", code: "+49", name: "Germany" },
  { iso2: "it", code: "+39", name: "Italy" },
  { iso2: "es", code: "+34", name: "Spain" },
  { iso2: "nl", code: "+31", name: "Netherlands" },
  { iso2: "ch", code: "+41", name: "Switzerland" },
  { iso2: "at", code: "+43", name: "Austria" },
  { iso2: "be", code: "+32", name: "Belgium" },
  { iso2: "pt", code: "+351", name: "Portugal" },
  { iso2: "se", code: "+46", name: "Sweden" },
  { iso2: "no", code: "+47", name: "Norway" },
  { iso2: "dk", code: "+45", name: "Denmark" },
  { iso2: "fi", code: "+358", name: "Finland" },
  { iso2: "pl", code: "+48", name: "Poland" },
  { iso2: "ru", code: "+7", name: "Russia" },
  { iso2: "ua", code: "+380", name: "Ukraine" },
  { iso2: "tr", code: "+90", name: "Turkey" },
  { iso2: "sa", code: "+966", name: "Saudi Arabia" },
  { iso2: "ae", code: "+971", name: "UAE" },
  { iso2: "eg", code: "+20", name: "Egypt" },
  { iso2: "ma", code: "+212", name: "Morocco" },
  { iso2: "tn", code: "+216", name: "Tunisia" },
  { iso2: "dz", code: "+213", name: "Algeria" },
  { iso2: "jo", code: "+962", name: "Jordan" },
  { iso2: "sy", code: "+963", name: "Syria" },
  { iso2: "iq", code: "+964", name: "Iraq" },
  { iso2: "kw", code: "+965", name: "Kuwait" },
  { iso2: "qa", code: "+974", name: "Qatar" },
  { iso2: "bh", code: "+973", name: "Bahrain" },
  { iso2: "om", code: "+968", name: "Oman" },
  { iso2: "in", code: "+91", name: "India" },
  { iso2: "cn", code: "+86", name: "China" },
  { iso2: "jp", code: "+81", name: "Japan" },
  { iso2: "kr", code: "+82", name: "South Korea" },
  { iso2: "sg", code: "+65", name: "Singapore" },
  { iso2: "au", code: "+61", name: "Australia" },
  { iso2: "nz", code: "+64", name: "New Zealand" },
  { iso2: "br", code: "+55", name: "Brazil" },
  { iso2: "mx", code: "+52", name: "Mexico" },
  { iso2: "ar", code: "+54", name: "Argentina" },
  { iso2: "za", code: "+27", name: "South Africa" },
  { iso2: "ng", code: "+234", name: "Nigeria" },
];

const flagUrl = (iso2) => `https://flagcdn.com/24x18/${iso2.toLowerCase()}.png`;

//get the error message from the api 
const getErrorMessage = (e, fallback) =>
  e?.response?.data?.message || e?.response?.data?.title || e?.message || fallback;

// transfrom date 5/6/1990 to June 5, 1990 
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

//phone number validation 
const validatePhone = (phone) => {
  if (!phone) return "";

  const matchedCountry = COUNTRY_CODES.find((c) => phone.startsWith(c.code));
  const local = matchedCountry ? phone.replace(matchedCountry.code, "").trim() : phone.trim();
  const digitsOnly = local.replace(/[\s\-()]/g, "");

  if (!digitsOnly) return "Please enter a phone number.";
  if (!/^\d+$/.test(digitsOnly)) return "Wrong phone number format.";
  if (digitsOnly.length < 7 || digitsOnly.length > 15) {
    return "Phone number must be between 7 and 15 digits.";
  }

  return "";
};

//list an error message under the fields with an error
function FieldError({ msg }) {
  if (!msg) return null;

  return (
    <div className={styles.fieldErrorWrap}>
      <AlertCircle className={styles.fieldErrorIcon} />
      <p className={styles.fieldErrorText}>{msg}</p>
    </div>
  );
}

//country code select component with search and flag display, value is the full phone number including country code, onChange returns the full phone number as well
function CountryPhoneSelect({ value, onChange, hasError }) {
  const [selected, setSelected] = useState(COUNTRY_CODES[0]);
  const [localNum, setLocalNum] = useState("");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    if (!value) {
      setSelected(COUNTRY_CODES[0]);
      setLocalNum("");
      return;
    }

    const matched = COUNTRY_CODES.find((c) => value.startsWith(c.code));
    if (matched) {
      setSelected(matched);
      setLocalNum(value.replace(matched.code, "").trim());
    } else {
      setLocalNum(value);
    }
  }, [value]);

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open]);

  const filtered = useMemo(
    () =>
      COUNTRY_CODES.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.code.includes(search)
      ),
    [search]
  );

  const select = (country) => {
    setSelected(country);
    setOpen(false);
    setSearch("");
    onChange(localNum ? `${country.code} ${localNum}` : "");
  };

  const handleNum = (e) => {
    const raw = e.target.value.replace(/[^0-9\s\-()]/g, "").slice(0, 20);
    setLocalNum(raw);
    onChange(raw ? `${selected.code} ${raw}` : "");
  };

  const borderClass = hasError ? styles.phoneSelectBorderError : styles.phoneSelectBorderDefault;

  return (
    <div className={styles.phoneSelectWrap} ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${styles.phoneSelectButton} ${borderClass}`}
      >
        <img
          src={flagUrl(selected.iso2)}
          alt={selected.name}
          width={22}
          height={16}
          className={styles.phoneFlag}
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
        <span className={styles.phoneCode}>{selected.code}</span>
        <ChevronDown
          className={`${styles.phoneChevron} ${open ? styles.phoneChevronOpen : ""}`}
        />
      </button>

      <input
        type="tel"
        inputMode="tel"
        value={localNum}
        onChange={handleNum}
        placeholder="e.g. 71 123 456"
        className={`${styles.phoneSelectInput} ${borderClass}`}
      />

      {open && (
        <div className={styles.phoneDropdown}>
          <div className={styles.phoneDropdownHeader}>
            <div className={styles.phoneSearchWrap}>
              <Search className={styles.phoneSearchIcon} />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country or code…"
                className={styles.phoneSearchInput}
              />
            </div>
          </div>

          <ul className={styles.phoneList}>
            {filtered.length === 0 && (
              <li className={styles.phoneNoResults}>No results</li>
            )}

            {filtered.map((country) => {
              const active = selected.iso2 === country.iso2 && selected.code === country.code;

              return (
                <li
                  key={`${country.iso2}-${country.code}`}
                  onClick={() => select(country)}
                  className={`${styles.phoneListItem} ${
                    active ? styles.phoneListItemActive : styles.phoneListItemIdle
                  }`}
                >
                  <img
                    src={flagUrl(country.iso2)}
                    alt={country.name}
                    width={22}
                    height={16}
                    className={styles.phoneFlagMenu}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                  <span className={styles.phoneCountryName}>{country.name}</span>
                  <span className={styles.phoneCountryCode}>{country.code}</span>
                  {active && <Check className={styles.phoneCheckIcon} />}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

//search for a health item select it , delete it 
function SearchableHealthMultiSelect({
  title,
  searchPlaceholder,
  emptyMessage,
  items = [],
  selectedIds = [],
  onToggle,
  onClear,
  busy = [],
  accentColor = "emerald",
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const accent = styles.accent[accentColor] || {};

  const normalized = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        nid: typeof item?.id === "string" && !isNaN(item.id) ? Number(item.id) : item?.id,
      })),
    [items]
  );

  const filtered = useMemo(() => {
    const t = query.trim().toLowerCase();
    return t ? normalized.filter((i) => String(i?.name || "").toLowerCase().includes(t)) : normalized;
  }, [normalized, query]);

  const selectedItems = useMemo(
    () => normalized.filter((i) => selectedIds.includes(i.nid)),
    [normalized, selectedIds]
  );

  return (
    <div className={styles.multiSelectWrap}>
      <div className={styles.multiSelectHeader}>
        <div className={styles.multiSelectHeaderLeft}>
          <span className={styles.multiSelectTitle}>{title}</span>
          {selectedItems.length > 0 && (
            <span className={`${styles.multiSelectPill} ${accent.pill}`}>
              {selectedItems.length} selected
            </span>
          )}
        </div>

        <div className={styles.multiSelectHeaderRight}>
          {selectedItems.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className={styles.multiSelectClearButton}
            >
              Clear all
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsOpen((p) => !p)}
            className={styles.multiSelectToggleButton}
          >
            {isOpen ? (
              <ChevronUp className={styles.multiSelectToggleIcon} />
            ) : (
              <ChevronDown className={styles.multiSelectToggleIcon} />
            )}
          </button>
        </div>
      </div>

      {selectedItems.length > 0 && (
        <div className={styles.multiSelectSelectedWrap}>
          {selectedItems.map((item) => {
            const isBusy = busy.includes(item.nid);

            return (
              <span
                key={item.nid}
                className={`${styles.multiSelectBadge} ${accent.badge}`}
              >
                {item.name}
                {isBusy ? (
                  <Loader2 className={styles.multiSelectBadgeBusyIcon} />
                ) : (
                  <button
                    type="button"
                    onClick={() => onToggle(item)}
                    className={`${styles.multiSelectBadgeRemoveButton} ${accent.badgeX}`}
                  >
                    <X className={styles.multiSelectBadgeRemoveIcon} />
                  </button>
                )}
              </span>
            );
          })}
        </div>
      )}

      {isOpen && (
        <>
          <div className={styles.multiSelectSearchSection}>
            <div className={styles.multiSelectSearchWrap}>
              <Search className={styles.multiSelectSearchIcon} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className={styles.multiSelectSearchInput}
              />
            </div>
          </div>

          <div className={styles.multiSelectOptions}>
            {filtered.length === 0 && (
              <div className={styles.multiSelectEmpty}>{emptyMessage}</div>
            )}

            {filtered.map((item) => {
              const sel = selectedIds.includes(item.nid);
              const isBusy = busy.includes(item.nid);

              return (
                <label
                  key={item.nid}
                  className={`${styles.multiSelectOption} ${
                    sel ? accent.row : styles.multiSelectOptionIdle
                  } ${isBusy ? styles.multiSelectOptionBusy : ""}`}
                >
                  <Checkbox
                    checked={sel}
                    onCheckedChange={() => onToggle(item)}
                    disabled={isBusy}
                    className={`${styles.multiSelectCheckbox} ${accent.checkbox}`}
                  />
                  <span className={sel ? accent.rowText : styles.multiSelectOptionText}>
                    {item.name}
                  </span>
                  {isBusy && <Loader2 className={styles.multiSelectBusyIcon} />}
                </label>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
//fucntion to display genral information about the user in the overview tab
function OverviewField({ label, value }) {
  return (
    <div className={styles.overviewFieldWrap}>
      <p className={styles.cls016}>{label}</p>
      <p className={styles.cls017}>{value}</p>
    </div>
  );
}
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

  const [allergyCatalog, setAllergyCatalog] = useState([]);
  const [diseaseCatalog, setDiseaseCatalog] = useState([]);

  const [notice, setNotice] = useState({ type: "", text: "" });
  const [phoneError, setPhoneError] = useState("");
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
        const [profileData, healthData, allergies, diseases] = await Promise.all([
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
      await getUserHealthSummary(userId);
    } catch {}
  };

  const handleSaveProfile = async () => {
    if (!userId) return;

    const phoneValidationError = validatePhone(profile.phone);
    if (phoneValidationError) {
      setPhoneError(phoneValidationError);
      setNotice({ type: "error", text: "Please correct the highlighted fields." });
      return;
    }

    setPhoneError("");
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
        setHealth((prev) => ({
          ...prev,
          allergies: prev.allergies.filter((a) => Number(a.id) !== id),
        }));
        setNotice({ type: "success", text: `${item.name} removed from your allergies.` });
      } else {
        await addUserAllergy(userId, id);
        setHealth((prev) => ({
          ...prev,
          allergies: [...prev.allergies, { id, name: item.name }],
        }));
        setNotice({ type: "success", text: `${item.name} added to your allergies.` });
      }

      await refreshSummary();
    } catch (e) {
      setNotice({ type: "error", text: getErrorMessage(e, "Failed to update allergy.") });
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
        setHealth((prev) => ({
          ...prev,
          diseases: prev.diseases.filter((d) => Number(d.id) !== id),
        }));
        setNotice({ type: "success", text: `${item.name} removed from your diseases.` });
      } else {
        await addUserDisease(userId, id);
        setHealth((prev) => ({
          ...prev,
          diseases: [...prev.diseases, { id, name: item.name }],
        }));
        setNotice({ type: "success", text: `${item.name} added to your diseases.` });
      }

      await refreshSummary();
    } catch (e) {
      setNotice({ type: "error", text: getErrorMessage(e, "Failed to update disease.") });
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
      setNotice({ type: "error", text: getErrorMessage(e, "Failed to deactivate account.") });
    } finally {
      setDeletingAccount(false);
      setShowDeleteConfirm(false);
      setDeleteConfirmText("");
    }
  };

  //if the profile is loading show a loader and a message
  if (loading) {
    return (
      <div className={styles.cls001}>
        <div className={styles.cls002}>
          <Loader2 className={styles.cls003} />
          <span>Loading your profile…</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.cls004}>
      <div>
        <h2 className={styles.cls005}>My Profile</h2>
        <p className={styles.cls006}>Manage your personal information and health preferences.</p>
      </div>

      {notice.text && (
        <Alert
          role="status"
          className={notice.type === "error" ? styles.noticeError : styles.noticeSuccess}
        >
          {notice.type === "error" ? (
            <AlertTriangle className={styles.cls007} />
          ) : (
            <Check className={styles.cls008} />
          )}
          <AlertDescription
            className={notice.type === "error" ? styles.noticeErrorText : styles.noticeSuccessText}
          >
            {notice.text}
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className={styles.cls009}>
          {[
            { value: "overview", icon: <Info className={styles.cls011} />, label: "General Info" },
            { value: "personal", icon: <UserRoundPen className={styles.cls011} />, label: "Personal" },
            { value: "health", icon: <ShieldCheck className={styles.cls011} />, label: "Health" },
            { value: "delete", icon: <Trash2 className={styles.cls011} />, label: "Delete" },
          ].map(({ value, icon, label }) => (
            <TabsTrigger key={value} value={value} className={styles.cls010}>
              {icon}
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className={styles.cls004}>
          <Card className={styles.cls012}>
            <CardHeader>
              <CardTitle className={styles.cls013}>Profile Overview</CardTitle>
              <CardDescription>A summary of your account and health data</CardDescription>
            </CardHeader>

            <CardContent className={styles.cls014}>
              <div className={styles.cls015}>
                <OverviewField
                  label="Full Name"
                  value={`${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "Not set"}
                />
                <OverviewField label="Email" value={profile.email || "Not set"} />
                <OverviewField label="Date of Birth" value={formatDate(profile.dateOfBirth)} />
                <OverviewField label="Gender" value={humanizeGender(profile.gender)} />
              </div>

              <div className={styles.cls018}>
                <Label className={styles.cls019}>Allergies</Label>
                {selectedAllergyNames.length ? (
                  <div className={styles.cls020}>
                    {selectedAllergyNames.map((name) => (
                      <Badge key={`allergy-${name}`} className={styles.cls021}>
                        {name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className={styles.cls022}>No allergies on record.</p>
                )}
              </div>

              <div className={styles.cls018}>
                <Label className={styles.cls019}>Diseases</Label>
                {selectedDiseaseNames.length ? (
                  <div className={styles.cls020}>
                    {selectedDiseaseNames.map((name) => (
                      <Badge key={`disease-${name}`} className={styles.cls023}>
                        {name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className={styles.cls022}>No diseases on record.</p>
                )}
              </div>

              {isFemale && (
                <div className={styles.cls024}>
                  <div>
                    <p className={styles.cls025}>Pregnancy Status</p>
                    <p className={styles.cls026}>
                      {health.isPregnant ? "Currently pregnant" : "Not pregnant"}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personal">
          <Card className={styles.cls012}>
            <CardHeader>
              <CardTitle className={styles.cls013}>Personal Information</CardTitle>
              <CardDescription>Keep your account details accurate and up to date</CardDescription>
            </CardHeader>

            <CardContent className={styles.cls014}>
              <div className={styles.cls015}>
                <div className={styles.cls018}>
                  <Label htmlFor="firstName" className={styles.inputLabel}>
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    value={profile.firstName}
                    onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
                    className={styles.textInput}
                  />
                </div>

                <div className={styles.cls018}>
                  <Label htmlFor="lastName" className={styles.inputLabel}>
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    value={profile.lastName}
                    onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
                    className={styles.textInput}
                  />
                </div>
              </div>

              <div className={styles.cls018}>
                <Label htmlFor="email" className={styles.inputLabel}>
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  readOnly
                  disabled
                  className={`${styles.readOnlyInputBase} ${styles.cls027}`}
                />
                <p className={styles.cls028}>Email cannot be changed from this screen.</p>
              </div>

              <div className={styles.cls018}>
                <Label htmlFor="phone" className={styles.inputLabel}>
                  Phone Number
                </Label>
                <CountryPhoneSelect
                  value={profile.phone}
                  onChange={(value) => {
                    setProfile((p) => ({ ...p, phone: value }));
                    setPhoneError("");
                  }}
                  hasError={!!phoneError}
                />
                <FieldError msg={phoneError} />
              </div>

              <div className={styles.cls015}>
                <div className={styles.cls018}>
                  <Label htmlFor="dateOfBirth" className={styles.inputLabel}>
                    Date of Birth
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={profile.dateOfBirth || ""}
                    onChange={(e) => setProfile((p) => ({ ...p, dateOfBirth: e.target.value }))}
                    className={styles.textInput}
                  />
                </div>

                <div className={styles.cls018}>
                  <Label htmlFor="gender" className={styles.inputLabel}>
                    Gender
                  </Label>
                  <Input
                    id="gender"
                    value={humanizeGender(profile.gender)}
                    readOnly
                    disabled
                    className={`${styles.readOnlyInputBase} ${styles.cls027}`}
                  />
                  <p className={styles.cls028}>Gender cannot be changed from this screen.</p>
                </div>
              </div>

              <Button onClick={handleSaveProfile} disabled={savingProfile} className={styles.cls029}>
                {savingProfile ? (
                  <>
                    <Loader2 className={styles.cls030} />
                    Saving…
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
              <CardTitle className={styles.cls013}>Health Profile</CardTitle>
              <CardDescription>
                Changes are saved instantly. Click any item to add or remove it.
              </CardDescription>
            </CardHeader>

            <CardContent className={styles.cls004}>
              <Alert className={styles.cls032}>
                <ShieldCheck className={styles.cls033} />
                <AlertDescription className={styles.cls034}>
                  Your health data is kept confidential and used only for safer food recommendations.
                </AlertDescription>
              </Alert>

              <div className={styles.cls035}>
                <h3 className={styles.cls036}>Allergies</h3>
                {allergyCatalog.length === 0 ? (
                  <p className={styles.healthEmptyText}>No allergies available.</p>
                ) : (
                  <SearchableHealthMultiSelect
                    title="Select your allergies"
                    searchPlaceholder="Search allergies…"
                    emptyMessage="No allergies matched your search."
                    items={allergyCatalog}
                    selectedIds={selectedAllergyIds}
                    onToggle={handleToggleAllergy}
                    onClear={() => health.allergies.forEach((a) => handleToggleAllergy(a))}
                    busy={pendingAllergyIds}
                    accentColor="emerald"
                  />
                )}
              </div>

              <div className={styles.cls035}>
                <h3 className={styles.cls036}>Diseases</h3>
                {diseaseCatalog.length === 0 ? (
                  <p className={styles.healthEmptyText}>No diseases available.</p>
                ) : (
                  <SearchableHealthMultiSelect
                    title="Select your diseases"
                    searchPlaceholder="Search diseases…"
                    emptyMessage="No diseases matched your search."
                    items={diseaseCatalog}
                    selectedIds={selectedDiseaseIds}
                    onToggle={handleToggleDisease}
                    onClear={() => health.diseases.forEach((d) => handleToggleDisease(d))}
                    busy={pendingDiseaseIds}
                    accentColor="sky"
                  />
                )}
              </div>

              {isFemale && (
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
                    {savingPregnancy && <Loader2 className={styles.cls046} />}
                  </div>
                </div>
              )}
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
                  This action is irreversible. All profile and health data will be permanently deleted.
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
                  <Trash2 className={styles.deleteButtonIcon} />
                  Proceed to Delete Account
                </Button>
              ) : (
                <div className={styles.cls035}>
                  <Label htmlFor="deleteConfirm" className={styles.inputLabel}>
                    Type <span className={styles.deleteConfirmHighlight}>DELETE</span> to confirm
                  </Label>

                  <Input
                    id="deleteConfirm"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="DELETE"
                    className={styles.deleteConfirmInput}
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
                      {deletingAccount ? "Deleting…" : "Delete Permanently"}
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


