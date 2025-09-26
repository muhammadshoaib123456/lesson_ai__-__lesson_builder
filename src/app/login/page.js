// app/login/page.jsx
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
  const next = getSafeNext(sp.get("next") || "/");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
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

      <main className="flex flex-col items-center justify-center px-4 py-8 bg-white min-h-[calc(100vh-160px)] gap-10">
        {/* ===== Frame 11 ===== */}
        <div className="flex flex-col items-center gap-[20px] w-full max-w-[665px]">
          <h1
            style={{
              fontFamily: "Mulish, sans-serif",
              fontWeight: 700,
              fontSize: 41,
              lineHeight: "51px",
              color: "#9500DE",
              textAlign: "center",
            }}
          >
            Good to see you again!
          </h1>
          <p
            style={{
              fontFamily: "Mulish, sans-serif",
              fontWeight: 400,
              fontSize: 21,
              lineHeight: "26px",
              color: "#9500DE",
              textAlign: "center",
            }}
          >
            Build &amp; explore standards-based, AI-driven lessns
          </p>
        </div>
        {/* ===== End Frame 11 ===== */}

        <div className="w-full max-w-[440px] text-center">
          {/* ===== Frame 17 ===== */}
          <div className="flex flex-col items-center gap-[10px] w-full">
            <h2
              style={{
                fontFamily: "Mulish, sans-serif",
                fontWeight: 600,
                fontSize: 24,
                lineHeight: "30px",
                color: "#322F35",
                textAlign: "center",
              }}
            >
              Log in
            </h2>
            <p
              style={{
                fontFamily: "Mulish, sans-serif",
                fontWeight: 400,
                fontSize: 18,
                lineHeight: "23px",
                color: "rgba(50, 47, 53, 0.7)",
                textAlign: "center",
              }}
            >
              Dont Have an Account?{" "}
              <a href="/register" style={{ color: "#9500DE", marginLeft: 4 }}>
                Register
              </a>
            </p>
          </div>
          {/* ===== End Frame 17 ===== */}

          <section className="mt-5">
            <form onSubmit={submit} autoComplete="on" className="flex flex-col items-center gap-4">
              {/* ===== Frame 19 ===== */}
              <div className="flex flex-col items-center justify-center gap-4 w-full">
                {/* Email */}
                <div
                  className="w-[365px] flex flex-row items-center"
                  style={{
                    boxSizing: "border-box",
                    padding: "16px 12px",
                    gap: 10,
                    height: 44,
                    border: "1px solid rgba(50, 47, 53, 0.5)",
                    borderRadius: 8,
                  }}
                >
                  <input
                    id="email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="Email address*"
                    className="flex-1 bg-transparent outline-none text-[#111] placeholder-[#8A8A8A]"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Password */}
                <div
                  className="w-[365px] flex flex-row items-center"
                  style={{
                    boxSizing: "border-box",
                    padding: "16px 12px",
                    gap: 10,
                    height: 44,
                    border: "1px solid rgba(50, 47, 53, 0.5)",
                    borderRadius: 8,
                  }}
                >
                  <input
                    id="password"
                    type={showPwd ? "text" : "password"}
                    name="password"
                    autoComplete="current-password"
                    placeholder="Password*"
                    className="flex-1 bg-transparent outline-none text-[#111] placeholder-[#8A8A8A]"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    aria-label={showPwd ? "Hide password" : "Show password"}
                    onClick={() => setShowPwd((s) => !s)}
                    className="p-1 rounded hover:opacity-80"
                    style={{ color: "#9500DE" }}
                  >
                    {showPwd ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M10.58 10.58A2 2 0 0012 14a2 2 0 001.42-.58M9.88 5.1A10.33 10.33 0 0112 5c5 0 9.27 3.11 10.5 7.5a10.94 10.94 0 01-3.16 4.73M6.24 6.24A11.08 11.08 0 001.5 12.5 11.1 11.1 0 007.27 17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M2 12S5 5 12 5s10 7 10 7-3 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="2" fill="none" />
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Remember + Forgot */}
                <div className="w-[365px] flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm" style={{ color: "#4A4A4A" }}>
                    <input type="checkbox" className="w-4 h-4" style={{ accentColor: "#9500DE" }} defaultChecked />
                    Remember me
                  </label>
                  <a
                    href={`/forgot-password?next=${encodeURIComponent(next)}`}
                    className="text-sm hover:underline"
                    style={{ color: "#9500DE" }}
                  >
                    Forgot password?
                  </a>
                </div>

                {/* Terms */}
                <p className="w-[365px] text-[12px] leading-snug text-left" style={{ color: "#7A7A7A" }}>
                  By signing up, you agree to our{" "}
                  <a href="/terms" className="hover:underline" style={{ color: "#9500DE" }}>
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" className="hover:underline" style={{ color: "#9500DE" }}>
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>
              {/* ===== End Frame 19 ===== */}

              {/* Login button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 mx-auto flex flex-row justify-center items-center gap-[10px] font-semibold text-white transition disabled:opacity-60"
                style={{
                  width: 365,
                  height: 57,
                  padding: 16,
                  borderRadius: 40,
                  background: "rgba(149, 0, 222, 0.8)",
                  boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.25)",
                }}
              >
                {loading ? "Logging in..." : "Log in"}
              </button>

              {/* Divider */}
              <div className="my-2 flex items-center w-[365px]" style={{ color: "#9A9A9A" }}>
                <hr className="flex-1 border-[#E2E2E2]" />
                <span className="px-3 text-sm">or</span>
                <hr className="flex-1 border-[#E2E2E2]" />
              </div>

              {/* Google button */}
              <button
                type="button"
                className="mx-auto flex flex-row justify-center items-center gap-[10px] font-medium bg-white"
                style={{
                  width: 365,
                  height: 57,
                  padding: 16,
                  border: "1px solid #9500DE",
                  borderRadius: 40,
                  color: "#9500DE",
                }}
              >
                <img src="/Google.svg" alt="Google" className="w-5 h-5" />
                Log in with Google
              </button>

              {msg && <p className="mt-3 text-center text-sm text-red-600">{msg}</p>}
            </form>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
























































