import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";

const lexend = Lexend({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gesture Detect Demo",
  description: "Minimal demo of gesture detection with Google Mediapipe + NextJS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={lexend.className}>
      <body
        className="text-white"
      >
        {children}
      </body>
    </html>
  );
}
