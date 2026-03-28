import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { Alert, AlertDescription } from "../components/ui/alert";


import { ArrowLeft, CheckCircle } from "lucide-react";
import logoImage from "../assets/logos/safebite.png";

import { getAllAllergies, getAllDiseases, registerApi } from "../services/register";


const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PHONE_REGEX = /^[0-9+\-() \s]{0,20}$/;
//trim strings or return null if empty
const trimOrNull = (v) => (typeof v === "string" ? v.trim() : v) || null;

// Mapping server error fields to client field names for  error 
const mapServerFieldToClient = (serverKey) => {
  const key = (serverKey || "").toLowerCase();
  if (key.startsWith("firstname")) return "firstName";
  if (key.startsWith("lastname")) return "lastName";
  if (key.startsWith("email")) return "email";
  if (key.startsWith("phone")) return "phone";
  if (key.startsWith("dateofbirth")) return "dob";
  if (key.startsWith("gender")) return "gender";
  if (key.startsWith("ispregnant")) return "isPregnant";
  if (key.startsWith("password")) return "password";
  if (key.startsWith("confirmpassword")) return "confirmPassword";
  if (key.startsWith("allergyids")) return "selectedAllergies";
  if (key.startsWith("diseaseids")) return "selectedDiseases";
  return null;
};

// merge multiple error messages for the same field
const mergeFieldErrors = (base, field, message) => {
  if (!field) return base;
  return {
    ...base,
    [field]: base[field] ? `${base[field]}\n${message}` : message,
  };
};

// parse API errors 
const parseApiError = (err) => {
  let summary = "Something went wrong. Please check your inputs.";
  let fieldErrors = {};

  // If it's not an Axios error or doesn't have a response return an  error message
  if (!axios.isAxiosError(err) || !err.response) {
    return { summary, fieldErrors };
  }

  const data = err.response.data; // Get the response data from the error object

  
  if (typeof data === "string") {
    summary = data;

    const text = data.toLowerCase();
    if (text.includes("email")) fieldErrors.email = data;
    if (text.includes("passwords do not match") || (text.includes("passwords") && text.includes("match"))) {
      fieldErrors.confirmPassword = data;
    }
    if (text.includes("male") && text.includes("pregnan")) {
      fieldErrors.isPregnant = data;
    }
    return { summary, fieldErrors };
  }

  if (data && typeof data === "object") {
    if (data.errors && typeof data.errors === "object") {
      for (const [serverField, messages] of Object.entries(data.errors)) {
        const clientField = mapServerFieldToClient(serverField);
        const msgList = Array.isArray(messages) ? messages : [String(messages || "")];
        for (const m of msgList) {
          if (clientField) fieldErrors = mergeFieldErrors(fieldErrors, clientField, m);
          else summary = summary ? `${summary}\n${m}` : m;
        }
      }
    }

    const pdSummary = data.title || data.detail || data.message || data.error;
    if (typeof pdSummary === "string" && pdSummary.trim()) {
      summary = pdSummary;
    } else if (!Object.keys(fieldErrors).length && typeof data === "object") {
      try {
        const s = JSON.stringify(data);
        if (s && s.length < 300) summary = s;
      } catch {}
    }
    return { summary, fieldErrors };
  }

  summary = err.response.statusText || summary;
  return { summary, fieldErrors };
};

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
  const [loadingMeta, setLoadingMeta] = useState(true);// State to manage loading of allergies and diseases

  useEffect(() => {
    let cancelled = false;
// Load allergies and diseases for the health information step when the component mounts
    async function loadMeta() {
      setLoadingMeta(true);
      try {
        const [a, d] = await Promise.all([getAllAllergies(), getAllDiseases()]);
        if (!cancelled) {
          setAllergies(Array.isArray(a) ? a : []);
          setDiseases(Array.isArray(d) ? d : []);
        }
      } catch (e) {
        console.error("Meta load error:", e);
        if (!cancelled) setFormError("Failed to load reference data. Please try again.");
      } finally {
        if (!cancelled) setLoadingMeta(false);
      }
    }

    loadMeta();
    return () => {
      cancelled = true;
    };
  }, []);

  // Client side validation for the personal information step
  const clientValidatePersonal = useMemo(() => {
    return () => {
      const fe = {};
      let summary = null;

      if (firstName && firstName.length > 50) {
        fe.firstName = "First name cannot exceed 50 characters.";
      }

      if (lastName && lastName.length > 50) {
        fe.lastName = "Last name cannot exceed 50 characters.";
      }

      if (!email) {
        fe.email = "Email is required.";
      } else if (!EMAIL_REGEX.test(email)) {
        fe.email = "Invalid email address.";
      } else if (email.length > 100) {
        fe.email = "Email cannot exceed 100 characters.";
      }

      if (phone) {
        if (phone.length > 20) {
          fe.phone = "Phone cannot exceed 20 characters.";
        } else if (!PHONE_REGEX.test(phone)) {
          fe.phone = "Invalid phone number.";
        }
      }

      if (!dob) {
        fe.dob = "Date of birth is required.";
      }

      if (!gender) {
        fe.gender = "Gender is required.";
      }

      if (!password) {
        fe.password = "Password is required.";
      } else {
        if (password.length < 8) fe.password = "Password must be at least 8 characters.";
        else if (password.length > 100) fe.password = "Password cannot exceed 100 characters.";
      }

      if (!confirmPassword) {
        fe.confirmPassword = "Confirm password is required.";
      } else if (password && confirmPassword !== password) {
        fe.confirmPassword = "Passwords do not match.";
      }

      if (Object.keys(fe).length > 0) {
        summary = Object.values(fe)[0];
      }
      return { fe, summary };
    };
  }, [firstName, lastName, email, phone, dob, gender, password, confirmPassword]);

  // Clear field error when user modifies the input
  const clearFieldError = (field) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const { [field]: _, ...rest } = prev;
      return rest;
    });
  };

