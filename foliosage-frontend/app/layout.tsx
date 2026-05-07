import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FolioSage — Your portfolio talks back",
  description: "AI-powered portfolio platform. Upload your work, let visitors chat with your portfolio, and get creation certificates for every file.",
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
