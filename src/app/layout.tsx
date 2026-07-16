import type { Metadata } from "next";
import {
  Space_Grotesk,
  IBM_Plex_Sans,
  IBM_Plex_Mono,
} from "next/font/google";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import "@/app/globals.css";

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

// "LS" glyph favicon — accent mark on the site's dark panel color.
const FAVICON =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>` +
      `<rect x='4' y='4' width='92' height='92' rx='12' fill='%2314161a' stroke='%235fae86' stroke-width='4'/>` +
      `<text x='50' y='70' font-size='50' font-family='Arial, sans-serif' font-weight='700' text-anchor='middle' fill='%235fae86'>LS</text>` +
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
      className={`${spaceGrotesk.variable} ${plexSans.variable} ${plexMono.variable}`}
    >
      <head>
        {/* Set the light/dark theme before first paint to avoid a flash. Reads
            the saved choice, else the OS preference. */}
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
        <NavBar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
