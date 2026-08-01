import type { DayPracticeContent } from "@/lib/types";

// What the child actually TYPES on Day 4. See day2.practice.ts's header for
// the shared conventions.
//
// KEY LADDER — Day 4 finishes the bottom row (z x c v b) AND unlocks Shift,
// which is the day's real milestone: every letter of the alphabet is now
// taught, and capitals become possible for the first time. The `teachesShift`
// flag below is the single declaration of that — content/days/index.ts's
// isShiftUnlocked reads it, so the two can no longer drift apart.
//
// The word bank deliberately ends on "Bondye" and "Jezi" — the first two
// words in the week a child can type with a real capital letter, which is
// what makes Shift feel worth learning rather than a chore.

const day4Practice: DayPracticeContent = {
  day: 4,
  newKeys: ["z", "x", "c", "v", "b"],
  teachesShift: true,
  // All five keys are the left hand's remaining bottom row, so there's no
  // mirrored right-hand partner left to pair with (unlike Days 2-3) — this
  // splits by finger instead, strongest to weakest: v/b (both left index,
  // same relationship as Day 1's g/h), then middle/ring/pinky solo.
  newKeyGroups: [
    ["v", "b"],
    ["c"],
    ["x"],
    ["z"],
  ],
  drills: [
    { keys: ["b"], pattern: "b b b b b b" },
    { keys: ["c"], pattern: "c c c c c c" },
    { keys: ["v"], pattern: "v v v v v v" },
    { keys: ["z"], pattern: "z z z z z z" },
    { keys: ["x"], pattern: "x x x x x x" },
  ],
  wordBank: ["zanmi", "bon", "liv", "tab", "chita", "danse", "chante", "legliz", "Bondye", "Jezi"],
  themePhrases: ["Bondye ban mwen kouraj."],
  verse: {
    text: "Mwen te rele ou pa non ou. Se pa M ou ye!",
    unlockedThroughDay: 5,
  },
  badgeId: "day4-soar-on-wings",
};

export default day4Practice;
