"use client";

import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

/*
 * Registration wizard
 *
 * This component implements a three‑step registration flow.  In the
 * final step users choose default curriculum settings for their
 * profile.  These settings drive the lesson creation experience on
 * subsequent pages.  Students are asked to choose a single
 * curriculum standard, while teachers choose a standard and then
 * select an associated subject and grade.  Dropdown options are
 * loaded from the backend via our Flask API.  See getFormData.jsx
 * for the corresponding endpoints.
 */

// ---------- helpers ----------

/**
 * Normalises a "next" querystring value to a safe relative path.
 * This prevents open redirect attacks by rejecting absolute URLs.
 */
function getSafeNext(rawNext) {
  if (typeof rawNext !== "string" || !rawNext) return "/";
  if (
    rawNext.startsWith("http://") ||
    rawNext.startsWith("https://") ||
    rawNext.startsWith("//")
  )
    return "/";
  return rawNext.startsWith("/") ? rawNext : "/";
}

/**
 * Fetches a JSON resource with a timeout.  Retries once on error.
 */
async function fetchJSONWithTimeout(
  url,
  { timeoutMs = 8000, headers, signal, ...init } = {},
  retry = true
) {
  const useController = !signal;
  const controller = useController ? new AbortController() : null;
  const timer = useController
    ? setTimeout(() => controller.abort(), timeoutMs)
    : null;

  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: headers ?? { Accept: "application/json" },
      signal: signal ?? controller.signal,
      ...init,
    });
    if (timer) clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const ct = (res.headers.get("content-type") || "").toLowerCase();
    return ct.includes("application/json")
      ? res.json()
      : { _nonJSON: await res.text() };
  } catch (e) {
    if (timer) clearTimeout(timer);
    if (retry) return fetchJSONWithTimeout(url, { timeoutMs, headers, signal, ...init }, false);
    throw e;
  }
}

/*
 * Helpers to load curriculum options from the backend.  These mirror
 * the logic found in mainpage/getformdata.jsx so that the register
 * wizard can share a consistent data source.  All functions return
 * simple arrays of names (strings) suitable for our Dropdown
 * component, which expects an array of primitive values.
 */

