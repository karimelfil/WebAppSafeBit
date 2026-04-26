import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";

import { ArrowLeft, CheckCircle, ChevronDown, ChevronUp, Eye, EyeOff, Search, X, Check } from "lucide-react";
import logoImage from "../assets/logos/safebite.png";

import { getAllAllergies, getAllDiseases, registerApi } from "../services/register";
import {
  getBorderClass,
  getInputClass,
  getPhoneButtonClass,
  getPhoneChevronClass,
  getPhoneInputClass,
  getPhoneOptionClass,
  getProgressClass,
  getSelectTriggerClass,
  getSelectableRowClass,
  getSelectableTextClass,
  getStrengthBarClass,
  getStrengthRuleIconClass,
  getStrengthRuleTextClass,
  getYesNoButtonClass,
  styles,
} from "../styles/pages/RegisterPage.styles.js";

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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const flagUrl = (iso2) => `https://flagcdn.com/24x18/${iso2.toLowerCase()}.png`;
const trimOrNull = (v) => (typeof v === "string" ? v.trim() : v) || null;

const getStrength = (pwd) => {
  if (!pwd) return null;
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  const levels = [
    null,
    { label: "Very Weak", bar: "bg-red-500", text: "text-red-500" },
    { label: "Weak", bar: "bg-orange-400", text: "text-orange-400" },
    { label: "Fair", bar: "bg-yellow-400", text: "text-yellow-500" },
    { label: "Strong", bar: "bg-emerald-500", text: "text-emerald-600" },
    { label: "Very Strong", bar: "bg-emerald-600", text: "text-emerald-700" },
  ];

  return { score, ...levels[score] };
};

const mapServerField = (key = "") => {
  const k = key.toLowerCase();
  if (k.startsWith("firstname")) return "firstName";
  if (k.startsWith("lastname")) return "lastName";
  if (k.startsWith("email")) return "email";
  if (k.startsWith("phone")) return "phone";
  if (k.startsWith("dateofbirth")) return "dob";
  if (k.startsWith("gender")) return "gender";
  if (k.startsWith("ispregnant")) return "isPregnant";
  if (k.startsWith("password")) return "password";
  if (k.startsWith("confirmpassword")) return "confirmPassword";
  if (k.startsWith("allergyids")) return "selectedAllergies";
  if (k.startsWith("diseaseids")) return "selectedDiseases";
  return null;
};

const parseApiError = (err) => {
  let summary = "Something went wrong. Please check your inputs.";
  let fieldErrors = {};

  if (!axios.isAxiosError(err) || !err.response) return { summary, fieldErrors };

  const data = err.response.data;
  if (typeof data === "string") {
    summary = data;
    const text = data.toLowerCase();
    if (text.includes("email")) fieldErrors.email = data;
    if (text.includes("passwords do not match")) fieldErrors.confirmPassword = data;
    if (text.includes("male") && text.includes("pregnan")) fieldErrors.isPregnant = data;
    return { summary, fieldErrors };
  }

  if (data?.errors) {
    for (const [serverField, messages] of Object.entries(data.errors)) {
      const clientField = mapServerField(serverField);
      for (const message of Array.isArray(messages) ? messages : [String(messages)]) {
        if (clientField) {
          fieldErrors[clientField] = fieldErrors[clientField]
            ? `${fieldErrors[clientField]}\n${message}`
            : message;
        } else {
          summary = `${summary}\n${message}`;
        }
      }
    }
  }

  const serverSummary = data?.title || data?.detail || data?.message || data?.error;
  if (typeof serverSummary === "string") summary = serverSummary;

  return { summary, fieldErrors };
};

