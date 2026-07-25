import type { StageId } from "./types";

// The camp schedule allots 20 minutes (11:05-11:25); this brief specifies
// 20-30. Per the project plan's resolution to that open question, total
// session length is a teacher-adjustable setting defaulting to 20 minutes,
// not a hardcoded countdown.
export const DEFAULT_SESSION_MINUTES = 20;

export const STAGE_ORDER: StageId[] = [
  "ready",
  "newKeys",
  "wordBuild",
  "themeChallenge",
  "game",
  "verseBuilder",
  "report",
];

// Approximate minutes from the brief's session-structure table, out of a
// ~28 minute reference session. Stage durations scale proportionally to
// whatever total session length the teacher sets.
const STAGE_WEIGHT_MINUTES: Record<StageId, number> = {
  ready: 2,
  newKeys: 5,
  wordBuild: 6,
  themeChallenge: 5,
  game: 5,
  verseBuilder: 3,
  report: 2,
};

const TOTAL_WEIGHT_MINUTES = Object.values(STAGE_WEIGHT_MINUTES).reduce((a, b) => a + b, 0);

export function getStageDurationSeconds(stage: StageId, totalSessionMinutes: number): number {
  const share = STAGE_WEIGHT_MINUTES[stage] / TOTAL_WEIGHT_MINUTES;
  return Math.round(totalSessionMinutes * 60 * share);
}
