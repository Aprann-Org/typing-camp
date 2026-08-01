"use client";

import { useState } from "react";
import type { DayNumber, Profile } from "@/lib/types";
import type { ErrorHandlingMode } from "@/content/levels";
import type { StageTypingSummary } from "@/lib/typing-engine";
import { LEVELS } from "@/content/levels";
import { getAvailableDays, getDayPracticeContent, getCumulativeUnlockedKeys, isShiftUnlocked } from "@/content/days";
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
 * play any day's game, with no scoring, no accuracy gate, and nothing
 * written to storage.
 *
 * Every day with content is selectable. This used to be gated on days the
 * child had actually completed, but that reads a history the app no longer
 * keeps (a child isn't guaranteed the same laptop twice — see
 * docs/profile-recovery-plan.md), which would have left the picker
 * permanently empty. A teacher steers which day is appropriate.
 *
 * Bonus games (Ninja Hop, Maze Runner, Star Blaster, Car Race) sit below the
 * day picker — they aren't tied to any single day's curriculum, so they use
 * whatever keys are unlocked through the day currently selected above.
 */
export function PlayScreen({ profile, onExit }: PlayScreenProps) {
  const { t } = useI18n();
  const playableDays = getAvailableDays(profile.language);

  const [selectedDay, setSelectedDay] = useState<DayNumber | null>(playableDays[0] ?? null);
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

  if (activeGame?.type === "bonus" && selectedDay) {
    const bonusGame = BONUS_GAMES.find((g) => g.id === activeGame.id);
    if (bonusGame) {
      const BonusGame = bonusGame.Component;
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
          <BonusGame
            unlockedChars={getCumulativeUnlockedKeys(selectedDay)}
            shiftUnlocked={isShiftUnlocked(selectedDay)}
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

      {playableDays.length === 0 ? (
        <p className="font-[family-name:var(--font-ui)] text-foreground-muted">{t("playScreen.noneYet")}</p>
      ) : (
        <>
          <div className="flex w-full max-w-md flex-col items-center gap-3">
            <span className="font-[family-name:var(--font-ui)] text-foreground-muted">{t("playScreen.dayLabel")}</span>
            <DayPath
              availableDays={playableDays}
              selectedDay={selectedDay ?? playableDays[0]}
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