function CountryPhoneSelect({ onChange, hasError }) {
  const [selected, setSelected] = useState(COUNTRY_CODES[0]);
  const [localNum, setLocalNum] = useState("");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapRef = useRef(null);
  const searchRef = useRef(null);

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
        (country) =>
          country.name.toLowerCase().includes(search.toLowerCase()) || country.code.includes(search)
      ),
    [search]
  );

  const borderClass = getBorderClass(hasError);

  const selectCountry = (country) => {
    setSelected(country);
    setOpen(false);
    setSearch("");
    onChange(localNum ? `${country.code} ${localNum}` : "");
  };

  const handleNum = (e) => {
    const raw = e.target.value.replace(/[^0-9\s\-()]/g, "").slice(0, 15);
    setLocalNum(raw);
    onChange(raw ? `${selected.code} ${raw}` : "");
  };

  return (
    <div className={styles.cls108} ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={getPhoneButtonClass(borderClass)}
        style={{ minWidth: 110 }}
      >
        <img
          src={flagUrl(selected.iso2)}
          alt={selected.name}
          width={22}
          height={16}
          className={styles.cls110}
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
        <span className={styles.cls111}>{selected.code}</span>
        <ChevronDown className={getPhoneChevronClass(open)} />
      </button>

      <input
        type="tel"
        inputMode="tel"
        value={localNum}
        onChange={handleNum}
        className={getPhoneInputClass(borderClass)}
      />

      {open && (
        <div className={styles.cls114}>
          <div className={styles.cls115}>
            <div className={styles.cls028}>
              <Search className={styles.cls116} />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country or code..."
                className={styles.cls117}
              />
            </div>
          </div>

          <ul className={styles.cls118}>
            {filtered.length === 0 && <li className={styles.cls119}>No results</li>}
            {filtered.map((country) => {
              const active = selected.iso2 === country.iso2 && selected.code === country.code;
              return (
                <li
                  key={`${country.iso2}-${country.code}`}
                  onClick={() => selectCountry(country)}
                  className={getPhoneOptionClass(active)}
                >
                  <img
                    src={flagUrl(country.iso2)}
                    alt={country.name}
                    width={22}
                    height={16}
                    className={styles.cls124}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                  <span className={styles.cls121}>{country.name}</span>
                  <span className={styles.cls122}>{country.code}</span>
                  {active && <Check className={styles.cls123} />}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function PasswordInput({ id, value, onChange, borderClass, autoComplete, placeholder }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={styles.cls001}>
      <input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={`${styles.cls002} ${borderClass}`}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((current) => !current)}
        className={styles.cls003}
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <Eye className={styles.cls004} /> : <EyeOff className={styles.cls004} />}
      </button>
    </div>
  );
}

function PasswordStrengthBar({ password }) {
  const strength = getStrength(password);
  if (!strength) return null;

  const rules = [
    { met: password.length >= 8, label: "At least 8 characters" },
    { met: /[A-Z]/.test(password), label: "Uppercase letter" },
    { met: /[a-z]/.test(password), label: "Lowercase letter" },
    { met: /[0-9]/.test(password), label: "Number" },
    { met: /[^A-Za-z0-9]/.test(password), label: "Special character" },
  ];

  return (
    <div className={styles.cls005}>
      <div className={styles.cls006}>
        <div className={styles.cls007}>
          {[1, 2, 3, 4, 5].map((index) => (
            <div key={index} className={getStrengthBarClass(index <= strength.score, strength.bar)} />
          ))}
        </div>
        <span className={`${styles.cls009} ${strength.text}`}>{strength.label}</span>
      </div>
      <div className={styles.cls010}>
        {rules.map((rule) => (
          <div key={rule.label} className={styles.cls011}>
            <div className={getStrengthRuleIconClass(rule.met)}>
              {rule.met && <Check className={styles.cls013} strokeWidth={3} />}
            </div>
            <span className={getStrengthRuleTextClass(rule.met)}>{rule.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SearchableHealthMultiSelect({
  title,
  searchPlaceholder,
  emptyMessage,
  loadingMessage,
  items,
  selectedIds,
  onToggle,
  onClear,
  loading,
  fieldError,
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(true);

  const normalized = useMemo(
    () =>
      (Array.isArray(items) ? items : []).map((item) => ({
        ...item,
        nid: typeof item?.id === "string" && !Number.isNaN(Number(item.id)) ? Number(item.id) : item?.id,
      })),
    [items]
  );

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    return text ? normalized.filter((item) => String(item?.name || "").toLowerCase().includes(text)) : normalized;
  }, [normalized, query]);

  const selectedItems = useMemo(
    () => normalized.filter((item) => selectedIds.includes(item.nid)),
    [normalized, selectedIds]
  );

  return (
    <div className={styles.cls015}>
      <div className={styles.cls016}>
        <div className={styles.cls017}>
          <span className={styles.cls018}>{title}</span>
          {selectedItems.length > 0 && <span className={styles.cls019}>{selectedItems.length} selected</span>}
        </div>
        <div className={styles.cls020}>
          {selectedItems.length > 0 && (
            <button type="button" onClick={onClear} className={styles.cls021}>
              Clear all
            </button>
          )}
          <button type="button" onClick={() => setIsOpen((current) => !current)} className={styles.cls022}>
            {isOpen ? <ChevronUp className={styles.cls004} /> : <ChevronDown className={styles.cls004} />}
          </button>
        </div>
      </div>

      {selectedItems.length > 0 && (
        <div className={styles.cls023}>
          {selectedItems.map((item) => (
            <span key={item.nid} className={styles.cls024}>
              {item.name}
              <button type="button" onClick={() => onToggle(item.nid, false)} className={styles.cls025}>
                <X className={styles.cls026} />
              </button>
            </span>
          ))}
        </div>
      )}

      {isOpen && (
        <>
          <div className={styles.cls027}>
            <div className={styles.cls028}>
              <Search className={styles.cls029} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className={styles.cls030}
              />
            </div>
          </div>

          <div className={styles.cls031}>
            {loading && (
              <div className={styles.cls032}>
                <div className={styles.cls033} />
                {loadingMessage}
              </div>
            )}
            {!loading && filtered.length === 0 && <div className={styles.cls034}>{emptyMessage}</div>}
            {!loading &&
              filtered.map((item) => {
                const selected = selectedIds.includes(item.nid);
                return (
                  <label key={item.nid} className={getSelectableRowClass(selected)}>
                    <Checkbox
                      checked={selected}
                      onCheckedChange={(checked) => onToggle(item.nid, checked)}
                      className={styles.cls036}
                    />
                    <span className={getSelectableTextClass(selected)}>{item.name}</span>
                  </label>
                );
              })}
          </div>
        </>
      )}

      {fieldError && (
        <div className={styles.cls038}>
          <p className={styles.cls039}>{fieldError}</p>
        </div>
      )}
    </div>
  );
}

function FieldError({ msg }) {
  if (!msg) return null;
  return <p className={styles.cls040}>{msg}</p>;
}

function SectionLabel({ children, required, optional }) {
  return (
    <label className={styles.cls041}>
      {children}
      {required && <span className={styles.cls042}>*</span>}
      {optional && <span className={styles.cls043}>(optional)</span>}
    </label>
  );
}

function YesNoButtons({ value, onYes, onNo }) {
  return (
    <div className={styles.cls044}>
      {[
        { label: "Yes", val: true, fn: onYes },
        { label: "No", val: false, fn: onNo },
      ].map(({ label, val, fn }) => (
        <button key={label} type="button" onClick={fn} className={getYesNoButtonClass(value === val)}>
          {label}
        </button>
      ))}
    </div>
  );
}

export function RegisterPage({ onNavigateToLogin }) {
  const [step, setStep] = useState("personal");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hasAllergies, setHasAllergies] = useState(null);
  const [hasDiseases, setHasDiseases] = useState(null);
  const [isPregnant, setIsPregnant] = useState(null);
  const [allergies, setAllergies] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [selectedAllergies, setSelectedAllergies] = useState([]);
  const [selectedDiseases, setSelectedDiseases] = useState([]);
  const [formError, setFormError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loadingMeta, setLoadingMeta] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [allergyData, diseaseData] = await Promise.all([getAllAllergies(), getAllDiseases()]);
        if (!cancelled) {
          setAllergies(Array.isArray(allergyData) ? allergyData : []);
          setDiseases(Array.isArray(diseaseData) ? diseaseData : []);
        }
      } catch {
        if (!cancelled) setFormError("Failed to load reference data. Please refresh and try again.");
      } finally {
        if (!cancelled) setLoadingMeta(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const healthReady = useMemo(() => {
    if (hasAllergies === null || hasDiseases === null) return false;
    if (gender === "female" && isPregnant === null) return false;
    return true;
  }, [hasAllergies, hasDiseases, gender, isPregnant]);

  const validatePersonal = () => {
    const nextErrors = {};

    if (firstName.length > 50) nextErrors.firstName = "First name cannot exceed 50 characters.";
    if (lastName.length > 50) nextErrors.lastName = "Last name cannot exceed 50 characters.";

    if (!email) nextErrors.email = "Email address is required.";
    else if (!EMAIL_REGEX.test(email)) nextErrors.email = "Please enter a valid email address.";
    else if (email.length > 254) nextErrors.email = "Email cannot exceed 254 characters.";

    if (phone) {
      const local = phone.replace(/^\+\d+\s?/, "");
      if (local.replace(/[\s\-()]/g, "").length > 15) {
        nextErrors.phone = "Phone number cannot exceed 15 digits.";
      }
    }

    if (!dob) nextErrors.dob = "Date of birth is required.";
    if (!gender) nextErrors.gender = "Gender is required.";
    if (!password) nextErrors.password = "Password is required.";
    else if (password.length < 8) nextErrors.password = "Password must be at least 8 characters.";
    if (!confirmPassword) nextErrors.confirmPassword = "Please confirm your password.";
    else if (confirmPassword !== password) nextErrors.confirmPassword = "Passwords do not match.";

    return nextErrors;
  };

  const clearErr = (field) => {
    setFieldErrors((prev) => {
      const { [field]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const toggleId = (id, checked, setter) => {
    const numericId = typeof id === "string" && !Number.isNaN(Number(id)) ? Number(id) : id;
    setter((prev) => (checked ? [...new Set([...prev, numericId])] : prev.filter((value) => value !== numericId)));
  };

  const handlePersonalSubmit = (e) => {
    e.preventDefault();
    setFormError(null);
    const nextErrors = validatePersonal();

    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors);
      setFormError("Please correct the highlighted fields.");
      return;
    }

    setFieldErrors({});
    setStep("health");
  };

  const handleHealthSubmit = async (e) => {
    e.preventDefault();
    if (!healthReady) return;

    setFormError(null);
    setFieldErrors({});
    setSubmitting(true);

    try {
      await registerApi({
        firstName: trimOrNull(firstName),
        lastName: trimOrNull(lastName),
        email: email.trim(),
        phone: trimOrNull(phone),
        dateOfBirth: dob,
        gender: gender === "male" ? 1 : 2,
        isPregnant: gender === "female" ? !!isPregnant : false,
        password,
        confirmPassword,
        allergyIds: hasAllergies ? selectedAllergies.filter(Number.isFinite).map(Number) : [],
        diseaseIds: hasDiseases ? selectedDiseases.filter(Number.isFinite).map(Number) : [],
      });

      setStep("success");
      setTimeout(() => onNavigateToLogin?.(), 3000);
    } catch (err) {
      const { summary, fieldErrors: nextErrors } = parseApiError(err);
      setFieldErrors(nextErrors);
      setFormError(summary);
    } finally {
      setSubmitting(false);
    }
  };

  const borderClass = (field) => getBorderClass(!!fieldErrors[field]);
  const inputClass = (field) => getInputClass(!!fieldErrors[field]);

  if (step === "success") {
    return (
      <div className={styles.cls046}>
        <div className={styles.cls047}>
          <div className={styles.cls048}>
            <CheckCircle className={styles.cls049} />
          </div>
          <h2 className={styles.cls050}>Registration Successful!</h2>
          <p className={styles.cls051}>Your account has been created. Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.cls052}>
      <div className={styles.cls053}>
        <div className={styles.cls054}>
          <div className={styles.cls055}>
            <div className={styles.cls056}>
              <button
                type="button"
                onClick={() => (step === "personal" ? onNavigateToLogin?.() : setStep("personal"))}
                className={styles.cls057}
              >
                <ArrowLeft className={styles.cls058} />
                Back
              </button>
              <img src={logoImage} alt="SafeBite" className={styles.cls059} />
              <div className={styles.cls060} />
            </div>

            <div className={styles.cls061}>
              <h1 className={styles.cls062}>Create your account</h1>
              <p className={styles.cls063}>
                {step === "personal" ? "Step 1 of 2 - Personal Information" : "Step 2 of 2 - Health Information"}
              </p>
            </div>

            <div className={styles.cls064}>
              <div className={styles.cls095} />
              <div className={getProgressClass(step === "health")} />
            </div>
          </div>

          <div className={styles.cls066}>
            {formError && (
              <div className={styles.cls067}>
                <div className={styles.cls068}>
                  <X className={styles.cls069} strokeWidth={3} />
                </div>
                <p className={styles.cls070}>{formError}</p>
              </div>
            )}

            {step === "personal" && (
              <form onSubmit={handlePersonalSubmit} noValidate className={styles.cls071}>
                <div className={styles.cls072}>
                  <div>
                    <SectionLabel optional>First Name</SectionLabel>
                    <input
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        clearErr("firstName");
                      }}
                      className={inputClass("firstName")}
                    />
                    <FieldError msg={fieldErrors.firstName} />
                  </div>

                  <div>
                    <SectionLabel optional>Last Name</SectionLabel>
                    <input
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                        clearErr("lastName");
                      }}
                      className={inputClass("lastName")}
                    />
                    <FieldError msg={fieldErrors.lastName} />
                  </div>
                </div>

                <div>
                  <SectionLabel required>Email Address</SectionLabel>
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearErr("email");
                    }}
                    className={inputClass("email")}
                  />
                  <FieldError msg={fieldErrors.email} />
                </div>

                <div>
                  <SectionLabel optional>Phone Number</SectionLabel>
                  <CountryPhoneSelect
                    onChange={(value) => {
                      setPhone(value);
                      clearErr("phone");
                    }}
                    hasError={!!fieldErrors.phone}
                  />
                  <FieldError msg={fieldErrors.phone} />
                </div>

                <div className={styles.cls072}>
                  <div>
                    <SectionLabel required>Date of Birth</SectionLabel>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => {
                        setDob(e.target.value);
                        clearErr("dob");
                      }}
                      className={inputClass("dob")}
                    />
                    <FieldError msg={fieldErrors.dob} />
                  </div>

                  <div>
                    <SectionLabel required>Gender</SectionLabel>
                    <Select
                      value={gender}
                      onValueChange={(value) => {
                        setGender(value);
                        clearErr("gender");
                      }}
                    >
                      <SelectTrigger className={getSelectTriggerClass(!!fieldErrors.gender)}>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent className={styles.cls098}>
                        <SelectItem value="male" className={styles.cls099}>
                          Male
                        </SelectItem>
                        <SelectItem value="female" className={styles.cls099}>
                          Female
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError msg={fieldErrors.gender} />
                  </div>
                </div>

                <div className={styles.cls072}>
                  <div>
                    <SectionLabel required>Password</SectionLabel>
                    <PasswordInput
                      id="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        clearErr("password");
                      }}
                      borderClass={borderClass("password")}
                      autoComplete="new-password"
                      placeholder="Min. 8 characters"
                    />
                    <FieldError msg={fieldErrors.password} />
                    {!fieldErrors.password && <PasswordStrengthBar password={password} />}
                  </div>

                  <div>
                    <SectionLabel required>Confirm Password</SectionLabel>
                    <PasswordInput
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        clearErr("confirmPassword");
                      }}
                      borderClass={borderClass("confirmPassword")}
                      autoComplete="new-password"
                      placeholder="Re-enter your password"
                    />
                    <FieldError msg={fieldErrors.confirmPassword} />
                    {confirmPassword && !fieldErrors.confirmPassword && password === confirmPassword && (
                      <div className={styles.cls074}>
                        <div className={styles.cls075}>
                          <Check className={styles.cls013} strokeWidth={3} />
                        </div>
                        <span className={styles.cls076}>Passwords match</span>
                      </div>
                    )}
                  </div>
                </div>

                <button type="submit" className={styles.cls077}>
                  Continue to Health Information {"->"}
                </button>

                <p className={styles.cls078}>
                  Already have an account?{" "}
                  <button type="button" onClick={onNavigateToLogin} className={styles.cls079}>
                    Sign in
                  </button>
                </p>
              </form>
            )}

            {step === "health" && (
              <form onSubmit={handleHealthSubmit} noValidate className={styles.cls073}>
                <div className={styles.cls080}>
                  <svg className={styles.cls081} fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className={styles.cls082}>
                    Your health information is confidential and will only be used for personalized recommendations.
                  </p>
                </div>

                <div className={styles.cls083}>
                  <p className={styles.cls084}>Do you have any allergies?</p>
                  <YesNoButtons
                    value={hasAllergies}
                    onYes={() => setHasAllergies(true)}
                    onNo={() => {
                      setHasAllergies(false);
                      setSelectedAllergies([]);
                    }}
                  />
                  {hasAllergies === true && (
                    <SearchableHealthMultiSelect
                      title="Select your allergies"
                      searchPlaceholder="Search allergies..."
                      emptyMessage={allergies.length > 0 ? "No allergies matched your search." : "No allergies found."}
                      loadingMessage="Loading allergies..."
                      items={allergies}
                      selectedIds={selectedAllergies}
                      onToggle={(id, checked) => toggleId(id, checked, setSelectedAllergies)}
                      onClear={() => setSelectedAllergies([])}
                      loading={loadingMeta}
                      fieldError={fieldErrors.selectedAllergies}
                    />
                  )}
                </div>

                <div className={styles.cls083}>
                  <p className={styles.cls084}>Do you have any chronic food-related conditions?</p>
                  <YesNoButtons
                    value={hasDiseases}
                    onYes={() => setHasDiseases(true)}
                    onNo={() => {
                      setHasDiseases(false);
                      setSelectedDiseases([]);
                    }}
                  />
                  {hasDiseases === true && (
                    <SearchableHealthMultiSelect
                      title="Select your conditions"
                      searchPlaceholder="Search conditions..."
                      emptyMessage={diseases.length > 0 ? "No conditions matched your search." : "No conditions found."}
                      loadingMessage="Loading conditions..."
                      items={diseases}
                      selectedIds={selectedDiseases}
                      onToggle={(id, checked) => toggleId(id, checked, setSelectedDiseases)}
                      onClear={() => setSelectedDiseases([])}
                      loading={loadingMeta}
                      fieldError={fieldErrors.selectedDiseases}
                    />
                  )}
                </div>

                {gender === "female" && (
                  <div className={styles.cls083}>
                    <div>
                      <p className={styles.cls084}>Are you currently pregnant?</p>
                      <p className={styles.cls085}>Helps us flag dishes that may pose risks during pregnancy.</p>
                    </div>
                    <YesNoButtons value={isPregnant} onYes={() => setIsPregnant(true)} onNo={() => setIsPregnant(false)} />
                  </div>
                )}

                {!healthReady && (
                  <p className={styles.cls086}>
      
                  </p>
                )}

                <button type="submit" disabled={submitting || !healthReady} className={styles.cls088}>
                  {submitting ? (
                    <span className={styles.cls089}>
                      <span className={styles.cls090} />
                      Creating your account...
                    </span>
                  ) : (
                    "Complete Registration"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
