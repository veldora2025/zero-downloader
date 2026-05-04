# Zero Downloader

Zero Downloader adalah web app modern berbasis **Next.js** untuk mendownload media dari YouTube (hingga 4K), TikTok (tanpa watermark), dan Instagram Reels dengan cepat dan gratis.

Karena proyek ini menggunakan eksekusi server-side lokal untuk melewati batasan API, Anda memerlukan beberapa pengaturan khusus sebelum menjalankan aplikasi ini di komputer/server Anda.

---

## 🛠️ Prasyarat Sistem

Pastikan komputer/server Anda sudah menginstal perangkat lunak berikut:

1. **Node.js** (v18 atau lebih baru) - Untuk menjalankan Next.js.
2. **Python** (v3.8 atau lebih baru) - Dibutuhkan oleh `yt-dlp`.
3. **FFmpeg** - **SANGAT PENTING**. Dibutuhkan oleh `yt-dlp` untuk menggabungkan format Video Resolusi Tinggi (1080p+) dan Audio menjadi satu file MP4.
   - *Windows:* Download dari [gyan.dev](https://www.gyan.dev/ffmpeg/builds/), lalu masukkan path `bin`-nya ke System Environment Variables.
   - *Mac:* `brew install ffmpeg`
   - *Linux:* `sudo apt install ffmpeg`
4. **yt-dlp** - Library Python untuk mendownload video YouTube.
   - Install via terminal: `pip install -U yt-dlp`

---

## 🚀 Panduan Instalasi & Setup

### 1. Clone & Install Dependencies
Clone repositori ini, lalu install semua paket Node.js.
```bash
git clone <url-repo-anda>
cd zero-downloader
npm install
```

### 2. Siapkan API Key (Untuk Instagram)
Instagram downloader menggunakan RapidAPI. Anda harus membuat file konfigurasi rahasia.
1. Buat file baru bernama `.env.local` di folder paling luar (sejajar dengan `package.json`).
2. Isi file tersebut dengan format berikut:
```env
RAPIDAPI_KEY=masukkan_api_key_rapidapi_anda_disini
```
*(Anda bisa mendapatkan API Key gratis dengan mendaftar di RapidAPI dan mensubscribe "instagram-reels-downloader-api")*

### 3. Siapkan Cookies YouTube (Wajib untuk Kestabilan)
Agar `yt-dlp` tidak diblokir oleh YouTube (menghindari error bot/age-restriction), Anda **wajib** menyertakan cookie dari sesi YouTube asli.

1. Buka browser Chrome/Firefox di komputer Anda.
2. Install ekstensi browser **"Get cookies.txt LOCALLY"**.
3. Buka halaman [YouTube](https://www.youtube.com) dan pastikan Anda sudah login menggunakan akun (disarankan akun sekunder/tumbal).
4. Klik ekstensi tersebut, lalu pilih tombol **Export**.
5. Simpan file yang didownload dengan nama `cookies.txt`.
6. Pindahkan file `cookies.txt` tersebut ke **folder paling luar (root) project ini** (sejajar dengan `package.json`).

*Catatan: File `cookies.txt` dan `.env.local` otomatis diblokir oleh GitHub agar rahasia Anda tidak bocor ke publik.*

---

## 💻 Cara Menjalankan Aplikasi

Setelah semua langkah di atas selesai, jalankan server pengembangan (development server):

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

### Cara Kerja Arsitektur:
- **YouTube:** Menggunakan eksekusi lokal `yt-dlp` di server. Mengunduh video + audio terbaik, lalu me-render penggabungannya (merge) dengan `ffmpeg` ke dalam folder `public/downloads/`. Mendukung Bypass JS Challenge secara dinamis.
- **TikTok:** Menggunakan API publik TikWM.
- **Instagram:** Menggunakan API dari RapidAPI.
- **Lain-lain:** Dialihkan ke Cobalt Fallback API.

## ⚠️ Troubleshooting
- **Error: Requested format is not available** pada YouTube: Berarti kualitas yang Anda pilih (misal 4K) tidak tersedia untuk video tersebut. Coba turunkan ke 1080p atau 720p.
- **Video Bisu (Tanpa Suara):** Pastikan **FFmpeg** sudah terinstal dan terbaca di System Path Anda. Jika FFmpeg tidak ada, `yt-dlp` gagal menggabungkan audio dan video.
- **Signature Solving Failed:** YouTube baru saja mengganti sistem proteksinya. Lakukan update pada yt-dlp dengan mengetik perintah `pip install -U yt-dlp` di terminal Anda.
