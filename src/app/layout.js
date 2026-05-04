import "./globals.css";

export const metadata = {
  title: "Zero Downloader - Premium Video Downloader",
  description: "Download TikTok, YouTube, and Instagram Reels with ease.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Zero Downloader",
  },
};

export const viewport = {
  themeColor: "#1a0b2e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
