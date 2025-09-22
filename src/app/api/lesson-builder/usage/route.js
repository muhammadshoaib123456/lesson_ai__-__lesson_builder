// src/app/api/lesson-builder/usage/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";      // ✅ import from lib, not the API route
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";               // ✅ ensure Node runtime

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        slidesCreated: true,
        subscriptionType: true,
        subscriptionActive: true,
        subscriptionEnds: true,
        lastSlideCreated: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const hasActiveSubscription =
      user.subscriptionActive && (!user.subscriptionEnds || new Date() < user.subscriptionEnds);

    const slidesUsed = user.slidesCreated || 0;
    const maxFreeSlides = 250;
    const canCreateSlides = hasActiveSubscription || slidesUsed < maxFreeSlides;

    return NextResponse.json({
      slidesUsed,
      maxFreeSlides,
      canCreateSlides,
      hasSubscription: hasActiveSubscription,
      subscriptionType: user.subscriptionType || "free",
      remainingSlides: hasActiveSubscription ? "unlimited" : Math.max(0, maxFreeSlides - slidesUsed),
      lastSlideCreated: user.lastSlideCreated,
    });
  } catch (error) {
    console.error("Usage check error:", error);
    return NextResponse.json({ error: "Failed to check usage" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        slidesCreated: true,
        subscriptionActive: true,
        subscriptionEnds: true,
      },
    });

    const hasActiveSubscription =
      user?.subscriptionActive && (!user.subscriptionEnds || new Date() < user.subscriptionEnds);

    if (!hasActiveSubscription && (user?.slidesCreated ?? 0) >= 5) {
      return NextResponse.json(
        { error: "Free limit exceeded. Please upgrade to continue." },
        { status: 403 }
      );
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        slidesCreated: { increment: 1 },
        lastSlideCreated: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Usage update error:", error);
    return NextResponse.json({ error: "Failed to update usage" }, { status: 500 });
  }
}
