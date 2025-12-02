import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/shared/shadcn/components/ui/sonner";
import "./globals.css";

const interRegular = Inter({
  variable: "--font-inter-regular",
  subsets: ["latin"],
  weight: "400",
});

const interSemiBold = Inter({
  variable: "--font-inter-semibold",
  subsets: ["latin"],
  weight: "600",
});

export const metadata: Metadata = {
  title: "Dish Go: 撮るだけ簡単!自動献立提案アプリ",
  description:
    "冷蔵庫やパントリーの食材を撮影して、最適な献立を提案します。一人暮らしを始めた方や忙しい方に最適なアプリです。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${interRegular.variable} ${interSemiBold.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
