export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

/* ---------- Helper: Require Session ---------- */
async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return {
      session: null,
      res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { session, res: null };
}

/* ---------- GET: Fetch User Profile ---------- */
export async function GET() {
  const { session, res } = await requireSession();
  if (!session) return res;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      firstName: true,
      lastName: true,
      name: true,
      email: true,
      role: true,
      defaultGrade: true,
      defaultSubject: true,
      defaultStandard: true,
      profileComplete: true,
      onboardingStep: true,
    },
  });

  return NextResponse.json(user || {}, { status: 200 });
}

/* ---------- PUT: Update User Profile ---------- */
export async function PUT(req) {
  const { session, res } = await requireSession();
  if (!session) return res;

  const body = await req.json().catch(() => ({}));
  const data = {};

  // Basic fields
  if ("firstName" in body) data.firstName = String(body.firstName || "");
  if ("lastName" in body) data.lastName = String(body.lastName || "");
  if ("name" in body) data.name = String(body.name || "");

  // Role & profile defaults
  if ("role" in body) data.role = String(body.role || "").toLowerCase();
  if ("defaultGrade" in body) data.defaultGrade = body.defaultGrade || null;
  if ("defaultSubject" in body) data.defaultSubject = body.defaultSubject || null;
  if ("defaultStandard" in body) data.defaultStandard = body.defaultStandard || null;
  if ("profileComplete" in body) data.profileComplete = !!body.profileComplete;
  if ("onboardingStep" in body) data.onboardingStep = Number(body.onboardingStep) || 1;

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data,
  });

  return NextResponse.json(
    {
      ok: true,
      profileComplete: updated.profileComplete,
      firstName: updated.firstName,
      lastName: updated.lastName,
    },
    { status: 200 }
  );
}

/* ---------- DELETE: Permanently Delete User Account ---------- */
export async function DELETE() {
  const { session, res } = await requireSession();
  if (!session) return res;

  try {
    const userId = session.user.id;

    // Because all foreign keys have ON DELETE CASCADE,
    // deleting the user will automatically remove all related data.
    await prisma.user.delete({
      where: { id: userId },
    });

    // Optionally clear user session (frontend can also handle signOut)
    return NextResponse.json({
      ok: true,
      message: "Account and all related data deleted successfully.",
    });
  } catch (err) {
    console.error("❌ Error deleting account:", err);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
