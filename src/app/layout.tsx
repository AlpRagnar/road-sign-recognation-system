import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Traffic Sign Mapping",
  description: "AI-Based Traffic Sign Detection, Localization and Map Dashboard System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
