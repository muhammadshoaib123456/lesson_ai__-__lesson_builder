"use client";

import { useEffect, useState } from "react";
import Select from "react-select";

/* ---------- React-Select Dropdown ---------- */
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

/*
 * ProfileEditor
 *
 * Allows users to view and update their personal details and
 * curriculum defaults.  Students may choose only a curriculum
 * standard, while teachers pick a standard, an associated subject
 * and a grade.  Dropdown options are loaded from the backend using
 * the same endpoints as the registration wizard.  When saved, the
 * updated defaults are persisted to the user's profile via the
 * /api/profile endpoint.
 */

// Helpers to load options from the backend.  These mirror the logic
// from the registration wizard to ensure consistent behaviour.
async function fetchStandardOptions(BACKEND) {
  try {
    const res = await fetch(`${BACKEND}/standards`, { cache: "no-store" });
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
  try {
    const params = new URLSearchParams({ standard_id: standard });
    const res = await fetch(`${BACKEND}/standards/get_subjects?${params.toString()}`, { cache: "no-store" });
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
  try {
    const params = new URLSearchParams({ standard_id: standard, subject_id: subject });
    const res = await fetch(`${BACKEND}/standards/get_grades?${params.toString()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    let arr = [];
    if (Array.isArray(data)) arr = data;
    else if (Array.isArray(data.grades)) arr = data.grades;
    else if (Array.isArray(data.grade)) arr = data.grade;
    return arr
      .map((g) => {
        const value = g.grade_id ?? g.value ?? g.id ?? g.grade ?? g.grade_name;
        const gn = g.grade_name ?? g.name ?? g.title ?? g.grade;
        if (!value || !gn) return null;
        let sortKey;
        if (gn === "Pre-K" || gn === "Pre‑K") sortKey = "00";
        else if (gn === "K") sortKey = "00.5";
        else {
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

export default function ProfileEditor() {
  const BACKEND = process.env.NEXT_PUBLIC_SERVER_URL;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  // User details
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [standard, setStandard] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");

  // Dropdown options
  const [standardOpts, setStandardOpts] = useState([]);
  const [subjectOpts, setSubjectOpts] = useState([]);
  const [gradeOpts, setGradeOpts] = useState([]);

  // Load profile and initial dropdown data
  useEffect(() => {
    (async () => {
      try {
        const p = await fetch("/api/profile", { cache: "no-store" }).then((r) => (r.ok ? r.json() : {}));
        setName(p?.name || "");
        setRole(p?.role || "");
        setStandard(p?.defaultStandard || "");
        setSubject(p?.defaultSubject || "");
        setGrade(p?.defaultGrade || "");
        if (BACKEND) {
          const opts = await fetchStandardOptions(BACKEND);
          setStandardOpts(opts);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [BACKEND]);

  // Load subjects when standard or role changes (teacher only)
  useEffect(() => {
    (async () => {
      if (!BACKEND) {
        setSubjectOpts([]);
        return;
      }
      if (role !== "teacher" || !standard) {
        setSubjectOpts([]);
        return;
      }
      const opts = await fetchSubjectOptions(BACKEND, standard);
      setSubjectOpts(opts);
    })();
  }, [BACKEND, role, standard]);

  // Load grades when subject changes (teacher only)
  useEffect(() => {
    (async () => {
      if (!BACKEND) {
        setGradeOpts([]);
        return;
      }
      if (role !== "teacher" || !standard || !subject) {
        setGradeOpts([]);
        return;
      }
      const opts = await fetchGradeOptions(BACKEND, standard, subject);
      setGradeOpts(opts);
    })();
  }, [BACKEND, role, standard, subject]);

  async function save() {
    setSaving(true);
    setMsg("");
    try {
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          role,
          defaultStandard: standard || null,
          defaultSubject: role === "teacher" ? subject || null : null,
          defaultGrade: role === "teacher" ? grade || null : null,
          profileComplete: role === "teacher" ? !!(standard && subject && grade) : !!standard,
        }),
      });
      setMsg("Saved!");
    } catch {
      setMsg("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="bg-white rounded-xl border p-6">Loading…</div>;

  return (
    <div className="bg-white rounded-xl border p-6 space-y-5">
      {/* Name */}
      <div>
        <div className="text-gray-600 mb-1">Name</div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-gray-50 border"
        />
      </div>
      {/* Role */}
      <div>
        <div className="text-gray-600 mb-1">Role</div>
        <div className="flex gap-3">
          {["student", "teacher"].map((r) => (
            <label
              key={r}
              className={`px-4 py-2 rounded-full border cursor-pointer ${role === r ? "border-purple-600" : "border-gray-300"}`}
            >
              <input
                type="radio"
                name="role"
                value={r}
                className="mr-2"
                checked={role === r}
                onChange={() => {
                  setRole(r);
                  if (r === "student") {
                    setSubject("");
                    setGrade("");
                  }
                }}
              />
              {r[0].toUpperCase() + r.slice(1)}
            </label>
          ))}
        </div>
      </div>
      {/* Standard dropdown */}
      <Dropdown
        label="Standard"
        placeholder="Select…"
        value={standard}
        onChange={(v) => {
          setStandard(v);
          setSubject("");
          setGrade("");
        }}
        options={standardOpts}
        disabled={!BACKEND}
      />
      {/* Subject dropdown for teacher */}
      {role === "teacher" && (
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
      {/* Grade dropdown for teacher */}
      {role === "teacher" && (
        <Dropdown
          label="Grade"
          placeholder="Select…"
          value={grade}
          onChange={(v) => setGrade(v)}
          options={gradeOpts}
          disabled={!subject}
        />
      )}
      {/* Save button and message */}
      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-full bg-purple-600 text-white px-6 py-2 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        {msg && <span className="text-sm text-gray-700">{msg}</span>}
      </div>
    </div>
  );
}