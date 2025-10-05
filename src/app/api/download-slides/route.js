import { NextResponse } from 'next/server';

/**
 * GET /api/lesson-builder/download-slides?socketID=...
 *
 * Proxies a download request to the upstream Flask API.  The query
 * parameter `socketID` is required.  On success returns the PPTX as
 * a Blob with appropriate headers set for download.  On error returns
 * a JSON response describing the failure.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const socketID = searchParams.get('socketID');

    if (!socketID) {
      return NextResponse.json({ error: 'Socket ID required' }, { status: 400 });
    }

    const response = await fetch(
      `https://builder.lessn.ai:8031/download_slide?socketID=${encodeURIComponent(socketID)}`,
      {
        method: 'GET',
        redirect: 'follow',
      }
    );

    if (!response.ok) {
      throw new Error(`Flask API responded with status: ${response.status}`);
    }

    const blob = await response.blob();

    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': 'attachment; filename="presentation.pptx"',
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Failed to download slides' }, { status: 500 });
  }
}
