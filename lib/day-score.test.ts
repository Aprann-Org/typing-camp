import { describe, expect, it } from "vitest";
import { computeDayScore, MAX_DAY_SCORE, typedAccuracy } from "./day-score";
import { emptySummary, processKeystroke, createTypingState, summarizeTypingState, NO_LOCKED_KEYS } from "./typing-engine";
import type { StageTypingSummary } from "./typing-engine";

function summary(overrides: Partial<StageTypingSummary> = {}): StageTypingSummary {
  return { ...emptySummary(), ...overrides };
}

describe("typedAccuracy", () => {
  it("is 1 when nothing was attempted", () => {
    expect(typedAccuracy(summary())).toBe(1);
  });

  it("counts misses per keystroke attempted", () => {
    const s = summary({ keyAttempts: { f: 8, j: 2 }, keyErrors: { j: 1 } });
    expect(typedAccuracy(s)).toBeCloseTo(0.9);
  });

  // The reason this function exists: Starter's gentle-nudge error handling
  // never increments incorrectCount, so a correct/(correct+incorrect) accuracy
  // read 100% for every Starter session no matter how many keys were missed.
  it("reports real accuracy for a gentle-nudge (Starter) session", () => {
    let state = createTypingState("fj", NO_LOCKED_KEYS);
    state = processKeystroke(state, "f", NO_LOCKED_KEYS, "gentle-nudge");
    state = processKeystroke(state, "k", NO_LOCKED_KEYS, "gentle-nudge"); // miss, not marked
    state = processKeystroke(state, "j", NO_LOCKED_KEYS, "gentle-nudge");
    const s = summarizeTypingState(state);

    expect(s.incorrectCount).toBe(0);
    expect(typedAccuracy(s)).toBeCloseTo(2 / 3);
  });

  it("never goes below 0", () => {
    expect(typedAccuracy(summary({ keyAttempts: { f: 1 }, keyErrors: { f: 5 } }))).toBe(0);
  });
});

describe("computeDayScore", () => {
  it("gives a perfect fast session full marks", () => {
    // 200 correct chars in 60s = 40 WPM, the speed ceiling, with no misses.
    const score = computeDayScore(summary({ correctCount: 200, keyAttempts: { f: 200 }, activeMs: 60_000 }));
    expect(score.wpm).toBe(40);
    expect(score.accuracy).toBe(1);
    expect(score.total).toBe(MAX_DAY_SCORE);
  });

  it("caps speed points rather than rewarding beyond the ceiling", () => {
    const fast = computeDayScore(summary({ correctCount: 600, keyAttempts: { f: 600 }, activeMs: 60_000 }));
    expect(fast.wpm).toBe(120);
    expect(fast.speedPoints).toBe(500);
    expect(fast.total).toBe(MAX_DAY_SCORE);
  });

  it("penalizes errors harder than a linear scale would", () => {
    const clean = computeDayScore(summary({ correctCount: 100, keyAttempts: { f: 100 }, activeMs: 60_000 }));
    const messy = computeDayScore(
      summary({ correctCount: 100, keyAttempts: { f: 100 }, keyErrors: { f: 20 }, activeMs: 60_000 })
    );
    // 80% accuracy keeps 64% of the accuracy points, not 80%.
    expect(messy.accuracyPoints).toBe(Math.round(0.8 * 0.8 * 500));
    expect(clean.accuracyPoints - messy.accuracyPoints).toBeGreaterThan(150);
  });

  it("scores WPM over active typing time, not session wall-clock", () => {
    // Same typing, but the summary only ever accumulated 30s of active time —
    // the child spent the rest of the lesson reading and playing.
    const score = computeDayScore(summary({ correctCount: 100, keyAttempts: { f: 100 }, activeMs: 30_000 }));
    expect(score.wpm).toBe(40);
    expect(score.activeSeconds).toBe(30);
  });

  it("gives an untyped session zero speed points without dividing by zero", () => {
    const score = computeDayScore(summary());
    expect(score.wpm).toBe(0);
    expect(score.speedPoints).toBe(0);
    // Nothing attempted means nothing missed, so accuracy marks are intact.
    expect(score.total).toBe(500);
  });

  it("counts helper keys toward chars typed but not toward accuracy", () => {
    const score = computeDayScore(
      summary({ correctCount: 10, incorrectCount: 2, guidedTypedCount: 8, keyAttempts: { f: 12 }, keyErrors: { f: 2 } })
    );
    expect(score.charsTyped).toBe(20);
    expect(score.accuracy).toBeCloseTo(10 / 12);
  });
});

describe("summarizeTypingState activeMs", () => {
  it("is 0 for an item the child never started", () => {
    const state = createTypingState("fj", NO_LOCKED_KEYS);
    expect(summarizeTypingState(state).activeMs).toBe(0);
  });

  it("is 0 for an item started but not finished, so idle time is never charged", () => {
    let state = createTypingState("fj", NO_LOCKED_KEYS);
    state = processKeystroke(state, "f", NO_LOCKED_KEYS, "mark-and-advance");
    expect(state.startedAt).not.toBeNull();
    expect(state.finished).toBe(false);
    expect(summarizeTypingState(state).activeMs).toBe(0);
  });

  it("measures first keystroke to last on a finished item", () => {
    let state = createTypingState("fj", NO_LOCKED_KEYS);
    state = processKeystroke(state, "f", NO_LOCKED_KEYS, "mark-and-advance");
    state = processKeystroke(state, "j", NO_LOCKED_KEYS, "mark-and-advance");
    const s = summarizeTypingState(state);
    expect(state.finished).toBe(true);
    expect(s.activeMs).toBe(state.completedAt! - state.startedAt!);
    expect(s.activeMs).toBeGreaterThanOrEqual(0);
  });
});