async function fetchStandardOptions(BACKEND) {
  // Fetch a list of standards from the backend.  The API returns
  // objects with `standard_id` and `title` fields.  We normalise
  // these into { value, label } pairs to match react-select usage.
  try {
    const res = await fetch(`${BACKEND}/standards`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    let arr = [];
    if (Array.isArray(data)) arr = data;
    else if (Array.isArray(data.standards)) arr = data.standards;
    return arr
      .map((s) => {
        const value = s.standard_id ?? s.value ?? s.id ?? s.label ?? s.title;
        const label = s.title ?? s.label ?? s.name ?? s.title;
        if (!value || !label) return null;
        return { value: String(value), label: String(label) };
      })
      .filter(Boolean);
  } catch (_) {
    return [];
  }
}

async function fetchSubjectOptions(BACKEND, standard) {
  // Fetch subjects for a given standard.  The API returns objects
  // with `subject_id` and `subject_name` fields.  We return an array
  // of { value, label } objects.
  try {
    const params = new URLSearchParams({ standard_id: standard });
    const res = await fetch(`${BACKEND}/standards/get_subjects?${params.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    let arr = [];
    if (Array.isArray(data)) arr = data;
    else if (Array.isArray(data.subjects)) arr = data.subjects;
    else if (Array.isArray(data.subject)) arr = data.subject;
    return arr
      .map((s) => {
        const value = s.subject_id ?? s.value ?? s.id ?? s.subject ?? s.subject_name;
        const label = s.subject_name ?? s.label ?? s.name ?? s.title ?? s.subject;
        if (!value || !label) return null;
        return { value: String(value), label: String(label) };
      })
      .filter(Boolean);
  } catch (_) {
    return [];
  }
}

async function fetchGradeOptions(BACKEND, standard, subject) {
  // Fetch grade options for a given standard and subject.  The API
  // returns objects with `grade_id` and `grade_name`.  We normalise
  // these into { value, label } pairs, prefixing the grade name with
  // "Grade " when available.
  try {
    const params = new URLSearchParams({
      standard_id: standard,
      subject_id: subject,
    });
    const res = await fetch(`${BACKEND}/standards/get_grades?${params.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    let arr = [];
    if (Array.isArray(data)) arr = data;
    else if (Array.isArray(data.grades)) arr = data.grades;
    else if (Array.isArray(data.grade)) arr = data.grade;
    // Normalise and sort grades.  Use the same ordering as the main
    // standards form: Pre‑K, K, then numeric grades in ascending order.
    return arr
      .map((g) => {
        const value = g.grade_id ?? g.value ?? g.id ?? g.grade ?? g.grade_name;
        const gn = g.grade_name ?? g.name ?? g.title ?? g.grade;
        if (!value || !gn) return null;
        // Determine a sort key: Pre‑K as 00, K as 00.5, others as two‑digit padded
        let sortKey;
        if (gn === "Pre-K" || gn === "Pre‑K") sortKey = "00";
        else if (gn === "K") sortKey = "00.5";
        else {
          // Attempt to pad numeric grades; fall back to original string
          const num = String(gn).replace(/[^0-9]/g, "");
          sortKey = num.padStart(2, "0");
        }
        const label = `Grade ${gn}`;
        return { value: String(value), label: String(label), sortKey };
      })
      .filter(Boolean)
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .map(({ value, label }) => ({ value, label }));
  } catch (_) {
    return [];
  }
}

/* ---------- Tiny SVG placeholders for role cards ---------- */
function StudentSVG() {
  return <svg></svg>;
}
function TeacherSVG() {
  return <svg></svg>;
}

/* ---------- React-Select Dropdown (unchanged) ---------- */
function Dropdown({
  label,
  placeholder,
  value,
  onChange,
  options,
  disabled,
  maxMenuHeightPx = 258,
}) {
  // Support both primitive options and objects with value/label fields.  If an
  // option already has these fields, use them directly; otherwise convert
  // the primitive into a {value,label} pair.
  const mapped = (options || []).map((opt) => {
    if (opt && typeof opt === "object" && "value" in opt && "label" in opt) {
      return { value: String(opt.value), label: String(opt.label) };
    }
    return { value: String(opt), label: String(opt) };
  });
  const selected = mapped.find((o) => o.value === value) ?? null;
  const customStyles = {
    control: (provided) => ({
      ...provided,
      borderColor: "#9333ea",
      borderRadius: "1.5rem",
      boxShadow: "none",
      minHeight: "2.75rem",
      height: "2.75rem",
      paddingLeft: "0.75rem",
      paddingRight: "0.75rem",
      "&:hover": {
        borderColor: "#6b21a8",
        cursor: "pointer",
      },
      display: "flex",
      alignItems: "center",
    }),
    option: (provided, state) => ({
      ...provided,
      color: state.isSelected ? "#6b21a8" : "#9333ea",
      backgroundColor: state.isSelected ? "#f3e8ff" : "#ffffff",
      "&:hover": {
        backgroundColor: "#f3e8ff",
        color: "#6b21a8",
        cursor: "pointer",
      },
    }),
    placeholder: (p) => ({ ...p, color: "#9333ea" }),
    singleValue: (p) => ({ ...p, color: "#6b21a8" }),
    indicatorSeparator: () => ({ display: "none" }),
    dropdownIndicator: (p) => ({
      ...p,
      color: "#9333ea",
      "&:hover": { color: "#6b21a8" },
    }),
    menuPortal: (base) => ({ ...base, zIndex: 999999 }),
    menu: (base) => ({ ...base, zIndex: 999999 }),
    menuList: (base) => ({
      ...base,
      maxHeight: maxMenuHeightPx,
      overflowY: "auto",
    }),
  };
  return (
    <div className="relative w-[484px] mx-auto">
      <label className="block mb-1 text-sm font-medium" style={{ color: "#9500DE" }}>
        {label}
      </label>
      <Select
        isDisabled={!!disabled}
        options={mapped}
        value={selected}
        onChange={(opt) => onChange(opt?.value ?? "")}
        placeholder={placeholder}
        styles={customStyles}
        menuPortalTarget={typeof window !== "undefined" ? document.body : null}
        maxMenuHeight={maxMenuHeightPx}
        classNamePrefix="rs"
      />
    </div>
  );
}

export default function RegisterWizard() {
  const router = useRouter();
  const sp = useSearchParams();
  const BACKEND = process.env.NEXT_PUBLIC_SERVER_URL;

  // Determine initial step and redirect target
  const initialStep = Number(sp.get("step")) || 1;
  const nextUrl = getSafeNext(sp.get("next") || sp.get("callbackUrl") || "/");

  // wizard step
  const [step, setStep] = useState(initialStep);

  // step 1 state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // step 2 + 3 state
  const [role, setRole] = useState("");
  const [standard, setStandard] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [standardOpts, setStandardOpts] = useState([]);
  const [subjectOpts, setSubjectOpts] = useState([]);
  const [gradeOpts, setGradeOpts] = useState([]);

  // Reset options whenever role changes
  useEffect(() => {
    if (!BACKEND || step < 3) return;
    // Load standards whenever we enter step 3 or the role changes
    (async () => {
      try {
        const opts = await fetchStandardOptions(BACKEND);
        setStandardOpts(opts);
      } catch {
        setStandardOpts([]);
      }
    })();
  }, [BACKEND, step, role]);

  // Load subjects whenever the standard changes (teacher only)
  useEffect(() => {
    if (!BACKEND || step < 3) return;
    if (role !== "teacher" || !standard) {
      setSubjectOpts([]);
      return;
    }
    (async () => {
      try {
        const opts = await fetchSubjectOptions(BACKEND, standard);
        setSubjectOpts(opts);
      } catch {
        setSubjectOpts([]);
      }
    })();
  }, [BACKEND, step, role, standard]);

  // Load grades whenever the subject changes (teacher only)
  useEffect(() => {
    if (!BACKEND || step < 3) return;
    if (role !== "teacher" || !standard || !subject) {
      setGradeOpts([]);
      return;
    }
    (async () => {
      try {
        const opts = await fetchGradeOptions(BACKEND, standard, subject);
        setGradeOpts(opts);
      } catch {
        setGradeOpts([]);
      }
    })();
  }, [BACKEND, step, role, standard, subject]);

  // Load persisted onboarding step and role from the profile (if available)
  useEffect(() => {
    (async () => {
      try {
        const p = await fetch("/api/profile", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null));
        if (p) {
          // If the user's profile is already complete, redirect
          if (p.profileComplete) {
            router.replace(nextUrl);
            return;
          }
          if (p.role) setRole(p.role);
          if (p.defaultStandard) setStandard(p.defaultStandard);
          if (p.defaultSubject) setSubject(p.defaultSubject);
          if (p.defaultGrade) setGrade(p.defaultGrade);
          if (p.onboardingStep && initialStep === 1) setStep(p.onboardingStep);
        }
      } catch {
        /* ignore */
      }
    })();
  }, []);

  async function saveProfilePatch(patch) {
    try {
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(patch),
      });
    } catch (e) {
      console.error("profile patch failed:", e);
    }
  }

  async function submitRegister(e) {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });
      let json = {};
      try {
        json = await res.json();
      } catch {}
      if (!res.ok || json?.ok === false) {
        throw new Error(json?.message || "Failed to register");
      }
      const si = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl: nextUrl,
      });
      if (si && si.ok) {
        await saveProfilePatch({ onboardingStep: 2 });
        setStep(2);
        setPassword("");
      } else if (si?.error) {
        setMsg("Registered, but sign-in failed. Please log in and continue setup.");
      } else {
        setMsg("Registered, but sign-in status is unknown. Try logging in.");
      }
    } catch (err) {
      setMsg(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function goFromRoleToDefaults() {
    if (!role) return;
    // Students do not choose a subject or grade, so clear these
    if (role === "student") {
      setSubject("");
      setGrade("");
    }
    await saveProfilePatch({ role, onboardingStep: 3 });
    setStep(3);
  }

  async function finish() {
    // Require a standard for all users
    if (!standard) return;
    // Teachers must also choose a subject and grade
    if (role === "teacher" && (!subject || !grade)) return;
    await saveProfilePatch({
      defaultGrade: role === "teacher" ? grade || null : null,
      defaultSubject: role === "teacher" ? subject || null : null,
      defaultStandard: standard || null,
      profileComplete: role === "teacher" ? !!(standard && subject && grade) : !!standard,
      onboardingStep: 3,
    });
    router.replace(nextUrl);
  }

  const pct = step === 1 ? 33 : step === 2 ? 66 : 100;
  const isTeacher = role === "teacher";

  return (
    <>
      <Header />
      <div
        className="bg-white min-h-[720px] flex justify-center items-start px-4 py-8"
        style={{ fontFamily: "Mulish, sans-serif" }}
      >
        <div className="w-full max-w-[680px] text-black">
          {/* Title */}
          <div className="mb-6">
            <h2 className="text-center text-3xl font-semibold text-[#9500DECC]">
              Let’s set up your Lessn account
            </h2>
          </div>
          {/* Slider / progress */}
          <div className="mb-6 w-[400px] max-w-full mx-auto">
            <div className="mb-2 flex justify-between text-xs text-[#7A7482]">
              <span>Step 1 of 3</span>
              <span>{step === 1 ? "Register" : step === 2 ? "Role" : "Defaults"}</span>
            </div>
            <div className="h-[6px] bg-[#EAE7EE] rounded-full relative">
              <div
                className="h-[6px] rounded-full absolute left-0 top-0 transition-all"
                style={{ width: `${pct}%`, backgroundColor: "#9500DE" }}
              />
            </div>
          </div>
          {step === 3 && !BACKEND && (
            <div className="max-w-[365px] mx-auto mb-4 rounded-md border border-amber-300 bg-amber-50 text-amber-800 p-3 text-sm">
              Unable to load default options because <code>NEXT_PUBLIC_SERVER_URL</code> is not set.
            </div>
          )}
          {/* Step 1: Register */}
          {step === 1 && (
            <form className="flex flex-col items-center gap-3" onSubmit={submitRegister} autoComplete="on">
              <h3 className="text-center text-xl mt-2 font-semibold">Sign up</h3>
              <p className="text-center text-sm text-[#7A7482] mb-1">
                Already have an account <span className="sr-only">(opens login)</span>?
                <a
                  href={`/login?next=${encodeURIComponent(`/register?step=2&next=${encodeURIComponent(nextUrl)}`)}`}
                  className="text-[#9500DE] hover:underline"
                >
                  {" "}Log in
                </a>
              </p>
              <div className="w-full max-w-[365px]">
                <label htmlFor="given-name" className="sr-only">First name</label>
                <input
                  id="given-name"
                  type="text"
                  name="given-name"
                  autoComplete="given-name"
                  placeholder="First name*"
                  className="w-[365px] h-[44px] flex flex-row items-center px-3 py-4 gap-[10px] border border-[#322F35]/50 rounded-lg box-border outline-none"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="w-full max-w-[365px]">
                <label htmlFor="family-name" className="sr-only">Last name</label>
                <input
                  id="family-name"
                  type="text"
                  name="family-name"
                  autoComplete="family-name"
                  placeholder="Last name*"
                  className="w-[365px] h-[44px] flex flex-row items-center px-3 py-4 gap-[10px] border border-[#322F35]/50 rounded-lg box-border outline-none"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
              <div className="w-full max-w-[365px]">
                <label htmlFor="email" className="sr-only">Email</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="Email address*"
                  className="w-[365px] h-[44px] flex flex-row items-center px-3 py-4 gap-[10px] border border-[#322F35]/50 rounded-lg box-border outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="w-full max-w-[365px] relative">
                <label htmlFor="new-password" className="sr-only">Password</label>
                <input
                  id="new-password"
                  type={showPwd ? "text" : "password"}
                  name="new-password"
                  autoComplete="new-password"
                  placeholder="Password* (min 6)"
                  className="w-[365px] h-[44px] flex flex-row items-center px-3 py-4 gap-[10px] border border-[#322F35]/50 rounded-lg box-border outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  aria-label="Toggle password visibility"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#7A7482] hover:text-[#322F35]"
                >
                  {showPwd ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 3l18 18" />
                      <path d="M10.58 10.58a2 2 0 102.83 2.83" />
                      <path d="M16.24 16.24A10.94 10.94 0 0112 18c-5 0-9-4-9-6a11 11 0 013.17-3.95" />
                      <path d="M9.88 5.09A10.94 10.94 0 0112 4c5 0 9 4 9 6a11 11 0 01-4.06 4.66" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="w-full max-w-[365px] -mt-1 text-[12px] leading-snug text-[#7A7482]">
                By signing up, you agree to our{" "}
                <a href="/terms" className="text-[#9500DE] hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" className="text-[#9500DE] hover:underline">
                  Privacy Policy
                </a>.
              </p>
              {msg && <p className="text-sm text-red-600 text-center w-full max-w-[365px]">{msg}</p>}
              <button
                className="w-full max-w-[365px] h-[57px] rounded-[40px] bg-[#9500DE] text-white text-[16px] font-semibold shadow-[0_1px_4px_rgba(0,0,0,0.25)] hover:opacity-90 transition disabled:opacity-60"
                disabled={loading}
                type="submit"
              >
                {loading ? "Registering..." : "Sign up"}
              </button>
              <div className="flex items-center w-full max-w-[365px] gap-3 text-[#7A7482]">
                <hr className="flex-1 border-[#D5CFDB]" />
                <span className="text-sm">or</span>
                <hr className="flex-1 border-[#D5CFDB]" />
              </div>
              <button
                type="button"
                disabled
                className="w-full max-w-[365px] h-[57px] rounded-[40px] border border-[#9500DE] text-[#322F35] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.05)] flex items-center justify-center gap-2 cursor-not-allowed"
                title="Coming soon"
              >
                <img src="/Google.svg" alt="Google" className="w-5 h-5" />
                <span className="text-[16px]">Sign up with Google</span>
              </button>
            </form>
          )}
          {/* Step 2: Role */}
          {step === 2 && (
            <section className="max-w-[720px] mx-auto" style={{ fontFamily: "Mulish, sans-serif" }}>
              <p className="ml-15 mt-20 mb-10 text-[#9500DE] text-base">Choose your role to shape your lesson</p>
              <div className="grid grid-cols-2 gap-36">
                {[
                  { key: "student", label: "Student", art: <StudentSVG /> },
                  { key: "teacher", label: "Teacher", art: <TeacherSVG /> },
                ].map((opt) => {
                  const selected = role === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => {
                        setRole(opt.key);
                        if (opt.key === "student") {
                          setSubject("");
                          setGrade("");
                        }
                      }}
                      className="flex flex-col items-center"
                    >
                      <div className="flex items-center justify-center w-full flex-1 p-5">
                        <div className="w-[170px] h-[130px] flex items-center justify-center">
                          {opt.art}
                        </div>
                      </div>
                      <div className=" mb-4 flex items-center justify-center gap-2">
                        <span
                          className={`inline-block w-3 h-3 rounded-full border border-[#9500DE] ${selected ? "bg-[#9500DE]" : ""}`}
                        />
                        <span className="font-medium text-[#9500DE] leading-none">
                          {opt.label}
                        </span>
                      </div>
                      {selected && <span className="sr-only">Selected</span>}
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-between mt-20 justify-end mr-17">
                <button
                  disabled={!role}
                  onClick={goFromRoleToDefaults}
                  className={`px-6 h-[44px] rounded-[40px] text-white font-semibold ${role ? "bg-[#9500DE]" : "bg-[#E0D6E8]"}`}
                >
                  Next
                </button>
              </div>
            </section>
          )}
          {/* Step 3: Defaults */}
          {step === 3 && (
            <section className="max-w-[720px] mx-auto" style={{ fontFamily: "Mulish, sans-serif" }}>
              <p className="ml-15 mt-8 mb-6 text-[#9500DE] text-base">
                You’re almost there!
              </p>
              <div className="grid grid-cols-2 gap-36">
                {[
                  { key: "student", label: "Student", art: <StudentSVG /> },
                  { key: "teacher", label: "Teacher", art: <TeacherSVG /> },
                ].map((opt) => {
                  const selected = role === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => {
                        setRole(opt.key);
                        if (opt.key === "student") {
                          setSubject("");
                          setGrade("");
                        }
                      }}
                      className="flex flex-col items-center"
                    >
                      <div className="flex items-center justify-center w-full flex-1 p-5">
                        <div className="w-[170px] h-[130px] flex items-center justify-center">
                          {opt.art}
                        </div>
                      </div>
                      <div className=" mb-4 flex items-center justify-center gap-2">
                        <span
                          className={`inline-block w-3 h-3 rounded-full border border-[#9500DE] ${selected ? "bg-[#9500DE]" : ""}`}
                        />
                        <span className="font-medium text-[#9500DE] leading-none">
                          {opt.label}
                        </span>
                      </div>
                      {selected && <span className="sr-only">Selected</span>}
                    </button>
                  );
                })}
              </div>
              {/* Dropdowns: Standard always shown; Subject and Grade only for teachers */}
              <div className="mt-8 space-y-4">
                {/* Standard */}
                <Dropdown
                  label="Standard"
                  placeholder="Choose…"
                  value={standard}
                  onChange={(v) => {
                    setStandard(v);
                    setSubject("");
                    setGrade("");
                  }}
                  options={standardOpts}
                  disabled={!BACKEND}
                />
                {/* Subject */}
                {role === "teacher" && standard && (
                  <Dropdown
                    label="Subject"
                    placeholder="Select…"
                    value={subject}
                    onChange={(v) => {
                      setSubject(v);
                      setGrade("");
                    }}
                    options={subjectOpts}
                    disabled={!standard}
                  />
                )}
                {/* Grade */}
                {role === "teacher" && standard && subject && (
                  <Dropdown
                    label="Grade"
                    placeholder="Select…"
                    value={grade}
                    onChange={(v) => setGrade(v)}
                    options={gradeOpts}
                    disabled={!subject}
                  />
                )}
              </div>
              <div className="flex justify-between mt-6 w-[484px] mx-auto">
                <button
                  onClick={() => setStep(2)}
                  className="px-5 h-[44px] rounded-[40px] border text-white"
                  style={{ borderColor: "#9500DE", backgroundColor: "white", color: "#9500DE" }}
                >
                  Back
                </button>
                <button
                  disabled={role === "teacher" ? !grade || !subject || !standard : !standard}
                  onClick={finish}
                  className="px-6 h-[44px] rounded-[40px] text-white font-semibold disabled:opacity-60"
                  style={{ backgroundColor: role === "teacher" ? (!grade || !subject || !standard ? "#E0D6E8" : "#9500DE") : (!standard ? "#E0D6E8" : "#9500DE") }}
                >
                  Finish
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}