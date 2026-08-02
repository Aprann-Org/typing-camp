import type { ErrorHandlingMode } from "@/content/levels";
import { DEFAULT_LAYOUT, getKeyForChar, type LayoutId } from "@/content/layouts";

// Pure, DOM-free typing engine. No React, no browser APIs — this is the
// thing that decides whether a keystroke was "correct," not a component.
// Unit-tested directly in typing-engine.test.ts before any UI touches it.
//
// A KeyboardEvent only ever reports which key was pressed, never which
// physical finger pressed it — so "correct finger for correct key" is
// necessarily a visual coaching signal (look up the expected finger for
// the target character and show it), never something this engine can
// enforce as an input gate. The engine only ever knows about characters.

export type CharStatus = "pending" | "correct" | "incorrect" | "guided";

export type CharSlot = {
  char: string;
  status: CharStatus;
  typedChar?: string;
};

/**
 * How the engine treats characters the child hasn't unlocked yet. The two
 * behaviors are genuinely different and are NOT interchangeable — see the
 * brief's two-layer design:
 *
 * - `autofill`: pre-filled, dimmed, skipped over; the child never types
 *   them. This is Verse Builder behavior ("Characters whose keys are locked
 *   render pre-filled in a dimmed style, auto-advancing when reached"), and
 *   it is also the only correct behavior for characters that have no key at
 *   all on the active layout (e.g. an accented Kreyòl character on US
 *   QWERTY) — a child physically cannot type those.
 *
 * - `guidedTyped`: the child DOES type them, with the finger shown, and
 *   they simply never affect accuracy or WPM. This is guided-mode behavior
 *   for Theme Challenge and the daily games ("Characters using locked keys
 *   are visually marked as 'helper keys' and do not count against the
 *   session accuracy score"). Autofilling these instead would make a stage
 *   whose target is mostly locked — e.g. a child's own name on Day 1 —
 *   complete itself instantly without a single keystroke.
 */
export type LockedKeyConfig = {
  autofill: ReadonlySet<string>;
  guidedTyped: ReadonlySet<string>;
};

export const NO_LOCKED_KEYS: LockedKeyConfig = { autofill: new Set(), guidedTyped: new Set() };

export type TypingState = {
  target: string;
  slots: CharSlot[];
  /** Index of the slot the child is currently on. */
  index: number;
  /** Per-expected-character miss counts, scored characters only. */
  keyErrors: Record<string, number>;
  /** Per-expected-character attempt counts (correct + incorrect), scored only. */
  keyAttempts: Record<string, number>;
  correctCount: number;
  incorrectCount: number;
  /** Characters filled via a locked/helper key — never counted toward accuracy or WPM. */
  guidedTypedCount: number;
  startedAt: number | null;
  completedAt: number | null;
  finished: boolean;
  /** Set for one tick after a miss, for a nudge/shake cue; not persisted scoring. */
  lastMiss: string | null;
  /**
   * Why the last miss happened, so the UI can point at the right key and say
   * something useful:
   *
   * - `"shift"`: the correct physical key, wrong Shift state — "b" for "B", or
   *   "1" for "!". The letter was right, so the blame belongs on Shift.
   * - `"key"`: a different key entirely.
   *
   * Which DIRECTION the Shift mistake went (needed Shift vs shouldn't have
   * held it) is deliberately not stored — the UI derives it from the expected
   * character via requiresShift, so there's no second thing to keep in sync.
   */
  lastMissKind: "shift" | "key" | null;
  /**
   * Monotonic counters for "a correct/incorrect keystroke just happened,"
   * independent of scoring. Repeated misses on the same key leave
   * `lastMiss` unchanged (same string value), which a value-comparison
   * effect wouldn't re-fire on — these exist so side effects like sound
   * cues have something that reliably changes on every event.
   */
  correctEventId: number;
  missEventId: number;
};

/** Mark consecutive autofill slots starting at `index` as filled, advancing past them. */
function advancePastAutofill(state: TypingState, locked: LockedKeyConfig): TypingState {
  let { index, guidedTypedCount } = state;
  const nextSlots = state.slots.slice();
  let changed = false;
  while (index < nextSlots.length && locked.autofill.has(nextSlots[index].char)) {
    nextSlots[index] = { ...nextSlots[index], status: "guided", typedChar: nextSlots[index].char };
    guidedTypedCount += 1;
    index += 1;
    changed = true;
  }
  if (!changed) return state;
  const finished = index >= nextSlots.length;
  return {
    ...state,
    slots: nextSlots,
    index,
    guidedTypedCount,
    finished,
    completedAt: finished && state.completedAt === null ? Date.now() : state.completedAt,
  };
}

