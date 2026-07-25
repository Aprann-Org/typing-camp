import type { DayDisplayText } from "@/lib/types";

// Display-only text for Day 1 in Kreyòl (theme title, Bible truth, Scratch
// project name, badge label). NOT the practice content the child types —
// see day1.practice.ts for that.
//
// STATUS: first-pass translation by Claude (AI), 2026-07-25 — a real
// translation attempt, not placeholders, but unreviewed by a native
// speaker. See content/i18n/ht.ts's header for the same caveat.
//
// IMPORTANT for the Aprann team: themeTitle and bibleTruth here should
// ultimately match whatever wording Aprann_Bible_Content_Pastoral_Revised_
// Review (Google Drive) uses for Day 1 — that pastor-reviewed doc is the
// authority, not this file. The English side (day1.en.ts) is also still an
// inferred placeholder pending that doc.

const day1DisplayHt: DayDisplayText = {
  // Echoes the Day 1 verse's own wording ("Mwen te rele ou pa non ou" —
  // I have called you by name), so the theme title and the Verse Builder
  // text reinforce each other.
  themeTitle: "Rele pa Non Ou",

  // "God knows your name and calls you His own." The second half is phrased
  // to echo the verse's "Se pa M ou ye!" (You are mine).
  bibleTruth: "Bondye konnen non ou, epi li di se pa l ou ye.",

  // REVIEW: Scratch project names may well be left in English in the camp
  // workbook — if so, revert this to "Name Animator" so the app and the
  // workbook match what a child sees on screen in Scratch itself.
  scratchProject: "Animatè Non",

  badgeLabel: "Rele pa Non Ou",
};

export default day1DisplayHt;
