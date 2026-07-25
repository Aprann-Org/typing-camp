"use client";

import { useState } from "react";
import type { DayNumber, Profile } from "@/lib/types";
import type { LevelId } from "@/content/levels";
import { StartScreen } from "@/components/StartScreen";
import { SessionRunner } from "@/components/SessionRunner";
import { SplashScreen } from "@/components/SplashScreen";
import { HomeButton } from "@/components/HomeButton";

type ActiveSession = { profile: Profile; day: DayNumber; level: LevelId } | null;

export default function Home() {
  const [active, setActive] = useState<ActiveSession>(null);
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
      ) : (
        <StartScreen
          onStart={(profile, day, level) => {
            setProgressSaved(false);
            setActive({ profile, day, level });
          }}
        />
      )}

      <HomeButton onExit={active ? endSession : undefined} confirm={active !== null && !progressSaved} />
    </>
  );
}
