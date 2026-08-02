"use client";

import { useEffect, useMemo, useState } from "react";
import type { DayPracticeContent } from "@/lib/types";
import type { LevelConfig } from "@/content/levels";
import { buildNewKeysCheckpoints } from "@/lib/drill-generator";
import { emptySummary, mergeSummaries, NO_LOCKED_KEYS, type StageTypingSummary } from "@/lib/typing-engine";
import { useGatedStage } from "@/lib/useGatedStage";
import { TypingItem } from "@/components/TypingItem";
import { HandMap } from "@/components/HandMap";
import { Keyboard } from "@/components/Keyboard";
import { getFingerForChar, getShiftFingerForChar } from "@/content/layouts";
import { useI18n } from "@/context/I18nContext";

// The letter the Shift explainer demonstrates with. "B" because Day 4 teaches
// "b" and the day's payoff word is "Bondye" — the child sees the exact chord
// they are about to need. Its Shift is the right pinky (opposite hand).
const SHIFT_DEMO_CHAR = "B";

type NewKeysStageProps = {
  dayContent: DayPracticeContent;
  level: LevelConfig;
  unlockedChars: ReadonlySet<string>;
  shiftUnlocked: boolean;
  justUnlockedChars: ReadonlySet<string>;
  /** Reports queue position (0-1) so the journey stepper can show movement through this, the longest stage of the day. */
  onProgress?: (fraction: number) => void;
  onComplete: (summary: StageTypingSummary) => void;
};

