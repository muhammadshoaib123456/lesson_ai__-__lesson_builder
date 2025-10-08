import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * POST /api/lesson-builder/outline
 *
 * Starts an outline generation job by proxying a request to the upstream
 * Flask API. Uses the authenticated user's ID from NextAuth (via Prisma).
 */
export async function POST(request) {
  try {
    // ✅ Get logged-in user's session
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      console.warn("❌ Unauthorized request: No valid session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Extract user info
    const userId = session.user.id;
    const userEmail = session.user.email;
    const userName = session.user.name;
    console.log("✅ Authenticated user:", { userId, userEmail, userName });

    // ✅ Parse incoming request body
    const {
      socketId,
      topic,
      reqPrompt,
      grade,
      subject,
      slides = 10,
      chosenStandard,
      comments,
      curriculumPoint,
    } = await request.json();

    console.log("🟪 Incoming outline request body:", {
      socketId,
      topic,
      reqPrompt,
      grade,
      subject,
      slides,
      chosenStandard,
      comments,
      curriculumPoint,
    });

    // Determine which prompt to use
    const prompt = topic || reqPrompt;

    // ✅ Validate required fields
    if (!socketId || !prompt || !grade || !subject) {
      console.warn("⚠️ Missing required fields");
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ Build upstream Flask API URL (use real userId)
    const url =
      `https://builder.lessn.ai:8031/main` +
      `?socketID=${encodeURIComponent(socketId)}` +
      `&userId=${encodeURIComponent(userId)}` + // ✅ real DB user ID
      `&userText=${encodeURIComponent(prompt)}` +
      `&grade=${encodeURIComponent(grade)}` +
      `&subject=${encodeURIComponent(subject)}` +
      `&slides=${encodeURIComponent(slides)}` +
      (chosenStandard ? `&standard=${encodeURIComponent(chosenStandard)}` : "");

    console.log("🌍 Calling Flask API URL:", url);

    // ✅ Optional POST body for extra info
    const extraBody = {};
    if (comments) extraBody.comments = comments;
    if (
      curriculumPoint &&
      (Array.isArray(curriculumPoint)
        ? curriculumPoint.length > 0
        : true)
    ) {
      extraBody.curriculumPoint = curriculumPoint;
    }

    const body =
      Object.keys(extraBody).length > 0
        ? JSON.stringify(extraBody)
        : undefined;

    if (body) {
      console.log("📦 Sending body to Flask API:", extraBody);
    }

    // ✅ Send request to Flask API
    const response = await fetch(url, {
      method: "POST",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body,
    });

    console.log("📡 Flask API response status:", response.status);

    if (!response.ok) {
      const text = await response.text();
      console.error("❌ Flask API returned an error:", response.status, text);
      throw new Error(`Flask API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Flask API response JSON:", data);

    // ✅ Return job_id to frontend
    if (data?.job_id) {
      console.log("🎉 Job created successfully with job_id:", data.job_id);
      return NextResponse.json({ job_id: data.job_id });
    }

    console.error("❌ No job_id returned from Flask API:", data);
    throw new Error("No job_id returned from Flask API");
  } catch (error) {
    console.error("🔥 Error in /api/lesson-builder/outline route:", error);
    return NextResponse.json(
      {
        error: "Failed to create outline job",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
