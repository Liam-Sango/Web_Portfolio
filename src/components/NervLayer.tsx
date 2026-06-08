"use client";

import { useEffect, useState } from "react";
import BootSequence from "@/components/BootSequence";
import Hud from "@/components/Hud";
import { useKeySequence } from "@/lib/useKeySequence";

// Gate for the NERV "flavor" layers. Default is a clean professional
// portfolio; typing `nerv` toggles the boot sequence + HUD overlay on/off.
// State lives in sessionStorage so it survives same-tab reloads but resets in
// a new tab / fresh browser.
const STORAGE_KEY = "nerv-mode";

export default function NervLayer() {
  // Always false on first render so server and client markup match; an effect
  // re-enables after mount if this session previously turned it on.
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") setEnabled(true);
    } catch {
      /* sessionStorage unavailable — stay disabled */
    }
  }, []);

  useKeySequence("nerv", () => {
    setEnabled((on) => {
      const next = !on;
      try {
        if (next) sessionStorage.setItem(STORAGE_KEY, "1");
        else sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
      return next;
    });
  });

  if (!enabled) return null;

  return (
    <>
      <BootSequence />
      <Hud />
    </>
  );
}
