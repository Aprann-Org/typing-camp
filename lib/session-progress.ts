import type { DayPracticeContent, StageId } from "./types";
import type { LevelConfig } from "@/content/levels";
import { buildLockedKeyConfig } from "@/content/layouts";
import { buildNewKeysQueue } from "./drill-generator";
import { STAGE_ORDER } from "./session";

/**
 * How long each stage of the day actually is, in characters the child has to
 * type. The journey stepper used to give every stage an equal-length segment,
 * which misrepresented the lesson badly: on Day 1 New Keys is ~25 drills
 * (hundreds of keystrokes) while Theme Challenge is a single name. A child
 * spent most of the session on the first segment and then watched the rest go
 * by in a rush. Sizing segments by this makes "halfway along the line" mean
 * halfway through the work.
 *
 * Keystrokes, not minutes: it's the one unit that's measurable from content
 * rather than guessed, and it tracks how long a stage feels for the child
 * doing the typing. STAGE_WEIGHT_MINUTES in lib/session.ts stays what it is —
 * that's the brief's teacher-facing timing table, a different thing.
 */

// Neither of these stages is driven by a character count, so they get rough
// keystroke equivalents instead of measurements.
//   ready: one screen and a tap.
//   game: a few minutes of typing words into a picture; the games vary, so
//     this is a middle-of-the-road estimate rather than a per-day figure.
const READY_EQUIVALENT = 12;
const GAME_EQUIVALENT = 90;

// No segment drops below this share of the bar, however little typing its
// stage contains — a hairline segment reads as a rendering glitch, and a dot
// the child can't see themselves move past isn't encouraging.
const MIN_SHARE = 0.06;

export type StageWorkInput = {
  dayContent: DayPracticeContent;
  level: LevelConfig;
  /** As resolved by SessionRunner — themePhrases, or the child's name on Day 1. */
  themeTargets: string[];
  unlockedChars: ReadonlySet<string>;
  shiftUnlocked: boolean;
};

function charCount(targets: string[]): number {
  return targets.reduce((sum, target) => sum + target.length, 0);
}

/** Characters the child types in each stage, keyed by stage id. */
export function stageWorkUnits(input: StageWorkInput): Record<StageId, number> {
  const { dayContent, level, themeTargets, unlockedChars, shiftUnlocked } = input;

  // Verse Builder pre-fills every character the child hasn't unlocked yet and
  // auto-advances past it, so only the rest is work — which is why Day 1's
  // verse segment is short even though the verse itself is long.
  const verseLocked = buildLockedKeyConfig(dayContent.verse.text, unlockedChars, shiftUnlocked, "autofill-all");
  const verseUnassisted = Array.from(dayContent.verse.text).filter((c) => !verseLocked.autofill.has(c)).length;

  return {
    ready: READY_EQUIVALENT,
    newKeys: charCount(buildNewKeysQueue(dayContent, level)),
    wordBuild: charCount(dayContent.wordBank),
    themeChallenge: charCount(themeTargets),
    game: GAME_EQUIVALENT,
    verseBuilder: verseUnassisted,
    // The report stage is the flag at the end of the line, not a segment.
    report: 0,
  };
}

/**
 * Relative length for each segment of the journey stepper — one per stage
 * before the report, in STAGE_ORDER. Consumed as flex-grow values, so these
 * only need to be proportional to each other.
 */
export function stageSegmentShares(input: StageWorkInput): number[] {
  const units = stageWorkUnits(input);
  const stages = STAGE_ORDER.slice(0, -1);
  const total = stages.reduce((sum, stage) => sum + units[stage], 0);
  if (total === 0) return stages.map(() => 1);
  return stages.map((stage) => Math.max(units[stage] / total, MIN_SHARE));
}
