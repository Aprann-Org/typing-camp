import { getCumulativeUnlockedKeys } from "@/content/days";

// Shared by the bonus games (Ninja Hop, Maze Runner, Star Blaster, Car
// Race) — none of them are tied to a single day's curriculum theme, so
// their targets are single letters rather than one day's word bank.
//
// The pool is every letter the 5-day curriculum ever teaches, not whatever's
// unlocked so far by the child playing right now — derived directly from
// content/days rather than a hardcoded a-z literal, so if the curriculum
// ever changes (a letter moves, a day is restructured), this can't silently
// drift out of sync with what's actually taught. getCumulativeUnlockedKeys(5)
// is every key unlocked by the end of the week — the full ladder — and
// scripts/validate-content.ts separately guarantees that ladder covers all
// 26 letters, so today this pool IS the full alphabet; the derivation is
// what keeps that true automatically rather than by two files agreeing.
//
// Lowercase only, on purpose — the /^[a-z]$/ filter excludes capital letters
// even though some ARE technically "taught" (Shift-capitalized forms appear
// in Day 4+ word bank entries like "Bondye"/"Jezi", not as their own newKeys
// entry). A bonus game drilling capitals would silently also be drilling
// Shift, which is its own taught skill with its own day (Day 4) — these
// games stay single-key practice, not a Shift drill in disguise.
//
// Not-yet-taught letters still go through WordSceneGame's guided mode (the
// same handling Day 1's Name Animator gives a child's own name before every
// letter in it is taught), so this never asks for an unscored keystroke to
// count against anyone.
//
// Punctuation and space are excluded on purpose too — a blank or symbol
// tile reads as a glitch in a game whose whole point is one satisfying
// keystroke per hop/shot/step.
const ALPHABET = Array.from(getCumulativeUnlockedKeys(5)).filter((char) => /^[a-z]$/.test(char));

/**
 * A random run of `length` letters covering the full curriculum alphabet,
 * with no two consecutive letters the same (a repeat back-to-back reads as
 * the game being stuck, not as practice — same reasoning as the New Keys
 * drill generator's alternation guard).
 */
export function pickLetterSequence(length: number): string[] {
  const sequence: string[] = [];
  let previous: string | null = null;
  for (let i = 0; i < length; i++) {
    let pick = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    while (pick === previous && ALPHABET.length > 1) {
      pick = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    }
    sequence.push(pick);
    previous = pick;
  }
  return sequence;
}
