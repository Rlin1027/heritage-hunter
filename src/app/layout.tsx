import type { Metadata } from "next";
import { Orbitron, Space_Mono, Cinzel, Libre_Baskerville } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";

// Cyberpunk fonts
const orbitron = Orbitron({
  variable: "--font-cyber-display",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const spaceMono = Space_Mono({
  variable: "--font-cyber-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

// Indiana Jones fonts
const cinzel = Cinzel({
  variable: "--font-indiana-display",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const libreBaskerville = Libre_Baskerville({
  variable: "--font-indiana-body",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Heritage Hunter - Taiwan Unclaimed Land Tracker",
  description: "Track and hunt down unclaimed land heritage across Taiwan's cities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${orbitron.variable} ${spaceMono.variable} ${cinzel.variable} ${libreBaskerville.variable} antialiased`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
