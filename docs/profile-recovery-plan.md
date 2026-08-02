# Deferred: profile PINs & progress codes

**Status:** built, then removed before the first camp. Not shipping in v1.

## The constraint that decides all of this

**A child is not guaranteed the same computer each day.** (Confirmed by the
Aprann team, 2026-08-01.)

`next.config.ts` is `output: "export"` — every laptop runs its own static copy
with its own localStorage, and there is no shared store. So a child on a
different machine on Tuesday types their name, `findProfileByName` finds
nothing on *that* machine, and they get a fresh profile. Silently: no error, no
hint that anything was lost.

Everything below follows from that. Cross-week tracking on this architecture
isn't a feature we chose to drop — it's a feature that misfires for most
children and *looks like data loss* when it does:

- the streak reads `1` even for the child who came all five days
- the badge shelf is empty most days
- the verse comparison never fires
- the week summary needs 5 unbroken days **on one machine**, so under rotation
  essentially nobody reaches it

A streak that reports `1` to a child who did the whole week is worse than no
streak. That's the argument against bringing any of this back on-device.

**What actually crosses machines:** paper. A sticker card the child carries or
a wall chart the teacher keeps is machine-independent by construction, survives
a dead laptop, and is the thing the child takes home. The progress code (§2) is
the only *code* here that crosses machines, but under daily rotation it becomes
a per-child, per-day transcription ritual. A shared store (one laptop serving
the rest, or a sync step) is the only clean digital fix and would mean giving
up the static export and the offline-first constraint — not a v1 move.

Two separate mechanisms landed on `hudson-branch` and were both taken back out
because they added a login-shaped ceremony to an app whose whole promise is
"type your name and start typing." This file records what they were, why they
came out, and what would have to be true to bring either back — so the next
person doesn't rediscover the same design from scratch.

The code itself is not lost. It lives in git:

| Piece | Commit |
| --- | --- |
| 4-digit PIN (`Profile.pin`, `verifyPin`, `PinInput`, setPin/enterPin steps) | `c1e9263` |
| Progress code (`lib/progressCode.ts`, `createProfileFromProgressCode`, export/import panels) | `81f42bb` |
| Removal of both | this branch's removal commit |

`git show c1e9263 -- components/PinInput.tsx lib/storage.ts` and
`git show 81f42bb -- lib/progressCode.ts` bring back the originals verbatim.

---

## 1. The 4-digit PIN — "don't let another kid open my profile"

### How it worked

- `Profile` gained an optional `pin?: string`, stored **in plaintext** inside
  the single `aprann.typing.v1` localStorage blob. Optional so profiles created
  before the feature still opened with no prompt.
- `createProfile(firstName, language, pin)` took the PIN as a required third
  argument.
- `verifyPin(profile, pin)` was a plain string compare with a deliberate
  bypass: `return !profile.pin || profile.pin === pin`.
- `StartScreen`'s step machine grew from `enterName | confirm | pickSession`
  to `enterName | confirm | setPin | enterPin | pickSession`:
  - new name → `setPin` (choose 4 digits) → profile created
  - existing name, "Yes that's me" → `enterPin`
  - tapping a name in the "already typed this week" list → `enterPin`
- `PinInput` was a shared numeric input: digits only, `maxLength={4}`,
  Enter submits, wide letter-spacing so it reads from across a classroom.

### Why it came out

- **It is a login screen.** Two extra taps and a remembered secret between a
  child and the first keystroke, on day 1 of a camp where the point is to
  remove friction, not add it.
- **No recovery path.** Forget the four digits and the profile is unreachable
  short of clearing localStorage. On a shared camp machine that is a realistic
  Monday-morning failure with no answer for the teacher.
- **It didn't actually protect anything.** Plaintext in devtools, unlimited
  guesses over a 10,000-item space. The doc comment was honest about this
  ("not real account security"), which is itself a sign the feature was doing
  less than its UI implied.
- **The threat is small and social.** One kid opening another kid's typing
  progress on a camp laptop is best handled by a teacher, not a keypad.

### If it comes back

Do it only if the camp reports real profile-mixups, and then:

- Ship a **teacher override** in the same change — a `/teacher` screen that can
  clear or reveal a PIN. A lock with no key is not shippable.
- Consider a **picture PIN** instead of digits (tap 3 of 9 animals): memorable
  for a 7-year-old, no typing, no "I forgot my number."
- Don't call it security anywhere in the UI or in parent-facing copy. It's a
  name tag, not a lock.
- Keep the `!profile.pin` bypass — it is what makes the field safely optional
  across an upgrade.

---

## 2. The progress code — "carry my week to another computer"

This is the one that actually addresses *recovering previous work*. It shipped
already switched off (`PROGRESS_CODE_FEATURE_ENABLED = false`), which was the
right instinct and the reason it was cheap to remove.

### How it worked

- `encodeProgressCode(name, day, level)` JSON-encoded exactly three fields —
  `{n, d, l}` — then base32'd the UTF-8 bytes into the alphabet
  `ABCDEFGHJKMNPQRSTUVWXYZ23456789` (no `0/O`, no `1/I/L`), grouped in fours:
  `XXXX XXXX XXXX`. The same "read it over the phone" alphabet a Wi-Fi
  password or product key uses.
- `decodeProgressCode` reversed it, tolerated lowercase / dashes / stray
  spaces, and validated hard — non-empty name, integer day 1–5, level in
  `LEVEL_ORDER` — returning `null` for anything off rather than a partial
  guess.
