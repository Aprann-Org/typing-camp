import type { DayDisplayText } from "@/lib/types";

// Display-only text for Day 1, shown when the child's instruction language
// is English. Not typed by the child — see day1.practice.ts for the
// single-source practice content (word bank, drills, verse), which is
// independent of this toggle.
//
// Sourced verbatim from Aprann_Bible_Content_Pastoral_Revised_Review
// (Google Drive, fileId 1MHnPlw8y-EZFZf3tt7Abxz3oPBktkqt_OtMLoU-zJCw,
// last edited 2026-07-21) — the "take-home truth" and Scratch project
// name for Day 1. See project memory for the full pastoral content
// (themes/Scripture/Scratch projects for all 5 days) and the note that
// this doc is still pending final pastor sign-off.

const day1DisplayEn: DayDisplayText = {
  themeTitle: "Called by Name",
  bibleTruth: "God knows my name.",
  scratchProject: "Animate Your Name",
  badgeLabel: "Called by Name",
};

export default day1DisplayEn;
