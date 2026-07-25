"use client";

import { useEffect, useMemo, useState } from "react";
import type { LevelConfig } from "@/content/levels";
import { buildLockedKeyConfig } from "@/content/layouts";
import { emptySummary, mergeSummaries, type StageTypingSummary } from "@/lib/typing-engine";
import { useGatedStage } from "@/lib/useGatedStage";
import { TypingItem } from "@/components/TypingItem";
import { useI18n } from "@/context/I18nContext";

type ThemeChallengeStageProps = {
  /** Resolved by SessionRunner: dayContent.themePhrases, or the child's own name when a day has none (Day 1). */
  targets: string[];
  level: LevelConfig;
  unlockedChars: ReadonlySet<string>;
  shiftUnlocked: boolean;
  onComplete: (summary: StageTypingSummary) => void;
};

export function ThemeChallengeStage({ targets, level, unlockedChars, shiftUnlocked, onComplete }: ThemeChallengeStageProps) {
  const { t } = useI18n();
  const { attempt, retrying, submitAttempt } = useGatedStage(level.accuracyGate, onComplete);
  const [index, setIndex] = useState(0);
  const [summary, setSummary] = useState<StageTypingSummary>(emptySummary());

  const isEmpty = targets.length === 0;
  const target = targets[index] ?? "";

  // Guided mode: the child types the not-yet-unlocked letters too (their own
  // name on Day 1); they just don't count toward the score. Memoized so the
  // engine's reducer isn't rebuilt on every render.
  const locked = useMemo(
    () => buildLockedKeyConfig(target, unlockedChars, shiftUnlocked, "guided"),
    [target, unlockedChars, shiftUnlocked]
  );

  useEffect(() => {
    setIndex(0);
    setSummary(emptySummary());
  }, [attempt]);

  // Nothing to type for this day/level — complete from an effect rather than
  // during render (calling a parent's setState mid-render is not allowed).
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

  const hasHelperKeys = locked.guidedTyped.size > 0 || locked.autofill.size > 0;

  function handleComplete(itemSummary: StageTypingSummary) {
    const total = mergeSummaries(summary, itemSummary);
    if (index + 1 >= targets.length) {
      submitAttempt(total);
    } else {
      setSummary(total);
      setIndex((i) => i + 1);
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
      <h2 className="font-[family-name:var(--font-display)] text-2xl text-foreground">{t("stages.themeChallenge.title")}</h2>
      <p className="font-[family-name:var(--font-ui)] text-foreground-muted">{t("stages.themeChallenge.instruction")}</p>
      {hasHelperKeys && (
        <p className="font-[family-name:var(--font-ui)] text-sm text-foreground-muted">{t("stages.themeChallenge.helperKeyNote")}</p>
      )}
      <TypingItem
        key={`${attempt}-${index}`}
        target={target}
        locked={locked}
        unlockedChars={unlockedChars}
        errorHandling={level.errorHandling}
        fingerHint={level.fingerHint}
        onComplete={handleComplete}
      />
    </div>
  );
}
