import { useSyncExternalStore } from "react";

// Minimal shared reactive store. Lets multiple components read and drive the
// same value and re-render together — used by the theme and NERV-mode hooks so
// the nav toggle, the footer glyph, and the keyword listener stay in sync.
export interface Store<T> {
  get: () => T;
  set: (next: T | ((prev: T) => T)) => void;
  subscribe: (onChange: () => void) => () => void;
  useValue: () => T;
}

export function createStore<T>(initial: T): Store<T> {
  let value = initial;
  const listeners = new Set<() => void>();

  const get = () => value;

  const set = (next: T | ((prev: T) => T)) => {
    value = typeof next === "function" ? (next as (prev: T) => T)(value) : next;
    listeners.forEach((l) => l());
  };

  const subscribe = (onChange: () => void) => {
    listeners.add(onChange);
    return () => listeners.delete(onChange);
  };

  // Server snapshot == client initial value, so SSR and first client render
  // match (we only ever `set` inside effects, post-hydration).
  const useValue = () => useSyncExternalStore(subscribe, get, get);

  return { get, set, subscribe, useValue };
}
