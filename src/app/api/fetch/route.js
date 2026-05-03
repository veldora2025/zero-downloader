import { NextResponse } from 'next/server';

// Community-maintained instances from cobalt.directory
const INSTANCES = [
  'https://cobalt.omega.wolfy.love',
  'https://melon.clxxped.lol',
  'https://nuko-c.meowing.de'
];

export async function POST(request) {
  try {
    const { url, quality, isAudioOnly } = await request.json();

    if (!url) {
      return NextResponse.json({ status: 'error', message: 'URL is required' }, { status: 400 });
    }

    // Attempt to use the first available instance
    const targetInstance = INSTANCES[0];

    // Cobalt v10+ uses the root endpoint and a slightly different schema
    const response = await fetch(targetInstance, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        videoQuality: quality || '720',
        downloadMode: isAudioOnly ? 'audio' : 'video',
        audioFormat: 'mp3',
        filenameStyle: 'pretty',
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
    return NextResponse.json({ status: 'error', message: 'Server error or API Instance down. Please try again.' }, { status: 500 });
  }
}
