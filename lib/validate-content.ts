import {
  getCumulativeUnlockedKeys,
  getDayDisplayText,
  getDayPracticeContent,
  isShiftUnlocked,
} from "@/content/days";
import { getKeyForChar, isCharUnlocked, requiresShift } from "@/content/layouts";
import type { DayNumber, Language } from "./types";

// The build-time content guardrail. Everything here is a rule that TypeScript
// cannot express: a word bank quietly using a key the child has not been
// taught yet, a drill for the wrong day, the memory verse drifting so it no
// longer completes exactly on Day 5. All of these produce an app that
// compiles perfectly and then strands a child mid-word in front of a class.
//
// Written as a pure function returning problems (rather than throwing) so the
// test can report every failure at once instead of one per run.

export type ContentProblem = {
  day: DayNumber | null;
  where: string;
  message: string;
};

const ALL_DAYS: DayNumber[] = [1, 2, 3, 4, 5];
const LANGUAGES: Language[] = ["en", "ht"];
const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");

/** Characters with no key at all on the layout — i.e. Kreyòl accents (è, ò, à). */
function charsWithNoKey(text: string): string[] {
  return [...new Set([...text])].filter((ch) => getKeyForChar(ch) === undefined);
}

/**
 * Whether every character of `text` can be typed by a child on `day`. Defers
 * to the engine's own isCharUnlocked rather than restating the shifted-form
 * rule — a second copy here once meant the validator could pass content the
 * app then refused to accept.
 */
function untypeableChars(text: string, day: DayNumber): string[] {
  const unlocked = getCumulativeUnlockedKeys(day);
  const shiftOk = isShiftUnlocked(day);
  return [...new Set([...text])].filter((ch) => !isCharUnlocked(ch, unlocked, shiftOk));
}

function countTypeable(text: string, day: DayNumber): number {
  const bad = new Set(untypeableChars(text, day));
  return [...text].filter((ch) => !bad.has(ch)).length;
}

