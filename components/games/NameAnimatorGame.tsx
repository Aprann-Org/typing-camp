"use client";

import { useEffect, useMemo, useState } from "react";
import { useTypingSession } from "@/lib/useTypingSession";
import { buildLockedKeyConfig, getFingerForChar } from "@/content/layouts";
import { FINGERS, THUMB_COLOR } from "@/content/fingers";
import { summarizeTypingState, type StageTypingSummary, type TypingState } from "@/lib/typing-engine";
import type { ErrorHandlingMode } from "@/content/levels";
import { useI18n } from "@/context/I18nContext";
import { useAppSettings } from "@/context/AppSettingsContext";
import { useTypingInputFocus } from "@/context/OverlayContext";
import { HandMap } from "@/components/HandMap";
import styles from "./NameAnimatorGame.module.css";

type NameAnimatorGameProps = {
  firstName: string;
  unlockedChars: ReadonlySet<string>;
  shiftUnlocked: boolean;
  errorHandling: ErrorHandlingMode;
  /** Reports fraction of the name typed (0-1) for the journey stepper. */
  onProgress?: (fraction: number) => void;
  onComplete: (summary: StageTypingSummary) => void;
};

function colorFor(char: string): string {
  const finger = getFingerForChar(char);
  if (!finger) return THUMB_COLOR;
  return finger === "thumb" ? THUMB_COLOR : FINGERS[finger].hex;
}

/** How long the finished name plays before the "Continue" button appears — mirrors WordSceneGame's identical hold. */
const FINISHED_HOLD_MS = 2200;

// Day 1's game: the child's own name renders large, and each correct
// keystroke makes that letter bounce, change color, and hold — mirroring
// the Day 1 Scratch project. Guided mode, since most names need locked
// keys: the child DOES type every letter (with the finger shown), those
// letters just don't count toward the session score.
export function NameAnimatorGame({ firstName, unlockedChars, shiftUnlocked, errorHandling, onProgress, onComplete }: NameAnimatorGameProps) {
  const { t } = useI18n();
  const { soundEnabled } = useAppSettings();
  // Set once the name is fully typed, so the finished animation gets its
  // moment before Continue appears — same reasoning as WordSceneGame's hold:
  // without it the last keystroke and the stage advance land in the same
  // frame, and the child never actually sees their own name land.
  const [finishedSummary, setFinishedSummary] = useState<StageTypingSummary | null>(null);
  const [readyToContinue, setReadyToContinue] = useState(false);
  const [continuePressed, setContinuePressed] = useState(false);

  const locked = useMemo(
    () => buildLockedKeyConfig(firstName, unlockedChars, shiftUnlocked, "guided"),
    [firstName, unlockedChars, shiftUnlocked]
  );

  const { state, handleKeyDown, inputRef } = useTypingSession({
    target: firstName,
    locked,
    errorHandling,
    soundEnabled,
    onComplete: (finalState: TypingState) => setFinishedSummary(summarizeTypingState(finalState)),
  });

  const focusProps = useTypingInputFocus(inputRef);

  useEffect(() => {
    if (state.slots.length > 0) onProgress?.(state.index / state.slots.length);
  }, [state.index, state.slots.length, onProgress]);

  useEffect(() => {
    if (!finishedSummary) return;
    const id = setTimeout(() => setReadyToContinue(true), FINISHED_HOLD_MS);
    return () => clearTimeout(id);
  }, [finishedSummary]);

  const currentChar = !state.finished ? state.slots[state.index]?.char : undefined;
  const currentFinger = currentChar !== undefined ? getFingerForChar(currentChar) : null;

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="font-[family-name:var(--font-ui)] text-foreground-muted">{t("games.day1NameAnimator.instruction")}</p>
      <div className={styles.row} onClick={() => inputRef.current?.focus()}>
        <input
          ref={inputRef}
          className={styles.hiddenInput}
          onKeyDown={handleKeyDown}
          {...focusProps}
          autoFocus
          aria-label="Typing input"
        />
        {state.slots.map((slot, i) => (
          <span
            key={i}
            className={[
              styles.letter,
              slot.status === "correct" || slot.status === "guided" ? styles.landed : "",
              i === state.index ? styles.current : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={
              slot.status === "correct" || slot.status === "guided"
                ? ({ "--letter-color": colorFor(slot.char) } as React.CSSProperties)
                : undefined
            }
          >
            {slot.char}
          </span>
        ))}
      </div>
      {/* Always show the finger here — nearly every letter of a name is a
          key the child hasn't been taught yet, so the hand map is the
          instruction, not a hint that can be withheld by level. */}
      {currentFinger && <HandMap activeFinger={currentFinger} activeLabel={t(`fingerNames.${currentFinger}`)} />}
      {readyToContinue && finishedSummary && (
        <button
          className="btn-primary px-8 py-3 text-lg"
          disabled={continuePressed}
          onClick={() => {
            setContinuePressed(true);
            onComplete(finishedSummary);
          }}
        >
          {t("common.continue")}
        </button>
      )}
    </div>
  );
}
