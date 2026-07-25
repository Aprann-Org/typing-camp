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