export function validateContent(): ContentProblem[] {
  const problems: ContentProblem[] = [];
  const add = (day: DayNumber | null, where: string, message: string) =>
    problems.push({ day, where, message });

  // --- Every day exists, in both languages -------------------------------
  for (const day of ALL_DAYS) {
    if (!getDayPracticeContent(day)) add(day, "practice", "no practice content registered");
    for (const language of LANGUAGES) {
      if (!getDayDisplayText(language, day)) add(day, `display.${language}`, "no display text registered");
    }
  }

  // --- Per-day content rules ---------------------------------------------
  const keyTaughtOn = new Map<string, DayNumber>();
  const badgeIds = new Map<string, DayNumber>();

  for (const day of ALL_DAYS) {
    const content = getDayPracticeContent(day);
    if (!content) continue;

    if (content.day !== day) {
      add(day, "practice.day", `file says day ${content.day} but is registered as day ${day}`);
    }

    // A key must be introduced exactly once across the whole week.
    for (const key of content.newKeys) {
      const previous = keyTaughtOn.get(key);
      if (previous !== undefined) {
        add(day, "newKeys", `"${key}" is already taught on day ${previous}`);
      }
      keyTaughtOn.set(key, day);
    }

    // Checkpoint groups must account for every one of today's new keys
    // exactly once — a missing key would silently never get a New Keys
    // stage item, a duplicate would silently repeat one.
    if (content.newKeyGroups) {
      const seen = new Map<string, number>();
      for (const group of content.newKeyGroups) {
        for (const key of group) {
          seen.set(key, (seen.get(key) ?? 0) + 1);
        }
      }
      for (const key of content.newKeys) {
        const count = seen.get(key) ?? 0;
        if (count === 0) add(day, "newKeyGroups", `"${key}" is in newKeys but missing from newKeyGroups`);
        else if (count > 1) add(day, "newKeyGroups", `"${key}" appears in ${count} newKeyGroups groups, should be 1`);
      }
      const newKeysSet = new Set(content.newKeys);
      for (const key of seen.keys()) {
        if (!newKeysSet.has(key)) add(day, "newKeyGroups", `"${key}" is grouped but not in newKeys`);
      }
    }

    // Drills introduce today's keys, so they may only use today's keys
    // (plus the space that separates them).
    const todaysKeys = new Set([...content.newKeys, " "]);
    for (const drill of content.drills) {
      for (const ch of drill.pattern) {
        if (!todaysKeys.has(ch)) {
          add(day, "drills", `pattern "${drill.pattern}" uses "${ch}", which is not one of today's new keys`);
          break;
        }
      }
    }

    // The word bank is scored typing, so every character must already be
    // unlocked — this is the check that stops a child hitting a wall.
    for (const word of content.wordBank) {
      const bad = untypeableChars(word, day);
      if (bad.length) {
        add(day, "wordBank", `"${word}" needs ${bad.map((c) => `"${c}"`).join(", ")}, not unlocked by day ${day}`);
      }
    }

    // Accented Kreyòl characters are excluded from anything the child types
    // (locked project decision) — they have no key on the layout at all, so
    // they would silently autofill and teach nothing.
    for (const [where, texts] of [
      ["wordBank", content.wordBank],
      ["drills", content.drills.map((d) => d.pattern)],
      ["themePhrases", content.themePhrases],
    ] as const) {
      for (const text of texts) {
        const accents = charsWithNoKey(text);
        if (accents.length) {
          add(day, where, `"${text}" contains ${accents.map((c) => `"${c}"`).join(", ")} — no key on this layout`);
        }
      }
    }

    // The Shift day's whole reason for existing is that capitals become
    // possible — if its word bank has none, the child drills a chord and then
    // never uses it, which is exactly the "chore" framing the day is built to
    // avoid.
    if (content.teachesShift && !content.wordBank.some((word) => [...word].some((ch) => requiresShift(ch)))) {
      add(day, "wordBank", "day teaches Shift but no word in the bank needs a capital");
    }

    const previousBadgeDay = badgeIds.get(content.badgeId);
    if (previousBadgeDay !== undefined) {
      add(day, "badgeId", `"${content.badgeId}" is already used by day ${previousBadgeDay}`);
    }
    badgeIds.set(content.badgeId, day);
  }

  // --- The week's memory verse -------------------------------------------
  // One verse runs all week, and the whole Verse Builder payoff depends on it
  // completing exactly on its stated day: earlier and Day 5 has no moment,
  // later and the child never gets there at all.
  const verses = new Set(
    ALL_DAYS.map((d) => getDayPracticeContent(d)?.verse.text).filter((t): t is string => !!t)
  );
  if (verses.size > 1) {
    add(null, "verse.text", `all five days must share one memory verse, found ${verses.size} different texts`);
  }

  const day1 = getDayPracticeContent(1);
  if (day1) {
    const target = day1.verse.unlockedThroughDay;
    for (const day of ALL_DAYS) {
      const typeable = countTypeable(day1.verse.text, day);
      const complete = typeable === day1.verse.text.length;
      if (day < target && complete) {
        add(day, "verse", `verse is already fully typeable on day ${day}, but should not be until day ${target}`);
      }
      if (day === target && !complete) {
        const bad = untypeableChars(day1.verse.text, day);
        add(day, "verse", `verse should be fully typeable by day ${target} but still needs ${bad.map((c) => `"${c}"`).join(", ")}`);
      }
    }
  }

  // --- Shift is taught exactly once ---------------------------------------
  // isShiftUnlocked derives from this flag, so zero days means capitals are
  // never typeable all week and two days means the second declaration is dead.
  const shiftDays = ALL_DAYS.filter((d) => getDayPracticeContent(d)?.teachesShift);
  if (shiftDays.length !== 1) {
    add(
      null,
      "teachesShift",
      shiftDays.length === 0
        ? "no day declares teachesShift, so Shift is never taught"
        : `teachesShift is declared on days ${shiftDays.join(", ")} — it must be exactly one`
    );
  }

  // --- Ladder completeness ------------------------------------------------
  const byEnd = getCumulativeUnlockedKeys(5);
  const missing = ALPHABET.filter((c) => !byEnd.has(c));
  if (missing.length) {
    add(null, "newKeys", `these letters are never taught: ${missing.join(", ")}`);
  }

  return problems;
}

export function formatProblems(problems: ContentProblem[]): string {
  return problems
    .map((p) => `  ${p.day === null ? "all days" : `day ${p.day}`} / ${p.where}: ${p.message}`)
    .join("\n");
}
