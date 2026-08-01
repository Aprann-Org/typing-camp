import type { DayNumber } from "./types";
import { LEVEL_ORDER, type LevelId } from "@/content/levels";

// Hidden from the UI for now (StartScreen checks this before showing either
// the "Save my code" or "Have a code?" entry points) — the mechanism itself
// stays in place and tested, just not offered to children yet.
export const PROGRESS_CODE_FEATURE_ENABLED = false;

// A human-typeable code carrying just enough of a profile's progress to
// recreate it on a different computer — built from the same mechanism
// prototyped and clicked through in the export/import preview artifact.
//
// Deliberately minimal: name, last completed day, and level — nothing else.
// Streak and badges aren't encoded because they're both fully derivable from
// "days 1..d were completed" (see createProfileFromProgressCode), and per-day
// history (WPM, accuracy, exact timestamps) isn't preserved at all — a
// restored profile gets a fresh start on those, not a replay of the old
// computer's numbers. That's the trade-off for a code short enough to read
// aloud or hand-write, with no server and nothing sent anywhere.
//
// The alphabet excludes 0/O and 1/I/L — the same "read it over the phone"
// set a Wi-Fi password or product key uses, so a mis-transcribed character
// is far less likely than with raw base64.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export type ProgressPayload = {
  n: string;
  d: DayNumber;
  l: LevelId;
};

function bytesToCode(bytes: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let out = "";
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += ALPHABET[(value << (5 - bits)) & 31];
  return out;
}

function codeToBytes(code: string): Uint8Array {
  const clean = code.toUpperCase().replace(/[^A-Z2-9]/g, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const char of clean) {
    const idx = ALPHABET.indexOf(char);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return new Uint8Array(bytes);
}

/** Groups of 4 separated by spaces, purely for readability — stripped back out by decodeProgressCode. */
export function encodeProgressCode(name: string, day: DayNumber, level: LevelId): string {
  const payload: ProgressPayload = { n: name, d: day, l: level };
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  const code = bytesToCode(bytes);
  return code.match(/.{1,4}/g)?.join(" ") ?? code;
}

/** Null for anything malformed — a typo, a code for something else, garbage — never a partial/guessed result. */
export function decodeProgressCode(code: string): ProgressPayload | null {
  try {
    const bytes = codeToBytes(code);
    if (bytes.length === 0) return null;
    const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof (parsed as { n?: unknown }).n !== "string" ||
      !(parsed as { n: string }).n.trim() ||
      typeof (parsed as { d?: unknown }).d !== "number" ||
      !Number.isInteger((parsed as { d: number }).d) ||
      (parsed as { d: number }).d < 1 ||
      (parsed as { d: number }).d > 5 ||
      typeof (parsed as { l?: unknown }).l !== "string" ||
      !(LEVEL_ORDER as string[]).includes((parsed as { l: string }).l)
    ) {
      return null;
    }
    const p = parsed as ProgressPayload;
    return { n: p.n, d: p.d, l: p.l };
  } catch {
    return null;
  }
}
