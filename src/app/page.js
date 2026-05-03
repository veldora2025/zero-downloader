'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Download, Link as LinkIcon, Loader2, CheckCircle2, AlertCircle,
  Video, Music, Sparkles, Zap, Shield, Clock, Trash2, ExternalLink,
  Clipboard, Check, ChevronDown, X, History
} from 'lucide-react';

// ─── Platform Detection ───────────────────────────────────
function detectPlatform(url) {
  if (!url) return null;
  if (url.includes('tiktok.com')) return 'tiktok';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('instagram.com')) return 'instagram';
  return 'other';
}

const platformConfig = {
  tiktok: { name: 'TikTok', color: '#ff0050', icon: '🎵' },
  youtube: { name: 'YouTube', color: '#ff0000', icon: '▶️' },
  instagram: { name: 'Instagram', color: '#e1306c', icon: '📸' },
  other: { name: 'Link', color: '#9d4edd', icon: '🔗' },
};

// ─── History Helper ───────────────────────────────────────
function getHistory() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem('zero_dl_history') || '[]');
  } catch { return []; }
}

function addToHistory(item) {
  const history = getHistory();
  const newItem = { ...item, id: Date.now(), downloadedAt: new Date().toISOString() };
  const updated = [newItem, ...history].slice(0, 20); // Max 20 items
  localStorage.setItem('zero_dl_history', JSON.stringify(updated));
  return updated;
}

function clearHistory() {
  localStorage.removeItem('zero_dl_history');
  return [];
}