// // app/login/page.jsx
// "use client";

// import React, { useState } from "react";
// import Header from "@/components/Header";
// import Footer from "@/components/Footer";
// import { signIn } from "next-auth/react";
// import { useSearchParams, useRouter } from "next/navigation";

// function getSafeNext(rawNext) {
//   if (typeof rawNext !== "string" || !rawNext) return "/";
//   if (rawNext.startsWith("http://") || rawNext.startsWith("https://") || rawNext.startsWith("//")) return "/";
//   return rawNext.startsWith("/") ? rawNext : "/";
// }

// export default function Login() {
//   const router = useRouter();
//   const sp = useSearchParams();
//   const next = getSafeNext(sp.get("next") || "/");

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [msg, setMsg] = useState("");
//   const [loading, setLoading] = useState(false);

//   async function submit(e) {
//     e.preventDefault();
//     setMsg("");
//     setLoading(true);

//     const res = await signIn("credentials", {
//       redirect: false,
//       email,
//       password,
//       callbackUrl: next,
//     });

//     setLoading(false);

//     if (res?.ok) {
//       router.push(next);
//     } else {
//       setMsg("Invalid email or password.");
//     }
//   }

//   return (
//     <>
//       <Header />
//       <div className="bg-white min-h-[654px] flex justify-center items-center font-sans px-4">
//         <div className="w-full max-w-[410px] text-black">
//           <div className="mb-10">
//             <h2 className="text-center font-sans text-2xl text-black">Log in to your account</h2>
//           </div>

//           <form className="flex flex-col gap-[20px]" onSubmit={submit} autoComplete="on">
//             <button type="button" className="flex items-center justify-center w-full py-3 rounded-full bg-[#EBF5FA] text-gray-500 border border-[#A7D5EC] cursor-not-allowed" disabled>
//               <img src="/Google.svg" alt="Google" className="w-5 h-5 mr-2" />
//               Sign in with Google (coming soon)
//             </button>
//             <button type="button" className="flex items-center justify-center w-full py-3 rounded-full bg-[#EBF5FA] text-gray-500 border border-[#A7D5EC] cursor-not-allowed" disabled>
//               <img src="/Microsoft.svg" alt="Microsoft" className="w-5 h-5 mr-2" />
//               Sign in with Microsoft (coming soon)
//             </button>

//             <div className="flex items-center text-gray-500">
//               <hr className="flex-1 border-gray-400" />
//               <span className="px-2 text-sm">OR</span>
//               <hr className="flex-1 border-gray-400" />
//             </div>

//             <div className="relative">
//               <input
//                 type="email"
//                 name="email"
//                 autoComplete="email"
//                 placeholder="Email"
//                 className="w-full py-3 pl-10 pr-3 rounded-full border border-purple-600 bg-white text-black text-base focus:outline-none"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//               />
//               <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-600 text-lg" />
//             </div>

//             <div className="relative">
//               <input
//                 type="password"
//                 name="password"
//                 autoComplete="current-password"
//                 placeholder="Password"
//                 className="w-full py-3 pl-10 pr-10 rounded-full border border-purple-600 bg-white text-black text-base focus:outline-none"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//               />
//               <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-600 text-lg" />
//             </div>

//             {msg && <p className="text-sm text-red-600 text-center">{msg}</p>}

//             <div className="flex justify-between items-center">
//               <label className="flex items-center gap-2 text-sm text-gray-700">
//                 <input type="checkbox" className="w-4 h-4 accent-purple-600" defaultChecked />
//                 Remember me
//               </label>
//               <a href={`/forgot-password?next=${encodeURIComponent(next)}`} className="text-blue-400 text-sm hover:underline">
//                 Forgot password?
//               </a>
//             </div>

//             <div className="flex justify-center">
//               <button
//                 className="w-[120px] py-3 rounded-full bg-purple-600 text-white text-base font-semibold hover:bg-purple-700 transition disabled:opacity-60"
//                 disabled={loading}
//               >
//                 {loading ? "Logging in..." : "Login"}
//               </button>
//             </div>

//             {/* Preserve `next` to register */}
//             <a
//               href={`/register?next=${encodeURIComponent(next)}`}
//               className="block text-center text-blue-400 text-sm hover:underline"
//             >
//               Sign up for free
//             </a>
//           </form>
//         </div>
//       </div>
//       <Footer />
//     </>
//   );
// }






































































