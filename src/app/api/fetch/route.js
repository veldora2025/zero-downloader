import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { url, quality, isAudioOnly } = await request.json();

    if (!url) {
      return NextResponse.json({ status: 'error', message: 'URL is required' }, { status: 400 });
    }

    // Calling Cobalt API
    const response = await fetch('https://api.cobalt.tools/api/json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        vQuality: quality || '720',
        isAudioOnly: isAudioOnly || false,
        filenamePattern: 'pretty', // Cleaner filenames
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ 
        status: 'error', 
        message: data.text || 'Failed to process request with Cobalt API' 
      }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ status: 'error', message: 'Internal server error' }, { status: 500 });
  }
}
