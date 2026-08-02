"use client";

import { useEffect, useState } from "react";

/**
 * A live stopwatch shared by the bonus games (Ninja Hop, Maze Runner, Star
 * Blaster, Car Race) — ticks every 100ms until `finished` flips true, then
 * stops (freezing the displayed time at the finish instant). Nothing here is
 * persisted: bonus games save nothing, per PlayScreen's own doc. This exists
 * purely so kids taking turns on the same device can compare who was
 * faster, without needing an actual opponent on screen to race against.
 */
export function useElapsedTimer(finished: boolean): number {
  // Lazy initializer: Date.now() can't run during render proper (it would
  // differ on every re-render), but a one-time value computed exactly once
  // at mount is the sanctioned exception — same reasoning as this app's
  // other one-time Date.now()/Math.random() seeds.
  const [startedAt] = useState(() => Date.now());
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (finished) return;
    const id = setInterval(() => setElapsedMs(Date.now() - startedAt), 100);
    return () => clearInterval(id);
  }, [finished, startedAt]);

  return elapsedMs;
}

export function formatElapsed(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}
