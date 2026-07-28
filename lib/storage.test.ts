import { describe, expect, it } from "vitest";
import { getWeekSummary, verifyPin } from "./storage";
import type { DayNumber, Profile, Session } from "./types";

function session(day: DayNumber, overrides: Partial<Session> = {}): Session {
  return {
    day,
    level: "builder",
    startedAt: `2026-07-2${day}T10:00:00.000Z`,
    completedAt: `2026-07-2${day}T10:20:00.000Z`,
    durationSeconds: 1200,
    wpm: 10 + day,
    accuracy: 0.9,
    charsTyped: 100,
    verseCharsTypedUnassisted: 10,
    keyErrors: {},
    keysMastered: [`key${day}`],
    badgeEarned: `day${day}-badge`,
    stagesCompleted: 6,
    ...overrides,
  };
}

function profile(sessions: Session[], overrides: Partial<Profile> = {}): Profile {
  return {
    id: "p1",
    firstName: "Test",
    language: "en",
    createdAt: "2026-07-20T00:00:00.000Z",
    sessions,
    soundEnabled: false,
    lastLevel: "builder",
    ...overrides,
  };
}

describe("verifyPin", () => {
  it("accepts the correct code", () => {
    expect(verifyPin(profile([], { pin: "4213" }), "4213")).toBe(true);
  });

  it("rejects an incorrect code", () => {
    expect(verifyPin(profile([], { pin: "4213" }), "0000")).toBe(false);
  });

  it("opens for anyone when no pin was ever set (profiles created before this feature existed)", () => {
    expect(verifyPin(profile([]), "0000")).toBe(true);
    expect(verifyPin(profile([]), "")).toBe(true);
  });
});

describe("getWeekSummary", () => {
  it("returns null when fewer than all 5 days are completed", () => {
    const p = profile([session(1), session(2), session(3)]);
    expect(getWeekSummary(p)).toBeNull();
  });

  it("returns null when a day is skipped, even with 5+ sessions total", () => {
    // Days 1,2,4,5 completed, day 3 never — getStreak stops at day 2.
    const p = profile([session(1), session(2), session(4), session(5), session(1)]);
    expect(getWeekSummary(p)).toBeNull();
  });

  it("returns per-day stats in order once all 5 days are completed", () => {
    const p = profile([session(1), session(2), session(3), session(4), session(5)]);
    const summary = getWeekSummary(p);
    expect(summary).not.toBeNull();
    expect(summary!.map((s) => s.day)).toEqual([1, 2, 3, 4, 5]);
    expect(summary![0].wpm).toBe(11);
    expect(summary![0].badgeId).toBe("day1-badge");
  });

  it("uses the most recent completed session per day when a day was replayed", () => {
    const p = profile([
      session(1),
      session(2),
      session(3),
      session(4),
      session(5, { completedAt: "2026-07-25T10:20:00.000Z", wpm: 999 }),
      // A later, better replay of day 5.
      session(5, { completedAt: "2026-07-26T10:20:00.000Z", wpm: 42 }),
    ]);
    const summary = getWeekSummary(p);
    expect(summary!.find((s) => s.day === 5)?.wpm).toBe(42);
  });

  it("ignores incomplete (in-progress) sessions", () => {
    const p = profile([
      session(1),
      session(2),
      session(3),
      session(4),
      session(5),
      session(5, { completedAt: null, wpm: 1 }),
    ]);
    const summary = getWeekSummary(p);
    expect(summary!.find((s) => s.day === 5)?.wpm).toBe(15);
  });
});
