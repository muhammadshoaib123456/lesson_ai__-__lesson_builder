import { NextResponse } from "next/server";

export async function GET() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);

    const response = await fetch("https://builder.lessn.ai:8085/get_grades", {
      signal: controller.signal,
      cache: "no-store",
      headers: { Accept: "application/json, text/plain, */*" },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error("Grades upstream non-OK:", response.status, text.slice(0, 500));
      return NextResponse.json(
        { error: "Upstream error fetching grades", details: { status: response.status } },
        { status: 502 }
      );
    }

    const ct = response.headers.get("content-type") || "";
    let data;
    if (ct.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Grades upstream returned non-JSON:", text.slice(0, 500));
        return NextResponse.json(
          { error: "Upstream returned non-JSON for grades" },
          { status: 502 }
        );
      }
    }

    // Normalize to { grade: [ { grade: "..." }, ... ] }
    let gradeList;
    if (Array.isArray(data)) {
      gradeList = data;
    } else if (Array.isArray(data.grade)) {
      gradeList = data.grade;
    } else if (Array.isArray(data.grades)) {
      gradeList = data.grades;
    } else {
      gradeList = [];
    }

    const normalized = (gradeList || []).map((g) =>
      typeof g === "string" ? { grade: g } : g
    );

    return NextResponse.json({ grade: normalized }, { status: 200 });
  } catch (error) {
    console.error("Error fetching grades:", error);
    const status = error?.name === "AbortError" ? 504 : 500;
    return NextResponse.json({ error: "Failed to fetch grades" }, { status });
  }
}
