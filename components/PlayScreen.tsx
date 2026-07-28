"use client";

import { useState } from "react";
import type { DayNumber, Profile } from "@/lib/types";
import type { ErrorHandlingMode } from "@/content/levels";
import type { StageTypingSummary } from "@/lib/typing-engine";
import { LEVELS } from "@/content/levels";
import { getDayPracticeContent, getCumulativeUnlockedKeys, isShiftUnlocked } from "@/content/days";
import { getLastCompletedDay } from "@/lib/storage";
import { useI18n } from "@/context/I18nContext";
import { DayPath } from "@/components/DayPath";
import { GameStage } from "@/components/stages/GameStage";
import { NinjaFlightGame } from "@/components/games/NinjaFlightGame";
import { MazeGame } from "@/components/games/MazeGame";
import { StarBlasterGame } from "@/components/games/StarBlasterGame";
import { CarRaceGame } from "@/components/games/CarRaceGame";

type PlayScreenProps = {
  profile: Profile;
  onExit: () => void;
};

type BonusGameProps = {
  unlockedChars: ReadonlySet<string>;
  shiftUnlocked: boolean;
  errorHandling: ErrorHandlingMode;
  onComplete: (summary: StageTypingSummary) => void;
};

type BonusGameId = "ninja" | "maze" | "starBlaster" | "carRace";

// All four are the same shape (see bonusLetters.ts): a run of single
// letters, covering the full curriculum alphabet, driving a scene with no
// day, no word bank, and no failure state. Listed here once so adding a
// fifth bonus game later is one array entry, not a new branch everywhere.
const BONUS_GAMES: { id: BonusGameId; labelKey: string; Component: (props: BonusGameProps) => React.JSX.Element }[] = [
  { id: "ninja", labelKey: "playScreen.ninjaGameLabel", Component: NinjaFlightGame },
  { id: "maze", labelKey: "playScreen.mazeGameLabel", Component: MazeGame },
  { id: "starBlaster", labelKey: "playScreen.starBlasterGameLabel", Component: StarBlasterGame },
  { id: "carRace", labelKey: "playScreen.carRaceGameLabel", Component: CarRaceGame },
];

type ActiveGame = { type: "day"; day: DayNumber } | { type: "bonus"; id: BonusGameId } | null;

/**
 * A "just for fun" area, entirely separate from the graded daily session:
 * replay any game from a day the child has already finished, with no
 * scoring, no accuracy gate, and nothing written to storage. Only days the
 * child has actually completed are selectable — a game is a reward for
 * finishing that day's lesson, not a menu of everything that exists.
 *
 * Bonus games (Ninja Hop, Maze Runner, Star Blaster, Car Race) sit below the
 * day picker — they aren't tied to any single day's curriculum, so they use
 * whatever keys are unlocked through the child's most recently completed day
 * instead of one day's fixed word bank.
 */
export function PlayScreen({ profile, onExit }: PlayScreenProps) {
  const { t } = useI18n();
  const lastCompletedDay = getLastCompletedDay(profile);
  const completedDays: DayNumber[] = lastCompletedDay
    ? (Array.from({ length: lastCompletedDay }, (_, i) => i + 1) as DayNumber[])
    : [];

  const [selectedDay, setSelectedDay] = useState<DayNumber | null>(completedDays[0] ?? null);
  const [activeGame, setActiveGame] = useState<ActiveGame>(null);

  // Nothing to score in play mode, so "complete" just means "played it" —
  // return to the picker rather than advancing anything.
  const backToPicker = () => setActiveGame(null);

  if (activeGame?.type === "day") {
    const dayContent = getDayPracticeContent(activeGame.day);
    if (dayContent) {
      return (
        <div className="flex flex-1 flex-col">
          <GameStage
            dayContent={dayContent}
            level={LEVELS[profile.lastLevel]}
            unlockedChars={getCumulativeUnlockedKeys(activeGame.day)}
            shiftUnlocked={isShiftUnlocked(activeGame.day)}
            firstName={profile.firstName}
            onComplete={backToPicker}
          />
        </div>
      );
    }
  }

  if (activeGame?.type === "bonus" && lastCompletedDay) {
    const bonusGame = BONUS_GAMES.find((g) => g.id === activeGame.id);
    if (bonusGame) {
      const BonusGame = bonusGame.Component;
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
          <BonusGame
            unlockedChars={getCumulativeUnlockedKeys(lastCompletedDay)}
            shiftUnlocked={isShiftUnlocked(lastCompletedDay)}
            errorHandling={LEVELS[profile.lastLevel].errorHandling}
            onComplete={backToPicker}
          />
        </div>
      );
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 p-6 text-center">
      <div className="flex flex-col items-center gap-2">
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-foreground">{t("playScreen.title")}</h1>
        <p className="font-[family-name:var(--font-ui)] text-foreground-muted">{t("playScreen.subtitle")}</p>
      </div>

      {completedDays.length === 0 ? (
        <p className="font-[family-name:var(--font-ui)] text-foreground-muted">{t("playScreen.noneYet")}</p>
      ) : (
        <>
          <div className="flex w-full max-w-md flex-col items-center gap-3">
            <span className="font-[family-name:var(--font-ui)] text-foreground-muted">{t("playScreen.dayLabel")}</span>
            <DayPath
              availableDays={completedDays}
              selectedDay={selectedDay ?? completedDays[0]}
              lastCompletedDay={lastCompletedDay}
              onSelect={setSelectedDay}
              dayLabel={(day) => t("startScreen.dayOption", { day })}
              comingSoonLabel={t("playScreen.notYetLabel")}
            />
            <button
              className="btn-primary mt-2 w-full px-6 py-3 text-lg"
              onClick={() => selectedDay && setActiveGame({ type: "day", day: selectedDay })}
              disabled={!selectedDay}
            >
              {t("playScreen.playButton")}
            </button>
          </div>

          <div className="flex w-full max-w-md flex-col items-center gap-3">
            <span className="font-[family-name:var(--font-ui)] text-foreground-muted">{t("playScreen.bonusGamesLabel")}</span>
            <div className="flex flex-wrap justify-center gap-2">
              {BONUS_GAMES.map((g) => (
                <button
                  key={g.id}
                  className="btn-secondary px-4 py-2"
                  onClick={() => setActiveGame({ type: "bonus", id: g.id })}
                >
                  {t(g.labelKey)}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <button className="btn-secondary px-6 py-2" onClick={onExit}>
        {t("playScreen.backButton")}
      </button>
    </div>
  );
}
