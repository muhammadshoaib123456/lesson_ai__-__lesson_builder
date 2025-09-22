import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const socketID = searchParams.get('socketID');
    
    if (!socketID) {
      return NextResponse.json({ error: 'Socket ID required' }, { status: 400 });
    }

    // Call your Flask API for download
    const response = await fetch(
      `https://builder.lessn.ai:8085/download_slide?socketID=${socketID}`,
      {
        method: "GET",
        redirect: "follow",
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