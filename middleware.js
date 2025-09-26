import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const GATED_PREFIXES = ["/create-lesson", "/my-lessons"];

export default withAuth(
  async function middleware(req) {
    try {
      const res = await fetch(new URL("/api/profile", req.url), {
        headers: { cookie: req.headers.get("cookie") || "" },
        cache: "no-store",
      });
      const profile = res.ok ? await res.json() : null;

      if (!profile?.profileComplete) {
        const url = req.nextUrl.clone();
        url.pathname = "/register";          // 👈 merged wizard lives on /register
        url.searchParams.set("step", "2");   // jump straight to role
        url.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);
        return NextResponse.redirect(url);
      }
    } catch {}

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname || "";
        const needsGate = GATED_PREFIXES.some((p) => path.startsWith(p));
        return needsGate ? !!token : true;
      },
    },
  }
);

export const config = {
  matcher: ["/create-lesson/:path*", "/my-lessons/:path*"],
};
