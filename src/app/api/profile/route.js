export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { session: null, res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session, res: null };
}

export async function GET() {
  const { session, res } = await requireSession();
  if (!session) return res;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
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

export async function PUT(req) {
  const { session, res } = await requireSession();
  if (!session) return res;

  const body = await req.json().catch(() => ({}));
  const data = {};

  if ("name" in body) data.name = String(body.name || "");
  if ("role" in body) data.role = String(body.role || "").toLowerCase();
  if ("defaultGrade" in body) data.defaultGrade = body.defaultGrade || null;
  if ("defaultSubject" in body) data.defaultSubject = body.defaultSubject || null;
  if ("defaultStandard" in body) data.defaultStandard = body.defaultStandard || null;
  if ("profileComplete" in body) data.profileComplete = !!body.profileComplete;
  if ("onboardingStep" in body) data.onboardingStep = Number(body.onboardingStep) || 1;

  const updated = await prisma.user.update({ where: { id: session.user.id }, data });
  return NextResponse.json({ ok: true, profileComplete: updated.profileComplete }, { status: 200 });
}
