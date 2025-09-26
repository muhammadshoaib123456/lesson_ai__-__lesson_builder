"use client";

import React, { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

/* ---------- helpers (unchanged behavior, sturdier impls) ---------- */
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

async function fetchJSONWithTimeout(
  url,
  { timeoutMs = 8000, headers, signal, ...init } = {},
  retry = true
) {
  // If a caller passes a signal, use it; otherwise, create our own that will time out.
  const useController = !signal;
  const controller = useController ? new AbortController() : null;
  const timer = useController ? setTimeout(() => controller.abort(), timeoutMs) : null;

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

async function fetchSubjectsForGrade(BE, grade) {
  // Try typical encoded param first
  const enc = encodeURIComponent(grade);
  const r1 = await fetchJSONWithTimeout(`${BE}/get_subject?grade=${enc}`).catch(() => null);
  if (r1 && !r1._nonJSON) return r1;

  // Some backends expect quoted, unencoded value (e.g., grade="High school")
  const r2 = await fetchJSONWithTimeout(`${BE}/get_subject?grade="${grade}"`).catch(() => null);
  if (r2 && !r2._nonJSON) return r2;

  // Final attempt: plain (unquoted) value
  return fetchJSONWithTimeout(`${BE}/get_subject?grade=${grade}`).catch(() => ({ _nonJSON: "fallback" }));
}

async function fetchStandardsFor(BACKEND, role, grade) {
  try {
    const params = new URLSearchParams();
    if (role) params.set("role", role);
    if (grade) params.set("grade", grade);
    const url = `${BACKEND}/get_standard?${params.toString()}`;
    const res = await fetchJSONWithTimeout(url, { timeoutMs: 8000 });
    if (!res?._nonJSON) {
      let arr = [];
      if (Array.isArray(res)) arr = res;
      else if (Array.isArray(res?.standards)) arr = res.standards;
      return arr.filter(Boolean);
    }
  } catch (_) {}
  const base = ["Common Core", "Texas (TEKS)", "NGSS", "Alaska"];
  const studentOnly = ["Common Core", "NGSS"];
  const list = String(role).toLowerCase() === "student" ? studentOnly : base;
  const withVariant = String(grade).toLowerCase().includes("high") ? [...list, "AP College Board"] : list;
  return withVariant;
}

export default function RegisterWizard() {
  const router = useRouter();
  const sp = useSearchParams();
  const BACKEND = process.env.NEXT_PUBLIC_SERVER_URL;

  const initialStep = Number(sp.get("step")) || 1;
  const nextUrl = getSafeNext(sp.get("next") || sp.get("callbackUrl") || "/");

  // wizard state
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
  const [role, setRole] = useState(""); // student | teacher
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [standard, setStandard] = useState("");

  // options
  const gradeOrder = useMemo(
    () => [
      "Pre-K",
      "Kindergarten",
      "First Grade",
      "Second Grade",
      "Third Grade",
      "Fourth Grade",
      "Fifth Grade",
      "Sixth Grade",
      "Seventh Grade",
      "Eighth Grade",
      "High school",
    ],
    []
  );
  const [gradeOpts, setGradeOpts] = useState([]);
  const [subjectOpts, setSubjectOpts] = useState([]);
  const [standardOpts, setStandardOpts] = useState([]);

  // If a signed-in user opens /register, try to resume from their profile
  useEffect(() => {
    (async () => {
      try {
        const p = await fetch("/api/profile", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null));
        if (p) {
          if (p.profileComplete) {
            router.replace(nextUrl);
            return;
          }
          if (p.role) setRole(p.role);
          if (p.defaultGrade) setGrade(p.defaultGrade);
          if (p.defaultSubject) setSubject(p.defaultSubject);
          if (p.defaultStandard) setStandard(p.defaultStandard);
          if (p.onboardingStep && initialStep === 1) setStep(p.onboardingStep);
        }
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // load Grades
  useEffect(() => {
    (async () => {
      if (!BACKEND || step < 3) return;
      const data = await fetchJSONWithTimeout(`${BACKEND}/get_grades`).catch(() => null);
      let arr = [];
      if (data && !data._nonJSON) {
        if (Array.isArray(data)) arr = data;
        else if (Array.isArray(data.grade)) arr = data.grade;
        else if (Array.isArray(data.grades)) arr = data.grades;
      }
      const normalized = arr
        .map((g) => (typeof g === "string" ? g : g?.grade ?? g?.name ?? g?.title))
        .filter(Boolean);
      const ordered = normalized.sort((a, b) => {
        const ia = gradeOrder.indexOf(a);
        const ib = gradeOrder.indexOf(b);
        return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
      });
      setGradeOpts(ordered);
    })();
  }, [BACKEND, gradeOrder, step]);

  // load Subjects (teacher only)
  useEffect(() => {
    (async () => {
      if (!BACKEND || step < 3) return;
      if (role !== "teacher" || !grade) {
        setSubjectOpts([]);
        return;
      }
      const data = await fetchSubjectsForGrade(BACKEND, grade).catch(() => null);
      let arr = [];
      if (data && !data._nonJSON) {
        if (Array.isArray(data)) arr = data;
        else if (Array.isArray(data.subjects)) arr = data.subjects;
        else if (Array.isArray(data.subject)) arr = data.subject;
        else if (Array.isArray(data.topics)) arr = data.topics;
      }
      const normalized = arr.map((s) => (typeof s === "string" ? s : s?.subject ?? s?.name ?? s?.title)).filter(Boolean);
      setSubjectOpts(normalized);
    })();
  }, [BACKEND, step, role, grade]);

  // load Standards
  useEffect(() => {
    (async () => {
      if (step < 3 || !role) {
        setStandardOpts([]);
        return;
      }
      const list = await fetchStandardsFor(BACKEND, role, grade);
      setStandardOpts(Array.isArray(list) ? list : []);
    })();
  }, [BACKEND, step, role, grade]);

  /* ---------- API helpers ---------- */
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

  /* ---------- Step 1: Register ---------- */
  async function submitRegister(e) {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }), // send lastName too
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
        setPassword(""); // reduce exposure in-memory
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

  /* ---------- Step 2: Role ---------- */
  async function goFromRoleToDefaults() {
    if (!role) return;
    if (role === "student") setSubject("");
    await saveProfilePatch({ role, onboardingStep: 3 });
    setStep(3);
  }

  /* ---------- Step 3: Defaults ---------- */
  async function finish() {
    if (!grade) return;
    if (role === "teacher" && !subject) return;

    await saveProfilePatch({
      defaultGrade: grade || null,
      defaultSubject: role === "teacher" ? subject || null : null,
      defaultStandard: standard || null,
      profileComplete: true,
      onboardingStep: 3,
    });

    router.replace(nextUrl);
  }

  // progress: 3 steps slider
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

          {/* If BACKEND is missing and user is at step 3, tell them */}
          {step === 3 && !BACKEND && (
            <div className="max-w-[365px] mx-auto mb-4 rounded-md border border-amber-300 bg-amber-50 text-amber-800 p-3 text-sm">
              Unable to load default options because <code>NEXT_PUBLIC_SERVER_URL</code> is not set.
            </div>
          )}

          {/* Step 1: Register */}
          {step === 1 && (
            <form className="flex flex-col items-center gap-3" onSubmit={submitRegister} autoComplete="on">
              {/* Subheading + login link */}
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

              {/* Fields */}
              <div className="w-full max-w-[365px]">
                <label htmlFor="given-name" className="sr-only">First name</label>
                <input
                  id="given-name"
                  type="text"
                  name="given-name"
                  autoComplete="given-name"
                  placeholder="First name*"
                  className="w-full h-[44px] px-3 rounded-[8px] border border-[rgba(50,47,53,0.5)] bg-white text-[15px] placeholder-[#7A7482] focus:outline-none"
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
                  className="w-full h-[44px] px-3 rounded-[8px] border border-[rgba(50,47,53,0.5)] bg-white text-[15px] placeholder-[#7A7482] focus:outline-none"
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
                  className="w-full h-[44px] px-3 rounded-[8px] border border-[rgba(50,47,53,0.5)] bg-white text-[15px] placeholder-[#7A7482] focus:outline-none"
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
                  className="w-full h-[44px] pr-10 pl-3 rounded-[8px] border border-[rgba(50,47,53,0.5)] bg-white text-[15px] placeholder-[#7A7482] focus:outline-none"
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

              {/* Terms */}
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

              {/* Primary CTA */}
              <button
                className="w-full max-w-[365px] h-[57px] rounded-[40px] bg-[#9500DE] text-white text-[16px] font-semibold shadow-[0_1px_4px_rgba(0,0,0,0.25)] hover:opacity-90 transition disabled:opacity-60"
                disabled={loading}
                type="submit"
              >
                {loading ? "Registering..." : "Sign up"}
              </button>

              {/* Divider */}
              <div className="flex items-center w-full max-w-[365px] gap-3 text-[#7A7482]">
                <hr className="flex-1 border-[#D5CFDB]" />
                <span className="text-sm">or</span>
                <hr className="flex-1 border-[#D5CFDB]" />
              </div>

              {/* Google button */}
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
            <section className="max-w-[365px] mx-auto" style={{ fontFamily: "Mulish, sans-serif" }}>
              <p className="mb-5 text-center text-[#322F35]">Choose your role</p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { key: "student", label: "Student" },
                  { key: "teacher", label: "Teacher" },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      setRole(opt.key);
                      if (opt.key === "student") setSubject("");
                    }}
                    className={`rounded-[12px] p-4 text-left border transition ${
                      role === opt.key
                        ? "border-[#9500DE] ring-2 ring-[#E9CCF7]"
                        : "border-[rgba(50,47,53,0.3)] hover:border-[#9500DE]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block w-3 h-3 rounded-full border ${
                          role === opt.key ? "bg-[#9500DE] border-[#9500DE]" : "border-[#7A7482]"
                        }`}
                      />
                      <span className="font-medium">{opt.label}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-5 h-[44px] rounded-[40px] border border-[#9500DE] text-[#9500DE]"
                >
                  Back
                </button>
                <button
                  disabled={!role}
                  onClick={goFromRoleToDefaults}
                  className={`px-6 h-[44px] rounded-[40px] text-white font-semibold ${
                    role ? "bg-[#9500DE]" : "bg-[#E0D6E8]"
                  }`}
                >
                  Next
                </button>
              </div>
            </section>
          )}

          {/* Step 3: Defaults */}
          {step === 3 && (
            <section className="max-w=[365px] mx-auto" style={{ fontFamily: "Mulish, sans-serif" }}>
              <p className="mb-5 text-center text-[#322F35]">
                {isTeacher ? "Set your defaults (Grade, Subject, Standard)" : "Set your defaults (Grade, Standard)"}
              </p>

              <div className="space-y-4">
                {/* Grade */}
                <div>
                  <label className="block mb-1 text-sm text-[#7A7482]">Grade</label>
                  <select
                    value={grade}
                    onChange={(e) => {
                      setGrade(e.target.value);
                      setSubject("");
                    }}
                    className="w-full h-[44px] px-3 rounded-[8px] border border-[rgba(50,47,53,0.5)] bg-white"
                  >
                    <option value="">Select…</option>
                    {gradeOpts.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject (Teacher only) */}
                {isTeacher && (
                  <div>
                    <label className="block mb-1 text-sm text-[#7A7482]">Subject</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      disabled={!grade}
                      className="w-full h-[44px] px-3 rounded-[8px] border border-[rgba(50,47,53,0.5)] bg-white disabled:bg-[#F4F1F7]"
                    >
                      <option value="">Select…</option>
                      {subjectOpts.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Standard */}
                <div>
                  <label className="block mb-1 text-sm text-[#7A7482]">Standard</label>
                  <select
                    value={standard}
                    onChange={(e) => setStandard(e.target.value)}
                    className="w-full h-[44px] px-3 rounded-[8px] border border-[rgba(50,47,53,0.5)] bg-white"
                  >
                    <option value="">(Optional) Choose…</option>
                    {standardOpts.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setStep(2)}
                  className="px-5 h-[44px] rounded-[40px] border border-[#9500DE] text-[#9500DE]"
                >
                  Back
                </button>
                <button
                  disabled={!grade || (isTeacher && !subject)}
                  onClick={finish}
                  className={`px-6 h-[44px] rounded-[40px] text-white font-semibold ${
                    !grade || (isTeacher && !subject) ? "bg-[#E0D6E8]" : "bg-[#9500DE]"
                  }`}
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
