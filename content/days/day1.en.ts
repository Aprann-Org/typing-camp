import type { DayDisplayText } from "@/lib/types";

// Display-only text for Day 1, shown when the child's instruction language
// is English. Not typed by the child — see day1.practice.ts for the
// single-source practice content (word bank, drills, verse), which is
// independent of this toggle.
//
// TODO(content): bibleTruth and scratchProject below are reasonable
// placeholders inferred from the theme title and the game brief ("Name
// Animator... mirrors the Day 1 Scratch project exactly"), not pulled from
// Aprann_Bible_Content_Pastoral_Revised_Review (Google Drive) — this
// session has no access to that doc. Confirm both against the pastoral
// review before camp.

const day1DisplayEn: DayDisplayText = {
  themeTitle: "Called by Name",
  bibleTruth: "God knows your name and calls you His own.",
  scratchProject: "Name Animator",
  badgeLabel: "Called by Name",
};

export default day1DisplayEn;
