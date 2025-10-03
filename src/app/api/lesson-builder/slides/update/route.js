import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * POST /api/lesson-builder/slides/update?socketID=...
 * Body: { text: "<START>...<END>" }
 */
export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const socketID = searchParams.get("socketID");
    if (!socketID) {
      return NextResponse.json({ error: "socketID is required" }, { status: 400 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      body = null;
    }
    const text = body?.text;
    if (typeof text !== "string" || text.length === 0) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    const upstream = await fetch(
      `https://builder.lessn.ai:8031/update_slides?socketID=${encodeURIComponent(socketID)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ text }),
        cache: "no-store",
      }
    );

    if (!upstream.ok) {
      const msg = await upstream.text().catch(() => "");
      return NextResponse.json(
        { error: `Upstream error ${upstream.status}`, details: msg },
        { status: 502 }
      );
    }

    const contentType = upstream.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const json = await upstream.json();
      return NextResponse.json(json);
    } else {
      const textResp = await upstream.text();
      return new Response(textResp, {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }
  } catch (err) {
    console.error("slides/update error:", err);
    return NextResponse.json({ error: "Failed to update slides" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
