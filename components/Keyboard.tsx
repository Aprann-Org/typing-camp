import { DEFAULT_LAYOUT, LAYOUTS, type LayoutId } from "@/content/layouts";
import { FINGERS, THUMB_COLOR } from "@/content/fingers";
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
}: KeyboardProps) {
  const layout = LAYOUTS[layoutId];

  return (
    <div className={styles.board} role="img" aria-label="On-screen keyboard">
      {layout.rows.map((row, rowIndex) => (
        <div className={styles.row} key={rowIndex}>
          {row.map((keyDef) => {
            const isUnlocked = unlockedChars.has(keyDef.char);
            // A helper key may be either the base char or its shifted form
            // (e.g. "V" in a name maps to the "v" key).
            const isHelper =
              !isUnlocked &&
              !!helperChars &&
              (helperChars.has(keyDef.char) || (!!keyDef.shiftChar && helperChars.has(keyDef.shiftChar)));
            const isNext =
              nextChar !== null && (keyDef.char === nextChar || (!!keyDef.shiftChar && keyDef.shiftChar === nextChar));
            const isJustUnlocked = justUnlockedChars?.has(keyDef.char) ?? false;
            const display = keyDef.label ?? (keyDef.char === " " ? "" : keyDef.char);

            return (
              <div
                key={keyDef.char}
                className={[
                  styles.key,
                  isUnlocked ? styles.unlocked : isHelper ? styles.helper : styles.locked,
                  isNext ? styles.next : "",
                  isJustUnlocked ? styles.justUnlocked : "",
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
