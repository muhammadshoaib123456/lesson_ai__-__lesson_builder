import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const socketID = searchParams.get("socketID");
    if (!socketID) {
      return new NextResponse("socketID is required", {
        status: 400,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const upstream = await fetch(
      `https://builder.lessn.ai:8085/download_ppt?socketID=${encodeURIComponent(socketID)}`,
      { method: "GET", cache: "no-store" }
    );

    if (!upstream.ok) {
      const msg = await upstream.text().catch(() => "");
      console.error("Upstream PPTX error:", upstream.status, msg?.slice?.(0, 500));
      return new NextResponse("fail", {
        status: 502,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const headers = new Headers();
    const cd = upstream.headers.get("content-disposition");
    const ct =
      upstream.headers.get("content-type") ||
      "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    if (cd) headers.set("content-disposition", cd);
    headers.set("content-type", ct);

    const body = await upstream.arrayBuffer();
    return new NextResponse(body, { status: 200, headers });
  } catch (err) {
    console.error("slides/download error:", err);
    return new NextResponse("fail", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