export function NewKeysStage({
  dayContent,
  level,
  unlockedChars,
  shiftUnlocked,
  justUnlockedChars,
  onProgress,
  onComplete,
}: NewKeysStageProps) {
  const { t } = useI18n();
  const { attempt, retrying, submitAttempt } = useGatedStage(level.accuracyGate, onComplete);

  // Days without authored newKeyGroups (see content/days/day1.practice.ts's
  // doc comment on the field) come back as a single checkpoint — this stage
  // then behaves exactly as it did before checkpoints existed.
  const checkpoints = useMemo(() => buildNewKeysCheckpoints(dayContent, level), [dayContent, level]);
  const totalItems = useMemo(() => checkpoints.reduce((sum, c) => sum + c.items.length, 0), [checkpoints]);

  const [checkpointIndex, setCheckpointIndex] = useState(0);
  const [itemIndex, setItemIndex] = useState(0);
  const [showBreak, setShowBreak] = useState(false);
  // Shown once, immediately before the Shift checkpoint's first drill. Shift
  // is the one "key" a child cannot be handed by highlighting a tile and
  // letting them find it, so it gets an explanation first.
  const [showShiftIntro, setShowShiftIntro] = useState(checkpoints[0]?.teachesShift ?? false);
  // Held when the LAST checkpoint is the Shift one: the stage waits on a
  // "you learned Shift" beat before submitting, rather than ending on the
  // final drill the way an ordinary last checkpoint does.
  const [pendingFinal, setPendingFinal] = useState<StageTypingSummary | null>(null);
  const [summary, setSummary] = useState<StageTypingSummary>(emptySummary());
  const isEmpty = totalItems === 0;

  // Reset on a genuinely new attempt (a gated retry), compared during render
  // rather than via an effect — see useTypingSession's identical pattern for
  // why: it lands in the same commit as the attempt change instead of one
  // render later. Tracked with state, not a ref — refs can't be read or
  // written during render at all.
  const [prevAttempt, setPrevAttempt] = useState(attempt);
  if (prevAttempt !== attempt) {
    setPrevAttempt(attempt);
    setCheckpointIndex(0);
    setItemIndex(0);
    setShowBreak(false);
    setShowShiftIntro(checkpoints[0]?.teachesShift ?? false);
    setPendingFinal(null);
    setSummary(emptySummary());
  }

  useEffect(() => {
    if (totalItems === 0) return;
    const itemsBefore = checkpoints.slice(0, checkpointIndex).reduce((sum, c) => sum + c.items.length, 0);
    onProgress?.((itemsBefore + itemIndex) / totalItems);
  }, [checkpoints, checkpointIndex, itemIndex, totalItems, onProgress]);

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

  const currentCheckpoint = checkpoints[checkpointIndex];

  if (showBreak) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-foreground">{t("stages.newKeys.checkpointTitle")}</h2>
        <p className="font-[family-name:var(--font-ui)] text-lg text-foreground-muted">
          {currentCheckpoint.teachesShift
            ? t("stages.newKeys.shiftCheckpointMessage")
            : t("stages.newKeys.checkpointMessage", {
                keys: currentCheckpoint.keys
                  .map((k) => (k === " " ? t("stages.newKeys.spaceKeyLabel") : k.toUpperCase()))
                  .join(", "),
              })}
        </p>
        <button
          type="button"
          className="rounded-full bg-foreground px-6 py-3 font-[family-name:var(--font-ui)] text-background"
          onClick={() => {
            // The Shift checkpoint is last, so its breather ends the stage
            // rather than advancing to another checkpoint.
            if (pendingFinal) {
              setShowBreak(false);
              submitAttempt(pendingFinal);
              return;
            }
            setShowBreak(false);
            if (checkpoints[checkpointIndex + 1]?.teachesShift) setShowShiftIntro(true);
            setCheckpointIndex((i) => i + 1);
            setItemIndex(0);
          }}
        >
          {t("stages.newKeys.checkpointContinue")}
        </button>
      </div>
    );
  }

  if (showShiftIntro) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-foreground">
          {t("stages.newKeys.shiftIntroTitle")}
        </h2>
        <HandMap
          activeFinger={getFingerForChar(SHIFT_DEMO_CHAR)}
          holdFinger={getShiftFingerForChar(SHIFT_DEMO_CHAR)}
          activeLabel={t("typing.shiftHint", {
            finger: t(`fingerNames.${getShiftFingerForChar(SHIFT_DEMO_CHAR)}`),
            char: SHIFT_DEMO_CHAR,
          })}
        />
        <div className="flex max-w-md flex-col gap-2 font-[family-name:var(--font-ui)] text-foreground">
          <p>{t("stages.newKeys.shiftIntroHold")}</p>
          <p>{t("stages.newKeys.shiftIntroPress")}</p>
          {/* The non-obvious half of the rule, and the reason a child's first
              instinct (same-hand Shift) makes the letter unreachable. */}
          <p className="text-foreground-muted">{t("stages.newKeys.shiftIntroOtherHand")}</p>
        </div>
        <Keyboard
          unlockedChars={unlockedChars}
          nextChar={SHIFT_DEMO_CHAR}
          shiftUnlocked={shiftUnlocked}
          shiftFinger={getShiftFingerForChar(SHIFT_DEMO_CHAR)}
          justUnlockedChars={justUnlockedChars}
        />
        <button className="btn-primary px-8 py-3 text-lg" onClick={() => setShowShiftIntro(false)}>
          {t("stages.newKeys.tryIt")}
        </button>
      </div>
    );
  }

  const currentPattern = currentCheckpoint.items[itemIndex];

  function handleItemComplete(itemSummary: StageTypingSummary) {
    const total = mergeSummaries(summary, itemSummary);
    const isLastItemInCheckpoint = itemIndex + 1 >= currentCheckpoint.items.length;
    const isLastCheckpoint = checkpointIndex + 1 >= checkpoints.length;

    if (isLastItemInCheckpoint && isLastCheckpoint) {
      if (currentCheckpoint.teachesShift) {
        // Day 4's milestone earns its own beat instead of the stage just
        // ending on the last drill.
        setSummary(total);
        setPendingFinal(total);
        setShowBreak(true);
      } else {
        submitAttempt(total);
      }
    } else if (isLastItemInCheckpoint) {
      setSummary(total);
      setShowBreak(true);
    } else {
      setSummary(total);
      setItemIndex((i) => i + 1);
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
      <h2 className="font-[family-name:var(--font-display)] text-2xl text-foreground">{t("stages.newKeys.title")}</h2>
      <p className="font-[family-name:var(--font-ui)] text-foreground-muted">{t("stages.newKeys.instruction")}</p>
      <TypingItem
        key={`${attempt}-${checkpointIndex}-${itemIndex}`}
        target={currentPattern}
        locked={NO_LOCKED_KEYS}
        unlockedChars={unlockedChars}
        shiftUnlocked={shiftUnlocked}
        errorHandling={level.errorHandling}
        fingerHint={level.fingerHint}
        justUnlockedChars={justUnlockedChars}
        onComplete={handleItemComplete}
      />
    </div>
  );
}
