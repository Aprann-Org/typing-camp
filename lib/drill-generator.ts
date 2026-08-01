// Generates the "then alternation with known keys" half of the New Keys
// stage (see the brief's stage-2 description). Isolated single-key intros
// stay author-controlled content (content/days/day*.ts's `drills`); this
// covers the part that must vary by level and by how many keys are known
// so far, which isn't something a teacher hand-authors per day.
//
// A rotating cursor that keeps advancing ACROSS bursts (not resetting to 0
// each time) is the whole fix for the "identical drill repeated back to
// back" complaint — burst 2 always continues where burst 1 left off, so
// no two bursts in a sequence are ever the same string.

import type { DayPracticeContent } from "./types";
import { getDrilledKeys, type LevelConfig } from "@/content/levels";

function burstFrom(pool: string[], start: number, length: number): string {
  const chars: string[] = [];
  for (let i = 0; i < length; i++) chars.push(pool[(start + i) % pool.length]);
  return chars.join(" ");
}

/** One alternation burst: `burstLength` characters cycling through [newKey, ...knownKeys]. */
export function buildAlternationBursts(
  newKey: string,
  knownKeys: string[],
  burstCount: number,
  burstLength: number
): string[] {
  const pool = [newKey, ...knownKeys];
  const bursts: string[] = [];
  let start = 0;
  let previous: string | null = null;
  for (let b = 0; b < burstCount; b++) {
    let burst = burstFrom(pool, start, burstLength);
    // A purely periodic cursor can realign with the pool's own period and
    // reproduce an earlier burst verbatim (e.g. pool size 3, burst length
    // 4: burst 4 lands back on the same phase as burst 1) — exactly the
    // "identical drill again" bug this generator exists to avoid. Nudge
    // the start by one extra step whenever that would happen.
    if (burst === previous && pool.length > 1) {
      start += 1;
      burst = burstFrom(pool, start, burstLength);
    }
    bursts.push(burst);
    previous = burst;
    start += burstLength;
  }
  return bursts;
}

/**
 * The full New Keys sequence: for each drilled key, the author-written
 * isolated pattern once ("f f f f f f" from content/days), then — once at
 * least one other key is already known — level-scaled alternation bursts
 * mixing the new key with everything known so far. This is what actually
 * varies content between levels and between attempts; nothing here repeats
 * an identical target back to back.
 *
 * Lives here rather than in NewKeysStage because the journey stepper needs to
 * know how long this stage is BEFORE the child enters it — it is by far the
 * longest stage of the day, and sizing its segment honestly is the whole
 * point (see lib/session-progress.ts).
 */
// buildAlternationBursts runs once per new-key introduction after the first,
// so a day's total alternation volume is level.drillRepetitions.burstCount *
// (drilled keys - 1) — fine on days with 5-6 new keys, but Day 1's 11 keys
// pushed Starter to 26 items and Builder to 31 (see stageWorkUnits' own
// comment about Day 1 New Keys running "hundreds of keystrokes"). This caps
// the day's total burst count rather than the per-level shape: on days with
// few transitions it's a no-op (the min() below just returns burstCount
// unchanged); it only kicks in once a day has enough new keys that the
// straight multiplication would balloon past what a short day produces.
const TARGET_TOTAL_BURSTS = 10;

export type NewKeysCheckpoint = {
  /** The keys introduced in this checkpoint, in teaching order. */
  keys: string[];
  /** This checkpoint's slice of the New Keys queue — see buildNewKeysQueue. */
  items: string[];
  /**
   * This checkpoint teaches Shift rather than a set of new keys: New Keys
   * shows the chord explainer before its items, and its breather says "you
   * learned Shift" rather than naming keys. Only the day declaring
   * `teachesShift` gets one.
   */
  teachesShift?: true;
};

