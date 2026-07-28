"use client";

import { useState } from "react";
import { WordSceneGame, colorFor, type SceneRenderProps } from "./WordSceneGame";
import { pickLetterSequence } from "./bonusLetters";
import { useElapsedTimer } from "./useElapsedTimer";
import { GameTimer } from "./GameTimer";
import type { StageTypingSummary } from "@/lib/typing-engine";
import type { ErrorHandlingMode } from "@/content/levels";
import { useI18n } from "@/context/I18nContext";
import styles from "./CarRaceGame.module.css";

// Bonus game — see bonusLetters.ts for the letter pool and NinjaFlightGame's
// doc for the shared "never loses" rule. There's deliberately no other car
// on the track: a race usually means someone can lose it, so this is one
// car against the distance, not against another racer. The clock (see
// useElapsedTimer) is what lets two kids taking turns on the same device
// compare who was faster, without needing an actual opponent on screen.
const SEQUENCE_LENGTH = 10;

/** The road's vertical center — everything drawn relative to y=0 in local sprite coordinates lands here. */
const ROAD_Y = 151;

function CarScene({ revealed, total }: SceneRenderProps) {
  const progress = total === 0 ? 0 : revealed / total;
  const carX = 30 + progress * 224;
  const carColor = colorFor(String.fromCharCode(97 + (revealed % 26)));
  const finished = total > 0 && revealed >= total;

  return (
    <svg viewBox="0 0 300 200" role="img" aria-label="A car driving toward the checkered finish line, one letter per stretch of road">
      {/* The road. */}
      <rect x="0" y="136" width="300" height="30" fill="var(--background-raised)" />
      <line x1="10" y1="151" x2="290" y2="151" stroke="var(--foreground-muted)" strokeWidth="3" strokeDasharray="14 10" opacity="0.35" />

      {/* Distance markers, one per letter — filled in as the car passes them,
          same "environment stays gold, only the avatar carries a finger
          color" rule as the other bonus games. */}
      {Array.from({ length: total }, (_, i) => {
        const x = 30 + (i / Math.max(1, total - 1)) * 224;
        return (
          <circle key={i} cx={x} cy={166} r={3} fill={i < revealed ? "var(--accent-celebrate)" : "var(--foreground-muted)"} opacity={i < revealed ? 0.9 : 0.3} />
        );
      })}

      {/* Checkered finish flag. */}
      <g transform="translate(270 100)">
        <line x1="0" y1="0" x2="0" y2="50" stroke="var(--foreground-muted)" strokeWidth="2" />
        {[0, 1, 2, 3].map((row) =>
          [0, 1].map((col) => (
            <rect
              key={`${row}-${col}`}
              x={col * 8}
              y={row * 6}
              width="8"
              height="6"
              fill={(row + col) % 2 === 0 ? (finished ? "var(--accent-celebrate)" : "var(--foreground-muted)") : "var(--background)"}
            />
          ))
        )}
      </g>

      {/* The car: outer group owns the horizontal position (transitioned as
          carX changes), inner group owns a small bounce keyed by `revealed`
          so it re-fires every stretch — see NinjaFlightGame's identical
          two-group split for why one element can't own both at once. */}
      <g className={styles.carTrack} style={{ transform: `translate(${carX}px, ${ROAD_Y}px)` }}>
        <g key={revealed} className={styles.car}>
          <rect x="-18" y="-14" width="36" height="14" rx="5" fill={carColor} />
          <rect x="-10" y="-22" width="20" height="10" rx="4" fill={carColor} />
          <circle cx="-11" cy="0" r="5" fill="var(--background)" />
          <circle cx="11" cy="0" r="5" fill="var(--background)" />
        </g>
      </g>
    </svg>
  );
}

type Props = {
  unlockedChars: ReadonlySet<string>;
  shiftUnlocked: boolean;
  errorHandling: ErrorHandlingMode;
  onComplete: (summary: StageTypingSummary) => void;
};

export function CarRaceGame({ unlockedChars, shiftUnlocked, errorHandling, onComplete }: Props) {
  const { t } = useI18n();
  // Lazy initializer — see NinjaFlightGame's identical comment on why
  // Math.random() belongs in a one-time useState initializer, not render.
  const [sequence] = useState(() => pickLetterSequence(SEQUENCE_LENGTH));
  const [finished, setFinished] = useState(false);
  const elapsedMs = useElapsedTimer(finished);

  return (
    <div className="flex flex-col items-center gap-3">
      <GameTimer elapsedMs={elapsedMs} />
      <WordSceneGame
        words={sequence}
        instruction={t("games.carRace.instruction")}
        unlockedChars={unlockedChars}
        shiftUnlocked={shiftUnlocked}
        errorHandling={errorHandling}
        // Fires the instant the last letter lands — the true finish moment,
        // well before WordSceneGame's own multi-second celebration hold
        // calls onComplete — so the clock freezes exactly when the car
        // actually crosses the line, not 2+ seconds later.
        onProgress={(fraction) => {
          if (fraction >= 1) setFinished(true);
        }}
        renderScene={(props) => <CarScene {...props} />}
        onComplete={onComplete}
      />
    </div>
  );
}
