import type { DayPracticeContent } from "@/lib/types";

// What the child actually TYPES on Day 5. See day2.practice.ts's header for
// the shared conventions.
//
// KEY LADDER — Day 5 is punctuation, and it is what completes the week's
// verse: "." and "!" are the last two characters standing between the child
// and typing Isaiah 43:1 entirely unassisted. That 95% -> 100% is the Verse
// Builder's designed payoff, so this day's newKeys are load-bearing.
//
// "!" and "?" are declared here as the SHIFTED characters they actually are,
// not as their base keys "1" and "/" — a teacher says "today we learn the
// exclamation mark," not "today we learn the 1 key." getCumulativeUnlockedKeys
// in ./index.ts resolves each declared key back to its base so the typing
// engine (which looks up shifted chars via their base key) still agrees.
// This works only because Shift is already unlocked on Day 4.
//
// Punctuation lives in `drills` rather than `wordBank` on purpose: drills are
// the isolated new-key intro, so that is where the new marks belong. The word
// bank stays real words — now drawing on the full alphabet, themed to Day 5's
// lost-sheep parable.

const day5Practice: DayPracticeContent = {
  day: 5,
  newKeys: [".", ",", "'", "!", "?"],
  // Four checkpoints, by finger: comma (right middle) alone, period (right
  // ring) alone, apostrophe/question-mark together (both right pinky — one
  // direct, one shifted), then "!" alone as the final checkpoint — the last
  // character standing between the child and typing the week's memory verse
  // unassisted, so it gets its own dedicated moment rather than being lumped
  // in with the rest.
  newKeyGroups: [
    [","],
    ["."],
    ["'", "?"],
    ["!"],
  ],
  drills: [
    { keys: ["."], pattern: ". . . . . ." },
    { keys: [","], pattern: ", , , , , ," },
    { keys: ["'"], pattern: "' ' ' ' ' '" },
    { keys: ["!"], pattern: "! ! ! ! ! !" },
    { keys: ["?"], pattern: "? ? ? ? ? ?" },
  ],
  wordBank: ["mouton", "chache", "jwenn", "rele", "renmen", "retounen", "vwazen", "kontan", "lakay", "Jezi"],
  themePhrases: ["Bondye ap chache mwen."],
  verse: {
    text: "Mwen te rele ou pa non ou. Se pa M ou ye!",
    unlockedThroughDay: 5,
  },
  badgeId: "day5-the-one-who-seeks-you",
};

export default day5Practice;
