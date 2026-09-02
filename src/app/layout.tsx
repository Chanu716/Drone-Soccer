import type { Metadata } from "next";
import { Barlow_Condensed, Barlow } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { InteractiveMesh } from "@/components/common/InteractiveMesh";
import { ScrollProgressBar } from "@/components/common/ScrollProgressBar";

const barlowCondensed = Barlow_Condensed({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "700", "900"],
  display: "swap",
});

const barlow = Barlow({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Drone Soccer / SRM AP",
  description: "Drone Soccer at SRM University AP — A campus league launching Sep 2026.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${barlowCondensed.variable} ${barlow.variable}`}
    >
      <body style={{ margin: 0, background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-body), sans-serif" }}>
        <ScrollProgressBar />
        <InteractiveMesh />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