//toggle id in selected allergies and diseases
  const toggleId = (id, checked, setter) => {
    const isChecked = !!checked;
    const numId = typeof id === "string" && !Number.isNaN(Number(id)) ? Number(id) : id;
    setter((prev) => (isChecked ? [...new Set([...prev, numId])] : prev.filter((x) => x !== numId)));
  };

  const handlePersonalSubmit = (e) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const { fe, summary } = clientValidatePersonal();
    if (summary) {
      setFieldErrors(fe);
      setFormError(summary);
      return;
    }
    setStep("health");
  };

  const handleHealthSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setSubmitting(true);

    try {
      const payload = {
        firstName: trimOrNull(firstName),
        lastName: trimOrNull(lastName),
        email: email?.trim(),
        phone: trimOrNull(phone),
        dateOfBirth: dob,
        gender: gender === "male" ? 1 : 2,
        isPregnant: gender === "female" ? !!isPregnant : false,
        password,
        confirmPassword,
        allergyIds: hasAllergies ? selectedAllergies.filter((x) => Number.isFinite(x)).map(Number) : [],
        diseaseIds: hasDiseases ? selectedDiseases.filter((x) => Number.isFinite(x)).map(Number) : [],
      };

      await registerApi(payload);

      setStep("success");
      setTimeout(() => onNavigateToLogin?.(), 3000);
    } catch (err) {
      const { summary, fieldErrors: apiFieldErrors } = parseApiError(err);
      setFieldErrors(apiFieldErrors);
      setFormError(summary);
    } finally {
      setSubmitting(false);
    }
  };

  const inputErrorClass = (field) =>
    fieldErrors[field] ? "border-red-500 focus-visible:ring-red-500" : "";

  const helpText = (field, defaultText) =>
    fieldErrors[field] ? (
      <p className="text-xs text-red-600 whitespace-pre-line">{fieldErrors[field]}</p>
    ) : defaultText ? (
      <p className="text-xs text-gray-500">{defaultText}</p>
    ) : null;

  if (step === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-blue-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <h2 className="mb-2">Registration Successful!</h2>
            <p className="text-gray-600">
              Your account has been created successfully. Redirecting to login...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-blue-50">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => (step === "personal" ? onNavigateToLogin?.() : setStep("personal"))}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <img src={logoImage} alt="SafeBite Logo" className="h-16 w-16" />
            <div className="w-16" />
          </div>

          <CardTitle className="text-center">Create Your SafeBite Account</CardTitle>
          <CardDescription className="text-center">
            {step === "personal" ? "Step 1 of 2: Personal Information" : "Step 2 of 2: Health Information"}
          </CardDescription>

          <div className="flex gap-2 pt-4">
            <div className={`h-2 flex-1 rounded ${step === "personal" ? "bg-green-600" : "bg-green-300"}`} />
            <div className={`h-2 flex-1 rounded ${step === "health" ? "bg-green-600" : "bg-gray-200"}`} />
          </div>
        </CardHeader>

        <CardContent>
          {formError && (
            <Alert className="mb-4 bg-red-50 border-red-200">
              <AlertDescription className="text-red-700 whitespace-pre-line">{formError}</AlertDescription>
            </Alert>
          )}

          {step === "personal" ? (
            <form onSubmit={handlePersonalSubmit} noValidate className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    First Name <span className="text-gray-400">(Optional)</span>
                  </Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => { setFirstName(e.target.value); clearFieldError("firstName"); }}
                    className={inputErrorClass("firstName")}
                  />
                  {helpText("firstName")}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Last Name <span className="text-gray-400">(Optional)</span>
                  </Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => { setLastName(e.target.value); clearFieldError("lastName"); }}
                    className={inputErrorClass("lastName")}
                  />
                  {helpText("lastName")}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearFieldError("email"); }}
                  className={inputErrorClass("email")}
                />
                {helpText("email")} 
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone Number <span className="text-gray-400">(Optional)</span>
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); clearFieldError("phone"); }}
                  className={inputErrorClass("phone")}
                />
                {helpText("phone")}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dob">
                    Date of Birth <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="dob"
                    type="date"
                    value={dob}
                    onChange={(e) => { setDob(e.target.value); clearFieldError("dob"); }}
                    className={inputErrorClass("dob")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">
                    Gender <span className="text-red-500">*</span>
                  </Label>

                  <Select
                    value={gender}
                    onValueChange={(v) => { setGender(v); clearFieldError("gender"); }}
                  >
                    <SelectTrigger
                      id="gender"
                      className={
                        `bg-white border border-gray-300 text-gray-900 ` +
                        `rounded-md h-10 px-3 ` +
                        `focus:ring-2 focus:ring-green-600 focus:border-green-600 ` +
                        `${inputErrorClass("gender")}`
                      }
                    >
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>

                    <SelectContent
                      position="popper"
                      sideOffset={6}
                      className={
                        `bg-white text-gray-900 border border-gray-200 ` +
                        `rounded-md shadow-xl z-[60] ` +
                        `min-w-[var(--radix-select-trigger-width)]`
                      }
                    >
                      <SelectItem
                        value="male"
                        className="text-sm cursor-pointer data-[state=checked]:font-medium data-[highlighted]:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                      >
                        Male
                      </SelectItem>
                      <SelectItem
                        value="female"
                        className="text-sm cursor-pointer data-[state=checked]:font-medium data-[highlighted]:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                      >
                        Female
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); clearFieldError("password"); }}
                    className={inputErrorClass("password")}
                  />
                  {helpText("password")}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    Confirm Password <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); clearFieldError("confirmPassword"); }}
                    className={inputErrorClass("confirmPassword")}
                  />
                  {helpText("confirmPassword")}
                </div>
              </div>

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                Continue to Health Information
              </Button>
            </form>
          ) : (
            <form onSubmit={handleHealthSubmit} noValidate className="space-y-6">
              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription className="text-blue-800">
                  Your health information is confidential and will only be used to provide you with safe meal
                  recommendations.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <Label>Do you have any allergies?</Label>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={hasAllergies === true ? "default" : "outline"}
                    onClick={() => { setHasAllergies(true); }}
                    className={hasAllergies === true ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    Yes
                  </Button>
                  <Button
                    type="button"
                    variant={hasAllergies === false ? "default" : "outline"}
                    onClick={() => {
                      setHasAllergies(false);
                      setSelectedAllergies([]);
                    }}
                    className={hasAllergies === false ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    No
                  </Button>
                </div>

                {hasAllergies === true && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border rounded-lg bg-gray-50">
                    {loadingMeta && <div className="text-sm text-gray-500">Loading allergies...</div>}

                    {!loadingMeta &&
                      Array.isArray(allergies) &&
                      allergies.map((a) => (
                        <label key={a.id} className="flex items-center space-x-2">
                          <Checkbox
                            checked={selectedAllergies.includes(
                              typeof a.id === "string" && !Number.isNaN(Number(a.id)) ? Number(a.id) : a.id
                            )}
                            onCheckedChange={(checked) => toggleId(a.id, checked, setSelectedAllergies)}
                          />
                          <span className="text-sm">{a.name}</span>
                        </label>
                      ))}

                    {!loadingMeta && Array.isArray(allergies) && allergies.length === 0 && (
                      <div className="text-sm text-gray-500">No allergies found.</div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label>Do you suffer from any chronic food-related diseases?</Label>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={hasDiseases === true ? "default" : "outline"}
                    onClick={() => { setHasDiseases(true); }}
                    className={hasDiseases === true ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    Yes
                  </Button>
                  <Button
                    type="button"
                    variant={hasDiseases === false ? "default" : "outline"}
                    onClick={() => {
                      setHasDiseases(false);
                      setSelectedDiseases([]);
                    }}
                    className={hasDiseases === false ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    No
                  </Button>
                </div>

                {hasDiseases === true && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 border rounded-lg bg-gray-50">
                    {loadingMeta && <div className="text-sm text-gray-500">Loading diseases...</div>}

                    {!loadingMeta &&
                      Array.isArray(diseases) &&
                      diseases.map((d) => (
                        <label key={d.id} className="flex items-center space-x-2">
                          <Checkbox
                            checked={selectedDiseases.includes(
                              typeof d.id === "string" && !Number.isNaN(Number(d.id)) ? Number(d.id) : d.id
                            )}
                            onCheckedChange={(checked) => toggleId(d.id, checked, setSelectedDiseases)}
                          />
                          <span className="text-sm">{d.name}</span>
                        </label>
                      ))}

                    {!loadingMeta && Array.isArray(diseases) && diseases.length === 0 && (
                      <div className="text-sm text-gray-500">No diseases found.</div>
                    )}
                  </div>
                )}
              </div>

              {gender === "female" && (
                <div className="space-y-3">
                  <Label>Are you currently pregnant?</Label>
                  <p className="text-xs text-gray-500">
                    This helps us exclude dishes that may pose risks during pregnancy
                  </p>
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant={isPregnant === true ? "default" : "outline"}
                      onClick={() => { setIsPregnant(true); }}
                      className={isPregnant === true ? "bg-green-600 hover:bg-green-700" : ""}
                    >
                      Yes
                    </Button>
                    <Button
                      type="button"
                      variant={isPregnant === false ? "default" : "outline"}
                      onClick={() => { setIsPregnant(false); }}
                      className={isPregnant === false ? "bg-green-600 hover:bg-green-700" : ""}
                    >
                      No
                    </Button>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-70"
              >
                {submitting ? "Creating account..." : "Complete Registration"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
``
