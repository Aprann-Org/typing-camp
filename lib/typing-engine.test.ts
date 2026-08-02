import { describe, expect, it } from "vitest";
import {
  calculateAccuracy,
  createTypingState,
  emptySummary,
  NO_LOCKED_KEYS,
  passesAccuracyGate,
  processBackspace,
  processKeystroke,
} from "./typing-engine";
import { calculateWpm } from "./wpm";

/** Helper: locked characters that are pre-filled/skipped (Verse Builder behavior). */
const autofill = (...chars: string[]) => ({ autofill: new Set(chars), guidedTyped: new Set<string>() });
/** Helper: locked characters the child still types, unscored (guided mode). */
const guided = (...chars: string[]) => ({ autofill: new Set<string>(), guidedTyped: new Set(chars) });
const NO_LOCKED = NO_LOCKED_KEYS;

describe("createTypingState", () => {
  it("builds one pending slot per character", () => {
    const state = createTypingState("fj", NO_LOCKED);
    expect(state.slots).toHaveLength(2);
    expect(state.slots.every((s) => s.status === "pending")).toBe(true);
    expect(state.index).toBe(0);
    expect(state.finished).toBe(false);
  });

  it("auto-fills and skips locked characters up front, landing on the first strict slot", () => {
    const locked = autofill("V", "i", "n");
    const state = createTypingState("Vince f", locked);
    expect(state.slots[0].status).toBe("guided");
    expect(state.slots[1].status).toBe("guided");
    expect(state.slots[2].status).toBe("guided");
    // 'c' is not locked, so index should stop there, not run past it.
    expect(state.index).toBe(3);
    expect(state.slots[3].status).toBe("pending");
  });

  it("finishes immediately if the whole target is locked", () => {
    const locked = autofill("a", "b");
    const state = createTypingState("ab", locked);
    expect(state.finished).toBe(true);
    expect(state.guidedTypedCount).toBe(2);
  });
});

describe("processKeystroke — correct input", () => {
  it("advances the index and records a correct slot", () => {
    let state = createTypingState("fj", NO_LOCKED);
    state = processKeystroke(state, "f", NO_LOCKED, "mark-and-advance");
    expect(state.slots[0].status).toBe("correct");
    expect(state.index).toBe(1);
    expect(state.correctCount).toBe(1);
    expect(state.finished).toBe(false);
  });

  it("finishes after the last correct character", () => {
    let state = createTypingState("fj", NO_LOCKED);
    state = processKeystroke(state, "f", NO_LOCKED, "mark-and-advance");
    state = processKeystroke(state, "j", NO_LOCKED, "mark-and-advance");
    expect(state.finished).toBe(true);
    expect(state.completedAt).not.toBeNull();
  });

  it("skips over locked characters reached mid-stream", () => {
    const locked = autofill("x");
    let state = createTypingState("fxj", locked);
    expect(state.index).toBe(0);
    state = processKeystroke(state, "f", locked, "mark-and-advance");
    // after typing f, the locked 'x' should auto-fill and index should land on 'j'
    expect(state.slots[1].status).toBe("guided");
    expect(state.index).toBe(2);
  });
});

describe("processKeystroke — error handling modes", () => {
  it("gentle-nudge (Starter): wrong key does nothing, no advance, no visible mark", () => {
    let state = createTypingState("f", NO_LOCKED);
    state = processKeystroke(state, "d", NO_LOCKED, "gentle-nudge");
    expect(state.index).toBe(0);
    expect(state.slots[0].status).toBe("pending");
    expect(state.incorrectCount).toBe(0);
    expect(state.keyErrors.f).toBe(1);
    expect(state.lastMiss).toBe("f");
  });

  it("mark-and-advance (Builder): wrong key marks red but advances", () => {
    let state = createTypingState("fj", NO_LOCKED);
    state = processKeystroke(state, "d", NO_LOCKED, "mark-and-advance");
    expect(state.slots[0].status).toBe("incorrect");
    expect(state.slots[0].typedChar).toBe("d");
    expect(state.index).toBe(1);
    expect(state.incorrectCount).toBe(1);
    expect(state.keyErrors.f).toBe(1);
  });

  it("must-correct (Flyer): wrong key marks red and does NOT advance until backspace", () => {
    let state = createTypingState("fj", NO_LOCKED);
    state = processKeystroke(state, "d", NO_LOCKED, "must-correct");
    expect(state.slots[0].status).toBe("incorrect");
    expect(state.index).toBe(0);
    expect(state.incorrectCount).toBe(1);

    state = processBackspace(state);
    expect(state.slots[0].status).toBe("pending");
    expect(state.index).toBe(0);

    state = processKeystroke(state, "f", NO_LOCKED, "must-correct");
    expect(state.slots[0].status).toBe("correct");
    expect(state.index).toBe(1);
  });

  it("processBackspace is a no-op when the current slot isn't marked incorrect", () => {
    const state = createTypingState("f", NO_LOCKED);
    const after = processBackspace(state);
    expect(after).toBe(state);
  });
});

