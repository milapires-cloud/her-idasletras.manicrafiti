import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import VoiceProvider from "@/components/VoiceProvider";
import PwaInstaller from "@/components/PwaInstaller";

export const metadata: Metadata = {
  title: "MANICRAFITI — Herói da Leitura",
  description:
    "Jogo de alfabetização fônica em 15 dias com monstros, voz, missões e painel dos pais.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MANICRAFITI",
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#5aab3a",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="MANICRAFITI" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="text-white antialiased min-h-screen mc-sky overscroll-none">
        <VoiceProvider>
          {children}
          <PwaInstaller />
        </VoiceProvider>
      </body>
    </html>
  );
}
