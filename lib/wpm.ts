// Standard WPM formula: one "word" = 5 characters. Deliberately not called
// on every keystroke — components should sample this from a ref-based
// accumulator on a low-frequency timer (see the project plan's perf notes),
// so WPM math never sits on the critical path of a keystroke's visual
// feedback.

const MIN_ELAPSED_MS = 1000;

export function calculateWpm(correctChars: number, startedAtMs: number, nowMs: number): number {
  const elapsedMs = nowMs - startedAtMs;
  if (elapsedMs < MIN_ELAPSED_MS) return 0;
  const minutes = elapsedMs / 60000;
  return Math.round(correctChars / 5 / minutes);
}
