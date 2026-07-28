import type { DayPracticeContent } from "@/lib/types";

// Single source of truth for what a child actually TYPES on Day 1 —
// independent of the UI instruction-language toggle. Locked project
// decision (2026-07-25): practice content is always Kreyòl regardless of
// which language the on-screen instructions are shown in, since these are
// Haitian children practicing real words, not an English-vs-Kreyòl
// exercise. See day1.en.ts / day1.ht.ts for the bilingual DISPLAY-only text
// (theme title, Bible truth, etc.) that does follow the toggle.
//
// wordBank: still an English placeholder, by explicit team decision
// (2026-07-25) — real home-row-only Kreyòl vocabulary is genuinely scarce
// (Day 1's home row has only one vowel, "a"), and confidently sourcing it
// needs a native Kreyòl speaker, not a guess. Do not replace this with
// invented Kreyòl words. Day 1's theme carries through the Name Animator
// game regardless, same reasoning as the original English-only version.
//
// verse.text: sourced from a real published Haitian Creole Bible
// translation — ebible.org's "Bib Sen An" (Isaiah / Izayi 43):
// https://ebible.org/hatbsa/ISA43.htm — fetched directly, not recalled
// from memory or paraphrased. Full verse 1: "Men koulye a, konsa pale
// SENYÈ a, Kreyatè ou a, O Jacob, e Sila ki te fòme ou a, O Israël: 'Pa
// pè, paske Mwen te rachte ou. Mwen te rele ou pa non ou. Se pa M ou ye!'"
// The excerpt below is the portion matching the brief's short English
// verse ("I have called you by name; you are mine."). Character-by-
// character analysis against the key ladder confirms this excerpt ALSO
// resolves fully typeable exactly on Day 5 (only "." and "!" require Day
// 5; everything else — m,w,e,n,t,r,l,o,u,p,a,s,y plus two Shift capitals —
// falls on Days 1-4), so unlockedThroughDay stays 5, matching the English
// ladder's design intent.
// TODO(kreyol): confirm this exact wording matches whatever Kreyòl Bible
// translation Aprann's own camp materials actually use — multiple
// published Kreyòl translations exist, and camp may reference a different
// one specifically.

const day1Practice: DayPracticeContent = {
  day: 1,
  newKeys: ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", " "],
  // Day 1 has 11 new keys — far more than any other day — so the New Keys
  // stage teaches them as five checkpoints (a short breather between each)
  // instead of one unbroken run through all eleven. Order is finger pairs,
  // starting with F/J: the same anchor keys the Ready stage right before
  // this already told the child to rest their index fingers on ("Feel the
  // bump"), so New Keys picks up exactly where Ready left off rather than
  // starting over at "a". See lib/drill-generator.ts's buildNewKeysCheckpoints.
  newKeyGroups: [
    ["f", "j"],
    ["d", "k"],
    ["s", "l"],
    ["a", ";"],
    ["g", "h"],
    [" "],
  ],
  // Author-written isolated intro for each new key; alternation-with-
  // known-keys practice is generated dynamically — see lib/drill-generator.ts.
  drills: [
    { keys: ["f"], pattern: "f f f f f f" },
    { keys: ["j"], pattern: "j j j j j j" },
    { keys: ["d"], pattern: "d d d d d d" },
    { keys: ["k"], pattern: "k k k k k k" },
    { keys: ["s"], pattern: "s s s s s s" },
    { keys: ["l"], pattern: "l l l l l l" },
    { keys: ["a"], pattern: "a a a a a a" },
    { keys: [";"], pattern: "; ; ; ; ; ;" },
    { keys: ["g"], pattern: "g g g g g g" },
    { keys: ["h"], pattern: "h h h h h h" },
  ],
  // NEEDS TRANSLATION (see file header) — English placeholder, kept by
  // explicit team decision until a native Kreyòl speaker supplies real
  // home-row-only words.
  wordBank: ["all", "glad", "dad", "has", "shall", "flag", "ask", "half", "flash", "salad"],
  themePhrases: [],
  verse: {
    text: "Mwen te rele ou pa non ou. Se pa M ou ye!",
    unlockedThroughDay: 5,
  },
  badgeId: "day1-called-by-name",
};

export default day1Practice;