- `createProfileFromProgressCode(payload, language, pin)` rebuilt a profile by
  **synthesizing** one completed session per day `1..d`, each carrying that
  day's real `badgeId` and cumulative unlocked keys, so `getLastCompletedDay` /
  `getStreak` / `getEarnedBadges` / `getWeekSummary` all read the restored
  profile as genuinely completed.
- Per-day performance was deliberately **not** carried: WPM 0, accuracy 100%,
  duration 0. A restored profile gets a fresh start on numbers rather than a
  fabricated replay of the other computer's.
- UI: a "Save my code" panel on the pickSession screen (with copy-to-clipboard)
  and a "Have a code from another computer?" panel on the name screen, which
  decoded to a confirmation preview ("Welcome back, Widelene — Day 3 complete,
  builder level") before creating anything.

### Why it came out

- **The problem may not exist yet.** It solves "the child is on a different
  laptop than yesterday." Whether that actually happens at this camp is
  unknown — nobody has run the week. Building the fix before observing the
  problem is what made v1 complicated.
- **Nothing was using it.** It was feature-flagged off, so it was pure surface
  area: two panels of UI, an encoder, a synthesizing profile factory, and their
  tests, all shipping dead.
- **A teacher with a code list is a lot of ceremony.** The realistic operating
  model — every child hands a 12-character code to a teacher who writes it
  down and re-types it on another machine — is more work than re-picking a day
  from the day path, which the app already supports.

### If it comes back

The encoding is good and worth reusing as-is; the questions are all about
delivery:

- **Confirm the need first.** After a real camp week, ask: did any child change
  machines, and did losing progress actually cost anything? Note that a child
  can already just pick their day again from the day path — the badges and
  streak are the only real loss.
- **Consider export-the-whole-file instead.** If machines change often, a
  teacher-side "export all profiles to a JSON file / import on the other
  laptop" is one action for the whole class rather than one code per child, and
  it can carry the real per-day stats the code has to throw away.
- **Widen the payload if it stays.** Encoding `verseCharsTypedUnassisted`
  would let the verse builder's day-over-day comparison survive a restore;
  right now a restored child's "Day 1 you typed 14, today 38" comparison is
  wrong (reads 0). This was an accepted trade for code length — revisit it.
- **Decide the duplicate-profile rule.** Restoring creates a *new* profile even
  if a same-named one exists on the target machine, so a child who restores and
  then also has a local profile ends up with two.

---

## 3. Every day is a brand new day — the model that shipped

Removed 2026-08-01, in one pass with the "is this you?" check:

- **The "is this you?" confirm step.** A typed name no longer looks anything
  up. `findProfileByName`, `getAllProfiles` and the "already typed this week"
  name list are gone; `createProfile` is the only entry point, and every
  sitting creates a fresh profile.
- **The week summary.** `WeekSummaryStage.tsx` + its CSS, `getWeekSummary`,
  `WeekSummaryDay`, the "See my week" button, and the `weekSummaryProfile`
  branch in `app/page.tsx`.
- **The streak line and badge shelf** on the report — with `getStreak` and
  `getEarnedBadges`.
- **The verse day-over-day comparison** and `getPriorVerseProgress`. The
  verse builder now always shows `firstTimeLine` ("You typed N characters
  yourself today").
- **Day-path checkmarks** and `getLastCompletedDay`. Nothing knows or claims
  to know which days a child has finished.

### Why the confirm step forced the rest

Once every sitting is a new profile, the cross-day figures aren't merely
unreliable — they're *guaranteed* wrong: the streak reads 1 always, the shelf
is always empty, the week summary can never fire. Keeping that UI would have
meant shipping screens known to misreport. The lookup and the week features
had to go together.

### Two things that changed shape rather than disappearing

- **Games are no longer gated on completed days.** `PlayScreen` offered only
  days the child had finished, which now reads a history that doesn't exist —
  the picker would have been permanently empty. It now offers every day with
  content, and bonus games take their unlocked keys from the day selected in
  that picker rather than from the last completed day. A teacher steers which
  day is appropriate. Copy in both languages was reworded to match (the
  Kreyòl strings are marked `REVIEW`, unreviewed by a native speaker).
- **Sessions are still written.** `addSession` runs exactly as before; nothing
  reads it back. Keeping the records costs nothing and preserves the option of
  a teacher-side CSV export. Note the export would be **per-machine** — under
  machine rotation each laptop holds a partial, disjoint slice of the week, so
  a real export means collating across every laptop. Raise that with the
  Aprann team before building `/teacher`.

### What the week arc is now

Paper. Nothing on screen spans days. Each day ends with its own summary —
WPM, accuracy, keys mastered, keys warming up, and that day's badge, all
computed from the session that just finished. A sticker card or wall chart is
the thing that accumulates, and unlike localStorage it follows the child
rather than the laptop.

### If cross-day tracking is ever wanted again

Don't restore these functions from git — they encode the assumption that a
profile persists on one machine, which is the thing that isn't true. Solve
cross-device storage first, then rebuild on top of it.

## 4. Two consequences to keep an eye on

**Duplicate profiles accumulate.** Every sitting writes a new profile, so a
laptop used by 20 children across a week ends up with ~100 of them, many
sharing a first name. That's harmless for the app (nothing lists or searches
them) and it's arguably the right shape for a CSV — one row per child-day —
but it does mean `Profile` is now closer to "a session record" than "a person".
Worth renaming if anything is ever built on top of it.

**Name spelling no longer matters at all**, which is a genuine simplification:
`"Widelène"`, `"Widelene"` and `"widelene"` were three different children under
the old lookup and are now simply three labels on three independent sittings.
The duplicate-name ambiguity that made the old "Is this you?" prompt unreliable
is gone with it.
