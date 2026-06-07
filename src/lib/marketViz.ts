import type { Quote } from "@/lib/useMarketFeed";

// Deterministic 4-digit hex id from a symbol's price (no randomness, so
// static export and client render agree). e.g. 467.20 -> "0x46720" trimmed.
export function hexId(q: Quote): string {
  const n = Math.round(q.price * 100) % 0x10000;
  return "0x" + n.toString(16).toUpperCase().padStart(4, "0");
}

// Flicker animation-duration in seconds: bigger |dp| = faster flicker.
// Clamped so calm stocks pulse slowly and wild ones stutter, never frozen.
export function flickRate(dp: number): number {
  const mag = Math.min(Math.abs(dp), 5); // cap at 5%
  // 0% -> 2.4s (slow pulse), 5% -> 0.18s (rapid stutter)
  return +(2.4 - (mag / 5) * 2.22).toFixed(2);
}

// Direction class for color (green up / amber-red down).
export function dirClass(dp: number): "up" | "down" {
  return dp >= 0 ? "up" : "down";
}

// Bar fill 0..10 cells from |dp| (each ~0.5% = one cell, capped).
export function barFill(dp: number): number {
  return Math.max(1, Math.min(10, Math.round(Math.abs(dp) * 2)));
}

// Render a 10-cell block bar string from a fill count.
export function barString(fill: number): string {
  const f = Math.max(0, Math.min(10, fill));
  return "█".repeat(f) + "░".repeat(10 - f);
}

// Synthetic SYNC% readout derived from price+dp (deterministic, 90.0–99.9).
export function syncPct(q: Quote): string {
  const base = (Math.abs(q.price) + Math.abs(q.dp) * 7) % 10; // 0..10
  return (90 + base).toFixed(1);
}

// Aggregate PATTERN code from mean dp across quotes.
// Net up -> BLUE (all clear), flat -> GREEN, net down -> ORANGE/RED.
export function aggregatePattern(quotes: Quote[]): {
  pattern: string;
  dir: "up" | "down";
  meanDp: number;
} {
  if (quotes.length === 0)
    return { pattern: "ORANGE", dir: "down", meanDp: 0 };
  const meanDp =
    quotes.reduce((s, q) => s + q.dp, 0) / quotes.length;
  const pattern =
    meanDp > 0.4 ? "BLUE" : meanDp >= -0.4 ? "GREEN" : meanDp < -1.5 ? "RED" : "ORANGE";
  return { pattern, dir: meanDp >= 0 ? "up" : "down", meanDp };
}
