import { NextResponse } from 'next/server';

const COBALT_INSTANCES = [
  'https://cobalt.omega.wolfy.love',
  'https://nuko-c.meowing.de',
  'https://cobaltapi.kittycat.boo'
];

export async function POST(request) {
  try {
    const { url, quality, isAudioOnly } = await request.json();

    if (!url) {
      return NextResponse.json({ status: 'error', message: 'URL is required' }, { status: 400 });
    }

    // --- TIKTOK SPECIFIC LOGIC (TikWM) ---
    if (url.includes('tiktok.com')) {
      try {
        console.log('Detected TikTok, using TikWM API...');
        const tikwmRes = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
        const tikwmData = await tikwmRes.json();

        if (tikwmData.code === 0 && tikwmData.data) {
          // Normalize TikWM data to our app's format
          return NextResponse.json({
            status: 'redirect', // Compatibility with Cobalt frontend logic
            url: tikwmData.data.play, // Video without watermark
            thumbnail: tikwmData.data.cover,
            title: tikwmData.data.title,
            author: tikwmData.data.author?.nickname,
            music: tikwmData.data.music
          });
        }
        console.warn('TikWM failed, falling back to Cobalt...');
      } catch (err) {
        console.error('TikWM Error:', err.message);
      }
    }

    // --- FALLBACK TO COBALT (Universal) ---
    let lastError = 'Semua server sedang sibuk';
    for (const instance of COBALT_INSTANCES) {
      try {
        const response = await fetch(instance, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          body: JSON.stringify({
            url: url,
            videoQuality: String(quality || '720'),
            downloadMode: isAudioOnly ? 'audio' : 'video',
            filenameStyle: 'pretty',
          }),
          signal: AbortSignal.timeout(10000)
        });

        const data = await response.json().catch(() => null);

        if (response.ok && data) {
          return NextResponse.json(data);
        } else {
          lastError = (data && data.text) || `Server ${instance} error (${response.status})`;
          continue;
        }
      } catch (err) {
        lastError = err.message;
        continue;
      }
    }

    return NextResponse.json({ 
      status: 'error', 
      message: `Gagal memproses link: ${lastError}. Silakan coba lagi beberapa saat lagi.` 
    }, { status: 502 });

  } catch (error) {
    console.error('Global API Error:', error);
    return NextResponse.json({ status: 'error', message: 'Internal server error' }, { status: 500 });
  }
}
