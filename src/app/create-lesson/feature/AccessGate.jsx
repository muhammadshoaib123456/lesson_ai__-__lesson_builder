"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LogIn, UserPlus, ArrowRight } from "lucide-react";

/**
 * Gorgeous, animated access gate for your lesson builder.
 * - Fully TailwindCSS (no custom CSS file needed)
 * - Framer Motion micro-interactions
 * - Works in Next.js App Router
 */
export default function AccessGate({ nextPath = "/create-lesson" }) {
  const q = `?next=${encodeURIComponent(nextPath)}`;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-[#0B1020] dark:via-[#0B1020] dark:to-[#0C0F1A]">
      {/* Subtle grid overlay */}
      <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(60%_60%_at_50%_40%,#000_60%,transparent_100%)]">
        <div className="h-full w-full bg-[linear-gradient(to_right,rgba(120,119,198,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(120,119,198,0.08)_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {/* Animated glow orbs */}
      <motion.div
        aria-hidden
        className="absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle at 30% 30%, #a78bfa55, transparent 60%)" }}
        animate={{ y: [0, 20, 0], x: [0, 10, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute -bottom-24 -right-20 h-80 w-80 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle at 70% 70%, #60a5fa55, transparent 60%)" }}
        animate={{ y: [0, -25, 0], x: [0, -12, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Center card */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-xl"
        >
          {/* Card with glass + gradient border */}
          <div className="group relative rounded-3xl p-[1px] shadow-2xl shadow-indigo-500/5">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/30 via-violet-500/30 to-fuchsia-500/30 blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />
            <div className="relative rounded-3xl bg-white/80 backdrop-blur-xl ring-1 ring-white/60 dark:bg-white/5 dark:ring-white/10">
              <div className="px-8 pb-8 pt-10 sm:px-10">
                <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200/70 bg-indigo-50/60 px-3 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-400/20 dark:bg-indigo-400/10 dark:text-indigo-200">
                  <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" />
                  Secure Access Required
                </div>

                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                  <span className="bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                    Please sign in
                  </span>
                </h1>
                <p className="mt-3 text-slate-600 dark:text-slate-300">
                  You need to log in or create an account to access the lesson builder.
                </p>

                {/* Perks */}
                <ul className="mt-6 grid grid-cols-1 gap-3 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-3">
                  {[
                    "Save progress",
                    "Template library",
                    "One-click export",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M20 7L9 18l-5-5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-emerald-500"
                        />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>

                {/* Actions */}
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <ShimmerButton asChild>
                    <Link href={`/login${q}`} className="group inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold">
                      <LogIn className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                      Log in
                      <ArrowRight className="h-4 w-4 opacity-70 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </ShimmerButton>

                  <GhostButton asChild>
                    <Link href={`/register${q}`} className="group inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold">
                      <UserPlus className="h-4 w-4" />
                      Create account
                    </Link>
                  </GhostButton>
                </div>

                {/* Tiny fine print */}
                <p className="mt-6 text-xs text-slate-500 dark:text-slate-400">
                  By continuing, you agree to our Terms and acknowledge our Privacy Policy.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/**
 * ShimmerButton — radiant gradient button with a subtle shine sweep and hover lift.
 */
function ShimmerButton({ asChild, children }) {
  const Cmp = asChild ? "div" : "button";
  return (
    <motion.div whileHover={{ y: -2 }} whileTap={{ y: 0 }} className="relative">
      <Cmp
        className="relative overflow-hidden rounded-full bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white shadow-lg shadow-indigo-600/20 ring-1 ring-white/10 transition-transform focus:outline-none focus:ring-2 focus:ring-indigo-300/50"
      >
        {/* Shine */}
        <span className="pointer-events-none absolute -inset-1 block opacity-0 [background:linear-gradient(110deg,transparent,rgba(255,255,255,0.6),transparent)] [mask-image:linear-gradient(#000,transparent_60%)] transition-opacity duration-700 group-hover:opacity-75" />
        {/* Inner content wrapper to pad */}
        <span className="relative z-10 inline-flex items-center px-6 py-3">
          {children}
        </span>
      </Cmp>
    </motion.div>
  );
}

/**
 * GhostButton — soft, glassy secondary button.
 */
function GhostButton({ asChild, children }) {
  const Cmp = asChild ? "div" : "button";
  return (
    <motion.div whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
      <Cmp
        className="rounded-full border border-slate-300/70 bg-white/70 px-6 py-3 text-slate-800 shadow-sm backdrop-blur-md transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300/50 dark:border-white/10 dark:bg-white/10 dark:text-white/90 hover:dark:bg-white/15"
      >
        <span className="inline-flex items-center gap-2">{children}</span>
      </Cmp>
    </motion.div>
  );
}