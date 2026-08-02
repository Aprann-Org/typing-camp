"use client";

import { useState } from "react";
import type { DayNumber, Profile } from "@/lib/types";
import { type LevelId } from "@/content/levels";
import { StartScreen } from "@/components/StartScreen";
import { SessionRunner } from "@/components/SessionRunner";
import { PlayScreen } from "@/components/PlayScreen";
import { SplashScreen } from "@/components/SplashScreen";
import { HomeButton } from "@/components/HomeButton";

type ActiveSession = { profile: Profile; day: DayNumber; level: LevelId } | null;

export default function Home() {
  const [active, setActive] = useState<ActiveSession>(null);
  // The "just play a game" area — entirely separate from a graded session
  // (see PlayScreen's own doc), so it doesn't share ActiveSession's day/level.
  const [playingProfile, setPlayingProfile] = useState<Profile | null>(null);
  // Cold boot only. This component stays mounted for the life of the tab,
  // so the splash returns on a real reload and never between sessions.
  const [showSplash, setShowSplash] = useState(true);
  // Flipped once the session has written itself to storage, which is what
  // decides whether leaving costs the child anything.
  const [progressSaved, setProgressSaved] = useState(false);

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
      ) : (
        <StartScreen
          onStart={(profile, day, level) => {
            setProgressSaved(false);
            setActive({ profile, day, level });
          }}
          onPlay={setPlayingProfile}
        />
      )}

      {/* Play mode has nothing unsaved to lose, so it exits like the start
          screen (no confirm) rather than a session. */}
      <HomeButton
        onExit={active ? endSession : playingProfile ? () => setPlayingProfile(null) : undefined}
        confirm={active !== null && !progressSaved}
      />
    </>
  );
}
