import type { DayDisplayText } from "@/lib/types";

// Display-only text for Day 1 in Kreyòl (theme title, Bible truth, Scratch
// project name, badge label). NOT the practice content the child types —
// see day1.practice.ts for that.
//
// STATUS: first-pass translation by Claude (AI), 2026-07-25 — a real
// translation attempt, not placeholders, but unreviewed by a native
// speaker. See content/i18n/ht.ts's header for the same caveat.
//
// English side (day1.en.ts) now matches Aprann_Bible_Content_Pastoral_
// Revised_Review (Google Drive) verbatim as of 2026-07-25 — this file's
// Kreyòl wording has been updated to translate that exact English text,
// but still needs a native-speaker pass.

const day1DisplayHt: DayDisplayText = {
  // Echoes the Day 1 verse's own wording ("Mwen te rele ou pa non ou" —
  // I have called you by name), so the theme title and the Verse Builder
  // text reinforce each other.
  themeTitle: "Rele pa Non Ou",

  // "God knows my name." (verbatim take-home truth from the pastoral doc)
  bibleTruth: "Bondye konnen non mwen.",

  // REVIEW: Scratch project names may well be left in English in the camp
  // workbook — if so, revert this to "Name Animator"/English so the app and
  // the workbook match what a child sees on screen in Scratch itself.
  scratchProject: "Anime Non Ou",

  badgeLabel: "Rele pa Non Ou",
};

export default day1DisplayHt;
