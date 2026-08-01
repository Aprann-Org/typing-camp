"use client";

import { useEffect, useMemo, useState } from "react";
import type { DayPracticeContent } from "@/lib/types";
import type { LevelConfig } from "@/content/levels";
import { emptySummary, mergeSummaries, type LockedKeyConfig, type StageTypingSummary } from "@/lib/typing-engine";
import { useGatedStage } from "@/lib/useGatedStage";
import { TypingItem } from "@/components/TypingItem";
import { useI18n } from "@/context/I18nContext";

type WordBuildStageProps = {
  dayContent: DayPracticeContent;
  level: LevelConfig;
  unlockedChars: ReadonlySet<string>;
  shiftUnlocked: boolean;
  /** Keys not explicitly drilled this session at Starter level — typed as helper keys here, not scored. */
  guidedOnlyKeys: ReadonlySet<string>;
  /** Reports word-queue position (0-1) for the journey stepper. */
  onProgress?: (fraction: number) => void;
  onComplete: (summary: StageTypingSummary) => void;
};

function shuffled(words: string[]): string[] {
  const copy = words.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function WordBuildStage({
  dayContent,
  level,
  unlockedChars,
  shiftUnlocked,
  guidedOnlyKeys,
  onProgress,
  onComplete,
}: WordBuildStageProps) {
  const { t } = useI18n();
  const { attempt, retrying, submitAttempt } = useGatedStage(level.accuracyGate, onComplete);

  // A retry reshuffles word order rather than replaying the identical
  // sequence — same word bank, different experience.
  const words = useMemo(
    () => (attempt === 0 ? dayContent.wordBank : shuffled(dayContent.wordBank)),
    [dayContent.wordBank, attempt]
  );

  // Starter drills only half of today's new keys; the rest appear here as
  // typed-but-unscored helper keys rather than being pre-filled.
  const locked = useMemo<LockedKeyConfig>(
    () => ({ autofill: new Set<string>(), guidedTyped: guidedOnlyKeys }),
    [guidedOnlyKeys]
  );

  const [wordIndex, setWordIndex] = useState(0);
  const [summary, setSummary] = useState<StageTypingSummary>(emptySummary());
  const isEmpty = words.length === 0;

  // See NewKeysStage/useTypingSession's identical pattern: reset compared
  // during render rather than via an effect, so it lands in the same commit
  // as the attempt change. State, not a ref — refs can't be touched during render.
  const [prevAttempt, setPrevAttempt] = useState(attempt);
  if (prevAttempt !== attempt) {
    setPrevAttempt(attempt);
    setWordIndex(0);
    setSummary(emptySummary());
  }

  useEffect(() => {
    if (words.length > 0) onProgress?.(wordIndex / words.length);
  }, [wordIndex, words.length, onProgress]);

  useEffect(() => {
    if (isEmpty) onComplete(emptySummary());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEmpty]);

  if (isEmpty) return null;

  if (retrying) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="font-[family-name:var(--font-ui)] text-lg text-foreground">{t("feedback.retryMessage")}</p>
      </div>
    );
  }

  function handleWordComplete(wordSummary: StageTypingSummary) {
    const total = mergeSummaries(summary, wordSummary);
    if (wordIndex + 1 >= words.length) {
      submitAttempt(total);
    } else {
      setSummary(total);
      setWordIndex((i) => i + 1);
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
      <h2 className="font-[family-name:var(--font-display)] text-2xl text-foreground">{t("stages.wordBuild.title")}</h2>
      <p className="font-[family-name:var(--font-ui)] text-foreground-muted">{t("stages.wordBuild.instruction")}</p>
      <TypingItem
        key={`${attempt}-${wordIndex}`}
        target={words[wordIndex]}
        locked={locked}
        unlockedChars={unlockedChars}
        shiftUnlocked={shiftUnlocked}
        errorHandling={level.errorHandling}
        fingerHint={level.fingerHint}
        onComplete={handleWordComplete}
      />
    </div>
  );
}
