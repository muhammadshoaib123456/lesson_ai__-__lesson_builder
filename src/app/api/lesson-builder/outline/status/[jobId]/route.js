// src/app/api/lesson-builder/outline/status/[jobId]/route.js
import { NextResponse } from "next/server";

// Optional (helps ensure no route-level caching):
// export const revalidate = 0;
// export const dynamic = "force-dynamic";

export async function GET(_request, context) {
  try {
    const { jobId } = await context.params; // ✅ await the async params
    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    const upstream = await fetch(
      `https://builder.lessn.ai:8031/status/${encodeURIComponent(jobId)}`,
      {
        method: "GET",
        cache: "no-store",
        headers: { Accept: "application/json" },
      }
    );

    if (!upstream.ok) {
      // grab any upstream body for better debugging (non-fatal if it fails)
      let extra = "";
      try {
        extra = await upstream.text();
      } catch {}
      throw new Error(
        `Flask API responded with status: ${upstream.status}${
          extra ? ` — ${extra}` : ""
        }`
      );
    }

    const data = await upstream.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error checking Flask API status:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch job status",
        details:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
