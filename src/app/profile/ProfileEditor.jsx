"use client";

import { useEffect, useMemo, useState } from "react";

async function fetchJSONWithTimeout(url, { timeoutMs = 8000, headers, signal, ...init } = {}, retry = true) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { cache: "no-store", headers: headers ?? { Accept: "application/json" }, signal: signal ?? controller.signal, ...init });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const ct = (res.headers.get("content-type") || "").toLowerCase();
    return ct.includes("application/json") ? res.json() : { _nonJSON: await res.text() };
  } catch (e) {
    clearTimeout(timer);
    if (retry) return fetchJSONWithTimeout(url, { timeoutMs, headers, signal, ...init }, false);
    throw e;
  }
}
async function fetchSubjectsForGrade(BE, grade) {
  const enc = encodeURIComponent(grade);
  const r1 = await fetchJSONWithTimeout(`${BE}/get_subject?grade=${enc}`);
  if (!r1?._nonJSON) return r1;
  return fetchJSONWithTimeout(`${BE}/get_subject?grade="${enc}"`);
}

export default function ProfileEditor() {
  const BACKEND = process.env.NEXT_PUBLIC_SERVER_URL;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [standard, setStandard] = useState("");

  const gradeOrder = useMemo(() => [
    "Pre-K","Kindergarten","First Grade","Second Grade","Third Grade","Fourth Grade",
    "Fifth Grade","Sixth Grade","Seventh Grade","Eighth Grade","High school"
  ], []);

  const [gradeOpts, setGradeOpts] = useState([]);
  const [subjectOpts, setSubjectOpts] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const p = await fetch("/api/profile", { cache: "no-store" }).then(r => r.ok ? r.json() : {});
        setName(p?.name || "");
        setRole(p?.role || "");
        setGrade(p?.defaultGrade || "");
        setSubject(p?.defaultSubject || "");
        setStandard(p?.defaultStandard || "");

        if (BACKEND) {
          const data = await fetchJSONWithTimeout(`${BACKEND}/get_grades`).catch(()=>null);
          let arr = [];
          if (data && !data._nonJSON) {
            if (Array.isArray(data)) arr = data;
            else if (Array.isArray(data.grade)) arr = data.grade;
            else if (Array.isArray(data.grades)) arr = data.grades;
          }
          const normalized = arr.map(g => typeof g === "string" ? g : g?.grade).filter(Boolean);
          const ordered = normalized.sort((a,b)=> {
            const ia = gradeOrder.indexOf(a), ib = gradeOrder.indexOf(b);
            return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
          });
          setGradeOpts(ordered);
        }
      } finally { setLoading(false); }
    })();
  }, [BACKEND, gradeOrder]);

  useEffect(() => {
    (async () => {
      if (!BACKEND || !grade) { setSubjectOpts([]); return; }
      const data = await fetchSubjectsForGrade(BACKEND, grade).catch(()=>null);
      let arr = [];
      if (data && !data._nonJSON) {
        if (Array.isArray(data)) arr = data;
        else if (Array.isArray(data.subjects)) arr = data.subjects;
        else if (Array.isArray(data.subject)) arr = data.subject;
        else if (Array.isArray(data.topics)) arr = data.topics;
      }
      const normalized = arr.map(s => typeof s==="string"? s : s?.subject).filter(Boolean);
      setSubjectOpts(normalized);
    })();
  }, [BACKEND, grade]);

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
          defaultGrade: grade || null,
          defaultSubject: subject || null,
          defaultStandard: standard || null,
          profileComplete: !!(role && grade && subject),
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
      <div>
        <div className="text-gray-600 mb-1">Name</div>
        <input value={name} onChange={e=>setName(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-gray-50 border" />
      </div>

      <div>
        <div className="text-gray-600 mb-1">Role</div>
        <div className="flex gap-3">
          {["student", "teacher"].map(r => (
            <label key={r} className={`px-4 py-2 rounded-full border cursor-pointer ${role===r ? "border-purple-600" : "border-gray-300"}`}>
              <input type="radio" name="role" value={r} className="mr-2" checked={role===r} onChange={()=>setRole(r)} />
              {r[0].toUpperCase()+r.slice(1)}
            </label>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <div className="text-gray-600 mb-1">Grade</div>
          <select value={grade} onChange={e=>{setGrade(e.target.value); setSubject("");}} className="w-full px-3 py-2 rounded-lg bg-gray-50 border">
            <option value="">Select…</option>
            {gradeOpts.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <div className="text-gray-600 mb-1">Subject</div>
          <select value={subject} onChange={e=>setSubject(e.target.value)} disabled={!grade} className="w-full px-3 py-2 rounded-lg bg-gray-50 border disabled:bg-gray-100">
            <option value="">Select…</option>
            {subjectOpts.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <div className="text-gray-600 mb-1">Standard</div>
          <select value={standard} onChange={e=>setStandard(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-gray-50 border">
            <option value="">(Optional)</option>
            {["Alaska","Common Core","Texas","NGSS"].map(st => <option key={st} value={st}>{st}</option>)}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={saving} className="rounded-full bg-purple-600 text-white px-6 py-2 disabled:opacity-60">
          {saving ? "Saving…" : "Save changes"}
        </button>
        {msg && <span className="text-sm text-gray-700">{msg}</span>}
      </div>
    </div>
  );
}
