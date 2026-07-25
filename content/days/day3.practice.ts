import type { DayPracticeContent } from "@/lib/types";

// What the child actually TYPES on Day 3. See day2.practice.ts's header for
// the shared conventions (Kreyòl-always practice content, AI-sourced word
// bank pending native review, accent-free typed content).
//
// KEY LADDER — Day 3 finishes the top row (q w o p) and adds the two
// bottom-row index keys (n m). Splitting it this way rather than "top row
// then bottom row" keeps new-key counts even across the week (11/6/6/5/5)
// and is what carries the verse from 63% to 88% typeable.
//
// q is taught for completeness even though Kreyòl effectively doesn't use it
// (Kreyòl writes k) — it costs one drill and leaves no permanently dark key
// on the keyboard display.

const day3Practice: DayPracticeContent = {
  day: 3,
  newKeys: ["q", "w", "o", "p", "n", "m"],
  drills: [
    { keys: ["o"], pattern: "o o o o o o" },
    { keys: ["n"], pattern: "n n n n n n" },
    { keys: ["m"], pattern: "m m m m m m" },
    { keys: ["p"], pattern: "p p p p p p" },
    { keys: ["w"], pattern: "w w w w w w" },
    { keys: ["q"], pattern: "q q q q q q" },
  ],
  wordBank: ["dlo", "moun", "timoun", "manje", "papa", "manman", "jodi", "maten", "kontan", "lalin"],
  themePhrases: ["Mwen kapab kreye tou."],
  verse: {
    text: "Mwen te rele ou pa non ou. Se pa M ou ye!",
    unlockedThroughDay: 5,
  },
  badgeId: "day3-made-to-create",
};

export default day3Practice;
