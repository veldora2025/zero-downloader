import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

const COBALT_INSTANCES = [
  'https://cobalt.omega.wolfy.love',
  'https://nuko-c.meowing.de',
  'https://cobaltapi.kittycat.boo'
];

// --- INSTAGRAM via RapidAPI (instagram-reels-downloader-api) ---
async function handleInstagram(url, isAudioOnly) {
  const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
  if (!RAPIDAPI_KEY) {
    throw new Error('RAPIDAPI_KEY belum dikonfigurasi di .env.local');
  }

  console.log('Detected Instagram, using RapidAPI (instagram-reels-downloader-api)...');
  
  const apiUrl = `https://instagram-reels-downloader-api.p.rapidapi.com/download?url=${encodeURIComponent(url)}`;
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': 'instagram-reels-downloader-api.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    signal: AbortSignal.timeout(15000)
  };

  const response = await fetch(apiUrl, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || `Instagram API error (${response.status})`);
  }

  if (data?.message === "You are not subscribed to this API.") {
      throw new Error('Anda belum men-subscribe API ini di RapidAPI. Silakan klik tombol Subscribe (Free) di halaman RapidAPI tersebut.');
  }

  // API pihak ketiga sering memiliki struktur berbeda. Kita cari link video-nya di dalam respon
  let downloadUrl = null;
  let mediaType = 'video';
  let thumbnail = data.data?.thumbnail || null;
  
  // Mencoba mengekstrak dari format 'instagram-reels-downloader-api'
  if (data.data?.medias && data.data.medias.length > 0) {
      if (isAudioOnly) {
          // Prioritaskan mencari tipe audio jika user memilih mode Audio Only
          const media = data.data.medias.find(m => m.type === 'audio') || data.data.medias[0];
          downloadUrl = media.url;
          mediaType = 'audio';
      } else {
          // Prioritaskan mencari tipe video
          const media = data.data.medias.find(m => m.type === 'video') || data.data.medias[0];
          downloadUrl = media.url;
          mediaType = media.type || 'video';
      }
  } 
  // Fallback ke kemungkinan format lainnya jika beda response
  else if (data.data?.video_url) downloadUrl = data.data.video_url;
  else if (data.download_url) downloadUrl = data.download_url;
  else if (Array.isArray(data.data) && data.data[0]?.url) downloadUrl = data.data[0].url;
  else if (data.download_links?.[0]?.url) downloadUrl = data.download_links[0].url;
  // Jangan gunakan data.data.url langsung karena ternyata itu berisi link Instagram asli, bukan link mp4

  if (!downloadUrl) {
    console.error('Instagram API Response:', JSON.stringify(data));
    throw new Error('Gagal mengekstrak link media dari respons API');
  }

  return NextResponse.json({
    status: 'redirect',
    url: downloadUrl,
    thumbnail: thumbnail,
    mediaType: mediaType,
    source: 'instagram-rapidapi'
  });
}

