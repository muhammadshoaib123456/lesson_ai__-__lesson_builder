import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * POST /api/lesson-builder/slides/upload?socketID=...
 * Proxies to upstream which returns plain text: Google Slides URL or "fail".
 */
export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const socketID = searchParams.get("socketID");
    if (!socketID) {
      return NextResponse.json({ error: "socketID is required" }, { status: 400 });
    }
    const upstream = await fetch(
      `https://builder.lessn.ai:8031/upload_slide?socketID=${encodeURIComponent(socketID)}`,
      { method: "POST", cache: "no-store" }
    );

    const text = await upstream.text().catch(() => "fail");

    if (!upstream.ok) {
      return new Response("fail", { status: 502, headers: { "Content-Type": "text/plain" } });
    }

    return new Response(text, { status: 200, headers: { "Content-Type": "text/plain" } });
  } catch (err) {
    console.error("slides/upload error:", err);
    return new Response("fail", { status: 500, headers: { "Content-Type": "text/plain" } });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
