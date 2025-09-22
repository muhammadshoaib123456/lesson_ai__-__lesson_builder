"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";

function getSafeNext(rawNext) {
  if (typeof rawNext !== "string" || !rawNext) return "/";
  if (rawNext.startsWith("http://") || rawNext.startsWith("https://") || rawNext.startsWith("//")) return "/";
  return rawNext.startsWith("/") ? rawNext : "/";
}

export default function Login() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = getSafeNext(sp.get("next") || sp.get("callbackUrl") || "/");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl: next,
    });

    setLoading(false);

    if (res?.ok) {
      router.push(next);
    } else {
      setMsg("Invalid email or password.");
    }
  }

  return (
    <>
      <Header />
      <div className="bg-white min-h-[654px] flex justify-center items-center font-sans px-4">
        <div className="w-full max-w-[410px] text-black">
          <div className="mb-10">
            <h2 className="text-center font-sans text-2xl text-black">Log in to your account</h2>
          </div>

          <form className="flex flex-col gap-[20px]" onSubmit={submit} autoComplete="on">
            <button type="button" className="flex items-center justify-center w-full py-3 rounded-full bg-[#EBF5FA] text-gray-500 border border-[#A7D5EC] cursor-not-allowed" disabled>
              <img src="/Google.svg" alt="Google" className="w-5 h-5 mr-2" />
              Sign in with Google (coming soon)
            </button>
            <button type="button" className="flex items-center justify-center w-full py-3 rounded-full bg-[#EBF5FA] text-gray-500 border border-[#A7D5EC] cursor-not-allowed" disabled>
              <img src="/Microsoft.svg" alt="Microsoft" className="w-5 h-5 mr-2" />
              Sign in with Microsoft (coming soon)
            </button>

            <div className="flex items-center text-gray-500">
              <hr className="flex-1 border-gray-400" />
              <span className="px-2 text-sm">OR</span>
              <hr className="flex-1 border-gray-400" />
            </div>

            <div className="relative">
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="Email"
                className="w-full py-3 pl-10 pr-3 rounded-full border border-purple-600 bg-white text-black text-base focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-600 text-lg" />
            </div>

            <div className="relative">
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="Password"
                className="w-full py-3 pl-10 pr-10 rounded-full border border-purple-600 bg-white text-black text-base focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-600 text-lg" />
            </div>

            {msg && <p className="text-sm text-red-600 text-center">{msg}</p>}

            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" className="w-4 h-4 accent-purple-600" defaultChecked />
                Remember me
              </label>
              <a href={`/forgot-password?next=${encodeURIComponent(next)}`} className="text-blue-400 text-sm hover:underline">
                Forgot password?
              </a>
            </div>

            <div className="flex justify-center">
              <button
                className="w-[120px] py-3 rounded-full bg-purple-600 text-white text-base font-semibold hover:bg-purple-700 transition disabled:opacity-60"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>

            {/* Preserve `next` to register */}
            <a
              href={`/register?next=${encodeURIComponent(next)}`}
              className="block text-center text-blue-400 text-sm hover:underline"
            >
              Sign up for free
            </a>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
