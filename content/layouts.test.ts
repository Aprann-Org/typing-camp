import { describe, expect, it } from "vitest";
import { buildLockedKeyConfig, getKeyForChar, getShiftFingerForChar, requiresShift } from "./layouts";
import { getCumulativeUnlockedKeys, getDayPracticeContent, isShiftUnlocked } from "./days";
import type { DayNumber } from "@/lib/types";

// Guided mode has to decide, per character, between "you type this, it just
// won't be scored" and "we fill this in for you." Getting that boundary wrong
// is not a cosmetic bug — it strands a child on a keystroke they have no way
// to know, in front of a class, with a hand map pointing at the wrong thing.

const day1Keys = getCumulativeUnlockedKeys(1);

describe("guided mode autofills what a child cannot yet press", () => {
  // Changed deliberately: capitals used to be autofilled before Day 4 because
  // the hand map could only show one finger. It now draws the Shift+letter
  // chord, so a Day-1 child types the capital in their own name themselves.
  it("guides a capital before Shift is taught rather than filling it in", () => {
    const { autofill, guidedTyped } = buildLockedKeyConfig("Tes", day1Keys, false, "guided");
    expect(guidedTyped.has("T")).toBe(true);
    expect(autofill.has("T")).toBe(false);
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

describe("no day asks for a keystroke it can't show", () => {
  // The old form of this rule banned Shift chords from guided mode outright.
  // Now that a chord can be drawn, the rule that actually protects the child
  // is that every guided character has a hint to draw — a guided character
  // with no finger, or a capital with no Shift to point at, is the failure
  // mode that used to strand them.
  it("can always show a hint for every guided-typed character", () => {
    for (const day of [1, 2, 3, 4, 5] as DayNumber[]) {
      const content = getDayPracticeContent(day)!;
      const unlocked = getCumulativeUnlockedKeys(day);
      const shiftOk = isShiftUnlocked(day);
      for (const phrase of content.themePhrases) {
        const { guidedTyped } = buildLockedKeyConfig(phrase, unlocked, shiftOk, "guided");
        for (const ch of guidedTyped) {
          expect(getKeyForChar(ch), `day ${day} "${phrase}": no key for guided char "${ch}"`).toBeDefined();
          if (requiresShift(ch)) {
            expect(
              getShiftFingerForChar(ch),
              `day ${day} "${phrase}": guided char "${ch}" needs Shift but has no Shift finger to show`
            ).not.toBeNull();
          }
        }
      }
    }
  });
});

describe("which Shift to hold", () => {
  it("uses the hand opposite the letter, so one hand isn't asked to do both", () => {
    // "b" is a left-hand key, "p" a right-hand one.
    expect(getShiftFingerForChar("B")).toBe("rightPinky");
    expect(getShiftFingerForChar("P")).toBe("leftPinky");
  });

  it("covers shifted punctuation, not just capitals", () => {
    // Day 5 teaches "!" and "?" as shifted characters; "!" lives on left-pinky
    // "1", "?" on right-pinky "/".
    expect(getShiftFingerForChar("!")).toBe("rightPinky");
    expect(getShiftFingerForChar("?")).toBe("leftPinky");
  });

  it("is null for anything that needs no Shift", () => {
    expect(getShiftFingerForChar("b")).toBeNull();
    expect(getShiftFingerForChar(" ")).toBeNull();
    expect(getShiftFingerForChar("è")).toBeNull();
  });
});

describe("the Shift key itself is not a character", () => {
  // The Shift tiles are drawn on the board but excluded from the char lookup.
  // If they leaked in, the engine and the validator would both start treating
  // "Shift" as something a child could type.
  it("is absent from the character lookup", () => {
    expect(getKeyForChar("Shift")).toBeUndefined();
    expect(getKeyForChar("")).toBeUndefined();
  });
});
