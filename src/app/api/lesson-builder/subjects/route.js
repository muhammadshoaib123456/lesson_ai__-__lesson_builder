import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const grade = searchParams.get("grade");

    if (!grade) {
      return NextResponse.json({ error: "Grade parameter required" }, { status: 400 });
    }

    // Abort in case the upstream stalls
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);

    const upstreamUrl = `https://builder.lessn.ai:8085/get_subject?grade=${encodeURIComponent(
      grade
    )}`;

    const response = await fetch(upstreamUrl, {
      signal: controller.signal,
      // avoid cached proxies returning stale/HTML error pages
      cache: "no-store",
      headers: { Accept: "application/json, text/plain, */*"},
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error("Subjects upstream non-OK:", response.status, text.slice(0, 500));
      return NextResponse.json(
        { error: "Upstream error fetching subjects", details: { status: response.status } },
        { status: 502 }
      );
    }

    // Be defensive about content-type and parse path
    const ct = response.headers.get("content-type") || "";
    let data;
    if (ct.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Subjects upstream returned non-JSON:", text.slice(0, 500));
        return NextResponse.json(
          { error: "Upstream returned non-JSON for subjects" },
          { status: 502 }
        );
      }
    }

    // Normalize → always { subjects: [{ subject: "..." }, ...] }
    let subjects;
    if (Array.isArray(data)) {
      subjects = data;
    } else if (Array.isArray(data.subjects)) {
      subjects = data.subjects;
    } else if (Array.isArray(data.subject)) {
      subjects = data.subject;
    } else if (Array.isArray(data.topics)) {
      // lenient mapping if upstream returns topics
      subjects = data.topics;
    } else {
      subjects = [];
    }

    // Coerce strings -> { subject: string }, drop empties
    const normalized = (subjects || [])
      .map((s) => (typeof s === "string" ? { subject: s } : s))
      .filter((s) => s && typeof s.subject === "string" && s.subject.trim().length > 0);

    return NextResponse.json({ subjects: normalized }, { status: 200 });
  } catch (err) {
    console.error("Error fetching subjects:", err);
    const status = err?.name === "AbortError" ? 504 : 500;
    return NextResponse.json({ error: "Failed to fetch subjects" }, { status });
  }
}
