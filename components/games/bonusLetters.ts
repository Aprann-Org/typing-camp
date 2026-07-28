// Shared by the bonus games (Ninja Hop, Maze Runner, Star Blaster, Car
// Race) — none of them are tied to a single day's curriculum theme, so
// their targets are single letters rather than one day's word bank.
//
// The pool is the full alphabet, not whatever's unlocked so far: content/
// days' validate-content.ts already guarantees every letter a-z is taught
// somewhere across the 5-day ladder (see its "these letters are never
// taught" check), so "letters the child has learned or will learn" IS the
// full alphabet — there's no letter outside it to accidentally include.
// Not-yet-taught letters still go through WordSceneGame's guided mode (the
// same handling Day 1's Name Animator gives a child's own name before every
// letter in it is taught), so this never asks for an unscored keystroke to
// count against anyone.
//
// Punctuation and space are excluded on purpose — a blank or symbol tile
// reads as a glitch in a game whose whole point is one satisfying keystroke
// per hop/shot/step.
const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");

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
    while (pick === previous) pick = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    sequence.push(pick);
    previous = pick;
  }
  return sequence;
}
