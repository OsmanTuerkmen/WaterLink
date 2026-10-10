import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WaterLink · Funktioniert unsere Wasserstelle heute?",
  description: "Zuletzt bestätigte Betriebszustände und nachvollziehbare Reparaturen. Private Hackathon-Demo mit fiktiven Beispieldaten.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="antialiased">{children}</body>
    </html>
  );
}
