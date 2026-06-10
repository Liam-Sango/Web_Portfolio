"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "@/lib/useTheme";

const NAV_ITEMS = [
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "blog", label: "Blog" },
  { id: "contact", label: "Contact" },
] as const;

export type SectionId = (typeof NAV_ITEMS)[number]["id"];

// Two-digit mono index shown before each tab label (01..06).
const pad2 = (n: number) => String(n + 1).padStart(2, "0");

export default function NavBar() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  // On the home page the active section is driven by the URL hash; on detail
  // pages it's derived from the path (e.g. /blog/* → "blog").
  const [hash, setHash] = useState("");
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const sync = () => setHash(window.location.hash.replace(/^#/, ""));
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [pathname]);

  let active: SectionId | "" = "";
  if (pathname.startsWith("/blog")) {
    active = "blog";
  } else if (pathname.startsWith("/projects")) {
    active = "projects";
  } else if (NAV_ITEMS.some((item) => item.id === hash)) {
    active = hash as SectionId;
  }

  return (
    <nav className="nav" role="navigation" aria-label="Site sections">
      <div className="site-container nav-inner">
        {/* On home, a plain anchor (`#`) fires hashchange without a reload;
            from a detail page, a real Link navigates back home. */}
        {onHome ? (
          <a className="nav-brand" href="#" aria-label="Home">
            <span className="brand-mark">LS</span>
            <span className="brand-name">Liam Sango</span>
          </a>
        ) : (
          <Link className="nav-brand" href="/" aria-label="Home">
            <span className="brand-mark">LS</span>
            <span className="brand-name">Liam Sango</span>
          </Link>
        )}

        <div className="nav-tabs">
          {NAV_ITEMS.map((item, i) => {
            const className = `nav-tab${
              active === item.id ? " nav-tab--active" : ""
            }`;
            const current = active === item.id ? "page" : undefined;
            const inner = (
              <>
                <span className="nav-tab-index" aria-hidden="true">
                  {pad2(i)}
                </span>
                {item.label}
              </>
            );
            // Same-page hash anchors fire `hashchange` (Next <Link> uses
            // pushState, which does not) — so the home page must use <a>.
            return onHome ? (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={className}
                aria-current={current}
              >
                {inner}
              </a>
            ) : (
              <Link
                key={item.id}
                href={`/#${item.id}`}
                className={className}
                aria-current={current}
              >
                {inner}
              </Link>
            );
          })}

          <button
            type="button"
            className="theme-toggle"
            onClick={toggle}
            aria-label={
              theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
            }
            title="Toggle light/dark theme"
          >
            <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
