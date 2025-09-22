import { NextResponse } from "next/server";

/**
 * Download proxy for generated slides.
 * Accepts ?href=<absolute-url>, validates host, fetches the file, and streams it
 * with `Content-Disposition: attachment; filename=...`.
 *
 * NOTE: We validate the URL against a small allowlist to avoid SSRF.
 * Tweak ALLOWED_DOWNLOAD_HOSTS below to match whatever your Flask returns.
 */

export const runtime = "nodejs";

// You can also move this to process.env.ALLOWED_DOWNLOAD_HOSTS and split(",")
const ALLOWED_DOWNLOAD_HOSTS = new Set([
  "storage.googleapis.com",
  "drive.google.com",
  "docs.google.com",
  "slides.googleapis.com",
  "builder.lessn.ai",
  "slides.lessn.ai",
]);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const href = searchParams.get("href");

    if (!href) {
      return NextResponse.json({ error: "Missing href" }, { status: 400 });
    }

    let url;
    try {
      url = new URL(href);
    } catch {
      return NextResponse.json({ error: "Invalid href" }, { status: 400 });
    }

    if (!(url.protocol === "https:" || url.protocol === "http:")) {
      return NextResponse.json({ error: "Only http/https allowed" }, { status: 400 });
    }

    if (!ALLOWED_DOWNLOAD_HOSTS.has(url.hostname)) {
      return NextResponse.json({ error: "Host not allowed" }, { status: 400 });
    }

    // Fetch the file from the remote URL
    const upstream = await fetch(url.toString(), {
      // If your upstream requires credentials or headers, add them here.
      // headers: { ... }
    });

    if (!upstream.ok) {
      const msg = await upstream.text().catch(() => "");
      return NextResponse.json(
        { error: `Upstream ${upstream.status}`, msg },
        { status: 502 }
      );
    }

    // Try to preserve upstream headers
    const contentType = upstream.headers.get("content-type") || "application/octet-stream";
    const contentLength = upstream.headers.get("content-length") || undefined;

    // Derive a filename if upstream didn't provide one
    let filename = "slides";
    const cd = upstream.headers.get("content-disposition");
    if (cd && /filename\*=UTF-8''([^;]+)/i.test(cd)) {
      filename = decodeURIComponent(cd.match(/filename\*=UTF-8''([^;]+)/i)[1]);
    } else if (cd && /filename="?([^"]+)"?/i.test(cd)) {
      filename = cd.match(/filename="?([^"]+)"?/i)[1];
    } else {
      // try to extract from path
      const last = url.pathname.split("/").pop();
      if (last) filename = last;
      // ensure a sane default extension if path has none
      if (!/\.[a-z0-9]{2,5}$/i.test(filename)) filename += ".pptx";
    }

    const headers = new Headers();
    headers.set("content-type", contentType);
    if (contentLength) headers.set("content-length", contentLength);
    headers.set("content-disposition", `attachment; filename="${filename}"`);

    // Stream the body through
    return new Response(upstream.body, {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error("download proxy error:", err);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
