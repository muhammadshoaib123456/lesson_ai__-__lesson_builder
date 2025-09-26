// app/api/lesson-builder/slides/download/route.js
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const socketID = searchParams.get("socketID");
    if (!socketID) {
      return NextResponse.json({ error: "socketID required" }, { status: 400 });
    }

    const sourceUrl = `https://builder.lessn.ai:8085/download_slide?socketID=${encodeURIComponent(
      socketID
    )}`;

    const upstream = await fetch(sourceUrl, {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
      headers: {
        Accept:
          "application/vnd.openxmlformats-officedocument.presentationml.presentation,application/octet-stream",
      },
    });

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => "");
      return NextResponse.json(
        { error: `Flask upstream ${upstream.status}`, msg: text },
        { status: 502 }
      );
    }

    const ct =
      upstream.headers.get("content-type") ||
      "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    if (/json|html|text/i.test(ct)) {
      const text = await upstream.text().catch(() => "");
      return NextResponse.json(
        { error: "Unexpected upstream response", msg: text.slice(0, 1000) },
        { status: 502 }
      );
    }

    // filename (fallback)
    let filename = "presentation.pptx";
    const cd = upstream.headers.get("content-disposition");
    if (cd && /filename\*=UTF-8''([^;]+)/i.test(cd)) {
      filename = decodeURIComponent(cd.match(/filename\*=UTF-8''([^;]+)/i)[1]);
    } else if (cd && /filename="?([^";]+)"?/i.test(cd)) {
      filename = cd.match(/filename="?([^";]+)"?/i)[1];
    }

    const headers = new Headers();
    headers.set("content-type", ct);
    const cl = upstream.headers.get("content-length");
    if (cl) headers.set("content-length", cl);
    headers.set("content-disposition", `attachment; filename="${filename}"`);
    headers.set("cache-control", "no-store");

    return new Response(upstream.body, { status: 200, headers });
  } catch (err) {
    console.error("slides/download error:", err);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
