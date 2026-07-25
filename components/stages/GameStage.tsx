"use client";

import { useEffect } from "react";
import type { DayPracticeContent } from "@/lib/types";
import type { LevelConfig } from "@/content/levels";
import { NameAnimatorGame } from "@/components/games/NameAnimatorGame";
import { emptySummary, type StageTypingSummary } from "@/lib/typing-engine";
import { useI18n } from "@/context/I18nContext";

type GameStageProps = {
  dayContent: DayPracticeContent;
  level: LevelConfig;
  unlockedChars: ReadonlySet<string>;
  shiftUnlocked: boolean;
  firstName: string;
  onComplete: (summary: StageTypingSummary) => void;
};

export function GameStage({ dayContent, level, unlockedChars, shiftUnlocked, firstName, onComplete }: GameStageProps) {
  const { t } = useI18n();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
      <h2 className="font-[family-name:var(--font-display)] text-2xl text-foreground">{t("stages.game.title")}</h2>
      {dayContent.day === 1 ? (
        <NameAnimatorGame
          firstName={firstName}
          unlockedChars={unlockedChars}
          shiftUnlocked={shiftUnlocked}
          errorHandling={level.errorHandling}
          onComplete={onComplete}
        />
      ) : (
        <UnsupportedDayGame onComplete={onComplete} />
      )}
    </div>
  );
}

// Days 2-5 games are out of scope for this build checkpoint (see the
// project plan) — the day registry only has Day 1 populated, so this path
// isn't reachable from the start screen, but stays safe if it ever is.
function UnsupportedDayGame({ onComplete }: { onComplete: (summary: StageTypingSummary) => void }) {
  useEffect(() => {
    onComplete(emptySummary());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
