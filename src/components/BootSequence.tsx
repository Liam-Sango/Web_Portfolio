"use client";

import { useEffect, useRef, useState } from "react";

interface BootLine {
  label: string;
  jp?: string;
  value: string;
  cls?: "ok" | "warn" | "crit";
}

const LINES: BootLine[] = [
  { label: "POWER BUS", jp: "電源", value: "+285V" },
  { label: "MAGI SYSTEM", jp: "起動", value: "INIT" },
  { label: "MELCHIOR · 壱号", value: "ONLINE", cls: "ok" },
  { label: "BALTHASAR · 弐号", value: "ONLINE", cls: "ok" },
  { label: "CASPER · 参号", value: "ONLINE", cls: "ok" },
  { label: "CENTRAL DOGMA UPLINK", value: "LINKED", cls: "ok" },
  { label: "NEURAL HARMONICS", jp: "同調", value: "STABLE", cls: "ok" },
  { label: "A.T. FIELD", value: "NEUTRAL", cls: "warn" },
  { label: "LCL PRESSURE", jp: "充填", value: "NOMINAL", cls: "ok" },
  { label: "ENTRY PLUG", value: "LOCKED", cls: "ok" },
  { label: "PERSONNEL RECORD", value: "SANGO, L.", cls: "ok" },
  { label: "SYNCHRO RATIO", value: "100.0%", cls: "ok" },
  { label: "ALL SYSTEMS", value: "NOMINAL", cls: "ok" },
];

// Diagnostic cells that flicker on across the boot — the "everything
// lighting up" wall of subsystems.
const CELLS = [
  "PWR", "BUS", "GYRO", "UMB", "COOL", "S²", "NRV", "0x1A",
  "ATF", "LCL", "PLG", "SYN", "0x2F", "OPT", "AUX", "NAV",
  "DGM", "EVA", "0x07", "SIG", "THR", "VLV", "MAG", "RDY",
];

const GAUGES = [
  { label: "POWER", target: 100 },
  { label: "SYNC", target: 100 },
  { label: "LCL", target: 82 },
  { label: "A.T.", target: 64 },
];

const TICKS = 46;
const INTERVAL = 78;

type Phase = "running" | "ready" | "out" | "hidden";

export default function BootSequence() {
  // Runs whenever this component mounts (i.e. each time NERV mode is enabled).
  const [phase, setPhase] = useState<Phase>("running");
  const [tick, setTick] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduce) {
      setPhase("hidden");
      return;
    }

    interval.current = setInterval(() => {
      setTick((t) => {
        const next = t + 1;
        if (next >= TICKS && interval.current) {
          clearInterval(interval.current);
          interval.current = null;
          timers.current.push(setTimeout(() => setPhase("ready"), 120));
          timers.current.push(setTimeout(() => setPhase("out"), 980));
          timers.current.push(setTimeout(finish, 1500));
        }
        return next;
      });
    }, INTERVAL);

    return () => {
      if (interval.current) clearInterval(interval.current);
      timers.current.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function finish() {
    setPhase("hidden");
  }

  function skip() {
    if (phase === "hidden") return;
    if (interval.current) clearInterval(interval.current);
    timers.current.forEach(clearTimeout);
    setTick(TICKS);
    setPhase("out");
    timers.current.push(setTimeout(finish, 420));
  }

  if (phase === "hidden") return null;

  const progress = Math.min(1, tick / TICKS);
  const cellsLit = Math.round(progress * CELLS.length);
  const linesShown =
    phase === "ready" ? LINES.length : Math.round(progress * LINES.length);
  const magiLit = [0.18, 0.3, 0.42].filter((t) => progress >= t).length;
  const pct = Math.round(progress * 100);

  return (
    <div
      className={`boot${phase === "out" ? " boot--out" : ""}`}
      aria-hidden="true"
      onClick={skip}
      role="presentation"
    >
      <div className="boot-grid" />
      <div className="boot-scanbar" />

      <div className="boot-core">
        <div className="boot-head">
          <span className="boot-logo">NERV</span>
          <span className="boot-sub">
            特務機関 · MAGI SYSTEM <span className="jp">起動シーケンス</span>
          </span>
        </div>

        {/* Wall of subsystem diagnostic cells lighting up */}
        <div className="boot-cells">
          {CELLS.map((c, i) => (
            <span
              key={i}
              className={`boot-cell${i < cellsLit ? " boot-cell--on" : ""}`}
            >
              {c}
            </span>
          ))}
        </div>

        <div className="boot-magi">
          {["MELCHIOR", "BALTHASAR", "CASPER"].map((m, i) => (
            <div
              key={m}
              className={`magi-node${i < magiLit ? " magi-node--on" : ""}`}
            >
              <span className="magi-hex" />
              <span className="magi-name">{m}</span>
            </div>
          ))}
        </div>

        <div className="boot-columns">
          <ul className="boot-log">
            {LINES.slice(0, linesShown).map((line, i) => (
              <li key={i} className="boot-row">
                <span className="boot-label">
                  {line.label}
                  {line.jp ? <span className="jp"> {line.jp}</span> : null}
                </span>
                <span className="boot-dots" />
                <span className={`boot-value boot-value--${line.cls ?? "ok"}`}>
                  {line.value}
                </span>
              </li>
            ))}
          </ul>

          <div className="boot-gauges">
            {GAUGES.map((g) => {
              const v = Math.round(Math.min(1, progress * 1.15) * g.target);
              return (
                <div key={g.label} className="boot-gauge">
                  <span className="boot-gauge-label">{g.label}</span>
                  <span className="boot-gauge-track">
                    <span
                      className="boot-gauge-fill"
                      style={{ width: `${v}%` }}
                    />
                  </span>
                  <span className="boot-gauge-val">{v}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="boot-bar">
          <div className="boot-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="boot-status">
          {phase === "ready" ? (
            <span className="boot-ready">▶ SYSTEM READY — 同期完了</span>
          ) : (
            <span>
              INITIALIZING <span className="boot-pct">{pct}%</span> · CLICK TO
              SKIP
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
