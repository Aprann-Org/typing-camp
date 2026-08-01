import { describe, expect, it } from "vitest";
import { pickLetterSequence } from "./bonusLetters";
import { getCumulativeUnlockedKeys } from "@/content/days";

describe("pickLetterSequence", () => {
  const taughtLetters = new Set(Array.from(getCumulativeUnlockedKeys(5)).filter((c) => /^[a-z]$/.test(c)));

  it("draws only from letters the curriculum actually teaches somewhere across the 5 days", () => {
    // Run several rounds — this is randomized, so one lucky sequence
    // wouldn't catch a pool that includes an untaught letter.
    for (let round = 0; round < 20; round++) {
      const sequence = pickLetterSequence(30);
      for (const letter of sequence) {
        expect(taughtLetters.has(letter)).toBe(true);
      }
    }
  });

  it("never includes a capital letter, space, or punctuation", () => {
    for (let round = 0; round < 20; round++) {
      const sequence = pickLetterSequence(30);
      for (const letter of sequence) {
        expect(letter).toMatch(/^[a-z]$/);
      }
    }
  });

  it("covers the full alphabet — the curriculum ladder teaches all 26 letters by Day 5", () => {
    expect(taughtLetters.size).toBe(26);
  });

  it("never repeats the same letter back to back", () => {
    for (let round = 0; round < 20; round++) {
      const sequence = pickLetterSequence(30);
      for (let i = 1; i < sequence.length; i++) {
        expect(sequence[i]).not.toBe(sequence[i - 1]);
      }
    }
  });

  it("returns exactly the requested length", () => {
    expect(pickLetterSequence(10)).toHaveLength(10);
    expect(pickLetterSequence(0)).toHaveLength(0);
  });
});
