import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { socketId, reqPrompt, grade, subject, slides = 10 } =
      await request.json();

    if (!socketId || !reqPrompt || !grade || !subject) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const url =
      `https://builder.lessn.ai:8031/main` +
      `?socketID=${encodeURIComponent(socketId)}` +
      `&userText=${encodeURIComponent(reqPrompt)}` +
      `&grade=${encodeURIComponent(grade)}` +
      `&subject=${encodeURIComponent(subject)}` +
      `&slides=${encodeURIComponent(slides)}`;

    const response = await fetch(url, {
      method: "POST",
      // MAKE SURE we don't cache job creation responses in Next layer
      cache: "no-store",
      headers: { Accept: "application/json" },
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
      { error: "Failed to create outline job", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
