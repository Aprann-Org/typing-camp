import { FINGERS, THUMB_COLOR, type FingerId } from "@/content/fingers";
import styles from "./HandMap.module.css";

type HandMapProps = {
  /** The finger the child should PRESS with right now, or null/undefined for none. */
  activeFinger?: FingerId | "thumb" | null;
  /**
   * A finger the child should HOLD DOWN while pressing `activeFinger` — the
   * pinky on Shift. Drawn with a sustained glow rather than the press bounce,
   * because holding and tapping are different physical actions and shouldn't
   * look alike.
   */
  holdFinger?: FingerId | null;
  /** Pre-translated label shown under the hands, e.g. "left index finger". */
  activeLabel?: string;
};

type DigitSlot = "pinky" | "ring" | "middle" | "index" | "thumb";

const LEFT_SLOT_TO_FINGER: Record<DigitSlot, FingerId | "thumb"> = {
  pinky: "leftPinky",
  ring: "leftRing",
  middle: "leftMiddle",
  index: "leftIndex",
  thumb: "thumb",
};

const RIGHT_SLOT_TO_FINGER: Record<DigitSlot, FingerId | "thumb"> = {
  pinky: "rightPinky",
  ring: "rightRing",
  middle: "rightMiddle",
  index: "rightIndex",
  thumb: "thumb",
};

function colorFor(finger: FingerId | "thumb"): string {
  return finger === "thumb" ? THUMB_COLOR : FINGERS[finger].hex;
}

/**
 * One stylized top-down hand: pinky at local-left, index at local-right,
 * thumb reaching in toward the spacebar. Mirrored via CSS transform for the
 * right hand — the anatomical slot->finger mapping (not the drawing) is
 * what changes between hands, so the geometry is written once.
 */
function HandSvg({
  mirrored,
  slotToFinger,
  activeFinger,
  holdFinger,
}: {
  mirrored: boolean;
  slotToFinger: Record<DigitSlot, FingerId | "thumb">;
  activeFinger: FingerId | "thumb" | null | undefined;
  holdFinger: FingerId | null | undefined;
}) {
  const isActive = (slot: DigitSlot) => slotToFinger[slot] === activeFinger;
  const isHold = (slot: DigitSlot) => slotToFinger[slot] === holdFinger;
  const fill = (slot: DigitSlot) => {
    const finger = slotToFinger[slot];
    return isActive(slot) || isHold(slot) ? colorFor(finger) : undefined;
  };
  const cls = (slot: DigitSlot) =>
    [styles.digit, isActive(slot) ? styles.digitActive : "", isHold(slot) ? styles.digitHold : ""]
      .filter(Boolean)
      .join(" ");

  return (
    <svg
      width="120"
      height="170"
      viewBox="0 0 120 170"
      style={mirrored ? { transform: "scaleX(-1)" } : undefined}
      aria-hidden="true"
    >
      <rect className={styles.digit} x="15" y="95" width="90" height="65" rx="28" />
      <rect className={cls("pinky")} x="12" y="45" width="16" height="55" rx="8" style={{ fill: fill("pinky") }} />
      <rect className={cls("ring")} x="36" y="25" width="16" height="75" rx="8" style={{ fill: fill("ring") }} />
      <rect className={cls("middle")} x="60" y="15" width="16" height="85" rx="8" style={{ fill: fill("middle") }} />
      <rect className={cls("index")} x="84" y="30" width="16" height="70" rx="8" style={{ fill: fill("index") }} />
      <rect
        className={cls("thumb")}
        x="95" y="100" width="40" height="18" rx="9"
        transform="rotate(35 95 100)"
        style={{ fill: fill("thumb") }}
      />
    </svg>
  );
}

export function HandMap({ activeFinger = null, holdFinger = null, activeLabel }: HandMapProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.hands}>
        <HandSvg
          mirrored={false}
          slotToFinger={LEFT_SLOT_TO_FINGER}
          activeFinger={activeFinger}
          holdFinger={holdFinger}
        />
        <HandSvg
          mirrored={true}
          slotToFinger={RIGHT_SLOT_TO_FINGER}
          activeFinger={activeFinger}
          holdFinger={holdFinger}
        />
      </div>
      <div className={styles.label}>{activeLabel}</div>
    </div>
  );
}
