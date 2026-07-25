import { describe, expect, it } from "vitest";
import { stageSegmentShares, stageWorkUnits } from "./session-progress";
import { STAGE_ORDER } from "./session";
import { getCumulativeUnlockedKeys, getDayPracticeContent, isShiftUnlocked } from "@/content/days";
import { LEVELS } from "@/content/levels";
import type { DayNumber } from "./types";
import type { LevelId } from "@/content/levels";

function inputFor(day: DayNumber, level: LevelId) {
  const dayContent = getDayPracticeContent(day);
  if (!dayContent) throw new Error(`no content for day ${day}`);
  return {
    dayContent,
    level: LEVELS[level],
    themeTargets: dayContent.themePhrases.length > 0 ? dayContent.themePhrases : ["Mirlande"],
    unlockedChars: getCumulativeUnlockedKeys(day),
    shiftUnlocked: isShiftUnlocked(day),
  };
}

const DAYS: DayNumber[] = [1, 2, 3, 4, 5];
const LEVEL_IDS: LevelId[] = ["starter", "builder", "flyer"];

describe("stageWorkUnits", () => {
  it("makes New Keys the longest stage of the day, which is the whole reason this exists", () => {
    const units = stageWorkUnits(inputFor(1, "builder"));
    const others = STAGE_ORDER.slice(0, -1)
      .filter((stage) => stage !== "newKeys")
      .map((stage) => units[stage]);
    expect(units.newKeys).toBeGreaterThan(Math.max(...others));
  });

  it("counts only the verse characters the child actually types", () => {
    // Day 1's verse is mostly locked keys, which Verse Builder pre-fills — so
    // its segment must be far shorter than the verse text itself.
    const input = inputFor(1, "starter");
    const units = stageWorkUnits(input);
    expect(units.verseBuilder).toBeGreaterThan(0);
    expect(units.verseBuilder).toBeLessThan(input.dayContent.verse.text.length);
  });
});

describe("stageSegmentShares", () => {
  it("returns one share per dot on the stepper, excluding the report flag", () => {
    expect(stageSegmentShares(inputFor(1, "starter"))).toHaveLength(STAGE_ORDER.length - 1);
  });

  it("keeps every segment visible on every day and level", () => {
    for (const day of DAYS) {
      for (const level of LEVEL_IDS) {
        for (const share of stageSegmentShares(inputFor(day, level))) {
          expect(share).toBeGreaterThanOrEqual(0.06);
          expect(Number.isFinite(share)).toBe(true);
        }
      }
    }
  });
});
