import type { StageTypingSummary } from "./typing-engine";
import { calculateWpm } from "./wpm";

/**
 * One comparable number for the end of a day, so a room full of children can
 * hold a friendly competition. Pure and DOM-free like the typing engine —
 * this file decides what a day is worth, no component does.
 *
 * Nothing here is persisted or ranked by the app. The score lives on the
 * report screen until the child closes it, and the report tells them to read
 * it out to their teacher — a locked decision, because storage is per-machine
 * and a child isn't guaranteed the same laptop twice, so any leaderboard the
 * app kept would be wrong for most of them (see docs/profile-recovery-plan.md).
 *
 * Compare children WITHIN a level, not across. The three levels change four
 * dimensions of the session at once — Starter drills half the day's keys in
 * short bursts with every finger hint showing, Flyer does full keys in long
 * runs and must correct every mistake — so a cross-level ranking would punish
 * exactly the beginners the level system exists to protect. The report shows
 * the level name next to the score so the teacher can group correctly.
 */

const SPEED_POINTS = 500;
const ACCURACY_POINTS = 500;

export const MAX_DAY_SCORE = SPEED_POINTS + ACCURACY_POINTS;

/** Full speed marks. Not a level target — a ceiling generous enough that no child hits it by accident. */
const SPEED_TARGET_WPM = 40;

export type DayScore = {
  /** 0-MAX_DAY_SCORE. The number the child reads out. */
  total: number;
  speedPoints: number;
  accuracyPoints: number;
  /** Over active typing time only, not session wall-clock. */
  wpm: number;
  /** 0-1, over every scored keystroke attempted. */
  accuracy: number;
  activeSeconds: number;
  /** Every character the child put on screen, including unscored helper keys. */
  charsTyped: number;
};

/**
 * Accuracy as misses per keystroke attempted, 0-1. 1 when nothing was
 * attempted (a fully guided session has no score to give).
 *
 * Derived from keyAttempts/keyErrors rather than correctCount/incorrectCount
 * on purpose: `gentle-nudge` (Starter) deliberately never increments
 * incorrectCount, so the older correct/(correct+incorrect) accuracy read
 * exactly 100% for every Starter session however many keys were missed. The
 * misses were always recorded per key — this counts them. For Builder and
 * Flyer the two formulas agree exactly, since each keystroke increments
 * attempts once and errors only when it missed.
 */
export function typedAccuracy(summary: StageTypingSummary): number {
  let attempts = 0;
  for (const count of Object.values(summary.keyAttempts)) attempts += count;
  if (attempts === 0) return 1;
  let errors = 0;
  for (const count of Object.values(summary.keyErrors)) errors += count;
  return Math.max(0, 1 - errors / attempts);
}

export function computeDayScore(summary: StageTypingSummary): DayScore {
  const wpm = calculateWpm(summary.correctCount, 0, summary.activeMs);
  const accuracy = typedAccuracy(summary);

  const speedPoints = Math.round(SPEED_POINTS * Math.min(1, wpm / SPEED_TARGET_WPM));
  // Squared, so 99% is worth visibly more than 90% and racing through the day
  // leaving a trail of red is a losing strategy. The competition should push
  // children toward the form the lesson is teaching, not away from it.
  const accuracyPoints = Math.round(ACCURACY_POINTS * accuracy * accuracy);

  return {
    total: speedPoints + accuracyPoints,
    speedPoints,
    accuracyPoints,
    wpm,
    accuracy,
    activeSeconds: Math.round(summary.activeMs / 1000),
    charsTyped: summary.correctCount + summary.incorrectCount + summary.guidedTypedCount,
  };
}
