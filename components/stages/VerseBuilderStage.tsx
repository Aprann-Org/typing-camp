"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { DayPracticeContent } from "@/lib/types";
import type { LevelConfig } from "@/content/levels";
import { buildLockedKeyConfig, getFingerForChar, DEFAULT_LAYOUT, type LayoutId } from "@/content/layouts";
import { FINGERS, THUMB_COLOR } from "@/content/fingers";
import { useTypingSession } from "@/lib/useTypingSession";
import { summarizeTypingState, type StageTypingSummary, type TypingState } from "@/lib/typing-engine";
import { useI18n } from "@/context/I18nContext";
import { useAppSettings } from "@/context/AppSettingsContext";
import { useTypingInputFocus } from "@/context/OverlayContext";
import styles from "./VerseBuilderStage.module.css";

type PriorProgress = { day: number; charsTypedUnassisted: number } | null;

type VerseBuilderStageProps = {
  dayContent: DayPracticeContent;
  level: LevelConfig;
  unlockedChars: ReadonlySet<string>;
  shiftUnlocked: boolean;
  priorProgress: PriorProgress;
  /** Reports fraction of the verse typed (0-1) for the journey stepper. */
  onProgress?: (fraction: number) => void;
  onComplete: (summary: StageTypingSummary, verseCharsTypedUnassisted: number) => void;
};

const HOLD_MS = 500;
const BLOOM_MS = 650;

function displayChar(char: string): string {
  return char === " " ? " " : char;
}

function colorForChar(char: string, layoutId: LayoutId): string {
  const finger = getFingerForChar(char, layoutId);
  if (!finger) return THUMB_COLOR;
  return finger === "thumb" ? THUMB_COLOR : FINGERS[finger].hex;
}

export function VerseBuilderStage({
  dayContent,
  level,
  unlockedChars,
  shiftUnlocked,
  priorProgress,
  onProgress,
  onComplete,
}: VerseBuilderStageProps) {
  const { t } = useI18n();
  const { soundEnabled } = useAppSettings();
  const text = dayContent.verse.text;
  const layoutId = DEFAULT_LAYOUT;

  // Verse Builder is the one stage that pre-fills locked characters and
  // auto-advances past them, per the brief — the child types only what
  // they've actually unlocked, and the count of that is the whole point.
  const locked = useMemo(
    () => buildLockedKeyConfig(text, unlockedChars, shiftUnlocked, "autofill-all"),
    [text, unlockedChars, shiftUnlocked]
  );
  const totalUnassisted = useMemo(
    () => Array.from(text).filter((c) => !locked.autofill.has(c)).length,
    [text, locked]
  );

  const [completing, setCompleting] = useState(false);
  const [blooming, setBlooming] = useState(false);
  const finalCountRef = useRef(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const { state, handleKeyDown, inputRef } = useTypingSession({
    target: text,
    locked,
    errorHandling: level.errorHandling,
    soundEnabled,
    onComplete: (finalState: TypingState) => {
      finalCountRef.current = finalState.correctCount + finalState.incorrectCount;
      setCompleting(true);
      const t1 = setTimeout(() => setBlooming(true), HOLD_MS);
      const t2 = setTimeout(() => {
        onComplete(summarizeTypingState(finalState), finalCountRef.current);
      }, HOLD_MS + BLOOM_MS);
      timersRef.current.push(t1, t2);
    },
  });

  const focusProps = useTypingInputFocus(inputRef);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  const typedSoFar = state.correctCount + state.incorrectCount;

  useEffect(() => {
    if (totalUnassisted > 0) onProgress?.(typedSoFar / totalUnassisted);
  }, [typedSoFar, totalUnassisted, onProgress]);

  return (
    <div className={styles.wrap}>
      <h2 className="font-[family-name:var(--font-display)] text-2xl text-foreground">{t("stages.verseBuilder.title")}</h2>
      <p className="font-[family-name:var(--font-ui)] text-foreground-muted">{t("stages.verseBuilder.instruction")}</p>
      <p className={styles.counter}>{t("stages.verseBuilder.counter", { typed: typedSoFar, total: totalUnassisted })}</p>

      <div className={styles.verseRow} onClick={() => inputRef.current?.focus()}>
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
              styles.slot,
              i === state.index ? styles.current : "",
              slot.status === "correct" ? styles.correct : "",
              slot.status === "incorrect" ? styles.incorrect : "",
              slot.status === "guided" ? styles.guided : "",
              blooming ? styles.blooming : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={{
              ...(slot.status === "correct" ? ({ "--slot-color": colorForChar(slot.char, layoutId) } as React.CSSProperties) : {}),
              animationDelay: blooming ? `${i * 22}ms` : undefined,
            }}
          >
            {displayChar(slot.char)}
          </span>
        ))}
      </div>

      {completing && (
        <p className={styles.comparison}>
          {priorProgress
            ? t("stages.verseBuilder.comparisonLine", {
                day: priorProgress.day,
                previous: priorProgress.charsTypedUnassisted,
                current: finalCountRef.current,
              })
            : t("stages.verseBuilder.firstTimeLine", { current: finalCountRef.current })}
        </p>
      )}
    </div>
  );
}
