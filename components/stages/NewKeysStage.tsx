"use client";

import { useEffect, useMemo, useState } from "react";
import type { DayPracticeContent } from "@/lib/types";
import { getDrilledKeys, type LevelConfig } from "@/content/levels";
import { buildAlternationBursts } from "@/lib/drill-generator";
import { emptySummary, mergeSummaries, NO_LOCKED_KEYS, type StageTypingSummary } from "@/lib/typing-engine";
import { useGatedStage } from "@/lib/useGatedStage";
import { TypingItem } from "@/components/TypingItem";
import { useI18n } from "@/context/I18nContext";

type NewKeysStageProps = {
  dayContent: DayPracticeContent;
  level: LevelConfig;
  unlockedChars: ReadonlySet<string>;
  justUnlockedChars: ReadonlySet<string>;
  onComplete: (summary: StageTypingSummary) => void;
};

/**
 * Builds the queue: for each drilled key, the author-written isolated
 * pattern once ("f f f f f f" from content/days), then — once at least one
 * other key is already known — level-scaled alternation bursts mixing the
 * new key with everything known so far (see lib/drill-generator.ts). This
 * is what actually varies content between levels and between attempts;
 * nothing here repeats an identical target back to back.
 */
function buildQueue(dayContent: DayPracticeContent, level: LevelConfig): string[] {
  const drilledKeysList = getDrilledKeys(dayContent.newKeys, level.newKeyScope);
  const items: string[] = [];
  const known: string[] = [];

  for (const key of drilledKeysList) {
    const authored = dayContent.drills.find((d) => d.keys.length === 1 && d.keys[0] === key);
    if (authored) items.push(authored.pattern);

    if (known.length > 0) {
      items.push(
        ...buildAlternationBursts(key, known, level.drillRepetitions.burstCount, level.drillRepetitions.burstLength)
      );
    }
    known.push(key);
  }

  return items;
}

export function NewKeysStage({ dayContent, level, unlockedChars, justUnlockedChars, onComplete }: NewKeysStageProps) {
  const { t } = useI18n();
  const { attempt, retrying, submitAttempt } = useGatedStage(level.accuracyGate, onComplete);

  const queue = useMemo(() => buildQueue(dayContent, level), [dayContent, level]);

  const [queueIndex, setQueueIndex] = useState(0);
  const [summary, setSummary] = useState<StageTypingSummary>(emptySummary());
  const isEmpty = queue.length === 0;

  useEffect(() => {
    setQueueIndex(0);
    setSummary(emptySummary());
  }, [attempt]);

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

  const currentPattern = queue[queueIndex];

  function handleItemComplete(itemSummary: StageTypingSummary) {
    const total = mergeSummaries(summary, itemSummary);
    if (queueIndex + 1 >= queue.length) {
      submitAttempt(total);
    } else {
      setSummary(total);
      setQueueIndex((i) => i + 1);
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
      <h2 className="font-[family-name:var(--font-display)] text-2xl text-foreground">{t("stages.newKeys.title")}</h2>
      <p className="font-[family-name:var(--font-ui)] text-foreground-muted">{t("stages.newKeys.instruction")}</p>
      <TypingItem
        key={`${attempt}-${queueIndex}`}
        target={currentPattern}
        locked={NO_LOCKED_KEYS}
        unlockedChars={unlockedChars}
        errorHandling={level.errorHandling}
        fingerHint={level.fingerHint}
        justUnlockedChars={justUnlockedChars}
        onComplete={handleItemComplete}
      />
    </div>
  );
}
