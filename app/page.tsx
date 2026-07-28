"use client";

import { useState } from "react";
import type { DayNumber, Profile } from "@/lib/types";
import { LEVELS, type LevelId } from "@/content/levels";
import { getWeekSummary } from "@/lib/storage";
import { StartScreen } from "@/components/StartScreen";
import { SessionRunner } from "@/components/SessionRunner";
import { PlayScreen } from "@/components/PlayScreen";
import { WeekSummaryStage } from "@/components/stages/WeekSummaryStage";
import { SplashScreen } from "@/components/SplashScreen";
import { HomeButton } from "@/components/HomeButton";
import { useI18n } from "@/context/I18nContext";

type ActiveSession = { profile: Profile; day: DayNumber; level: LevelId } | null;

export default function Home() {
  const { t } = useI18n();
  const [active, setActive] = useState<ActiveSession>(null);
  // The "just play a game" area — entirely separate from a graded session
  // (see PlayScreen's own doc), so it doesn't share ActiveSession's day/level.
  const [playingProfile, setPlayingProfile] = useState<Profile | null>(null);
  // Reopening the week summary later (see StartScreen's "See my week"
  // button) — separate from ActiveSession for the same reason: it isn't a
  // graded session, just a look back at data that's already saved.
  const [weekSummaryProfile, setWeekSummaryProfile] = useState<Profile | null>(null);
  // Cold boot only. This component stays mounted for the life of the tab,
  // so the splash returns on a real reload and never between sessions.
  const [showSplash, setShowSplash] = useState(true);
  // Flipped once the session has written itself to storage, which is what
  // decides whether leaving costs the child anything.
  const [progressSaved, setProgressSaved] = useState(false);

  const weekSummary = weekSummaryProfile ? getWeekSummary(weekSummaryProfile) : null;

  function endSession() {
    setActive(null);
    setProgressSaved(false);
  }

  if (showSplash) {
    // The splash already carries the mark, full size and centered.
    return <SplashScreen onDismiss={() => setShowSplash(false)} />;
  }

  return (
    <>
      {active ? (
        <SessionRunner
          profile={active.profile}
          day={active.day}
          level={active.level}
          onProgressSaved={() => setProgressSaved(true)}
          onSessionEnd={endSession}
        />
      ) : playingProfile ? (
        <PlayScreen profile={playingProfile} onExit={() => setPlayingProfile(null)} />
      ) : weekSummaryProfile && weekSummary ? (
        <WeekSummaryStage
          language={weekSummaryProfile.language}
          level={LEVELS[weekSummaryProfile.lastLevel]}
          weekSummary={weekSummary}
          onDone={() => setWeekSummaryProfile(null)}
          doneLabel={t("common.back")}
        />
      ) : (
        <StartScreen
          onStart={(profile, day, level) => {
            setProgressSaved(false);
            setActive({ profile, day, level });
          }}
          onPlay={setPlayingProfile}
          onViewWeekSummary={setWeekSummaryProfile}
        />
      )}

      {/* Play mode and the week summary have nothing unsaved to lose, so
          they exit like the start screen (no confirm) rather than a session. */}
      <HomeButton
        onExit={
          active
            ? endSession
            : playingProfile
              ? () => setPlayingProfile(null)
              : weekSummaryProfile
                ? () => setWeekSummaryProfile(null)
                : undefined
        }
        confirm={active !== null && !progressSaved}
      />
    </>
  );
}
