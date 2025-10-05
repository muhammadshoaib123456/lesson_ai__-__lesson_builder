import { NextResponse } from "next/server";

// Optional flags to disable caching.  Uncomment if your environment
// supports them and you want to ensure fresh data every request.
// export const revalidate = 0;
// export const dynamic = "force-dynamic";

/**
 * GET /api/lesson-builder/outline/status/[jobId]
 *
 * Polls the upstream Flask API for the status of an outline job.  The
 * `jobId` is extracted from the route parameters.  Returns the upstream
 * JSON response directly on success.  If the upstream returns a non-OK
 * status, the response text (if any) is included in the error details.
 */
export async function GET(_request, context) {
  try {
    const { jobId } = await context.params;
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
      let extra = "";
      try {
        extra = await upstream.text();
      } catch {}
      throw new Error(
        `Flask API responded with status: ${upstream.status}${extra ? ` — ${extra}` : ""}`
      );
    }

    const data = await upstream.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error checking Flask API status:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch job status",
        details: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}