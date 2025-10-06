"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import PresentationCard from "@/components/PresentationCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function MyLessonsPage() {
  const { status } = useSession();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [activeTab, setActiveTab] = useState("saved");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const nextParam = encodeURIComponent("/my-lessons");

  const [checkingGate, setCheckingGate] = useState(true);
  const [blocked, setBlocked] = useState(false);

  // ---------- AUTH & PROFILE CHECK ----------
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (status !== "authenticated") {
        setCheckingGate(false);
        setBlocked(false);
        return;
      }
      try {
        const res = await fetch("/api/profile", { cache: "no-store" });
        const p = res.ok ? await res.json() : null;
        if (mounted) setBlocked(!p?.profileComplete);
      } catch {
        if (mounted) setBlocked(false);
      } finally {
        if (mounted) setCheckingGate(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [status, pathname]);

  // ---------- FETCH SAVED LESSONS ----------
  useEffect(() => {
    if (status !== "authenticated") {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/my-lessons", { method: "GET", cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        setItems(Array.isArray(data?.items) ? data.items : []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [status]);

  const savedCount = items.length;

  // ---------- FILTER LOGIC ----------
  const filteredItems = useMemo(() => {
    if (activeTab === "created") return [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;

    const tokens = q.split(/\s+/).filter(Boolean);
    const norm = (v) =>
      (String(v ?? "")
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, " ") || "");

    return items.filter((p) => {
      const hay = [
        p.title,
        p.name,
        p.subject,
        Array.isArray(p.tags) ? p.tags.join(" ") : p.tags,
        Array.isArray(p.grades) ? p.grades.join(" ") : p.grade,
        p.description,
      ]
        .map(norm)
        .join(" ");
      return tokens.every((t) => hay.includes(t));
    });
  }, [items, searchQuery, activeTab]);

  // ---------- AUTH GATE ----------
  if (status !== "authenticated") {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="max-w-3xl mx-auto px-6 py-12">
            <h1 className="text-2xl font-bold text-slate-800 mb-4">My Lessons</h1>
            <p className="text-slate-600 mb-6">
              Please log in to use this feature. Once you are logged in, any saved presentations will appear here.
            </p>
            <div className="flex gap-3">
              <Link className="rounded-full bg-[#9500DE] text-white px-4 py-2" href={`/login?next=${nextParam}`}>
                Login
              </Link>
              <Link
                className="rounded-full border border-[#9500DE] text-[#9500DE] px-4 py-2"
                href={`/register?next=${nextParam}`}
              >
                Register
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ---------- MAIN ----------
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Profile blocker */}
      {!checkingGate && blocked && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative z-[101] bg-white text-black w-[92%] max-w-md rounded-2xl shadow-xl border p-6">
            <h3 className="text-xl font-semibold mb-2">Complete your profile</h3>
            <p className="text-gray-700 mb-4">
              Please complete your profile first to access <span className="font-medium">My Lessons</span>.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 rounded-full border border-gray-300 text-gray-700"
              >
                Go back
              </button>
              <button
                onClick={() =>
                  router.push(
                    `/register?next=${encodeURIComponent(
                      pathname + (sp?.toString() ? `?${sp.toString()}` : "")
                    )}`
                  )
                }
                className="px-5 py-2 rounded-full bg-[#9500DE] text-white hover:opacity-90"
              >
                Continue onboarding
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- MAIN CONTENT ---------- */}
      <main className="flex-1">
        <div
          className={`max-w-6xl mx-auto px-6 py-10 ${
            blocked ? "pointer-events-none select-none opacity-60" : ""
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
            <h1 className="text-2xl font-bold text-slate-800">My Lessons</h1>

            {/* Search + toggle */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div
                className="flex items-center gap-2 px-6"
                style={{
                  width: 265,
                  height: 35,
                  borderColor: "#9500DE",
                  borderRadius: 30,
                  borderStyle: "solid",
                  borderWidth: 0.5,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" stroke="#9500DE" strokeWidth="2" />
                  <path d="M20 20L17 17" stroke="#9500DE" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search…"
                  className="w-full h-full outline-none text-sm placeholder-[#9500DE]/70 text-slate-700"
                />
              </div>

              {/* View toggle */}
              <div className="flex">
                <button
                  type="button"
                  aria-label="Grid view"
                  onClick={() => setViewMode("grid")}
                  className={`w-[57px] h-[35px] rounded-l-[6px] flex items-center justify-center transition ${
                    viewMode === "grid"
                      ? "bg-[#9500DE] text-white"
                      : "bg-[rgba(149,0,222,0.10)] text-[#9500DE]"
                  }`}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="3" y="3" width="7" height="7" rx="1"></rect>
                    <rect x="14" y="3" width="7" height="7" rx="1"></rect>
                    <rect x="3" y="14" width="7" height="7" rx="1"></rect>
                    <rect x="14" y="14" width="7" height="7" rx="1"></rect>
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="List view"
                  onClick={() => setViewMode("list")}
                  className={`w-[57px] h-[35px] rounded-r-[6px] flex items-center justify-center transition ${
                    viewMode === "list"
                      ? "bg-[#9500DE] text-white"
                      : "bg-[rgba(149,0,222,0.10)] text-[#9500DE]"
                  }`}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="5" cy="6" r="2"></circle>
                    <rect x="10" y="5" width="10" height="2" rx="1"></rect>
                    <circle cx="5" cy="12" r="2"></circle>
                    <rect x="10" y="11" width="10" height="2" rx="1"></rect>
                    <circle cx="5" cy="18" r="2"></circle>
                    <rect x="10" y="17" width="10" height="2" rx="1"></rect>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setActiveTab("created")}
              className={`px-4 py-2 rounded-full border transition ${
                activeTab === "created"
                  ? "bg-[#9500DE] text-white border-[#9500DE]"
                  : "text-[#9500DE] border-[#9500DE]"
              }`}
            >
              Created
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`px-4 py-2 rounded-full border transition ${
                activeTab === "saved"
                  ? "bg-[#9500DE] text-white border-[#9500DE]"
                  : "text-[#9500DE] border-[#9500DE]"
              }`}
            >
              Saved ({String(savedCount).padStart(2, "0")})
            </button>
          </div>

          {/* Cards */}
          {loading ? (
            <div className="text-slate-600">Loading your saved presentations…</div>
          ) : activeTab === "created" ? (
            <div className="text-slate-600">You haven’t created any presentations yet.</div>
          ) : filteredItems.length === 0 ? (
            <div className="text-slate-600">
              No matches found. Try a different keyword, or browse the{" "}
              <Link href="/explore-library" className="underline text-[#9500DE]">
                library
              </Link>.
            </div>
          ) : viewMode === "grid" ? (
            // ✅ GRID VIEW — same size as saved cards
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((p) => (
                <div key={p.id || p.slug} className="w-full max-w-[370px] mx-auto">
                  <PresentationCard
                    p={{ ...p, is_saved: true }}
                    initiallySaved={true}
                    cardHeight={370}
                    cardWidth={370}
                    onSavedChange={(pres, isSaved) => {
                      if (!isSaved) {
                        setItems((prev) =>
                          prev.filter((x) => (x.id ?? x.slug) !== (pres.id ?? pres.slug))
                        );
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            // ✅ LIST VIEW — same size as saved cards for consistency
            <div className="flex flex-col gap-5">
              {filteredItems.map((p) => (
                <div key={p.id || p.slug} className="w-full max-w-[370px] justify-start">
                  <PresentationCard
                    p={{ ...p, is_saved: true }}
                    initiallySaved={true}
                    cardHeight={370}
                    cardWidth={370}
                    onSavedChange={(pres, isSaved) => {
                      if (!isSaved) {
                        setItems((prev) =>
                          prev.filter((x) => (x.id ?? x.slug) !== (pres.id ?? pres.slug))
                        );
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
