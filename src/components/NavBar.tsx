"use client";

import { useState } from "react";

const NAV_ITEMS = [
  { id: "about", label: "About Me", icon: "📋" },
  { id: "projects", label: "Projects", icon: "💾" },
  { id: "blog", label: "Blog", icon: "📝" },
];

export default function NavBar() {
  const [active, setActive] = useState("about");

  return (
    <nav className="win-navbar" role="navigation" aria-label="Site sections">
      <div className="site-container nav-inner">
        <a href="#hero" className="nav-brand" onClick={() => setActive("")}>
          🖥️ Liam Sango
        </a>

        <div className="nav-links">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`win-btn nav-btn${active === item.id ? " nav-btn--active" : ""}`}
              onClick={() => setActive(item.id)}
              aria-current={active === item.id ? "true" : undefined}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </div>

        {/* Mobile hamburger placeholder — Win98 style compact nav */}
        <div className="nav-mobile" role="group" aria-label="Mobile navigation">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="win-btn nav-btn-mobile"
              aria-label={item.label}
            >
              {item.icon}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
