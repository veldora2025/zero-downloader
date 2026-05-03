import "./globals.css";

export const metadata = {
  title: "Zero Downloader - Premium Video Downloader",
  description: "Download TikTok, YouTube Shorts, and Instagram Reels with ease.",
  manifest: "/manifest.json",
  themeColor: "#1a0b2e",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Zero Downloader",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
