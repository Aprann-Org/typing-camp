import type { RefObject } from "react";
import { useEffect, useRef, useState } from "react";
import type { TypingState } from "@/lib/typing-engine";
import { getFingerForChar, DEFAULT_LAYOUT, type LayoutId } from "@/content/layouts";
import { FINGERS, THUMB_COLOR } from "@/content/fingers";
import { useI18n } from "@/context/I18nContext";
import { useTypingInputFocus } from "@/context/OverlayContext";
import styles from "./TypingSlots.module.css";

type TypingSlotsProps = {
  state: TypingState;
  inputRef: RefObject<HTMLInputElement | null>;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  /** Needed to see a modifier being RELEASED — keydown alone can't tell. */
  onKeyUp?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  /** Clears held-modifier state when focus is genuinely lost (see handleBlur). */
  onBlur?: () => void;
  layoutId?: LayoutId;
};

// Below this, showing a counter would just be noise on every short drill —
// it only surfaces once a run is actually notable.
const STREAK_DISPLAY_THRESHOLD = 3;

// A stall this long mid-target gets a soft pulse on the current slot — not a
// timer, not a penalty, just a "still here?" nudge for a child who's stopped.
const IDLE_MS = 6000;

// A space used to render as "·", which is nearly the same mark as a period at
// the same size in the same-width slot — the two were indistinguishable on the
// drills that alternate them. A space now draws no glyph at all: the .space
// slot is wide with a low bar (echoing the wide space bar), while a period is
// a narrow slot with an oversized dot. Width and shape carry the difference
// before anything is typed; finger color carries it after.
function displayChar(char: string): string {
  return char === " " ? "" : char;
}

function colorForChar(char: string, layoutId: LayoutId): string | undefined {
  const finger = getFingerForChar(char, layoutId);
  if (!finger) return undefined;
  return finger === "thumb" ? THUMB_COLOR : FINGERS[finger].hex;
}

export function TypingSlots({ state, inputRef, onKeyDown, onKeyUp, onBlur, layoutId = DEFAULT_LAYOUT }: TypingSlotsProps) {
  const { t } = useI18n();
  const focusProps = useTypingInputFocus(inputRef);
  const [streak, setStreak] = useState(0);
  const [idle, setIdle] = useState(false);
  const eventIdsRef = useRef({ correct: state.correctEventId, miss: state.missEventId });
  // Real value is set by the effects below (both run before the idle
  // interval's first tick) — Date.now() itself can't be called during
  // render, so this starts at a placeholder rather than a live timestamp.
  const lastActivityRef = useRef(0);

  // A fresh target (new drill/word/phrase) always starts a fresh streak,
  // compared during render (React's "adjusting state when a prop changes"
  // pattern) rather than via an effect — state, not a ref, since refs can't
  // be read or written during render at all.
  const [prevTarget, setPrevTarget] = useState(state.target);
  if (prevTarget !== state.target) {
    setPrevTarget(state.target);
    setStreak(0);
    setIdle(false);
  }

  // The ref/Date.now() half of the same reset — both are only legal inside
  // an effect (refs can't be touched during render; Date.now() during
  // render is exactly the kind of impure call that produces a hydration
  // mismatch), so it can't join the render-time block above.
  useEffect(() => {
    eventIdsRef.current = { correct: state.correctEventId, miss: state.missEventId };
    lastActivityRef.current = Date.now();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.target]);

  useEffect(() => {
    const prev = eventIdsRef.current;
    if (state.missEventId > prev.miss) {
      setStreak(0);
      lastActivityRef.current = Date.now();
      setIdle(false);
    } else if (state.correctEventId > prev.correct) {
      setStreak((s) => s + 1);
      lastActivityRef.current = Date.now();
      setIdle(false);
    }
    eventIdsRef.current = { correct: state.correctEventId, miss: state.missEventId };
  }, [state.correctEventId, state.missEventId]);

  useEffect(() => {
    if (state.finished) return;
    const id = setInterval(() => setIdle(Date.now() - lastActivityRef.current > IDLE_MS), 1000);
    return () => clearInterval(id);
  }, [state.finished]);

  return (
    <div className={styles.container}>
      <span className={[styles.streak, streak >= STREAK_DISPLAY_THRESHOLD && !state.finished ? styles.streakVisible : ""].join(" ")}>
        {streak >= STREAK_DISPLAY_THRESHOLD ? t("typing.streak", { count: streak }) : ""}
      </span>

      <div className={styles.wrap} onClick={() => inputRef.current?.focus()}>
        <input
          ref={inputRef}
          className={styles.hiddenInput}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
          {...focusProps}
          // Composed rather than overridden: focusProps.onBlur is what keeps
          // the hidden input focused, so replacing it would break every
          // keystroke.
          onBlur={(e) => {
            focusProps.onBlur(e);
            onBlur?.();
          }}
          autoFocus
          aria-label="Typing input"
        />
        {state.slots.map((slot, i) => {
          const isCurrent = i === state.index;
          const justMissed = isCurrent && state.lastMiss !== null;
          return (
            <span
              // Remounting the current slot on every miss retriggers its
              // shake keyframe even when it stays the current slot (gentle-
              // nudge level never advances past a miss) — a class toggle
              // alone wouldn't re-fire the same animation twice in a row.
              key={isCurrent ? `cur-${state.missEventId}` : i}
              className={[
                styles.slot,
                slot.char === " " ? styles.space : "",
                slot.char === "." || slot.char === "," ? styles.dotPunct : "",
                isCurrent ? styles.current : "",
                slot.status === "correct" ? styles.correct : "",
                slot.status === "incorrect" ? styles.incorrect : "",
                slot.status === "guided" ? styles.guided : "",
                justMissed ? styles.shake : "",
                isCurrent && idle ? styles.idle : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={slot.status === "correct" ? ({ "--slot-color": colorForChar(slot.char, layoutId) } as React.CSSProperties) : undefined}
            >
              {displayChar(slot.char)}
            </span>
          );
        })}
      </div>
    </div>
  );
}
