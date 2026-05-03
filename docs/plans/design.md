# Project Design Document: Zero Downloader (Hard-Gate)

> [!IMPORTANT]
> Dokumen ini adalah Single Point of Truth untuk desain sistem. Seluruh implementasi kode wajib merujuk pada spesifikasi di bawah ini.

## 1. Project Overview
- **Nama Proyek**: Zero Downloader
- **Tujuan**: Aplikasi PWA premium untuk mendownload video TikTok, YouTube Shorts, dan Instagram Reels tanpa watermark.
- **Target User**: Personal Use (Penggunaan Pribadi).
- **Aesthetic Theme**: "Lyric AI" Style (Deep Purple, Glassmorphism, Neon Glow).

## 2. Arsitektur Sistem (Opsi 1: API-Powered)
- **Frontend**: Next.js 15 (App Router).
- **Styling**: Vanilla CSS (Premium Aesthetics) + Lucide Icons.
- **Backend (Proxy)**: Netlify Functions (Node.js) sebagai jembatan ke API eksternal.
- **API Downloader**: Cobalt API (atau layanan sejenis yang stabil).
- **Deployment**: Netlify (Frontend & Functions).
- **PWA**: Installable web app dengan manifest dan service worker.

## 3. Fitur Utama
1. **Multi-Platform Support**: TikTok (No Watermark), YouTube Shorts, Instagram Reels.
2. **Quality Selection**: Memilih resolusi video jika tersedia.
3. **Audio Extraction**: Opsi download format MP3.
4. **Premium UI**: 
   - Dark Mode (Deep Purple/Black).
   - Efek Glassmorphism pada Input Bar dan Cards.
   - Micro-animations (Glow effects, smooth transitions).
   - Preview video sebelum download.

## 4. UI/UX Design System
- **Color Palette**: 
  - Background: `#050505` (Deep Black) ke `#1a0b2e` (Deep Purple) gradient.
  - Accent: `#9d4edd` (Purple Glow), `#4895ef` (Neon Blue).
  - Surface: `rgba(255, 255, 255, 0.05)` dengan `backdrop-filter: blur(10px)`.
- **Typography**: Google Fonts (Outfit).
- **Components**:
  - `Hero`: Judul besar dengan gradasi warna + Input bar transparan.
  - `ProcessingCard`: Animasi loading saat fetching data.
  - `ResultCard`: Thumbnail video, Title, dan Grid tombol Download.

## 5. Alur Data (Data Flow)
1. User paste URL -> `POST /api/fetch` (Netlify Function).
2. Function memvalidasi URL -> Request ke Cobalt API.
3. Cobalt API return metadata & download links.
4. Frontend menampilkan `ResultCard` -> User klik Download.

## 6. Verification Plan
- [ ] **PWA Audit**: Memastikan skor Lighthouse PWA tinggi.
- [ ] **Functional Test**: Verifikasi download TikTok tanpa watermark berhasil.
- [ ] **UI Verification**: Menggunakan Browser Agent untuk memastikan estetika sesuai referensi Lyric AI.
- [ ] **Responsiveness**: Berjalan sempurna di Mobile (iOS/Android) dan Desktop.
