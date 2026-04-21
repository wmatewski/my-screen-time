import type { Metadata } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Wojticore Flowa",
  description:
    "Open-source SaaS do tworzenia sesji screen time, udostępniania krótkich linków i śledzenia raportów live.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
