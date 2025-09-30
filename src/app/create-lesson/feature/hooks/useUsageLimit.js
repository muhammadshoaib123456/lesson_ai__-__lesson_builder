"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";

export function useUsageLimit() {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const aliveRef = useRef(true);

  useEffect(() => () => { aliveRef.current = false; }, []);

  const safeSet = (setter) => { if (aliveRef.current) setter(); };

  const checkUsage = async () => {
    try {
      const res = await fetch("/api/lesson-builder/usage", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      safeSet(() => setUsage(data));
    } catch {}
    finally { safeSet(() => setLoading(false)); }
  };

  const incrementUsage = async () => {
    try {
      const res = await fetch("/api/lesson-builder/usage", { method: "POST" });
      if (res.status === 403) {
        const body = await res.json().catch(() => null);
        toast.error(body?.error || "Free limit reached! Upgrade to Pro.");
        await checkUsage();
        return { ok: false, code: 403 };
      }
      if (!res.ok) return { ok: false };
      await checkUsage();
      return { ok: true };
    } catch {
      return { ok: false };
    }
  };

  const canCreateSlides = useMemo(
    () => Boolean(usage?.canCreateSlides),
    [usage]
  );

  const remainingNumeric = useMemo(() => {
    if (!usage) return 0;
    if (usage.hasSubscription) return Infinity;
    const n = typeof usage.remainingSlides === "number"
      ? usage.remainingSlides
      : Number(usage.remainingSlides);
    return Number.isFinite(n) ? n : 0;
  }, [usage]);

  const showLimitWarning = () => {
    if (!usage) return;
    if (!usage.hasSubscription && remainingNumeric <= 1) {
      toast.warning(
        `You have ${usage.remainingSlides} slide creation${remainingNumeric === 1 ? "" : "s"} remaining. Upgrade for unlimited access!`
      );
    }
  };

  const showLimitReached = (msg) => {
    toast.error(msg || "Free limit reached! Upgrade to Pro for unlimited slide creation.");
  };

  useEffect(() => { checkUsage(); }, []);

  return {
    usage,
    loading,
    checkUsage,
    incrementUsage,
    canCreateSlides,          // BOOLEAN
    remainingSlides: remainingNumeric,
    showLimitWarning,
    showLimitReached,
  };
}
