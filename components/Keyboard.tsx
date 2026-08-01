import { DEFAULT_LAYOUT, LAYOUTS, SHIFT_MODIFIER_ID, type LayoutId } from "@/content/layouts";
import { FINGERS, THUMB_COLOR, type FingerId } from "@/content/fingers";
import styles from "./Keyboard.module.css";

type KeyboardProps = {
  /** Base characters unlocked as of today, cumulative across days. */
  unlockedChars: ReadonlySet<string>;
  /** The character the child should press next, pulsed in its finger color. */
  nextChar?: string | null;
  /** Keys unlocking for the first time today — get a one-time "light up." */
  justUnlockedChars?: ReadonlySet<string>;
  /**
   * Guided-mode "helper keys": not unlocked yet, but the child is being
   * asked to type them anyway (e.g. the letters of their own name on Day
   * 1). Shown brighter than a dormant locked key so they're findable,
   * but visually distinct from a properly-learned unlocked key.
   */
  helperChars?: ReadonlySet<string>;
  layoutId?: LayoutId;
  /** The character just missed, if any — flashes that key red for one beat. */
  missChar?: string | null;
  /** Monotonic counter so a repeated miss on the same key (gentle-nudge level never advances) retriggers the flash. */
  missEventId?: number;
  /**
   * Whether the miss was a Shift mistake (right key, wrong Shift state). When
   * it was, the flash belongs on Shift rather than on the letter key — the
   * child did press that letter correctly, and flashing it would point at the
   * one thing they got right.
   */
  missKind?: "shift" | "key" | null;
  /** Whether Shift has been taught yet. A dormant Shift key reads as locked until then. */
  shiftUnlocked?: boolean;
  /** The pinky that must hold Shift for `nextChar`, if it needs one — see getShiftFingerForChar. */
  shiftFinger?: FingerId | null;
  /** Whether Shift is physically held down right now, making an invisible action visible. */
  shiftHeld?: boolean;
};

function colorForFinger(finger: string): string {
  if (finger === "thumb") return THUMB_COLOR;
  return FINGERS[finger as keyof typeof FINGERS]?.hex ?? THUMB_COLOR;
}

export function Keyboard({
  unlockedChars,
  nextChar = null,
  justUnlockedChars,
  helperChars,
  layoutId = DEFAULT_LAYOUT,
  missChar = null,
  missEventId = 0,
  missKind = null,
  shiftUnlocked = false,
  shiftFinger = null,
  shiftHeld = false,
}: KeyboardProps) {
  const layout = LAYOUTS[layoutId];

  return (
    <div className={styles.board} role="img" aria-label="On-screen keyboard">
      {layout.rows.map((row, rowIndex) => (
        <div className={styles.row} key={rowIndex}>
          {row.map((keyDef) => {
            const isShiftKey = keyDef.modifier === "shift";
            // Shift is the one key whose state can't be read off the
            // character sets, since it produces no character — every branch
            // below therefore forks on isShiftKey. `isThisShift` narrows to
            // the ONE of the two Shift tiles the current chord wants, so the
            // child is pointed at the correct hand rather than both.
            const isThisShift = isShiftKey && shiftFinger === keyDef.finger;

            const isUnlocked = isShiftKey ? shiftUnlocked : unlockedChars.has(keyDef.char);
            // A helper key may be either the base char or its shifted form
            // (e.g. "V" in a name maps to the "v" key). Shift is a helper
            // whenever a chord needs it before Day 4 — same dashed treatment
            // as a letter the child is being asked to type untaught.
            const isHelper = isShiftKey
              ? !shiftUnlocked && isThisShift
              : !isUnlocked &&
                !!helperChars &&
                (helperChars.has(keyDef.char) || (!!keyDef.shiftChar && helperChars.has(keyDef.shiftChar)));
            const isNext = isShiftKey
              ? isThisShift
              : nextChar !== null && (keyDef.char === nextChar || (!!keyDef.shiftChar && keyDef.shiftChar === nextChar));
            const isJustUnlocked = (isShiftKey ? justUnlockedChars?.has(SHIFT_MODIFIER_ID) : justUnlockedChars?.has(keyDef.char)) ?? false;
            // On a Shift miss the flash moves to Shift and off the letter. If
            // no chord was expected the child is holding Shift (or Caps Lock)
            // when they shouldn't be, so both tiles flash — there's no single
            // correct one to point at.
            const isMissed = isShiftKey
              ? missKind === "shift" && (shiftFinger === null || isThisShift)
              : missKind !== "shift" && missChar !== null && (keyDef.char === missChar || keyDef.shiftChar === missChar);
            const isHeld = isShiftKey && shiftHeld;
            const display = keyDef.label ?? (keyDef.char === " " ? "" : keyDef.char);
            // Two Shift tiles share an empty `char`, so identity comes from
            // `id` where one is declared.
            const identity = keyDef.id ?? keyDef.char;

            return (
              <div
                // Remounted on every miss of this key (not just class-
                // toggled) so a gentle-nudge child who mashes the same wrong
                // key twice in a row sees the flash retrigger both times.
                key={isMissed ? `${identity}-m${missEventId}` : identity}
                className={[
                  styles.key,
                  isUnlocked ? styles.unlocked : isHelper ? styles.helper : styles.locked,
                  isShiftKey ? styles.modifier : "",
                  isNext ? styles.next : "",
                  isJustUnlocked ? styles.justUnlocked : "",
                  isMissed ? styles.missed : "",
                  isHeld ? styles.held : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={{ "--key-color": colorForFinger(keyDef.finger), flexGrow: keyDef.width ?? 1 } as React.CSSProperties}
              >
                {display}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
