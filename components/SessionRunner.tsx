"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { DayNumber, Profile, Session } from "@/lib/types";
import { LEVELS, getDrilledKeys, type LevelId } from "@/content/levels";
import { getDayDisplayText, getDayPracticeContent, getCumulativeUnlockedKeys, isShiftUnlocked } from "@/content/days";
import { STAGE_ORDER } from "@/lib/session";
import { emptySummary, mergeSummaries, computeKeyMastery, type StageTypingSummary } from "@/lib/typing-engine";
import { calculateWpm } from "@/lib/wpm";
import { addSession, getPriorVerseProgress, getStreak } from "@/lib/storage";
import { useI18n } from "@/context/I18nContext";
import { ProgressBar } from "@/components/ProgressBar";
import { TeacherControls } from "@/components/TeacherControls";
import { ReadyStage } from "./stages/ReadyStage";
import { NewKeysStage } from "./stages/NewKeysStage";
import { WordBuildStage } from "./stages/WordBuildStage";
import { ThemeChallengeStage } from "./stages/ThemeChallengeStage";
import { GameStage } from "./stages/GameStage";
import { VerseBuilderStage } from "./stages/VerseBuilderStage";
import { ReportStage } from "./stages/ReportStage";

type SessionRunnerProps = {
  profile: Profile;
  day: DayNumber;
  level: LevelId;
  onSessionEnd: () => void;
};

const REPORT_STAGE_INDEX = STAGE_ORDER.length - 1;

export function SessionRunner({ profile, day, level, onSessionEnd }: SessionRunnerProps) {
  const { t } = useI18n();
  const dayContent = getDayPracticeContent(day);
  const displayText = getDayDisplayText(profile.language, day);
  const levelConfig = LEVELS[level];

  const [stageIndex, setStageIndex] = useState(0);
  const [summary, setSummary] = useState<StageTypingSummary>(emptySummary());
  const [verseCharsTypedUnassisted, setVerseCharsTypedUnassisted] = useState(0);
  const [finalStats, setFinalStats] = useState<{ wpm: number; accuracy: number; streak: number } | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const savedRef = useRef(false);

  if (startedAtRef.current === null) startedAtRef.current = Date.now();

  const unlockedChars = useMemo(() => getCumulativeUnlockedKeys(day), [day]);
  const shiftUnlocked = isShiftUnlocked(day);

  const guidedOnlyKeys = useMemo(() => {
    if (!dayContent) return new Set<string>();
    const drilled = new Set(getDrilledKeys(dayContent.newKeys, levelConfig.newKeyScope));
    return new Set(dayContent.newKeys.filter((k) => !drilled.has(k)));
  }, [dayContent, levelConfig.newKeyScope]);

  // A day with no static theme phrases (Day 1) falls back to the child's
  // own name — that IS Day 1's workbook prompt ("type your first name"),
  // not a generic placeholder. Days with real themePhrases use those.
  const themeTargets = useMemo(() => {
    if (!dayContent) return [];
    return dayContent.themePhrases.length > 0 ? dayContent.themePhrases : [profile.firstName];
  }, [dayContent, profile.firstName]);

  const priorVerseProgress = useMemo(() => getPriorVerseProgress(profile, day), [profile, day]);

  const stage = STAGE_ORDER[stageIndex];

  useEffect(() => {
    if (!dayContent || !displayText || stage !== "report" || savedRef.current) return;
    savedRef.current = true;
    const startedAt = startedAtRef.current ?? Date.now();
    const now = Date.now();
    const wpm = calculateWpm(summary.correctCount, startedAt, now);
    const attempted = summary.correctCount + summary.incorrectCount;
    const accuracy = attempted === 0 ? 1 : summary.correctCount / attempted;
    const { mastered } = computeKeyMastery(summary);
    const charsTyped = summary.correctCount + summary.incorrectCount + summary.guidedTypedCount;

    const session: Session = {
      day,
      level,
      startedAt: new Date(startedAt).toISOString(),
      completedAt: new Date(now).toISOString(),
      durationSeconds: Math.round((now - startedAt) / 1000),
      wpm,
      accuracy,
      charsTyped,
      verseCharsTypedUnassisted,
      keyErrors: summary.keyErrors,
      keysMastered: mastered,
      badgeEarned: dayContent.badgeId,
      stagesCompleted: REPORT_STAGE_INDEX,
    };
    const updatedProfile = addSession(profile.id, session);
    setFinalStats({ wpm, accuracy, streak: updatedProfile ? getStreak(updatedProfile) : 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  if (!dayContent || !displayText) {
    // Shouldn't happen — the start screen only offers days with content —
    // but bail out safely rather than rendering a broken session.
    onSessionEnd();
    return null;
  }

  function addToSummary(stageSummary: StageTypingSummary) {
    setSummary((prev) => mergeSummaries(prev, stageSummary));
  }

  function goToNextStage() {
    setStageIndex((i) => Math.min(i + 1, STAGE_ORDER.length - 1));
  }

  function handleStageComplete(stageSummary: StageTypingSummary) {
    addToSummary(stageSummary);
    goToNextStage();
  }

  return (
    <div className="flex flex-1 flex-col">
      {stage !== "report" && (
        <div className="flex justify-center pt-4">
          <ProgressBar
            current={stageIndex + 1}
            total={STAGE_ORDER.length}
            label={t("progress.stageOf", { current: stageIndex + 1, total: STAGE_ORDER.length })}
          />
        </div>
      )}

      {stage === "ready" && <ReadyStage onContinue={goToNextStage} />}

      {stage === "newKeys" && (
        <NewKeysStage
          dayContent={dayContent}
          level={levelConfig}
          unlockedChars={unlockedChars}
          justUnlockedChars={new Set(dayContent.newKeys)}
          onComplete={handleStageComplete}
        />
      )}

      {stage === "wordBuild" && (
        <WordBuildStage
          dayContent={dayContent}
          level={levelConfig}
          unlockedChars={unlockedChars}
          guidedOnlyKeys={guidedOnlyKeys}
          onComplete={handleStageComplete}
        />
      )}

      {stage === "themeChallenge" && (
        <ThemeChallengeStage
          targets={themeTargets}
          level={levelConfig}
          unlockedChars={unlockedChars}
          shiftUnlocked={shiftUnlocked}
          onComplete={handleStageComplete}
        />
      )}

      {stage === "game" && (
        <GameStage
          dayContent={dayContent}
          level={levelConfig}
          unlockedChars={unlockedChars}
          shiftUnlocked={shiftUnlocked}
          firstName={profile.firstName}
          onComplete={handleStageComplete}
        />
      )}

      {stage === "verseBuilder" && (
        <VerseBuilderStage
          dayContent={dayContent}
          level={levelConfig}
          unlockedChars={unlockedChars}
          shiftUnlocked={shiftUnlocked}
          priorProgress={priorVerseProgress}
          onComplete={(stageSummary, verseChars) => {
            setVerseCharsTypedUnassisted(verseChars);
            addToSummary(stageSummary);
            goToNextStage();
          }}
        />
      )}

      {stage === "report" && (
        <ReportStage
          badgeLabel={displayText.badgeLabel}
          level={levelConfig}
          summary={summary}
          wpm={finalStats?.wpm ?? 0}
          accuracy={finalStats?.accuracy ?? 1}
          streak={finalStats?.streak ?? 0}
          onDone={onSessionEnd}
        />
      )}

      <TeacherControls onSkipStage={stage !== "report" ? goToNextStage : undefined} />
    </div>
  );
}
