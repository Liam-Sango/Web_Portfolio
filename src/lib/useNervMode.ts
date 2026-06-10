"use client";

import { useEffect } from "react";
import { createStore } from "@/lib/createStore";

const STORAGE_KEY = "nerv-mode";

// Default false (SSR-safe: first render is always false, so server and client
// markup match). An effect re-enables if this session previously turned it on.
const nervStore = createStore<boolean>(false);

function applyNerv(on: boolean) {
  const el = document.documentElement;
  if (on) el.setAttribute("data-nerv", "");
  else el.removeAttribute("data-nerv");
}

export function useNervMode() {
  const enabled = nervStore.useValue();

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") {
        nervStore.set(true);
        applyNerv(true);
      }
    } catch {
      /* sessionStorage unavailable — stay disabled */
    }
  }, []);

  const toggle = () => {
    const next = !nervStore.get();
    nervStore.set(next);
    applyNerv(next);
    try {
      if (next) sessionStorage.setItem(STORAGE_KEY, "1");
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  return { enabled, toggle };
}
