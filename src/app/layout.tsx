import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Symoria — AI-Powered DeFi Platform",
  description: "Autonomous AI agents optimize yield, manage liquidity, and execute trades with full on-chain verifiability.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;1,400;1,500&family=IBM+Plex+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
