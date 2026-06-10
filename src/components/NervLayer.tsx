"use client";

import BootSequence from "@/components/BootSequence";
import Hud from "@/components/Hud";
import { useKeySequence } from "@/lib/useKeySequence";
import { useNervMode } from "@/lib/useNervMode";

// Gates the NERV "flavor" layers. The professional theme is the default; typing
// `nerv` (or clicking the footer glyph) toggles the boot sequence + HUD overlay
// and the `data-nerv` skin on/off. State lives in useNervMode (sessionStorage),
// shared with the footer toggle.
export default function NervLayer() {
  const { enabled, toggle } = useNervMode();

  useKeySequence("nerv", toggle);

  if (!enabled) return null;

  return (
    <>
      <BootSequence />
      <Hud />
    </>
  );
}
