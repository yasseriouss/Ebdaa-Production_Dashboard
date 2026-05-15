import type { Metadata } from "next";
import { Geist_Mono, Noto_Sans_Arabic } from "next/font/google";

import { StoreHydration } from "@/components/providers/store-hydration";

import "./globals.css";

const notoArabic = Noto_Sans_Arabic({
  variable: "--font-sans",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "مصنع الأخشاب — أوامر العمل",
  description: "لوحة متابعة أوامر العمل ومسار الإنتاج",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${notoArabic.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="bg-background text-foreground min-h-full flex flex-col">
        <StoreHydration />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
