import type { DayDisplayText } from "@/lib/types";

// Sourced verbatim from Aprann_Bible_Content_Pastoral_Revised_Review
// (Google Drive, fileId 1MHnPlw8y-EZFZf3tt7Abxz3oPBktkqt_OtMLoU-zJCw,
// last edited 2026-07-21). Doc is still pending final pastor sign-off —
// see project memory for the full pastoral content and that caveat.
//
// NOT YET WIRED IN: content/days/index.ts's DAY_PRACTICE has no Day 5
// entry, so getAvailableDays() won't surface this day yet — the key
// ladder, drills, word bank, and verse slice for Day 5 are still an open
// item (see project memory), independent of this display text.
//
// Note for whoever builds Day 5's Report/certificate discussion: the doc's
// Day 5 also includes a full expanded gospel invitation script and a
// "continued spiritual care & church connection" section — out of scope
// for this app, but relevant to how the in-person camp day is structured
// around this typing session.

const day5DisplayEn: DayDisplayText = {
  themeTitle: "The One Who Seeks You",
  bibleTruth: "God comes looking for me.",
  scratchProject: "Chase Game",
  badgeLabel: "The One Who Seeks You",
};

export default day5DisplayEn;