export function createTypingState(target: string, locked: LockedKeyConfig = NO_LOCKED_KEYS): TypingState {
  const slots: CharSlot[] = Array.from(target, (char) => ({ char, status: "pending" }));
  const initial: TypingState = {
    target,
    slots,
    index: 0,
    keyErrors: {},
    keyAttempts: {},
    correctCount: 0,
    incorrectCount: 0,
    guidedTypedCount: 0,
    startedAt: null,
    completedAt: null,
    finished: slots.length === 0,
    lastMiss: null,
    lastMissKind: null,
    correctEventId: 0,
    missEventId: 0,
  };
  return advancePastAutofill(initial, locked);
}

function withCompletion(state: TypingState, nextIndex: number, slots: CharSlot[]): Partial<TypingState> {
  const finished = nextIndex >= slots.length;
  return { finished, completedAt: finished ? Date.now() : state.completedAt };
}

/**
 * Process one typed character against the current slot. `state.index` (when
 * not finished) always points at a slot the child is expected to type —
 * either a scored character or a guided-typed helper character; autofill
 * slots are always skipped past by createTypingState / previous calls.
 */
export function processKeystroke(
  state: TypingState,
  typedChar: string,
  locked: LockedKeyConfig,
  errorHandling: ErrorHandlingMode,
  layoutId: LayoutId = DEFAULT_LAYOUT
): TypingState {
  if (state.finished || state.index >= state.slots.length) return { ...state, lastMiss: null, lastMissKind: null };

  const startedAt = state.startedAt ?? Date.now();
  const current = state.slots[state.index];
  const expected = current.char;
  const isCorrect = typedChar === expected;

  // Classified by PHYSICAL KEY identity, not by case: the same KeyDef means
  // the same key, so the only thing that can differ is whether Shift was
  // held. A toLowerCase() comparison would catch "b" vs "B" but miss "1" vs
  // "!" and "/" vs "?" — which is exactly Day 5's content.
  const typedKey = getKeyForChar(typedChar, layoutId);
  const lastMissKind: "shift" | "key" =
    !!typedKey && typedKey === getKeyForChar(expected, layoutId) ? "shift" : "key";

  // Helper key (guided mode): typed by the child, shown with its finger,
  // but never scored — no keyErrors, no keyAttempts, no accuracy impact.
  // A wrong key here is always treated gently regardless of level, since
  // there is no score for it to count against in the first place.
  if (locked.guidedTyped.has(expected)) {
    if (!isCorrect) {
      return { ...state, startedAt, lastMiss: expected, lastMissKind, missEventId: state.missEventId + 1 };
    }
    const nextSlots = state.slots.slice();
    nextSlots[state.index] = { ...current, status: "guided", typedChar };
    const nextIndex = state.index + 1;
    const advanced: TypingState = {
      ...state,
      slots: nextSlots,
      index: nextIndex,
      guidedTypedCount: state.guidedTypedCount + 1,
      startedAt,
      lastMiss: null,
      lastMissKind: null,
      correctEventId: state.correctEventId + 1,
      ...withCompletion(state, nextIndex, nextSlots),
    };
    return advancePastAutofill(advanced, locked);
  }

  if (isCorrect) {
    const nextSlots = state.slots.slice();
    nextSlots[state.index] = { ...current, status: "correct", typedChar };
    const nextIndex = state.index + 1;
    const advanced: TypingState = {
      ...state,
      slots: nextSlots,
      index: nextIndex,
      correctCount: state.correctCount + 1,
      keyAttempts: { ...state.keyAttempts, [expected]: (state.keyAttempts[expected] ?? 0) + 1 },
      startedAt,
      lastMiss: null,
      lastMissKind: null,
      correctEventId: state.correctEventId + 1,
      ...withCompletion(state, nextIndex, nextSlots),
    };
    return advancePastAutofill(advanced, locked);
  }

  const keyErrors = { ...state.keyErrors, [expected]: (state.keyErrors[expected] ?? 0) + 1 };
  const keyAttempts = { ...state.keyAttempts, [expected]: (state.keyAttempts[expected] ?? 0) + 1 };

  if (errorHandling === "gentle-nudge") {
    // No visible mark, no advance, no accuracy penalty (incorrectCount stays
    // put) — just a transient miss signal for a UI nudge (e.g. a shake).
    // Starter level: wrong key does nothing. keyErrors still records the
    // miss so the Report stage can surface "keys still warming up."
    return {
      ...state,
      keyErrors,
      keyAttempts,
      startedAt,
      lastMiss: expected,
      lastMissKind,
      missEventId: state.missEventId + 1,
    };
  }

  const nextSlots = state.slots.slice();
  nextSlots[state.index] = { ...current, status: "incorrect", typedChar };
  const incorrectCount = state.incorrectCount + 1;

  if (errorHandling === "must-correct") {
    // Flyer level: stays put until processBackspace clears the mark.
    return {
      ...state,
      slots: nextSlots,
      keyErrors,
      keyAttempts,
      incorrectCount,
      startedAt,
      lastMiss: expected,
      lastMissKind,
      missEventId: state.missEventId + 1,
    };
  }

  // mark-and-advance (Builder level): red mark, advance anyway.
  const nextIndex = state.index + 1;
  const advanced: TypingState = {
    ...state,
    slots: nextSlots,
    index: nextIndex,
    keyErrors,
    keyAttempts,
    incorrectCount,
    startedAt,
    lastMiss: expected,
    lastMissKind,
    missEventId: state.missEventId + 1,
    ...withCompletion(state, nextIndex, nextSlots),
  };
  return advancePastAutofill(advanced, locked);
}

