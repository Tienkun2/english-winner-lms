import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "English Winner – For a Better Future",
  description: "Trung tâm tiếng Anh English Winner – Nơi học tiếng Anh chuyên nghiệp, hiệu quả và truyền cảm hứng.",
  icons: {
    icon: "/Logo.jpg?v=2",
    apple: "/Logo.jpg?v=2",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={inter.variable} data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
