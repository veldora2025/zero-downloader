'use client';

import React, { useState } from 'react';
import { Download, Link as LinkIcon, Music, Video, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFetch = async (e) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (data.status === 'error' || !response.ok) {
        throw new Error(data.message || 'Failed to fetch video');
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (link) => {
    window.open(link, '_blank');
  };

  return (
    <main className="container mx-auto px-4 py-12 min-h-screen flex flex-col items-center">
      {/* Hero Section */}
      <div className="text-center mb-12 animate-in fade-in duration-700">
        <h1 className="text-5xl md:text-7xl font-bold mb-4 text-gradient">
          Zero Downloader
        </h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
          Download your favorite TikTok, YouTube Shorts, and Instagram Reels in premium quality.
        </p>
      </div>

      {/* Input Section */}
      <form 
        onSubmit={handleFetch}
        className="w-full max-w-3xl glass p-2 flex flex-col md:flex-row gap-2 mb-12 transition-all duration-300 hover:shadow-[0_0_30px_rgba(157,78,221,0.2)]"
      >
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <LinkIcon size={20} className="text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Paste your link here..."
            className="input-glass pl-12 h-full"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="btn-primary min-w-[140px] h-[56px]"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Download size={20} />}
          {loading ? 'Processing...' : 'Download'}
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="w-full max-w-3xl glass border-red-500/30 p-4 mb-8 flex items-center gap-3 text-red-400">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {/* Result Section */}
      {result && (
        <div className="w-full max-w-3xl glass p-6 md:p-8 animate-in zoom-in-95 duration-500">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Thumbnail */}
            {result.thumbnail && (
              <div className="w-full md:w-1/3 shrink-0">
                <img 
                  src={result.thumbnail} 
                  alt="Thumbnail" 
                  className="rounded-xl w-full object-cover shadow-2xl"
                />
              </div>
            )}
            
            {/* Details & Actions */}
            <div className="flex-grow flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                  {result.title || 'Video found'}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                  <CheckCircle2 size={16} className="text-green-500" />
                  Ready to download
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Cobalt response might have 'url' directly for basic mode */}
                {result.url && (
                  <button 
                    onClick={() => handleDownload(result.url)}
                    className="btn-primary"
                  >
                    <Video size={18} />
                    Download Video
                  </button>
                )}
                
                {/* Sometimes Cobalt returns picker/multiple urls */}
                {result.picker && result.picker.map((item, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleDownload(item.url)}
                    className="btn-primary bg-opacity-20 hover:bg-opacity-30 border border-white/10"
                  >
                    <Download size={18} />
                    {item.type || 'Download'}
                  </button>
                ))}

                {/* If it's a music/mp3 focus, usually it has different response structure */}
                {/* Cobalt usually sends 'url' for the requested type */}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <footer className="mt-auto pt-12 text-gray-500 text-sm">
        <p>© 2026 Zero Downloader • Premium PWA Experience</p>
      </footer>

      <style jsx>{`
        .container {
          max-width: 1200px;
        }
      `}</style>
    </main>
  );
}