// ─── Quality Selector ─────────────────────────────────────
const qualityOptions = [
  { value: '2160', label: '4K', desc: 'Ultra HD' },
  { value: '1080', label: '1080p', desc: 'Full HD' },
  { value: '720', label: '720p', desc: 'HD' },
  { value: '480', label: '480p', desc: 'Standard' },
  { value: '360', label: '360p', desc: 'Low' },
];

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [quality, setQuality] = useState('720');
  const [downloadMode, setDownloadMode] = useState('video'); // 'video' | 'audio'
  const [copied, setCopied] = useState(false);
  const [showQuality, setShowQuality] = useState(false);
  const inputRef = useRef(null);
  const qualityRef = useRef(null);

  // Load history on mount
  useEffect(() => {
    setHistory(getHistory());
  }, []);

  // Close quality dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (qualityRef.current && !qualityRef.current.contains(e.target)) {
        setShowQuality(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const platform = detectPlatform(url);

  // ─── Paste from clipboard ─────────────────────────────
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  // ─── Fetch handler ────────────────────────────────────
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
        body: JSON.stringify({ url, quality, isAudioOnly: downloadMode === 'audio' }),
      });

      const data = await response.json();

      if (data.status === 'error' || !response.ok) {
        throw new Error(data.message || 'Gagal memproses video');
      }

      setResult(data);
      setHistory(addToHistory({
        url,
        title: data.title || 'Untitled',
        thumbnail: data.thumbnail || null,
        platform: platform,
        downloadUrl: data.url || null,
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (link) => {
    window.open(link, '_blank');
  };

  const handleClearHistory = () => {
    setHistory(clearHistory());
  };

  const handleHistoryClick = (item) => {
    setUrl(item.url);
    setShowHistory(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ═══ HEADER / NAV ═══ */}
      <header style={{
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: 1100,
        margin: '0 auto',
        width: '100%',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, var(--accent-violet), var(--accent-blue))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 800, color: '#fff',
          }}>Z</div>
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>
            Zero<span style={{ color: 'var(--accent-purple)' }}>DL</span>
          </span>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="btn-secondary"
          style={{ padding: '8px 16px', fontSize: 13, borderRadius: 10 }}
        >
          <History size={16} />
          History
          {history.length > 0 && (
            <span style={{
              background: 'var(--accent-violet)', color: '#fff',
              borderRadius: 100, padding: '2px 8px', fontSize: 11, fontWeight: 600,
            }}>{history.length}</span>
          )}
        </button>
      </header>

      {/* ═══ MAIN CONTENT ═══ */}
      <main style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '40px 20px 60px',
        maxWidth: 1100, margin: '0 auto', width: '100%',
      }}>
        {/* ── Hero ── */}
        <div className="animate-fade-in-up" style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 100,
            background: 'rgba(123, 47, 247, 0.12)', border: '1px solid rgba(123, 47, 247, 0.2)',
            fontSize: 13, fontWeight: 500, color: 'var(--accent-purple)', marginBottom: 24,
          }}>
            <Sparkles size={14} /> Premium Video Downloader
          </div>
          <h1 style={{
            fontSize: 'clamp(2.2rem, 6vw, 4rem)',
            fontWeight: 800, letterSpacing: '-0.03em',
            lineHeight: 1.1, marginBottom: 16,
          }}>
            <span className="text-gradient">Download Anything</span>
            <br />
            <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 300 }}>in seconds.</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 17, maxWidth: 500, margin: '0 auto', fontWeight: 300 }}>
            TikTok, YouTube Shorts, Instagram Reels — tanpa watermark, kualitas premium.
          </p>
        </div>

        {/* ── Input Bar ── */}
        <form
          onSubmit={handleFetch}
          className="animate-fade-in-up delay-200 glass"
          style={{
            width: '100%', maxWidth: 720,
            padding: 8, marginBottom: 20,
            display: 'flex', flexDirection: 'column', gap: 8,
            opacity: 0,
          }}
        >
          {/* Top row: input + paste */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <div style={{
                position: 'absolute', top: '50%', left: 18, transform: 'translateY(-50%)',
                display: 'flex', alignItems: 'center', pointerEvents: 'none',
              }}>
                {platform ? (
                  <span style={{ fontSize: 18 }}>{platformConfig[platform].icon}</span>
                ) : (
                  <LinkIcon size={18} style={{ color: 'rgba(255,255,255,0.2)' }} />
                )}
              </div>
              <input
                ref={inputRef}
                type="text"
                placeholder="Paste video link here..."
                className="input-glass"
                style={{ paddingLeft: 50 }}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={handlePaste}
              className="tooltip btn-secondary"
              data-tooltip="Paste from clipboard"
              style={{
                padding: '18px', borderRadius: 'var(--radius-md)', flexShrink: 0,
                border: '1px solid var(--glass-border)',
              }}
            >
              {copied ? <Check size={18} style={{ color: '#4ade80' }} /> : <Clipboard size={18} />}
            </button>
          </div>

          {/* Bottom row: quality + mode + download */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Quality selector */}
            <div ref={qualityRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setShowQuality(!showQuality)}
                className="btn-secondary"
                style={{ padding: '10px 16px', fontSize: 13, borderRadius: 10, gap: 6 }}
              >
                {qualityOptions.find(q => q.value === quality)?.label || '720p'}
                <ChevronDown size={14} style={{
                  transform: showQuality ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform 0.2s ease',
                }} />
              </button>
              {showQuality && (
                <div className="glass-solid animate-scale-in" style={{
                  position: 'absolute', top: 'calc(100% + 8px)', left: 0,
                  minWidth: 180, padding: 6, zIndex: 50, borderRadius: 14,
                }}>
                  {qualityOptions.map(q => (
                    <button
                      key={q.value} type="button"
                      onClick={() => { setQuality(q.value); setShowQuality(false); }}
                      style={{
                        display: 'flex', justifyContent: 'space-between', width: '100%',
                        padding: '10px 14px', border: 'none', borderRadius: 10,
                        background: quality === q.value ? 'rgba(123,47,247,0.15)' : 'transparent',
                        color: '#fff', cursor: 'pointer', fontSize: 14,
                        fontFamily: 'Outfit', transition: 'background 0.2s',
                      }}
                      onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseOut={e => e.currentTarget.style.background = quality === q.value ? 'rgba(123,47,247,0.15)' : 'transparent'}
                    >
                      <span style={{ fontWeight: 500 }}>{q.label}</span>
                      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>{q.desc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mode toggle */}
            <div style={{
              display: 'flex', borderRadius: 10,
              border: '1px solid var(--glass-border)', overflow: 'hidden',
            }}>
              {[{ key: 'video', Icon: Video, label: 'Video' }, { key: 'audio', Icon: Music, label: 'Audio' }].map(m => (
                <button
                  key={m.key} type="button"
                  onClick={() => setDownloadMode(m.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '10px 16px', border: 'none',
                    background: downloadMode === m.key ? 'rgba(123,47,247,0.2)' : 'transparent',
                    color: downloadMode === m.key ? '#fff' : 'rgba(255,255,255,0.4)',
                    cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: 'Outfit',
                    transition: 'all 0.2s',
                  }}
                >
                  <m.Icon size={15} />
                  {m.label}
                </button>
              ))}
            </div>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Download button */}
            <button
              type="submit"
              disabled={loading || !url}
              className="btn-primary"
              style={{ padding: '12px 28px', borderRadius: 10 }}
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Processing...</>
              ) : (
                <><Download size={18} /> Download</>
              )}
            </button>
          </div>
        </form>

        {/* ── Loading state ── */}
        {loading && (
          <div className="animate-fade-in" style={{ width: '100%', maxWidth: 720, marginBottom: 24 }}>
            <div className="progress-bar">
              <div className="progress-bar-indeterminate" style={{ width: '100%', height: '100%' }} />
            </div>
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13, marginTop: 12 }}>
              Memproses link dari {platformConfig[platform]?.name || 'server'}...
            </p>
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div className="animate-slide-down glass" style={{
            width: '100%', maxWidth: 720, padding: '16px 20px',
            marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12,
            borderColor: 'rgba(239, 68, 68, 0.2)',
          }}>
            <AlertCircle size={20} style={{ color: '#ef4444', flexShrink: 0 }} />
            <p style={{ color: '#fca5a5', fontSize: 14, flex: 1 }}>{error}</p>
            <button
              onClick={() => setError(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
            >
              <X size={16} style={{ color: 'rgba(255,255,255,0.3)' }} />
            </button>
          </div>
        )}

        {/* ── Result Card ── */}
        {result && (
          <div className="animate-scale-in glass" style={{
            width: '100%', maxWidth: 720, padding: 0,
            marginBottom: 40, overflow: 'hidden', opacity: 0,
          }}>
            {/* Thumbnail hero */}
            {result.thumbnail && (
              <div style={{
                position: 'relative', width: '100%', height: 220, overflow: 'hidden',
              }}>
                <img
                  src={result.thumbnail}
                  alt="Video thumbnail"
                  style={{
                    width: '100%', height: '100%', objectFit: 'cover',
                    filter: 'brightness(0.6)',
                  }}
                />
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  height: '60%',
                  background: 'linear-gradient(to top, rgba(5,5,8,1) 0%, transparent 100%)',
                }} />
                {platform && (
                  <div style={{
                    position: 'absolute', top: 16, left: 16,
                  }}>
                    <span className={`chip chip-${platform}`}>
                      {platformConfig[platform].icon} {platformConfig[platform].name}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Info + actions */}
            <div style={{ padding: '20px 28px 28px' }}>
              <div style={{ marginBottom: 20 }}>
                <h3 style={{
                  fontSize: 20, fontWeight: 600, marginBottom: 6,
                  overflow: 'hidden', textOverflow: 'ellipsis',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                }}>
                  {result.title || 'Video siap diunduh'}
                </h3>
                {result.author && (
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
                    oleh {result.author}
                  </p>
                )}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  marginTop: 10, color: '#4ade80', fontSize: 13, fontWeight: 500,
                }}>
                  <CheckCircle2 size={15} />
                  Siap untuk diunduh
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {result.url && (
                  <button
                    onClick={() => handleDownload(result.url)}
                    className="btn-primary"
                    style={{ flex: 1, minWidth: 160 }}
                  >
                    <Download size={18} />
                    {downloadMode === 'audio' ? 'Download Audio' : 'Download Video'}
                  </button>
                )}
                {result.music && (
                  <button
                    onClick={() => handleDownload(result.music)}
                    className="btn-secondary"
                    style={{ flex: 1, minWidth: 140 }}
                  >
                    <Music size={18} />
                    Download Audio
                  </button>
                )}
                {result.picker && result.picker.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleDownload(item.url)}
                    className="btn-secondary"
                    style={{ flex: 1, minWidth: 120 }}
                  >
                    <Download size={16} />
                    {item.type || `Download ${idx + 1}`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Features Grid (only when no result) ── */}
        {!result && !loading && (
          <div className="animate-fade-in-up delay-400" style={{
            width: '100%', maxWidth: 720, marginTop: 24, opacity: 0,
          }}>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 14,
            }}>
              {[
                { icon: Zap, title: 'Super Cepat', desc: 'Proses download hanya dalam hitungan detik' },
                { icon: Shield, title: 'Tanpa Watermark', desc: 'Video bersih tanpa watermark mengganggu' },
                { icon: Music, title: 'Extract Audio', desc: 'Ambil audio/musik dari video favorit' },
                { icon: Sparkles, title: 'Kualitas Premium', desc: 'Pilih resolusi hingga 4K Ultra HD' },
              ].map((f, i) => (
                <div key={i} className="feature-card">
                  <div className="feature-icon">
                    <f.icon size={22} />
                  </div>
                  <h4 style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>{f.title}</h4>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, lineHeight: 1.5 }}>{f.desc}</p>
                </div>
              ))}
            </div>

            {/* Supported platforms */}
            <div style={{
              display: 'flex', justifyContent: 'center', gap: 10,
              marginTop: 32, flexWrap: 'wrap',
            }}>
              {[
                { name: 'TikTok', cls: 'chip-tiktok' },
                { name: 'YouTube Shorts', cls: 'chip-youtube' },
                { name: 'Instagram Reels', cls: 'chip-instagram' },
              ].map(p => (
                <span key={p.name} className={`chip ${p.cls}`}>
                  {p.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ═══ HISTORY PANEL (Slide-in) ═══ */}
      {showHistory && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setShowHistory(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
              zIndex: 90, animation: 'fadeIn 0.2s ease',
            }}
          />
          {/* Panel */}
          <div className="glass-solid animate-slide-down" style={{
            position: 'fixed', top: 16, right: 16, width: 380, maxWidth: 'calc(100vw - 32px)',
            maxHeight: 'calc(100vh - 32px)', zIndex: 100,
            borderRadius: 'var(--radius-lg)', padding: 24,
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: 20,
            }}>
              <h3 style={{ fontWeight: 600, fontSize: 17 }}>
                <History size={18} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 8 }} />
                Download History
              </h3>
              <div style={{ display: 'flex', gap: 8 }}>
                {history.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'rgba(255,255,255,0.3)', fontSize: 12,
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}
                  >
                    <Trash2 size={13} /> Clear
                  </button>
                )}
                <button
                  onClick={() => setShowHistory(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                >
                  <X size={18} style={{ color: 'rgba(255,255,255,0.5)' }} />
                </button>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {history.length === 0 ? (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', padding: 40, color: 'rgba(255,255,255,0.2)',
                }}>
                  <Clock size={32} style={{ marginBottom: 12 }} />
                  <p style={{ fontSize: 14 }}>Belum ada riwayat download</p>
                </div>
              ) : (
                history.map(item => (
                  <div
                    key={item.id}
                    className="history-item"
                    onClick={() => handleHistoryClick(item)}
                  >
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt="" className="history-thumb" />
                    ) : (
                      <div className="history-thumb" style={{
                        background: 'var(--glass-bg)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontSize: 22,
                      }}>
                        {platformConfig[item.platform]?.icon || '🔗'}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontWeight: 500, fontSize: 14,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {item.title}
                      </p>
                      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 2 }}>
                        {new Date(item.downloadedAt).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <ExternalLink size={14} style={{ color: 'rgba(255,255,255,0.15)', flexShrink: 0 }} />
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* ═══ FOOTER ═══ */}
      <footer style={{
        textAlign: 'center', padding: '24px 20px',
        color: 'rgba(255,255,255,0.15)', fontSize: 13, fontWeight: 300,
      }}>
        <p>© 2026 Zero Downloader · Built with 💜</p>
      </footer>
    </div>
  );
}
