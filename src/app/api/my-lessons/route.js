// app/api/my-lessons/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";   // make sure this is exported from lib/auth
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

async function requireSession() {
  const session = await getServerSession(authOptions);   // <- use this instead of auth()
  if (!session?.user?.id) {
    return { session: null, res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session, res: null };
}

export async function GET() {
  try {
    const { session, res } = await requireSession();
    if (!session) return res;

    const records = await prisma.savedPresentation.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { presentation: true },
    });

    const items = records.map(({ presentation: p }) => ({
      id: p.id,
      slug: p.slug,
      topic: p.topic ?? p.name ?? "",
      sub_topic: p.sub_topic ?? null,
      subject: p.subject,
      grade: p.grade,
      thumbnail: p.thumbnail ?? null,
      thumbnail_alt_text: p.thumbnail_alt_text ?? null,
      is_saved: true,
    }));

    return NextResponse.json({ items }, { status: 200 });
  } catch (err) {
    console.error("GET /api/my-lessons error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { session, res } = await requireSession();
    if (!session) return res;

    const body = await req.json().catch(() => ({}));
    const { id, slug } = body || {};
    if (!id && !slug) {
      return NextResponse.json({ error: "id or slug required" }, { status: 400 });
    }

    const pres = await prisma.presentation.findUnique({
      where: id ? { id: Number(id) } : { slug: String(slug) },
      select: { id: true },
    });
    if (!pres) return NextResponse.json({ error: "Presentation not found" }, { status: 404 });

    // create + swallow P2002 duplicate, works with @@id or @@unique([userId, presentationId])
    try {
      await prisma.savedPresentation.create({
        data: { userId: session.user.id, presentationId: pres.id },
      });
    } catch (e) {
      if (e?.code !== "P2002") throw e;
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("POST /api/my-lessons error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { session, res } = await requireSession();
    if (!session) return res;

    let id, slug;
    try {
      const json = await req.json();
      id = json?.id;
      slug = json?.slug;
    } catch {}
    if (!id && !slug) {
      const { searchParams } = new URL(req.url);
      id = searchParams.get("id") || id;
      slug = searchParams.get("slug") || slug;
    }
    if (!id && !slug) {
      return NextResponse.json({ error: "id or slug required" }, { status: 400 });
    }

    const pres = await prisma.presentation.findUnique({
      where: id ? { id: Number(id) } : { slug: String(slug) },
      select: { id: true },
    });
    if (!pres) return NextResponse.json({ error: "Presentation not found" }, { status: 404 });

    await prisma.savedPresentation.deleteMany({
      where: { userId: session.user.id, presentationId: pres.id },
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/my-lessons error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
