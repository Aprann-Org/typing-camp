"use client";

import type { DayPracticeContent } from "@/lib/types";
import type { LevelConfig } from "@/content/levels";
import { NameAnimatorGame } from "@/components/games/NameAnimatorGame";
import { CharacterBuilderGame } from "@/components/games/CharacterBuilderGame";
import { WorldBuilderGame } from "@/components/games/WorldBuilderGame";
import { SoarGame } from "@/components/games/SoarGame";
import { FindTheSheepGame } from "@/components/games/FindTheSheepGame";
import type { StageTypingSummary } from "@/lib/typing-engine";
import { useI18n } from "@/context/I18nContext";

type GameStageProps = {
  dayContent: DayPracticeContent;
  level: LevelConfig;
  unlockedChars: ReadonlySet<string>;
  shiftUnlocked: boolean;
  firstName: string;
  /** Reports scene/word progress (0-1) for the journey stepper. */
  onProgress?: (fraction: number) => void;
  onComplete: (summary: StageTypingSummary) => void;
};

export function GameStage({ dayContent, level, unlockedChars, shiftUnlocked, firstName, onProgress, onComplete }: GameStageProps) {
  const { t } = useI18n();

  // Day 1 is the odd one out: it types a single target (the child's own
  // name), so it stays standalone. Days 2-5 are all word sequences driving a
  // picture and share WordSceneGame underneath.
  const shared = { unlockedChars, shiftUnlocked, errorHandling: level.errorHandling, onProgress, onComplete };

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
      <h2 className="font-[family-name:var(--font-display)] text-2xl text-foreground">{t("stages.game.title")}</h2>
      {dayContent.day === 1 && (
        <NameAnimatorGame
          firstName={firstName}
          unlockedChars={unlockedChars}
          shiftUnlocked={shiftUnlocked}
          errorHandling={level.errorHandling}
          onProgress={onProgress}
          onComplete={onComplete}
        />
      )}
      {dayContent.day === 2 && <CharacterBuilderGame {...shared} />}
      {dayContent.day === 3 && <WorldBuilderGame {...shared} />}
      {dayContent.day === 4 && <SoarGame {...shared} />}
      {dayContent.day === 5 && <FindTheSheepGame {...shared} />}
    </div>
  );
}
