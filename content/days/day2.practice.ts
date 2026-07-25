import type { DayPracticeContent } from "@/lib/types";

// What the child actually TYPES on Day 2 — independent of the UI
// instruction-language toggle (locked project decision: practice content is
// always Kreyòl). See day2.en.ts / day2.ht.ts for bilingual display text.
//
// KEY LADDER — Day 2 is the top row's strong fingers (index + middle):
// e r t y u i. Chosen so the four most useful vowels/consonants for Kreyòl
// arrive as early as possible; verified by script that the week's verse
// reaches exactly 100% typeable on Day 5, no earlier.
//
// wordBank: everyday high-frequency Kreyòl vocabulary, verified by
// scripts/validate-content.ts to use only keys unlocked through Day 2.
// STATUS: sourced by Claude (AI), 2026-07-25 — real words, not invented,
// but NOT reviewed by a native speaker. Dorie / Hudson: please check.
//
// themePhrases: typed in guided mode, so locked keys are allowed (the child
// still types them, with the finger shown, and they don't affect the score).
// Kept accent-free per the locked decision that è/ò/à stay out of typed
// content — that rules out the literal take-home truth ("Bondye fè m yon jan
// ki mèveye"), so this is a simpler accent-free sentence carrying the same
// idea. REVIEW: replace with the camp's own wording if it has one.

const day2Practice: DayPracticeContent = {
  day: 2,
  newKeys: ["e", "r", "t", "y", "u", "i"],
  drills: [
    { keys: ["e"], pattern: "e e e e e e" },
    { keys: ["i"], pattern: "i i i i i i" },
    { keys: ["r"], pattern: "r r r r r r" },
    { keys: ["u"], pattern: "u u u u u u" },
    { keys: ["t"], pattern: "t t t t t t" },
    { keys: ["y"], pattern: "y y y y y y" },
  ],
  wordBank: ["kay", "lakay", "ale", "lari", "dife", "kite", "fig", "gita", "jedi", "glas"],
  themePhrases: ["Se Bondye ki kreye mwen."],
  verse: {
    text: "Mwen te rele ou pa non ou. Se pa M ou ye!",
    unlockedThroughDay: 5,
  },
  badgeId: "day2-wonderfully-made",
};

export default day2Practice;
