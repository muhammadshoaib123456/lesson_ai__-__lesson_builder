import { NextResponse } from "next/server";

/**
 * POST /api/lesson-builder/outline
 *
 * Starts an outline generation job by proxying a request to the upstream
 * Flask API.  The request body may include either `topic` (preferred) or
 * `reqPrompt` for backwards compatibility; whichever is provided will be
 * used as the user text.  Required fields are socketId, prompt,
 * grade and subject.  Optional fields are slides (defaults to 10),
 * chosenStandard, comments and curriculumPoint.
 */
export async function POST(request) {
  try {
    // Destructure fields from the incoming JSON payload.  Support both
    // `topic` and `reqPrompt` as the prompt field to allow a smooth
    // migration from the old API.  Unknown fields are ignored.
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

    // Determine the actual prompt value.  `topic` takes precedence, but
    // fall back to `reqPrompt` for older clients.
    const prompt = topic || reqPrompt;

    // Validate required fields.  Empty strings and undefined values are
    // considered missing.
    if (!socketId || !prompt || !grade || !subject) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Build the upstream URL.  Only append the standard query parameter
    // if provided.  Encode all values to ensure safe transmission.
    const url =
      `https://builder.lessn.ai:8031/main` +
      `?socketID=${encodeURIComponent(socketId)}` +
      `&userText=${encodeURIComponent(prompt)}` +
      `&grade=${encodeURIComponent(grade)}` +
      `&subject=${encodeURIComponent(subject)}` +
      `&slides=${encodeURIComponent(slides)}` +
      (chosenStandard ? `&standard=${encodeURIComponent(chosenStandard)}` : "");

    // Prepare an optional body containing comments and curriculumPoint.  Do
    // not include the body if both are falsy.  curriculumPoint may be
    // either a string or an array; include it as-is to let the upstream
    // handle parsing.
    const extraBody = {};
    if (comments) {
      extraBody.comments = comments;
    }
    if (curriculumPoint && (Array.isArray(curriculumPoint) ? curriculumPoint.length > 0 : true)) {
      extraBody.curriculumPoint = curriculumPoint;
    }
    const body = Object.keys(extraBody).length > 0 ? JSON.stringify(extraBody) : undefined;

    const response = await fetch(url, {
      method: "POST",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
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