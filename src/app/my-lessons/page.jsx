// app/my-lessons/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import PresentationCard from "@/components/PresentationCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function MyLessonsPage() {
  const { status } = useSession();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const nextParam = encodeURIComponent("/my-lessons");

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

  // Remove instantly on unsave
  const handleSavedChange = (pres, isSaved) => {
    if (!isSaved) {
      setItems(prev => prev.filter(x => (x.id ?? x.slug) !== (pres.id ?? pres.slug)));
    }
  };

  // Not signed in → prompt (with sticky footer too)
  if (status !== "authenticated") {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="max-w-3xl mx-auto px-6 py-12">
            <h1 className="text-2xl font-bold text-slate-800 mb-4">My Lessons</h1>
            <p className="text-slate-600 mb-6">
              Please log in to use this feature.Once you are logged in, any saved presentations will appear here.
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
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-6 py-10">
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
                  onSavedChange={handleSavedChange}
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
