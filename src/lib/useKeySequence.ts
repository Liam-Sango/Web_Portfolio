"use client";

import { useEffect, useRef } from "react";

// Fires `onMatch` when the user types `target` (case-insensitive) on the
// keyboard. Ignores keystrokes while focus is in an editable field (so the
// blog search box can't trigger it) and ignores keypresses with a modifier
// held. Buffer is kept in a ref so the listener identity stays stable.
export function useKeySequence(target: string, onMatch: () => void): void {
  const buffer = useRef("");
  const handler = useRef(onMatch);
  handler.current = onMatch;

  useEffect(() => {
    const want = target.toLowerCase();

    function isEditable(el: EventTarget | null): boolean {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName;
      return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        el.isContentEditable
      );
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.key.length !== 1) return; // ignore Enter, arrows, etc.
      if (isEditable(e.target)) return;

      const next = (buffer.current + e.key.toLowerCase()).slice(-want.length);
      buffer.current = next;
      if (next === want) {
        buffer.current = "";
        handler.current();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [target]);
}
