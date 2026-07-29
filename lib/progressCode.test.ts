import { describe, expect, it } from "vitest";
import { encodeProgressCode, decodeProgressCode } from "./progressCode";

describe("encodeProgressCode / decodeProgressCode", () => {
  it("round-trips name, day, and level", () => {
    const code = encodeProgressCode("Widelene", 3, "builder");
    expect(decodeProgressCode(code)).toEqual({ n: "Widelene", d: 3, l: "builder" });
  });

  it("is readable with dashes, extra spaces, and lowercase — a hand-typed code shouldn't have to be exact", () => {
    const code = encodeProgressCode("Junior", 5, "flyer");
    const messy = code.toLowerCase().replace(/ /g, "-").trim() + "   ";
    expect(decodeProgressCode(messy)).toEqual({ n: "Junior", d: 5, l: "flyer" });
  });

  it("uses only the unambiguous alphabet (no 0/O/1/I/L)", () => {
    const code = encodeProgressCode("Anyone", 1, "starter");
    expect(code).not.toMatch(/[0O1IL]/);
  });

  it("returns null for empty input", () => {
    expect(decodeProgressCode("")).toBeNull();
    expect(decodeProgressCode("   ")).toBeNull();
  });

  it("returns null for garbled/random input rather than a guessed result", () => {
    expect(decodeProgressCode("ZZZZ ZZZZ ZZZZ")).toBeNull();
    expect(decodeProgressCode("NOT A REAL CODE AT ALL")).toBeNull();
  });

  it("returns null for a day outside 1-5", () => {
    // encodeProgressCode itself doesn't validate its input — decode is where
    // an out-of-range value (from a corrupted or foreign code) gets caught.
    const outOfRange = encodeProgressCode("Test", 6 as unknown as 1, "builder");
    expect(decodeProgressCode(outOfRange)).toBeNull();
  });
});
