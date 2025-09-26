export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mailer";
import { welcomeEmail } from "@/lib/email-templates";

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || "";
}

export async function POST(req) {
  try {
    // --- CSRF-ish origin check (prevents cross-site form POSTs) ---
    const origin = req.headers.get("origin") || "";
    const base = getBaseUrl();
    if (base && origin && !origin.startsWith(base)) {
      return NextResponse.json({ ok: false, message: "Bad origin" }, { status: 403 });
    }

    const { firstName, lastName, email, password } = await req.json();

    const fn = String(firstName || "").trim();
    const ln = String(lastName || "").trim();
    const e = String(email || "").toLowerCase().trim();

    if (!fn || !ln || !e || !password || password.length < 6) {
      return NextResponse.json({ ok: false, message: "Invalid input" }, { status: 400 });
    }

    // IMPORTANT: ensure a unique index on User.email in your Prisma schema
    const exists = await prisma.user.findUnique({ where: { email: e } });
    if (exists) {
      // Keep 409 for clear UX (explicit message). If you want to avoid account enumeration,
      // swap this for a generic success and handle via email.
      return NextResponse.json({ ok: false, message: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Store full name in the existing "name" field to avoid schema changes.
    const fullName = `${fn} ${ln}`.replace(/\s+/g, " ").trim();

    const user = await prisma.user.create({
      data: { name: fullName, email: e, passwordHash },
    });

    try {
      // Keep greeting on first name.
      const { subject, html, text } = welcomeEmail(fn, base);
      const info = await sendMail({ to: e, subject, html, text });
      console.log("[welcome email] sent", info);
    } catch (mailErr) {
      console.error("[welcome email] failed:", mailErr);
      // Do not fail signup just because email failed.
    }

    return NextResponse.json({ ok: true, userId: user.id, name: fullName });
  } catch (e) {
    console.error("[register] error:", e);
    return NextResponse.json({ ok: false, message: "Server error" }, { status: 500 });
  }
}