// --- TIKTOK via TikWM ---
async function handleTikTok(url) {
  console.log('Detected TikTok, using TikWM API...');
  
  const tikwmRes = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`, {
    signal: AbortSignal.timeout(10000)
  });
  const tikwmData = await tikwmRes.json();

  if (tikwmData.code === 0 && tikwmData.data) {
    return NextResponse.json({
      status: 'redirect',
      url: tikwmData.data.play, // Video without watermark
      thumbnail: tikwmData.data.cover,
      title: tikwmData.data.title,
      author: tikwmData.data.author?.nickname,
      music: tikwmData.data.music,
      source: 'tikwm'
    });
  }

  throw new Error('TikWM: Gagal memproses video TikTok');
}


// --- YOUTUBE via local yt-dlp (High Quality Download & Merge) ---
async function handleYoutube(url, quality, isAudioOnly) {
  console.log(`Detected YouTube, using local yt-dlp (High Quality Mode)... Quality: ${quality}`);
  const fs = require('fs');
  const path = require('path');
  
  try {
    const downloadsDir = path.join(process.cwd(), 'public', 'downloads');
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }

    const timestamp = Date.now();
    const ext = isAudioOnly ? 'm4a' : 'mp4';
    const filename = `yt_${timestamp}.${ext}`;
    const outputPath = path.join(downloadsDir, filename);

    const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";
    
    // Filter kualitas berdasarkan input dropdown user (contoh: 1080, 720, 480)
    const heightFilter = quality ? `[height<=${quality}]` : '';
    
    // Memaksa video ext=mp4 dan audio ext=m4a agar FFmpeg tidak re-encode yang menyebabkan audio hilang
    const formatSelection = isAudioOnly 
        ? 'bestaudio[ext=m4a]/bestaudio' 
        : `bestvideo[ext=mp4]${heightFilter}+bestaudio[ext=m4a]/best[ext=mp4]${heightFilter}/best`;
    
    // Gunakan --merge-output-format mp4 untuk memastikan hasil akhirnya selalu mp4 (hanya untuk video)
    const mergeArg = !isAudioOnly ? '--merge-output-format mp4' : '';
    // Tambahkan --js-runtimes node dan --remote-components ejs:github untuk memecahkan YouTube signature verification
    const baseArgs = `--no-playlist --js-runtimes node --remote-components ejs:github --extractor-args "youtube:player-client=android,web" --user-agent "${userAgent}" -f "${formatSelection}" ${mergeArg} -o "${outputPath}"`;
    
    const command = `python -m yt_dlp ${baseArgs} --cookies "cookies.txt" "${url}"`;
    
    console.log(`Downloading & Merging YouTube video to ${outputPath}... (This may take a while)`);
    try {
        await execPromise(command);
    } catch (e) {
        console.log("yt-dlp failed with cookies, trying without cookies...", e.message);
        const fallbackCmd = `python -m yt_dlp ${baseArgs} "${url}"`;
        await execPromise(fallbackCmd);
    }

    if (!fs.existsSync(outputPath)) {
      throw new Error('Gagal mendownload dan menggabungkan video. File tidak ditemukan.');
    }

    // Karena file disimpan di public/downloads, kita bisa langsung memberikan URL lokalnya
    const downloadUrl = `/downloads/${filename}`;
    const mediaType = isAudioOnly ? 'audio' : 'video';

    return NextResponse.json({
      status: 'redirect',
      url: downloadUrl,
      mediaType: mediaType,
      source: 'yt-dlp-local-hq'
    });
  } catch (error) {
    const errorMsg = error.stderr || error.message;
    throw new Error(`yt-dlp error: ${errorMsg}`);
  }
}

// --- OTHER SITES via Cobalt ---
async function handleCobalt(url, quality, isAudioOnly) {
  let lastError = 'Semua server sedang sibuk';

  for (const instance of COBALT_INSTANCES) {
    try {
      console.log(`Trying Cobalt instance: ${instance}...`);
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
        // Cobalt mengembalikan status "redirect" atau "tunnel" jika berhasil
        if (data.status === 'redirect' || data.status === 'tunnel') {
            return NextResponse.json({ ...data, source: 'cobalt' });
        } else if (data.status === 'error') {
            lastError = `Cobalt Error: ${data.error?.code || 'Unknown'}`;
            continue;
        }
      } else {
        lastError = (data && data.text) || `Server ${instance} error (${response.status})`;
        continue;
      }
    } catch (err) {
      lastError = err.message;
      continue;
    }
  }

  throw new Error(lastError);
}

// --- MAIN HANDLER ---
export async function POST(request) {
  try {
    const { url, quality, isAudioOnly } = await request.json();

    if (!url) {
      return NextResponse.json({ status: 'error', message: 'URL is required' }, { status: 400 });
    }

    // Route to the correct handler based on URL
    try {
      if (url.includes('tiktok.com')) {
        return await handleTikTok(url);
      }

      if (url.includes('instagram.com')) {
        return await handleInstagram(url, isAudioOnly);
      }

      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        return await handleYoutube(url, quality, isAudioOnly);
      }

      // Everything else → Cobalt API
      return await handleCobalt(url, quality, isAudioOnly);

    } catch (handlerError) {
      console.error('Handler Error:', handlerError.message);
      
      return NextResponse.json({
        status: 'error',
        message: `Gagal memproses link: ${handlerError.message}. Silakan coba lagi beberapa saat lagi.`
      }, { status: 502 });
    }

  } catch (error) {
    console.error('Global API Error:', error);
    return NextResponse.json({ status: 'error', message: 'Internal server error' }, { status: 500 });
  }
}
