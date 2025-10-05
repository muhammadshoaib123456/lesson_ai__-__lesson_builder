import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // Destructure required and optional fields from the incoming request body.
    const {
      socketId,
      reqPrompt,
      grade,
      subject,
      slides = 10,
      chosenStandard,
      comments,
      curriculumPoint,
    } = await request.json();
    // Validate core fields; the standard fields are optional.
    if (!socketId || !reqPrompt || !grade || !subject) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    // Build the query string.  Append the standard ID only if present.
    const url =
      `https://builder.lessn.ai:8031/main` +
      `?socketID=${encodeURIComponent(socketId)}` +
      `&userText=${encodeURIComponent(reqPrompt)}` +
      `&grade=${encodeURIComponent(grade)}` +
      `&subject=${encodeURIComponent(subject)}` +
      `&slides=${encodeURIComponent(slides)}` +
      (chosenStandard ? `&standard=${encodeURIComponent(chosenStandard)}` : "");
    // Build the optional JSON body for comments and curriculumPoint.
    const extraBody = {};
    if (comments) {
      extraBody.comments = comments;
    }
    if (curriculumPoint) {
      extraBody.curriculumPoint = curriculumPoint;
    }
    const body =
      Object.keys(extraBody).length > 0 ? JSON.stringify(extraBody) : undefined;
    const response = await fetch(url, {
      method: "POST",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      // Only include the body if comments or curriculumPoint were provided
      body,
    });
    if (!response.ok) {
      throw new Error(`Flask API responded with status: ${response.status}`);
    }
    const data = await response.json();
    if (data?.job_id) {
      return NextResponse.json({ job_id: data.job_id });
    }
    throw new Error("No job_id returned from Flask API");
  } catch (error) {
    console.error("Error calling Flask API:", error);
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