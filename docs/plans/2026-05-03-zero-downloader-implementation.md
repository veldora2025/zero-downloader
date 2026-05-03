# Zero Downloader Implementation Plan

> **For Antigravity:** REQUIRED SUB-SKILL: Load executing-plans to implement this plan task-by-task.

**Goal:** Membangun PWA Video Downloader premium untuk penggunaan pribadi yang mendukung TikTok, YouTube, dan Instagram menggunakan Next.js dan Cobalt API.

**Architecture:** Frontend Next.js yang memanggil Netlify Functions sebagai proxy aman ke Cobalt API eksternal untuk menghindari CORS dan menjaga privasi request.

**Tech Stack:** Next.js 15, Vanilla CSS, Lucide Icons, Netlify Functions, Cobalt API.

---

### Task 1: Project Scaffolding
**Files:**
- Create: `package.json`, `next.config.mjs`, `public/manifest.json`
- Create: `app/layout.js`, `app/page.js`

**Step 1: Inisialisasi Next.js**
Run: `npx create-next-app@latest . --js --tailwind false --eslint --app --src-dir false --import-alias "@/*" --use-npm --yes`
Expected: Folder struktur Next.js terbentuk di direktori aktif.

**Step 2: Install Dependencies**
Run: `npm install lucide-react`
Expected: Berhasil terinstall.

**Step 3: Commit**
```bash
git add .
git commit -m "chore: initial next.js scaffold"
```

### Task 2: Netlify Function Proxy (`/api/fetch`)
**Files:**
- Create: `app/api/fetch/route.js`

**Step 1: Implementasi Proxy ke Cobalt API**
```javascript
// app/api/fetch/route.js
export async function POST(req) {
  try {
    const { url, isAudioOnly, quality } = await req.json();
    const res = await fetch("https://api.cobalt.tools/api/json", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "Accept": "application/json" 
      },
      body: JSON.stringify({ 
        url, 
        vQuality: quality || "720",
        isAudioOnly: isAudioOnly || false
      })
    });
    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    return Response.json({ status: "error", message: error.message }, { status: 500 });
  }
}
```

**Step 2: Commit**
```bash
git add .
git commit -m "feat: add api fetch proxy"
```

### Task 3: Premium UI (Lyric AI Aesthetic)
**Files:**
- Modify: `app/globals.css`
- Modify: `app/page.js`

**Step 1: Implementasi Design System**
Gunakan CSS Variables untuk warna Deep Purple dan Glassmorphism blur di `globals.css`.

**Step 2: Build Hero & Input Section**
Implementasi input bar transparan dengan glow effect di `app/page.js`.

**Step 3: Commit**
```bash
git add .
git commit -m "feat: implement lyric-ai premium ui"
```

### Task 4: PWA Configuration
**Files:**
- Create: `public/manifest.json`
- Modify: `app/layout.js`

**Step 1: Tambahkan Meta Tags & Manifest**
Pastikan aplikasi terdeteksi sebagai PWA di `app/layout.js`.

**Step 2: Commit**
```bash
git add .
git commit -m "feat: add pwa support"
```

### Task 5: Final Verification
**Step 1: Run dev server**
Run: `npm run dev`
Expected: App running on localhost:3000.

**Step 2: Manual Check**
Verifikasi download TikTok tanpa watermark.
