import type { DayDisplayText } from "@/lib/types";

// Sourced verbatim from Aprann_Bible_Content_Pastoral_Revised_Review
// (Google Drive, fileId 1MHnPlw8y-EZFZf3tt7Abxz3oPBktkqt_OtMLoU-zJCw,
// last edited 2026-07-21). Doc is still pending final pastor sign-off —
// see project memory for the full pastoral content and that caveat.
//
// NOT YET WIRED IN: content/days/index.ts's DAY_PRACTICE has no Day 4
// entry, so getAvailableDays() won't surface this day yet — the key
// ladder, drills, word bank, and verse slice for Day 4 are still an open
// item (see project memory), independent of this display text. Note also
// that Shift is scheduled to unlock Day 4 per content/days/index.ts's
// isShiftUnlocked — Day 4's newKeys will need to reflect that once decided.

const day4DisplayEn: DayDisplayText = {
  themeTitle: "Soar on Wings",
  bibleTruth: "God gives me strength to rise.",
  scratchProject: "Make It Fly",
  badgeLabel: "Soar on Wings",
};

export default day4DisplayEn;
