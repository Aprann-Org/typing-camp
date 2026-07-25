import { describe, expect, it } from "vitest";
import { buildLockedKeyConfig } from "./layouts";
import { getCumulativeUnlockedKeys, getDayPracticeContent, isShiftUnlocked } from "./days";
import type { DayNumber } from "@/lib/types";

// Guided mode has to decide, per character, between "you type this, it just
// won't be scored" and "we fill this in for you." Getting that boundary wrong
// is not a cosmetic bug — it strands a child on a keystroke they have no way
// to know, in front of a class, with a hand map pointing at the wrong thing.

const day1Keys = getCumulativeUnlockedKeys(1);

describe("guided mode autofills what a child cannot yet press", () => {
  it("autofills a capital before Shift is taught", () => {
    const { autofill, guidedTyped } = buildLockedKeyConfig("Tes", day1Keys, false, "guided");
    expect(autofill.has("T")).toBe(true);
    expect(guidedTyped.has("T")).toBe(false);
  });

  it("expects the child to type a capital once Shift is taught", () => {
    const day4Keys = getCumulativeUnlockedKeys(4);
    const { autofill } = buildLockedKeyConfig("Bondye", day4Keys, true, "guided");
    // Day 4 teaches b and Shift, so "B" is genuinely typeable — neither
    // autofilled nor merely guided.
    expect(autofill.has("B")).toBe(false);
  });

  it("still autofills characters with no key on the layout at all", () => {
    const { autofill } = buildLockedKeyConfig("kè", day1Keys, false, "guided");
    expect(autofill.has("è")).toBe(true);
  });

  it("keeps ordinary untaught letters as typed-but-unscored", () => {
    const { autofill, guidedTyped } = buildLockedKeyConfig("bo", day1Keys, false, "guided");
    expect(guidedTyped.has("b")).toBe(true);
    expect(autofill.has("b")).toBe(false);
  });
});

describe("no day asks for a keystroke it hasn't taught", () => {
  it("never leaves a Shift chord as guided-typed before Day 4", () => {
    for (const day of [1, 2, 3, 4, 5] as DayNumber[]) {
      const content = getDayPracticeContent(day)!;
      const unlocked = getCumulativeUnlockedKeys(day);
      const shiftOk = isShiftUnlocked(day);
      for (const phrase of content.themePhrases) {
        const { guidedTyped } = buildLockedKeyConfig(phrase, unlocked, shiftOk, "guided");
        for (const ch of guidedTyped) {
          const isCapital = ch !== ch.toLowerCase();
          expect(
            isCapital && !shiftOk,
            `day ${day} theme phrase "${phrase}" asks the child to type "${ch}" before Shift is taught`
          ).toBe(false);
        }
      }
    }
  });
});
