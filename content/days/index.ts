import type { DayDisplayText, DayNumber, DayPracticeContent, Language } from "@/lib/types";
import day1DisplayEn from "./day1.en";
import day1DisplayHt from "./day1.ht";
import day1Practice from "./day1.practice";

// Only Day 1 is populated in this build checkpoint — Days 2-5 are deferred
// (see the project plan). Adding a day means adding a display-text entry
// per language plus one practice-content entry; the start screen's day
// picker and SessionRunner are both driven off this registry, so neither
// needs to change.
//
// Display text is bilingual (follows the instruction-language toggle).
// Practice content — what the child actually types — is a single source
// per day, independent of that toggle (see the locked project decision:
// practice content is always Kreyòl regardless of instruction language).
const DAY_DISPLAY: Record<Language, Partial<Record<DayNumber, DayDisplayText>>> = {
  en: { 1: day1DisplayEn },
  ht: { 1: day1DisplayHt },
};

const DAY_PRACTICE: Partial<Record<DayNumber, DayPracticeContent>> = {
  1: day1Practice,
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
    content?.newKeys.forEach((k) => unlocked.add(k));
  }
  return unlocked;
}

/** Shift itself is introduced Day 4 (capitalization) — see the key ladder. */
export function isShiftUnlocked(day: DayNumber): boolean {
  return day >= 4;
}
