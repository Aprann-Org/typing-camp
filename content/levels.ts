// The three levels each change four dimensions of the session at once, not
// just typing speed. Level is chosen per session (not locked to a profile),
// so a child can move up mid-week — see lib/storage.ts for how the last
// choice is remembered per profile as the next default.
//
// User-facing copy (subtitles like "First time typing") lives in
// content/i18n, keyed by level id — this file is behavior only, no strings.

export type LevelId = "starter" | "builder" | "flyer";

export type NewKeyScope = "half" | "full" | "full-plus-preview";

// "High, short bursts" (Starter) vs "fewer, longer runs" (Flyer) is a
// burst-count-and-length shape, not a literal "repeat the identical string
// N times" counter — the latter produced back-to-back identical drills
// that felt like a stuck loop rather than practice. Total practice volume
// (burstCount * burstLength) is held roughly constant across levels; only
// the chunking differs, per the brief's own wording.
export type DrillRepetitions = {
  burstCount: number;
  burstLength: number;
  style: "short-bursts" | "standard" | "long-runs";
};

export type FingerHintMode = "always" | "after-miss" | "off";

export type ErrorHandlingMode =
  // Wrong key does nothing, no penalty, a gentle nudge back to the target.
  | "gentle-nudge"
  // Wrong key marks red, child is allowed to advance past it anyway.
  | "mark-and-advance"
  // Child must backspace and correct the mistake before advancing.
  | "must-correct";

export type LevelConfig = {
  id: LevelId;
  newKeyScope: NewKeyScope;
  drillRepetitions: DrillRepetitions;
  fingerHint: FingerHintMode;
  errorHandling: ErrorHandlingMode;
  /** Fraction (0-1) required to pass a stage, or null if there is no gate. */
  accuracyGate: number | null;
  showWpm: boolean;
  /** Only meaningful when showWpm is true; null means no target is shown. */
  wpmTarget: number | null;
};

export const LEVELS: Record<LevelId, LevelConfig> = {
  starter: {
    id: "starter",
    newKeyScope: "half",
    drillRepetitions: { burstCount: 4, burstLength: 4, style: "short-bursts" },
    fingerHint: "always",
    errorHandling: "gentle-nudge",
    accuracyGate: null,
    showWpm: false,
    wpmTarget: null,
  },
  builder: {
    id: "builder",
    newKeyScope: "full",
    drillRepetitions: { burstCount: 2, burstLength: 8, style: "standard" },
    fingerHint: "after-miss",
    errorHandling: "mark-and-advance",
    accuracyGate: 0.85,
    showWpm: true,
    wpmTarget: null,
  },
  flyer: {
    id: "flyer",
    newKeyScope: "full-plus-preview",
    drillRepetitions: { burstCount: 1, burstLength: 16, style: "long-runs" },
    fingerHint: "off",
    errorHandling: "must-correct",
    accuracyGate: 0.95,
    showWpm: true,
    wpmTarget: 30,
  },
};

export const LEVEL_ORDER: LevelId[] = ["starter", "builder", "flyer"];

export const DEFAULT_LEVEL: LevelId = "starter";

/**
 * Which of today's new keys are explicitly drilled this session, per the
 * "half the day's set, rest as guided" Starter dimension. Shared between
 * NewKeysStage (which of today's drills to run) and SessionRunner (which
 * keys count as "guided-only" — locked for scoring purposes — in Word
 * Build / Theme Challenge) so the two can never drift apart.
 */
export function getDrilledKeys(newKeys: string[], scope: NewKeyScope): string[] {
  if (scope === "half") return newKeys.slice(0, Math.ceil(newKeys.length / 2));
  return newKeys;
}
