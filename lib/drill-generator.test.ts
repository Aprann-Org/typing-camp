import { describe, expect, it } from "vitest";
import { buildAlternationBursts } from "./drill-generator";

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
