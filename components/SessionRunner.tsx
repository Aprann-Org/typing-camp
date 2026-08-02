"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DayNumber, Profile, Session } from "@/lib/types";
import { LEVELS, getDrilledKeys, type LevelId } from "@/content/levels";
import { getDayDisplayText, getDayPracticeContent, getCumulativeUnlockedKeys, isShiftUnlocked } from "@/content/days";
import { SHIFT_MODIFIER_ID } from "@/content/layouts";
import { STAGE_ORDER } from "@/lib/session";
import { stageSegmentShares } from "@/lib/session-progress";
import { emptySummary, mergeSummaries, computeKeyMastery, type StageTypingSummary } from "@/lib/typing-engine";
import { computeDayScore, type DayScore } from "@/lib/day-score";
import { addSession } from "@/lib/storage";
import { useI18n } from "@/context/I18nContext";
import { JourneyStepper } from "@/components/JourneyStepper";
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
  /** Fired once this session is written to storage — after which leaving costs nothing. */
  onProgressSaved: () => void;
  onSessionEnd: () => void;
};

const REPORT_STAGE_INDEX = STAGE_ORDER.length - 1;

export function SessionRunner({ profile, day, level, onProgressSaved, onSessionEnd }: SessionRunnerProps) {
  const { t } = useI18n();
  const dayContent = getDayPracticeContent(day);
  const displayText = getDayDisplayText(profile.language, day);
  const levelConfig = LEVELS[level];

  const [stageIndex, setStageIndex] = useState(0);
  // 0-1 progress inside the current stage, reported upward by the stages that
  // work through a queue. Feeds the stepper's partial segment fill.
  const [stageFraction, setStageFraction] = useState(0);
  const [summary, setSummary] = useState<StageTypingSummary>(emptySummary());
  const [verseCharsTypedUnassisted, setVerseCharsTypedUnassisted] = useState(0);
  const [finalScore, setFinalScore] = useState<DayScore | null>(null);
  // Lazy initial state — the initializer runs exactly once, at mount, which
  // is the sanctioned way to capture an impure one-time value like
  // Date.now() (a plain render-body read would differ between the server
  // render and the client's hydration render).
  const [startedAt] = useState(() => Date.now());
  const savedRef = useRef(false);

  const unlockedChars = useMemo(() => getCumulativeUnlockedKeys(day), [day]);
  const shiftUnlocked = isShiftUnlocked(day);

  // Shift rides in the same character-keyed set as the day's new letters (via
  // a sentinel, since it produces no character) so it gets the same one-time
  // "light up" on the day it's taught.
  const justUnlockedChars = useMemo(() => {
    if (!dayContent) return new Set<string>();
    const keys = new Set(dayContent.newKeys);
    if (dayContent.teachesShift) keys.add(SHIFT_MODIFIER_ID);
    return keys;
  }, [dayContent]);

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

  // Segment lengths for the stepper, sized by how much typing each stage
  // actually holds — New Keys is most of the day, and the bar now says so.
  const segmentShares = useMemo(() => {
    if (!dayContent) return undefined;
    return stageSegmentShares({ dayContent, level: levelConfig, themeTargets, unlockedChars, shiftUnlocked });
  }, [dayContent, levelConfig, themeTargets, unlockedChars, shiftUnlocked]);

  // Stages report on every item (and every keystroke, in Verse Builder), so
  // ignore changes too small to be visible — an identical value lets React
  // skip the re-render of the whole session tree entirely.
  const reportStageProgress = useCallback((fraction: number) => {
    const next = Math.min(1, Math.max(0, fraction));
    setStageFraction((prev) => (Math.abs(prev - next) < 0.01 ? prev : next));
  }, []);

  const stage = STAGE_ORDER[stageIndex];

  useEffect(() => {
    if (!dayContent || !displayText || stage !== "report" || savedRef.current) return;
    savedRef.current = true;
    const now = Date.now();
    const score = computeDayScore(summary);
    const { mastered } = computeKeyMastery(summary);

    const session: Session = {
      day,
      level,
      startedAt: new Date(startedAt).toISOString(),
      completedAt: new Date(now).toISOString(),
      durationSeconds: Math.round((now - startedAt) / 1000),
      activeSeconds: score.activeSeconds,
      wpm: score.wpm,
      accuracy: score.accuracy,
      score: score.total,
      charsTyped: score.charsTyped,
      verseCharsTypedUnassisted,
      keyErrors: summary.keyErrors,
      keysMastered: mastered,
      badgeEarned: dayContent.badgeId,
      stagesCompleted: REPORT_STAGE_INDEX,
    };
    // Still recorded even though nothing in the app reads it back: sessions
    // are the raw material for a future teacher-side export, and writing a
    // row costs nothing. Nothing in the UI promises it will be there
    // tomorrow — see docs/profile-recovery-plan.md.
    addSession(profile.id, session);
    setFinalScore(score);
    onProgressSaved();
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
    setStageFraction(0);
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
          <JourneyStepper
            current={stageIndex + 1}
            total={STAGE_ORDER.length}
            shares={segmentShares}
            fraction={stageFraction}
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
          shiftUnlocked={shiftUnlocked}
          justUnlockedChars={justUnlockedChars}
          onProgress={reportStageProgress}
          onComplete={handleStageComplete}
        />
      )}

      {stage === "wordBuild" && (
        <WordBuildStage
          dayContent={dayContent}
          level={levelConfig}
          unlockedChars={unlockedChars}
          shiftUnlocked={shiftUnlocked}
          guidedOnlyKeys={guidedOnlyKeys}
          onProgress={reportStageProgress}
          onComplete={handleStageComplete}
        />
      )}

      {stage === "themeChallenge" && (
        <ThemeChallengeStage
          targets={themeTargets}
          level={levelConfig}
          unlockedChars={unlockedChars}
          shiftUnlocked={shiftUnlocked}
          onProgress={reportStageProgress}
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
          onProgress={reportStageProgress}
          onComplete={handleStageComplete}
        />
      )}

      {stage === "verseBuilder" && (
        <VerseBuilderStage
          dayContent={dayContent}
          level={levelConfig}
          unlockedChars={unlockedChars}
          shiftUnlocked={shiftUnlocked}
          onProgress={reportStageProgress}
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
          day={day}
          firstName={profile.firstName}
          level={levelConfig}
          summary={summary}
          score={finalScore ?? computeDayScore(summary)}
          onDone={onSessionEnd}
        />
      )}

      <TeacherControls onSkipStage={stage !== "report" ? goToNextStage : undefined} />
    </div>
  );
}
