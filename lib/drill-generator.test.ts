import { describe, expect, it } from "vitest";
import { buildAlternationBursts, buildNewKeysCheckpoints, buildNewKeysQueue } from "./drill-generator";
import { LEVELS } from "@/content/levels";
import type { DayPracticeContent } from "./types";

describe("buildAlternationBursts", () => {
  it("cycles through the new key plus known keys", () => {
    const [burst] = buildAlternationBursts("f", ["a", "s"], 1, 6);
    expect(burst).toBe("f a s f a s");
  });

  it("never produces two identical BACK-TO-BACK bursts, even when pool size and burst length would otherwise realign", () => {
    // pool size 3, burst length 4: a naive continuously-advancing cursor
    // realigns its phase every 3 bursts (12 chars = 4 * pool.length), which
    // without the collision guard reproduces burst[0] verbatim at burst[3].
    const bursts = buildAlternationBursts("f", ["a", "s"], 4, 4);
    expect(bursts).toHaveLength(4);
    for (let i = 1; i < bursts.length; i++) {
      expect(bursts[i]).not.toBe(bursts[i - 1]);
    }
  });

  it("continues the rotation across bursts rather than resetting each time", () => {
    const bursts = buildAlternationBursts("f", ["a", "s"], 2, 3);
    // pool = [f, a, s]; burst 1 = f a s (cursor 0,1,2); burst 2 continues at cursor 3 = f a s again
    // use a pool of size 2 instead so continuation is actually observable mid-cycle
    const bursts2 = buildAlternationBursts("f", ["a"], 2, 3);
    // pool = [f, a]; cursor 0..2 -> f a f ; cursor 3..5 -> a f a
    expect(bursts2[0]).toBe("f a f");
    expect(bursts2[1]).toBe("a f a");
    expect(bursts.length).toBe(2);
  });

  it("respects burstLength", () => {
    const bursts = buildAlternationBursts("f", ["a", "s", "d"], 3, 5);
    bursts.forEach((b) => expect(b.split(" ")).toHaveLength(5));
  });
});

function dayWithGroups(newKeyGroups?: string[][]): DayPracticeContent {
  return {
    day: 1,
    newKeys: ["f", "j", "d", "k"],
    newKeyGroups,
    drills: [
      { keys: ["f"], pattern: "f f f f f f" },
      { keys: ["j"], pattern: "j j j j j j" },
      { keys: ["d"], pattern: "d d d d d d" },
      { keys: ["k"], pattern: "k k k k k k" },
    ],
    wordBank: [],
    themePhrases: [],
    verse: { text: "", unlockedThroughDay: 5 },
    badgeId: "test-day",
  };
}

describe("buildNewKeysCheckpoints", () => {
  it("without newKeyGroups, returns everything as a single checkpoint (unchanged pre-checkpoint behavior)", () => {
    const day = dayWithGroups(undefined);
    const checkpoints = buildNewKeysCheckpoints(day, LEVELS.builder);
    expect(checkpoints).toHaveLength(1);
    expect(checkpoints[0].keys).toEqual(["f", "j", "d", "k"]);
  });

  it("splits into one checkpoint per authored group, in the authored order", () => {
    const day = dayWithGroups([
      ["f", "j"],
      ["d", "k"],
    ]);
    const checkpoints = buildNewKeysCheckpoints(day, LEVELS.builder);
    expect(checkpoints.map((c) => c.keys)).toEqual([
      ["f", "j"],
      ["d", "k"],
    ]);
    // Flattening checkpoints must still equal the un-grouped queue exactly —
    // grouping only changes how items are chunked for the UI, never the content.
    expect(checkpoints.flatMap((c) => c.items)).toEqual(buildNewKeysQueue(day, LEVELS.builder));
  });

  it("drops a group's keys the level's newKeyScope filters out, and drops the group entirely if empty", () => {
    const day = dayWithGroups([
      ["f", "j"],
      ["d", "k"],
    ]);
    // Starter's "half" scope on 4 newKeys drills only the first 2: f, j.
    const checkpoints = buildNewKeysCheckpoints(day, LEVELS.starter);
    expect(checkpoints).toHaveLength(1);
    expect(checkpoints[0].keys).toEqual(["f", "j"]);
  });

  it("every day's authored newKeyGroups covers that day's new keys exactly once", async () => {
    const { getDayPracticeContent } = await import("@/content/days");
    for (const day of [1, 2, 3, 4, 5] as const) {
      const content = getDayPracticeContent(day);
      expect(content, `day ${day} content`).toBeDefined();
      expect(content!.newKeyGroups, `day ${day} newKeyGroups`).toBeDefined();
      const covered = content!.newKeyGroups!.flat();
      expect(new Set(covered), `day ${day} coverage`).toEqual(new Set(content!.newKeys));
      expect(covered.length, `day ${day} no duplicates`).toBe(content!.newKeys.length);
    }
  });
});
