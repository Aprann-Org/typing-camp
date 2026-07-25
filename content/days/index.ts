import type { DayDisplayText, DayNumber, DayPracticeContent, Language } from "@/lib/types";
import { getKeyForChar } from "@/content/layouts";
import day1DisplayEn from "./day1.en";
import day1DisplayHt from "./day1.ht";
import day1Practice from "./day1.practice";
import day2DisplayEn from "./day2.en";
import day2DisplayHt from "./day2.ht";
import day2Practice from "./day2.practice";
import day3DisplayEn from "./day3.en";
import day3DisplayHt from "./day3.ht";
import day3Practice from "./day3.practice";
import day4DisplayEn from "./day4.en";
import day4DisplayHt from "./day4.ht";
import day4Practice from "./day4.practice";
import day5DisplayEn from "./day5.en";
import day5DisplayHt from "./day5.ht";
import day5Practice from "./day5.practice";

// All five days are populated. Adding or reordering a day means editing the
// two registries below; the start screen's day picker and SessionRunner are
// both driven off this file, so neither needs to change.
//
// Display text is bilingual (follows the instruction-language toggle).
// Practice content — what the child actually types — is a single source
// per day, independent of that toggle (see the locked project decision:
// practice content is always Kreyòl regardless of instruction language).
//
// The key ladder across the five days is: home row -> top row strong
// fingers -> rest of top row + bottom index -> rest of bottom row + Shift
// -> punctuation. It is designed so the week's memory verse becomes exactly
// 100% typeable on Day 5 and not before; scripts/validate-content.ts
// enforces that, along with word banks only using already-unlocked keys.
const DAY_DISPLAY: Record<Language, Partial<Record<DayNumber, DayDisplayText>>> = {
  en: {
    1: day1DisplayEn,
    2: day2DisplayEn,
    3: day3DisplayEn,
    4: day4DisplayEn,
    5: day5DisplayEn,
  },
  ht: {
    1: day1DisplayHt,
    2: day2DisplayHt,
    3: day3DisplayHt,
    4: day4DisplayHt,
    5: day5DisplayHt,
  },
};

const DAY_PRACTICE: Partial<Record<DayNumber, DayPracticeContent>> = {
  1: day1Practice,
  2: day2Practice,
  3: day3Practice,
  4: day4Practice,
  5: day5Practice,
};

export function getDayDisplayText(language: Language, day: DayNumber): DayDisplayText | undefined {
  return DAY_DISPLAY[language][day];
}

export function getDayPracticeContent(day: DayNumber): DayPracticeContent | undefined {
  return DAY_PRACTICE[day];
}

/** Days with both display text (for this language) and practice content available, in order. */
export function getAvailableDays(language: Language): DayNumber[] {
  return ([1, 2, 3, 4, 5] as DayNumber[]).filter(
    (d) => DAY_DISPLAY[language][d] !== undefined && DAY_PRACTICE[d] !== undefined
  );
}

/** Every key unlocked as of `day`, cumulative across all earlier days' newKeys. Language-independent. */
export function getCumulativeUnlockedKeys(day: DayNumber): Set<string> {
  const unlocked = new Set<string>();
  for (let d = 1; d <= day; d++) {
    const content = DAY_PRACTICE[d as DayNumber];
    content?.newKeys.forEach((k) => {
      unlocked.add(k);
      // A day may declare a SHIFTED character directly — Day 5 teaches "!"
      // and "?" rather than the "1" and "/" keys they physically live on.
      // The typing engine resolves a shifted character through its base key
      // (see isCharUnlocked in content/layouts.ts), so unlock the base too
      // or the very character the day set out to teach stays untypeable.
      const base = getKeyForChar(k)?.char;
      if (base) unlocked.add(base);
    });
  }
  return unlocked;
}

/** Shift itself is introduced Day 4 (capitalization) — see the key ladder. */
export function isShiftUnlocked(day: DayNumber): boolean {
  return day >= 4;
}
