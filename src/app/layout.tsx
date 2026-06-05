import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Liam Sango — Portfolio & Resume",
  description:
    "Portfolio and resume website for Liam Sango — developer and designer.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🖥️</text></svg>" />
      </head>
      <body>{children}</body>
    </html>
  );
}