/**
 * The Shift checkpoint's drills: each of today's letters alternating between
 * its capital and lowercase form, so the child practices taking the chord on
 * and off rather than holding Shift for a whole word.
 *
 * Deliberately mechanical. The payoff — a real capitalised word — arrives
 * immediately afterwards in the day's word bank, which is what "Bondye" and
 * "Jezi" were placed at the end of Day 4's bank for.
 */
function buildShiftDrills(drilledKeys: string[], burstLength: number): string[] {
  return drilledKeys
    .filter((key) => /^[a-z]$/.test(key))
    .map((key) => {
      const pair = `${key.toUpperCase()} ${key}`;
      // Half-length: each repetition is two keystrokes plus a chord, so
      // matching a plain drill's repetition count would make this the longest
      // item of the day.
      const reps = Math.max(2, Math.round(burstLength / 2));
      return Array.from({ length: reps }, () => pair).join(" ");
    });
}

/**
 * How dayContent.newKeyGroups splits today's drilled keys into checkpoints.
 * Falls back to one group (today's whole drilled-keys list, in newKeys'
 * order) when the day has no authored groups — the pre-checkpoint behavior,
 * unchanged. A group is dropped once none of its keys survive this level's
 * newKeyScope filtering (e.g. Starter's "half" scope on Day 1 drops every
 * group down to whichever of its keys made the cut), and any key present in
 * newKeys but missing from every group is not silently lost — it still
 * belongs to drilledKeysList, so scripts/validate-content.ts is what catches
 * an incomplete newKeyGroups authoring mistake, not this function.
 */
function resolveCheckpointGroups(dayContent: DayPracticeContent, drilledKeysList: string[]): string[][] {
  const drilledSet = new Set(drilledKeysList);
  if (!dayContent.newKeyGroups) return [drilledKeysList];
  const groups = dayContent.newKeyGroups
    .map((group) => group.filter((key) => drilledSet.has(key)))
    .filter((group) => group.length > 0);
  return groups.length > 0 ? groups : [drilledKeysList];
}

/**
 * The New Keys stage as a sequence of checkpoints (see NewKeysCheckpoint):
 * groups of keys taught together with a breather in between, instead of one
 * uninterrupted run through every key of the day. Days without
 * dayContent.newKeyGroups authored (most days — see that field's doc) come
 * back as a single checkpoint, identical to the old un-grouped behavior.
 */
export function buildNewKeysCheckpoints(dayContent: DayPracticeContent, level: LevelConfig): NewKeysCheckpoint[] {
  const drilledKeysList = getDrilledKeys(dayContent.newKeys, level.newKeyScope);
  const groups = resolveCheckpointGroups(dayContent, drilledKeysList);

  const transitions = Math.max(0, drilledKeysList.length - 1);
  const burstCount =
    transitions > 0
      ? Math.max(1, Math.round(Math.min(level.drillRepetitions.burstCount, TARGET_TOTAL_BURSTS / transitions)))
      : level.drillRepetitions.burstCount;

  const known: string[] = [];
  const checkpoints: NewKeysCheckpoint[] = [];

  for (const group of groups) {
    const items: string[] = [];
    for (const key of group) {
      const authored = dayContent.drills.find((d) => d.keys.length === 1 && d.keys[0] === key);
      if (authored) items.push(authored.pattern);

      if (known.length > 0) {
        items.push(...buildAlternationBursts(key, known, burstCount, level.drillRepetitions.burstLength));
      }
      known.push(key);
    }
    checkpoints.push({ keys: group, items });
  }

  // Shift comes last, once every letter of the day is in hand — it needs a
  // letter to pair with, and the day's own new keys are the freshest ones.
  if (dayContent.teachesShift) {
    const items = buildShiftDrills(drilledKeysList, level.drillRepetitions.burstLength);
    if (items.length > 0) checkpoints.push({ keys: [], items, teachesShift: true });
  }

  return checkpoints;
}

export function buildNewKeysQueue(dayContent: DayPracticeContent, level: LevelConfig): string[] {
  return buildNewKeysCheckpoints(dayContent, level).flatMap((checkpoint) => checkpoint.items);
}
