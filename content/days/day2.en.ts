import type { DayDisplayText } from "@/lib/types";

// Sourced verbatim from Aprann_Bible_Content_Pastoral_Revised_Review
// (Google Drive, fileId 1MHnPlw8y-EZFZf3tt7Abxz3oPBktkqt_OtMLoU-zJCw,
// last edited 2026-07-21). Doc is still pending final pastor sign-off —
// see project memory for the full pastoral content and that caveat.
//
// NOT YET WIRED IN: content/days/index.ts's DAY_PRACTICE has no Day 2
// entry, so getAvailableDays() won't surface this day yet — the key
// ladder, drills, word bank, and verse slice for Day 2 are still an open
// item (see project memory), independent of this display text.

const day2DisplayEn: DayDisplayText = {
  themeTitle: "Wonderfully Made",
  bibleTruth: "God made me wonderfully.",
  scratchProject: "Animate a Character",
  badgeLabel: "Wonderfully Made",
};

export default day2DisplayEn;
