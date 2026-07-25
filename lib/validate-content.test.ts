import { describe, expect, it } from "vitest";
import { formatProblems, validateContent } from "./validate-content";
import { getCumulativeUnlockedKeys, getDayPracticeContent, isShiftUnlocked } from "@/content/days";
import { getKeyForChar } from "@/content/layouts";
import type { DayNumber } from "./types";

// This is the content guardrail running as a test, which is what makes
// `npm run build` fail on bad content (the build script runs vitest first).

describe("camp content", () => {
  it("has no content problems", () => {
    const problems = validateContent();
    expect(problems, `\n${formatProblems(problems)}\n`).toEqual([]);
  });
});

// The verse progression is the Verse Builder's entire emotional arc, so it is
// asserted explicitly rather than left to the generic validator — if someone
// reshuffles the key ladder, these numbers are what should make them stop and
// think about whether the new shape still tells a story.
describe("verse progression", () => {
  const verse = getDayPracticeContent(1)!.verse.text;

  function typeableOn(day: DayNumber): number {
    const unlocked = getCumulativeUnlockedKeys(day);
    const shiftOk = isShiftUnlocked(day);
    let n = 0;
    for (const ch of verse) {
      const key = getKeyForChar(ch);
      if (!key) continue;
      const isShifted = !!key.shiftChar && key.shiftChar === ch;
      if (isShifted ? shiftOk && unlocked.has(key.char) : unlocked.has(ch)) n++;
    }
    return n;
  }

  it("grows every single day", () => {
    const counts = ([1, 2, 3, 4, 5] as DayNumber[]).map(typeableOn);
    for (let i = 1; i < counts.length; i++) {
      expect(counts[i], `day ${i + 1} should unlock more of the verse than day ${i}`).toBeGreaterThan(counts[i - 1]);
    }
  });

  it("completes exactly on day 5", () => {
    expect(typeableOn(4)).toBeLessThan(verse.length);
    expect(typeableOn(5)).toBe(verse.length);
  });
});

describe("key ladder", () => {
  it("keeps each day's new-key count small enough for one 20-minute block", () => {
    for (const day of [1, 2, 3, 4, 5] as DayNumber[]) {
      const count = getDayPracticeContent(day)!.newKeys.length;
      expect(count, `day ${day} introduces ${count} keys`).toBeLessThanOrEqual(11);
    }
  });

  it("teaches one drill per new key", () => {
    for (const day of [1, 2, 3, 4, 5] as DayNumber[]) {
      const content = getDayPracticeContent(day)!;
      // Space is the one key with no isolated drill — it needs no introduction.
      const drillable = content.newKeys.filter((k) => k !== " ");
      expect(content.drills.length, `day ${day}`).toBe(drillable.length);
    }
  });
});
