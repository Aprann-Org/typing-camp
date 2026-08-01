"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useTypingSession } from "@/lib/useTypingSession";
import { buildLockedKeyConfig, getFingerForChar } from "@/content/layouts";
import { FINGERS, THUMB_COLOR } from "@/content/fingers";
import {
  emptySummary,
  mergeSummaries,
  summarizeTypingState,
  type StageTypingSummary,
  type TypingState,
} from "@/lib/typing-engine";
import type { ErrorHandlingMode } from "@/content/levels";
import { useI18n } from "@/context/I18nContext";
import { useAppSettings } from "@/context/AppSettingsContext";
import { useTypingInputFocus } from "@/context/OverlayContext";
import { HandMap } from "@/components/HandMap";
import styles from "./WordSceneGame.module.css";

// The shared engine behind the Day 2-5 games. All four are the same shape:
// type a short sequence of words, and each finished word advances one step
// of a picture. Only the picture differs, so it comes in as `renderScene`.
//
// Two rules hold across every scene built on this, both from the brief:
//   - No timer and no failure state. A slower child gets the same finished
//     picture, just later. Nothing is ever taken away for typing slowly.
//   - Guided mode, so words may use keys the child hasn't been taught yet.
//     Those are still typed (with the finger shown) and simply don't count
//     toward the session score.
//
// Day 1's Name Animator is deliberately NOT built on this — it types one
// target (the child's own name), not a sequence, so it stays standalone.

/** How long the finished picture plays before the "Continue" button appears. */
const FINISHED_SCENE_HOLD_MS = 2200;

export type SceneRenderProps = {
  /** Words finished so far, 0..total. Scenes reveal one element per word. */
  revealed: number;
  total: number;
};

type WordSceneGameProps = {
  words: string[];
  instruction: string;
  unlockedChars: ReadonlySet<string>;
  shiftUnlocked: boolean;
  errorHandling: ErrorHandlingMode;
  renderScene: (props: SceneRenderProps) => ReactNode;
  /** Reports words finished (0-1), so the journey stepper's game segment moves with the picture. */
  onProgress?: (fraction: number) => void;
  onComplete: (summary: StageTypingSummary) => void;
};

/**
 * The finger color for a character. Exported because the scenes use it too:
 * each piece of a picture is painted in the finger color of the first letter
 * of the word that earned it. That keeps the project's rule intact — a color
 * on screen always means a finger, never decoration — while still letting the
 * scenes be colorful.
 */
export function colorFor(char: string): string {
  const finger = getFingerForChar(char);
  if (!finger) return THUMB_COLOR;
  return finger === "thumb" ? THUMB_COLOR : FINGERS[finger].hex;
}

export function WordSceneGame({
  words,
  instruction,
  unlockedChars,
  shiftUnlocked,
  errorHandling,
  renderScene,
  onProgress,
  onComplete,
}: WordSceneGameProps) {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const accumulated = useRef<StageTypingSummary>(emptySummary());
  // Set once the finished picture has had its moment (see the hold effect
  // below) — reveals the Continue button rather than auto-advancing, so the
  // child (not a timer) decides when to move on. Guards against a double
  // click firing onComplete twice before the parent has a chance to advance.
  const [readyToContinue, setReadyToContinue] = useState(false);
  const [continuePressed, setContinuePressed] = useState(false);

  const handleWordFinished = useCallback(
    (summary: StageTypingSummary) => {
      accumulated.current = mergeSummaries(accumulated.current, summary);
      setIndex(index + 1);
    },
    [index]
  );

  useEffect(() => {
    if (words.length > 0) onProgress?.(index / words.length);
  }, [index, words.length, onProgress]);

  const done = index >= words.length;

  // Hold on the finished picture before offering Continue. Without this the
  // last keystroke both completes the drawing and reveals the button in the
  // same frame, so the child never actually sees the thing they spent the
  // whole game building — the payoff flashes past. Same reasoning as the
  // Verse Builder's completion flourish.
  useEffect(() => {
    if (!done) return;
    const id = setTimeout(() => setReadyToContinue(true), FINISHED_SCENE_HOLD_MS);
    return () => clearTimeout(id);
  }, [done]);

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="font-[family-name:var(--font-ui)] text-foreground-muted">{instruction}</p>
      <div className={styles.scene}>{renderScene({ revealed: index, total: words.length })}</div>
      {!done && (
        // Keyed by index so each word gets a genuinely fresh typing session.
        // useTypingSession resets on a changed `target`, which would silently
        // fail to reset if a scene ever listed the same word twice in a row.
        <WordTyper
          key={index}
          word={words[index]}
          unlockedChars={unlockedChars}
          shiftUnlocked={shiftUnlocked}
          errorHandling={errorHandling}
          onFinished={handleWordFinished}
        />
      )}
      {readyToContinue && (
        <button
          className="btn-primary px-8 py-3 text-lg"
          disabled={continuePressed}
          onClick={() => {
            setContinuePressed(true);
            onComplete(accumulated.current);
          }}
        >
          {t("common.continue")}
        </button>
      )}
    </div>
  );
}

type WordTyperProps = {
  word: string;
  unlockedChars: ReadonlySet<string>;
  shiftUnlocked: boolean;
  errorHandling: ErrorHandlingMode;
  onFinished: (summary: StageTypingSummary) => void;
};

function WordTyper({ word, unlockedChars, shiftUnlocked, errorHandling, onFinished }: WordTyperProps) {
  const { t } = useI18n();
  const { soundEnabled } = useAppSettings();

  const locked = useMemo(
    () => buildLockedKeyConfig(word, unlockedChars, shiftUnlocked, "guided"),
    [word, unlockedChars, shiftUnlocked]
  );

  const { state, handleKeyDown, inputRef } = useTypingSession({
    target: word,
    locked,
    errorHandling,
    soundEnabled,
    onComplete: (finalState: TypingState) => onFinished(summarizeTypingState(finalState)),
  });

  const focusProps = useTypingInputFocus(inputRef);

  const currentChar = !state.finished ? state.slots[state.index]?.char : undefined;
  const currentFinger = currentChar !== undefined ? getFingerForChar(currentChar) : null;

  return (
    <>
      <div className={styles.word} onClick={() => inputRef.current?.focus()}>
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
              slot.status === "incorrect" ? styles.missed : "",
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
      {/* Same reasoning as the Name Animator: these words routinely contain
          keys today's lesson hasn't taught, so the hand map is instruction
          rather than a hint that a higher level should withhold. */}
      {currentFinger && <HandMap activeFinger={currentFinger} activeLabel={t(`fingerNames.${currentFinger}`)} />}
    </>
  );
}