// A Shift mistake looks identical to any other miss in the raw comparison, but
// it is a completely different mistake to make: the child found the right key
// and got the modifier wrong. Blaming the letter key sends them to practise
// the one thing they already did correctly.
describe("processKeystroke — telling a Shift mistake from a wrong key", () => {
  it("flags a missing Shift on a capital", () => {
    let state = createTypingState("B", NO_LOCKED);
    state = processKeystroke(state, "b", NO_LOCKED, "gentle-nudge");
    expect(state.lastMissKind).toBe("shift");
  });

  it("flags a Shift held when it shouldn't be (stuck Shift, or Caps Lock)", () => {
    let state = createTypingState("b", NO_LOCKED);
    state = processKeystroke(state, "B", NO_LOCKED, "gentle-nudge");
    expect(state.lastMissKind).toBe("shift");
  });

  it("flags shifted punctuation, where the two forms aren't a case pair", () => {
    // "!" is Shift+"1" — a toLowerCase() comparison would call this a wrong
    // key and point the child at the wrong place on Day 5.
    let state = createTypingState("!", NO_LOCKED);
    state = processKeystroke(state, "1", NO_LOCKED, "gentle-nudge");
    expect(state.lastMissKind).toBe("shift");
  });

  it("calls a genuinely different key a key mistake", () => {
    let state = createTypingState("f", NO_LOCKED);
    state = processKeystroke(state, "d", NO_LOCKED, "gentle-nudge");
    expect(state.lastMissKind).toBe("key");
  });

  it("clears on a correct keystroke and on backspace", () => {
    let state = createTypingState("fj", NO_LOCKED);
    state = processKeystroke(state, "d", NO_LOCKED, "gentle-nudge");
    expect(state.lastMissKind).toBe("key");
    state = processKeystroke(state, "f", NO_LOCKED, "gentle-nudge");
    expect(state.lastMissKind).toBeNull();

    let flyer = createTypingState("fj", NO_LOCKED);
    flyer = processKeystroke(flyer, "F", NO_LOCKED, "must-correct");
    expect(flyer.lastMissKind).toBe("shift");
    flyer = processBackspace(flyer);
    expect(flyer.lastMissKind).toBeNull();
  });
});

describe("locked characters never affect accuracy or WPM", () => {
  it("guided characters are not counted in correctCount/incorrectCount", () => {
    const locked = autofill("V", "i", "n", "c", "e");
    const state = createTypingState("Vince", locked);
    expect(state.finished).toBe(true);
    expect(state.correctCount).toBe(0);
    expect(state.incorrectCount).toBe(0);
    expect(state.guidedTypedCount).toBe(5);
    expect(calculateAccuracy(state)).toBe(1);
  });
});

