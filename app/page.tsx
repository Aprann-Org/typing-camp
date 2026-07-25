"use client";

import { useState } from "react";
import type { DayNumber, Profile } from "@/lib/types";
import type { LevelId } from "@/content/levels";
import { StartScreen } from "@/components/StartScreen";
import { SessionRunner } from "@/components/SessionRunner";

type ActiveSession = { profile: Profile; day: DayNumber; level: LevelId } | null;

export default function Home() {
  const [active, setActive] = useState<ActiveSession>(null);

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
