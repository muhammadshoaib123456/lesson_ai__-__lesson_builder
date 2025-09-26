import { NextResponse } from "next/server";

/**
 * POST /api/lesson-builder/slides/upload?socketID=...
 *
 * Proxies slide upload requests to the upstream service.  The upstream
 * service returns a plain‑text response containing either a URL or the
 * literal string "fail".  This implementation preserves the plain
 * text response when the upstream is successful and propagates
 * upstream errors as a 502 with a plain "fail" body.  A missing
 * socketID results in a 400.
 */
export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const socketID = searchParams.get("socketID");
    if (!socketID) {
      return NextResponse.json({ error: "socketID is required" }, { status: 400 });
    }
    const upstream = await fetch(
      `https://builder.lessn.ai:8085/upload_slide?socketID=${encodeURIComponent(socketID)}`,
      { method: "POST", cache: "no-store" }
    );

    const text = await upstream.text().catch(() => "fail");

    if (!upstream.ok) {
      // On error propagate a generic failure; the client checks for "fail".
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