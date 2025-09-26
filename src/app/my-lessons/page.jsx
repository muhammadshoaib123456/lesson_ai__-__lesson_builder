"use client";

import { useEffect, useState } from "react";
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

  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const nextParam = encodeURIComponent("/my-lessons");

  // ---- Soft gate (inline) ----
  const [checkingGate, setCheckingGate] = useState(true);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      // Only check gate when logged in; logged-out users see login CTA
      if (status !== "authenticated") { setCheckingGate(false); setBlocked(false); return; }
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
    return () => { mounted = false; };
  }, [status, pathname]);

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

  // Not signed in → standard login/register view
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
              <Link className="rounded-full border border-[#9500DE] text-[#9500DE] px-4 py-2" href={`/register?next=${nextParam}`}>
                Register
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Soft gate modal if logged in but profile incomplete */}
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
                onClick={() => router.push(`/register?next=${encodeURIComponent(pathname + (sp?.toString() ? `?${sp.toString()}` : ""))}`)}
                className="px-5 py-2 rounded-full bg-purple-600 text-white hover:bg-purple-700"
              >
                Continue onboarding
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1">
        <div className={`max-w-6xl mx-auto px-6 py-10 ${blocked ? "pointer-events-none select-none opacity-60" : ""}`}>
          <h1 className="text-2xl font-bold text-slate-800 mb-6">My Lessons</h1>
          {loading ? (
            <div className="text-slate-600">Loading your saved presentations…</div>
          ) : items.length === 0 ? (
            <div className="text-slate-600">
              You haven’t saved any presentations yet. Browse the{" "}
              <Link href="/explore-library" className="underline text-[#9500DE]">library</Link> to get started!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((p) => (
                <PresentationCard
                  key={p.id || p.slug}
                  p={{ ...p, is_saved: true }}
                  cardHeight={420}
                  initiallySaved={true}
                  onSavedChange={(pres, isSaved) => {
                    if (!isSaved) {
                      setItems(prev => prev.filter(x => (x.id ?? x.slug) !== (pres.id ?? pres.slug)));
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
