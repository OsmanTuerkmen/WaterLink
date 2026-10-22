import type { Metadata, Viewport } from "next";
import "@fontsource-variable/archivo/wdth.css";
import "@fontsource-variable/atkinson-hyperlegible-next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WaterLink · Does our water point work today?",
  description: "Last confirmed state of nearby water points and repairs that only count once tested on site. Hackathon prototype with simulated confirmations.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export const viewport: Viewport = { themeColor: "#f5c211" };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Without scripts nothing would ever refresh the server's snapshot, so ask the browser to load the page again. */}
        <noscript><meta httpEquiv="refresh" content="60" /></noscript>
      </head>
      <body>
        {children}
        {/* If the scripts have not started after 30 s (weak connection), load the page again instead of leaving an aging snapshot on screen. */}
        <script dangerouslySetInnerHTML={{ __html: "setTimeout(function(){if(!document.documentElement.dataset.hydrated)location.reload()},30000)" }} />
      </body>
    </html>
  );
}
