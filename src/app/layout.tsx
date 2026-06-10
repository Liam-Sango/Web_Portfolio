import type { Metadata } from "next";
import {
  Chakra_Petch,
  Saira,
  JetBrains_Mono,
  Space_Grotesk,
  IBM_Plex_Sans,
  IBM_Plex_Mono,
} from "next/font/google";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import NervLayer from "@/components/NervLayer";
import "@/app/globals.css";

// ---- NERV mode faces (angular terminal identity) ----
const chakra = Chakra_Petch({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-chakra",
  weight: ["400", "500", "600", "700"],
});
const saira = Saira({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-saira",
  weight: ["400", "500", "600", "700"],
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
});

// ---- Professional theme faces (Graphite & Phosphor) ----
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-grotesk",
  weight: ["400", "500", "600", "700"],
});
const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plex-sans",
  weight: ["400", "500", "600"],
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plex-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Liam Sango — Aspiring Cybersecurity Professional",
  description:
    "Portfolio of Liam Sango — an aspiring cybersecurity professional and IT student building small tools and security projects.",
  openGraph: {
    title: "Liam Sango — Aspiring Cybersecurity Professional",
    description:
      "Portfolio of Liam Sango — an aspiring cybersecurity professional and IT student building small tools and security projects.",
    type: "website",
  },
};

// "LS" glyph favicon — NERV-style: hazard-orange mark on black with a
// notched (cut-corner) frame.
const FAVICON =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>` +
      `<polygon points='4,4 78,4 96,22 96,96 22,96 4,78' fill='%230a0a0b' stroke='%232bff88' stroke-width='4'/>` +
      `<text x='50' y='70' font-size='50' font-family='Arial, sans-serif' font-weight='700' text-anchor='middle' fill='%232bff88'>LS</text>` +
      `</svg>`,
  );

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${plexSans.variable} ${plexMono.variable} ${chakra.variable} ${saira.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        {/* Set the light/dark theme before first paint to avoid a flash. Reads
            the saved choice, else the OS preference. Does NOT touch data-nerv. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('theme');" +
              "if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}" +
              "document.documentElement.setAttribute('data-theme',t);}" +
              "catch(e){document.documentElement.setAttribute('data-theme','dark');}})();",
          }}
        />
        <link rel="icon" href={FAVICON} />
      </head>
      <body>
        <NervLayer />
        <NavBar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
