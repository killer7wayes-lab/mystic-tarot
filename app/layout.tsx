// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mystic Tarot ✦ AI",
  description: "Pick cards and get a direct, no-fluff AI tarot interpretation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#050314] text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
