"use client";

import { useState } from "react";
import type { DayNumber, Profile } from "@/lib/types";
import type { LevelId } from "@/content/levels";
import { StartScreen } from "@/components/StartScreen";
import { SessionRunner } from "@/components/SessionRunner";
import { SplashScreen } from "@/components/SplashScreen";

type ActiveSession = { profile: Profile; day: DayNumber; level: LevelId } | null;

export default function Home() {
  const [active, setActive] = useState<ActiveSession>(null);
  // Cold boot only. This component stays mounted for the life of the tab,
  // so the splash returns on a real reload and never between sessions.
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onDismiss={() => setShowSplash(false)} />;
  }

  if (active) {
    return (
      <SessionRunner
        profile={active.profile}
        day={active.day}
        level={active.level}
        onSessionEnd={() => setActive(null)}
      />
    );
  }

  return <StartScreen onStart={(profile, day, level) => setActive({ profile, day, level })} />;
}
