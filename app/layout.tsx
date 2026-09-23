import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Home Archive",
  description: "A living archive of home, garden, family and memory.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
