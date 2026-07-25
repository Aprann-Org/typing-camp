import type { RefObject } from "react";
import type { TypingState } from "@/lib/typing-engine";
import { getFingerForChar, DEFAULT_LAYOUT, type LayoutId } from "@/content/layouts";
import { FINGERS, THUMB_COLOR } from "@/content/fingers";
import styles from "./TypingSlots.module.css";

type TypingSlotsProps = {
  state: TypingState;
  inputRef: RefObject<HTMLInputElement | null>;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  layoutId?: LayoutId;
};

function displayChar(char: string): string {
  return char === " " ? "·" : char;
}

function colorForChar(char: string, layoutId: LayoutId): string | undefined {
  const finger = getFingerForChar(char, layoutId);
  if (!finger) return undefined;
  return finger === "thumb" ? THUMB_COLOR : FINGERS[finger].hex;
}

export function TypingSlots({ state, inputRef, onKeyDown, layoutId = DEFAULT_LAYOUT }: TypingSlotsProps) {
  return (
    <div className={styles.wrap} onClick={() => inputRef.current?.focus()}>
      <input
        ref={inputRef}
        className={styles.hiddenInput}
        onKeyDown={onKeyDown}
        onBlur={(e) => e.target.focus()}
        autoFocus
        aria-label="Typing input"
      />
      {state.slots.map((slot, i) => (
        <span
          key={i}
          className={[
            styles.slot,
            i === state.index ? styles.current : "",
            slot.status === "correct" ? styles.correct : "",
            slot.status === "incorrect" ? styles.incorrect : "",
            slot.status === "guided" ? styles.guided : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={slot.status === "correct" ? ({ "--slot-color": colorForChar(slot.char, layoutId) } as React.CSSProperties) : undefined}
        >
          {displayChar(slot.char)}
        </span>
      ))}
    </div>
  );
}
