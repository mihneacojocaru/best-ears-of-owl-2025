import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Music Challenge",
  description: "Vote for your favorite songs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