// Regression tests for a real bug: guided-mode targets (Theme Challenge,
// the Name Animator game) were sharing the Verse Builder's autofill
// behavior, so a target made entirely of not-yet-unlocked characters — a
// child's own name on Day 1 — completed itself instantly with zero
// keystrokes and skipped two of the session's seven stages.
describe("guided-typed helper keys (guided mode)", () => {
  it("does NOT auto-complete a target made entirely of helper keys", () => {
    const locked = guided("V", "i", "n", "c", "e");
    const state = createTypingState("Vince", locked);
    expect(state.finished).toBe(false);
    expect(state.index).toBe(0);
    expect(state.guidedTypedCount).toBe(0);
  });

  it("advances on a correct helper keystroke without scoring it", () => {
    const locked = guided("v");
    let state = createTypingState("vf", locked);
    state = processKeystroke(state, "v", locked, "mark-and-advance");
    expect(state.slots[0].status).toBe("guided");
    expect(state.index).toBe(1);
    expect(state.guidedTypedCount).toBe(1);
    // Never counted toward accuracy, and never recorded as a drilled key.
    expect(state.correctCount).toBe(0);
    expect(state.keyAttempts.v).toBeUndefined();
    expect(calculateAccuracy(state)).toBe(1);
  });

  it("never penalizes a wrong keystroke on a helper key, at any level", () => {
    const locked = guided("v");
    for (const mode of ["gentle-nudge", "mark-and-advance", "must-correct"] as const) {
      let state = createTypingState("vf", locked);
      state = processKeystroke(state, "q", locked, mode);
      expect(state.index).toBe(0);
      expect(state.slots[0].status).toBe("pending");
      expect(state.incorrectCount).toBe(0);
      expect(state.keyErrors.v).toBeUndefined();
    }
  });

  it("completes only after every helper key has actually been typed", () => {
    const locked = guided("v", "n");
    let state = createTypingState("vn", locked);
    state = processKeystroke(state, "v", locked, "mark-and-advance");
    expect(state.finished).toBe(false);
    state = processKeystroke(state, "n", locked, "mark-and-advance");
    expect(state.finished).toBe(true);
    expect(state.guidedTypedCount).toBe(2);
    expect(calculateAccuracy(state)).toBe(1);
  });

  it("mixes scored and helper characters in one target", () => {
    // "fv": f is unlocked/scored, v is a helper key.
    const locked = guided("v");
    let state = createTypingState("fv", locked);
    state = processKeystroke(state, "f", locked, "mark-and-advance");
    state = processKeystroke(state, "v", locked, "mark-and-advance");
    expect(state.finished).toBe(true);
    expect(state.correctCount).toBe(1);
    expect(state.guidedTypedCount).toBe(1);
  });

  it("still auto-fills characters that are impossible to type, even in guided mode", () => {
    // An accented Kreyòl character has no key on US QWERTY, so it must be
    // pre-filled or the child would be stuck on it forever. buildLockedKeyConfig
    // puts those in `autofill` even in guided mode; this asserts the engine
    // honors a config that mixes both kinds.
    const locked = { autofill: new Set(["è"]), guidedTyped: new Set(["n"]) };
    let state = createTypingState("èn", locked);
    // "è" auto-filled up front; index lands on the typeable helper key.
    expect(state.slots[0].status).toBe("guided");
    expect(state.index).toBe(1);
    expect(state.finished).toBe(false);
    state = processKeystroke(state, "n", locked, "mark-and-advance");
    expect(state.finished).toBe(true);
    expect(state.guidedTypedCount).toBe(2);
  });
});

describe("calculateAccuracy", () => {
  it("returns 1 when nothing has been attempted (never show a failing score on no data)", () => {
    const state = createTypingState("f", NO_LOCKED);
    expect(calculateAccuracy(state)).toBe(1);
  });

  it("computes correct / (correct + incorrect)", () => {
    let state = createTypingState("ffff", NO_LOCKED);
    state = processKeystroke(state, "f", NO_LOCKED, "mark-and-advance");
    state = processKeystroke(state, "d", NO_LOCKED, "mark-and-advance");
    state = processKeystroke(state, "f", NO_LOCKED, "mark-and-advance");
    state = processKeystroke(state, "f", NO_LOCKED, "mark-and-advance");
    expect(state.correctCount).toBe(3);
    expect(state.incorrectCount).toBe(1);
    expect(calculateAccuracy(state)).toBe(0.75);
  });
});

describe("passesAccuracyGate", () => {
  it("always passes when there is no gate (Starter)", () => {
    expect(passesAccuracyGate({ ...emptySummary(), correctCount: 1, incorrectCount: 9 }, null)).toBe(true);
  });

  it("always passes when nothing was attempted", () => {
    expect(passesAccuracyGate(emptySummary(), 0.95)).toBe(true);
  });

  it("passes when accuracy meets the gate exactly", () => {
    expect(passesAccuracyGate({ ...emptySummary(), correctCount: 17, incorrectCount: 3 }, 0.85)).toBe(true);
  });

  it("fails when accuracy is below the gate", () => {
    expect(passesAccuracyGate({ ...emptySummary(), correctCount: 8, incorrectCount: 2 }, 0.95)).toBe(false);
  });
});

describe("calculateWpm", () => {
  it("returns 0 for near-zero elapsed time (avoids a divide-by-near-zero spike)", () => {
    expect(calculateWpm(5, 0, 500)).toBe(0);
  });

  it("computes standard 5-chars-per-word WPM", () => {
    // 50 correct chars (10 words) in exactly 30 seconds => 20 WPM
    expect(calculateWpm(50, 0, 30_000)).toBe(20);
  });
});
