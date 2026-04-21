import type { Metadata } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Aura Clarity",
  description:
    "Mobilna aplikacja do wpisywania czasu przed ekranem, własnych sesji i przeglądania statystyk organizacji.",
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
