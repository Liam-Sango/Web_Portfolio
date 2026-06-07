import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "@/app/globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono-jb",
});

export const metadata: Metadata = {
  title: "Liam Sango — Full-Stack Developer",
  description:
    "Portfolio and resume of Liam Sango — a full-stack developer building fast, thoughtful web applications.",
  openGraph: {
    title: "Liam Sango — Full-Stack Developer",
    description:
      "Portfolio and resume of Liam Sango — a full-stack developer building fast, thoughtful web applications.",
    type: "website",
  },
};

// Gradient "LS" glyph favicon (violet → cyan), matching the site accent.
const FAVICON =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>` +
      `<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>` +
      `<stop offset='0' stop-color='%238b5cf6'/><stop offset='1' stop-color='%2322d3ee'/>` +
      `</linearGradient></defs>` +
      `<rect width='100' height='100' rx='22' fill='url(%23g)'/>` +
      `<text x='50' y='68' font-size='52' font-family='Arial, sans-serif' font-weight='800' text-anchor='middle' fill='white'>LS</text>` +
      `</svg>`,
  );

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="icon" href={FAVICON} />
      </head>
      <body>{children}</body>
    </html>
  );
}
