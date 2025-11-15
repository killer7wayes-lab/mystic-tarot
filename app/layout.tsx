import "./globals.css";
import ClientSW from "./ClientSW";

export const metadata = {
  title: "Mystic Tarot ✦ AI",
  description: "Pick a spread, choose a deck, let AI interpret.",
  manifest: "/manifest.webmanifest"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-mysticBg text-white">
        <ClientSW />
        {children}
      </body>
    </html>
  );
}