/** Clears an incorrect mark at the current slot (must-correct level only). */
export function processBackspace(state: TypingState): TypingState {
  if (state.finished || state.index >= state.slots.length) return state;
  const current = state.slots[state.index];
  if (current.status !== "incorrect") return state;
  const nextSlots = state.slots.slice();
  nextSlots[state.index] = { ...current, status: "pending", typedChar: undefined };
  return { ...state, slots: nextSlots, lastMiss: null, lastMissKind: null };
}

/** Accuracy over scored characters only, 0-1. 1 when nothing was attempted yet. */
export function calculateAccuracy(state: TypingState): number {
  const attempted = state.correctCount + state.incorrectCount;
  if (attempted === 0) return 1;
  return state.correctCount / attempted;
}

// A stage (New Keys, Word Build, Theme Challenge, Verse Builder) typically
// runs several TypingStates in sequence (one per drill/word/phrase). These
// helpers roll per-stage results into one session-level tally that
// SessionRunner accumulates across every stage, for the Report stage's
// WPM/accuracy/keys-mastered numbers.

export type StageTypingSummary = {
  correctCount: number;
  incorrectCount: number;
  keyErrors: Record<string, number>;
  keyAttempts: Record<string, number>;
  guidedTypedCount: number;
  /**
   * Time actually spent typing, summed per item: first keystroke to last.
   * Session wall-clock is the wrong denominator for WPM — it also contains
   * reading the Bible truth, the breather between key groups, and every
   * pause between drills, so a child who never hesitated scored below one
   * who wandered off mid-lesson. This is the honest one, and it's what
   * makes two children's numbers comparable at all (see lib/day-score.ts).
   *
   * An item the child never started, or abandoned part-way, contributes 0 —
   * there's no last-keystroke timestamp to measure to, and the alternative
   * (counting to "now") would charge them for time they weren't typing.
   */
  activeMs: number;
};

export function emptySummary(): StageTypingSummary {
  return { correctCount: 0, incorrectCount: 0, keyErrors: {}, keyAttempts: {}, guidedTypedCount: 0, activeMs: 0 };
}

export function summarizeTypingState(state: TypingState): StageTypingSummary {
  return {
    correctCount: state.correctCount,
    incorrectCount: state.incorrectCount,
    keyErrors: { ...state.keyErrors },
    keyAttempts: { ...state.keyAttempts },
    guidedTypedCount: state.guidedTypedCount,
    activeMs:
      state.startedAt !== null && state.completedAt !== null ? Math.max(0, state.completedAt - state.startedAt) : 0,
  };
}

function mergeCounts(a: Record<string, number>, b: Record<string, number>): Record<string, number> {
  const merged = { ...a };
  for (const [key, value] of Object.entries(b)) merged[key] = (merged[key] ?? 0) + value;
  return merged;
}

export function mergeSummaries(a: StageTypingSummary, b: StageTypingSummary): StageTypingSummary {
  return {
    correctCount: a.correctCount + b.correctCount,
    incorrectCount: a.incorrectCount + b.incorrectCount,
    keyErrors: mergeCounts(a.keyErrors, b.keyErrors),
    keyAttempts: mergeCounts(a.keyAttempts, b.keyAttempts),
    guidedTypedCount: a.guidedTypedCount + b.guidedTypedCount,
    activeMs: a.activeMs + b.activeMs,
  };
}

/**
 * Whether a stage's result clears a level's accuracy gate. null means no
 * gate (Starter); a stage with nothing attempted (e.g. fully guided
 * content) always passes — there's nothing to gate on.
 */
export function passesAccuracyGate(summary: StageTypingSummary, gate: number | null): boolean {
  if (gate === null) return true;
  const attempted = summary.correctCount + summary.incorrectCount;
  if (attempted === 0) return true;
  return summary.correctCount / attempted >= gate;
}

const MASTERY_ERROR_RATE_THRESHOLD = 0.2;

/**
 * Never show a failing score — the Report stage surfaces this instead:
 * which keys are solid and which still need warming up. Only keys the
 * child actually attempted are judged either way.
 */
export function computeKeyMastery(summary: StageTypingSummary): { mastered: string[]; warmingUp: string[] } {
  const mastered: string[] = [];
  const warmingUp: string[] = [];
  for (const [key, attempts] of Object.entries(summary.keyAttempts)) {
    if (attempts === 0) continue;
    const errorRate = (summary.keyErrors[key] ?? 0) / attempts;
    (errorRate <= MASTERY_ERROR_RATE_THRESHOLD ? mastered : warmingUp).push(key);
  }
  return { mastered, warmingUp };
}
